import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type UserRole = "admin" | "editor";

export type AllowedUser = {
  email: string;
  role: UserRole;
  invited_by: string | null;
  created_at: string;
  /** true si un compte auth.users existe vraiment pour cet email. */
  hasAccount: boolean;
};

/**
 * Rôle de l'utilisateur actuellement connecté, déterminé par sa présence
 * dans allowed_emails. Retourne null si non connecté ou non autorisé.
 */
export async function getCurrentUser(): Promise<{
  email: string;
  role: UserRole | null;
} | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("allowed_emails")
    .select("role")
    .eq("email", user.email)
    .maybeSingle();

  return {
    email: user.email,
    role: (data?.role as UserRole | undefined) ?? null,
  };
}

/**
 * Liste des personnes ayant accès (source : allowed_emails), enrichie
 * d'un flag indiquant si le compte auth existe réellement.
 */
export async function listAllowedUsers(): Promise<AllowedUser[]> {
  const admin = createAdminClient();

  const { data: rows, error } = await admin
    .from("allowed_emails")
    .select("email, role, invited_by, created_at")
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  if (!rows) return [];

  // Récupère les comptes auth pour croiser l'existence réelle.
  const { data: authData } = await admin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  const authEmails = new Set(
    (authData?.users ?? [])
      .map((u) => u.email?.toLowerCase())
      .filter((e): e is string => Boolean(e)),
  );

  return rows.map((r) => ({
    email: r.email,
    role: (r.role as UserRole) ?? "editor",
    invited_by: r.invited_by ?? null,
    created_at: r.created_at,
    hasAccount: authEmails.has(r.email.toLowerCase()),
  }));
}
