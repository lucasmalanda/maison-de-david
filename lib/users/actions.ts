"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "./queries";

export type ActionResult = {
  ok: boolean;
  error?: string;
  /** Renvoyé après une création réussie, pour le rappel « copie le mdp ». */
  createdEmail?: string;
};

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Email requis")
  .email("Email invalide");

const passwordSchema = z
  .string()
  .min(8, "Le mot de passe doit faire au moins 8 caractères")
  .max(72, "Le mot de passe est trop long (max 72 caractères)");

const roleSchema = z.enum(["admin", "editor"]);

const createSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  role: roleSchema,
});

/**
 * Garde : n'autorise que les admins. Retourne l'email de l'admin appelant,
 * ou une erreur si l'appelant n'est pas admin.
 */
async function requireAdmin(): Promise<
  { ok: true; email: string } | { ok: false; error: string }
> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "Non authentifié" };
  if (me.role !== "admin") {
    return { ok: false, error: "Accès réservé aux administrateurs" };
  }
  return { ok: true, email: me.email };
}

/** Retrouve l'id d'un compte auth à partir de son email (insensible à la casse). */
async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const target = email.toLowerCase();
  const match = (data?.users ?? []).find(
    (u) => u.email?.toLowerCase() === target,
  );
  return match?.id ?? null;
}

/**
 * Crée un utilisateur : compte auth (email déjà confirmé, AUCUN email envoyé)
 * + ligne dans allowed_emails.
 */
export async function createUser(formData: FormData): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const parsed = createSchema.safeParse({
    email: formData.get("email") ?? "",
    password: formData.get("password") ?? "",
    role: formData.get("role") ?? "",
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const { email, password, role } = parsed.data;
  const admin = createAdminClient();

  // 1. Crée le compte auth. email_confirm:true => pas de mail de confirmation.
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  // Si le compte existe déjà, on ne bloque pas : on ré-aligne le mot de passe
  // et on ajoute simplement l'accès dans allowed_emails.
  if (createError) {
    const alreadyExists =
      createError.message.toLowerCase().includes("already been registered") ||
      createError.message.toLowerCase().includes("already registered") ||
      createError.status === 422;

    if (alreadyExists) {
      const existingId = await findAuthUserIdByEmail(email);
      if (existingId) {
        await admin.auth.admin.updateUserById(existingId, { password });
      }
    } else {
      return { ok: false, error: createError.message };
    }
  }

  // 2. Ajoute (ou met à jour le rôle de) la ligne allowed_emails.
  const { error: upsertError } = await admin
    .from("allowed_emails")
    .upsert(
      { email, role, invited_by: guard.email },
      { onConflict: "email" },
    );

  if (upsertError) return { ok: false, error: upsertError.message };

  revalidatePath("/dashboard/utilisateurs");
  return { ok: true, createdEmail: email };
}

/** Change le mot de passe d'un utilisateur existant (oubli). */
export async function updatePassword(
  email: string,
  newPassword: string,
): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const parsedEmail = emailSchema.safeParse(email);
  const parsedPassword = passwordSchema.safeParse(newPassword);
  if (!parsedEmail.success) return { ok: false, error: "Email invalide" };
  if (!parsedPassword.success) {
    return { ok: false, error: parsedPassword.error.issues[0]?.message ?? "Mot de passe invalide" };
  }

  const id = await findAuthUserIdByEmail(parsedEmail.data);
  if (!id) return { ok: false, error: "Aucun compte trouvé pour cet email" };

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(id, {
    password: parsedPassword.data,
  });
  if (error) return { ok: false, error: error.message };

  return { ok: true };
}

/** Supprime un utilisateur : compte auth + ligne allowed_emails. */
export async function deleteUser(email: string): Promise<ActionResult> {
  const guard = await requireAdmin();
  if (!guard.ok) return { ok: false, error: guard.error };

  const parsedEmail = emailSchema.safeParse(email);
  if (!parsedEmail.success) return { ok: false, error: "Email invalide" };
  const target = parsedEmail.data;

  // Protection : impossible de se supprimer soi-même.
  if (target === guard.email.toLowerCase()) {
    return { ok: false, error: "Vous ne pouvez pas retirer votre propre accès" };
  }

  const admin = createAdminClient();

  // 1. Supprime le compte auth s'il existe.
  const id = await findAuthUserIdByEmail(target);
  if (id) {
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) return { ok: false, error: error.message };
  }

  // 2. Supprime l'accès.
  const { error: delError } = await admin
    .from("allowed_emails")
    .delete()
    .eq("email", target);
  if (delError) return { ok: false, error: delError.message };

  revalidatePath("/dashboard/utilisateurs");
  return { ok: true };
}
