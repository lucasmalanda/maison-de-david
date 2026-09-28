import { redirect } from "next/navigation";
import { canEditContent, getCurrentUser } from "@/lib/users/queries";

// Réservé aux admins et éditeurs : un membre est renvoyé à l'accueil.
// (La base de données bloque aussi les écritures, cf. lib/planning/migration.sql.)
export default async function ContentEditorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const me = await getCurrentUser();
  if (!canEditContent(me?.role)) redirect("/dashboard");
  return children;
}
