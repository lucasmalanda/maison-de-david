import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/queries";

// Réservé aux admins. (La base de données bloque aussi les écritures,
// cf. lib/planning/migration.sql.)
export default async function DonsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getCurrentUser();
  if (me?.role !== "admin") redirect("/dashboard");
  return children;
}
