import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/users/queries";
import { getServiceProfile, listPlanning } from "@/lib/planning/queries";
import { PlanningEventCard } from "@/components/dashboard/PlanningEventCard";

export default async function PlanningPage() {
  const me = await getCurrentUser();
  if (!me) redirect("/login");
  if (!me.role) redirect("/dashboard/profil");

  const [events, profile] = await Promise.all([
    listPlanning(),
    getServiceProfile(me.email),
  ]);

  return (
    <div className="px-6 py-10 pt-20 lg:px-12 lg:py-14 lg:pt-14">
      <header className="mb-10 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
          Planning
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
          Qui <em className="text-gold">sert ?</em>
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Pour chaque événement à venir, dis si tu es disponible et ce que tu
          veux faire. Tu vois aussi qui sert déjà et à quel poste.
        </p>
        {!profile && (
          <p className="mt-4 rounded-md border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-ink">
            Astuce : remplis{" "}
            <Link href="/dashboard/profil" className="font-semibold text-gold-deep underline-offset-4 hover:underline">
              ton profil
            </Link>{" "}
            pour que tes services soient pré-cochés.
          </p>
        )}
      </header>

      {events.length === 0 ? (
        <div className="max-w-2xl rounded-lg border border-dashed border-line bg-parchment/60 p-10 text-center">
          <p className="font-display text-2xl italic text-ink">Aucun événement à venir.</p>
          <p className="mt-2 text-sm text-ink-soft">
            Dès qu&apos;un événement sera créé, il apparaîtra ici.
          </p>
        </div>
      ) : (
        <div className="max-w-3xl space-y-6">
          {events.map((e) => (
            <PlanningEventCard
              key={e.id}
              event={e}
              myEmail={me.email.toLowerCase()}
              defaultServices={profile?.services ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
