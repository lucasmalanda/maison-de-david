import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
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

  return (
    <div className="flex min-h-screen flex-1">
      <Sidebar user={{ email: user.email }} />
      <div className="flex flex-1 flex-col lg:pl-72">
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </div>
  );
}
