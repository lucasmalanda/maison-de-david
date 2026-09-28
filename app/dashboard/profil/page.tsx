import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/queries";
import { getServiceProfile } from "@/lib/planning/queries";
import { ServiceProfileForm } from "@/components/dashboard/ServiceProfileForm";

export default async function ProfilPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");

  const profile = me.role ? await getServiceProfile(me.email) : null;

  return (
    <div className="px-6 py-10 pt-20 lg:px-12 lg:py-14 lg:pt-14">
      <header className="mb-10 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
          Mon profil
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
          Comment je <em className="text-gold">sers.</em>
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Indique ce que tu sais faire. Ces informations servent à organiser
          l&apos;équipe pour chaque événement. Elles restent internes et
          n&apos;apparaissent jamais sur le site public.
        </p>
      </header>

      {me.role ? (
        <ServiceProfileForm email={me.email} profile={profile} />
      ) : (
        <div className="max-w-2xl rounded-lg border border-dashed border-line bg-parchment/60 p-10 text-center">
          <p className="font-display text-2xl italic text-ink">Accès pas encore activé.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Demande à un administrateur de t&apos;ajouter dans la page Utilisateurs.
          </p>
        </div>
      )}
    </div>
  );
}
