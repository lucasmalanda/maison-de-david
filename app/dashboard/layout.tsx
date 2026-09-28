import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { UserRole } from "@/lib/users/queries";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Filet de sécurité (le proxy.ts a déjà filtré, mais on double)
  if (!user) {
    redirect("/login");
  }

  // Rôle de l'utilisateur (pour n'afficher que les entrées auxquelles il a droit).
  let role: UserRole | null = null;
  if (user.email) {
    const admin = createAdminClient();
    const { data } = await admin
      .from("allowed_emails")
      .select("role")
      .eq("email", user.email)
      .maybeSingle();
    role = (data?.role as UserRole | undefined) ?? null;
  }

  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar user={{ email: user.email }} role={role} />
      <div className="flex flex-1 flex-col lg:pl-72">
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
