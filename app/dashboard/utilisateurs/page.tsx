import { redirect } from "next/navigation";
import { getCurrentUser, listAllowedUsers } from "@/lib/users/queries";
import { UsersManager } from "@/components/dashboard/UsersManager";

export default async function UtilisateursPage() {
  const me = await getCurrentUser();

  // Sécurité : réservé aux admins. Un éditeur est renvoyé sans bruit.
  if (!me || me.role !== "admin") {
    redirect("/dashboard");
  }

  const users = await listAllowedUsers();

  return (
    <div className="px-6 py-10 pt-20 lg:px-12 lg:py-14 lg:pt-14">
      <header className="mb-10 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
          Utilisateurs
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
          Équipe & <em className="text-gold">accès.</em>
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Ajoute tes bénévoles et gère leurs accès au dashboard. Aucun email n&apos;est
          envoyé : tu crées le compte avec un mot de passe et tu le transmets toi-même.
        </p>
      </header>

      <UsersManager users={users} currentUserEmail={me.email} />
    </div>
  );
}
