import { listDonationMethods } from "@/lib/donations/queries";
import { DonationMethodCard } from "@/components/dashboard/DonationMethodCard";

export default async function DonsPage() {
  const methods = await listDonationMethods();

  return (
    <div className="px-6 py-10 pt-20 lg:px-12 lg:py-14 lg:pt-14">
      <header className="mb-10 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
          Dons
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
          Méthodes de <em className="text-gold">don.</em>
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Active ou masque chaque méthode et modifie les coordonnées affichées
          sur la page <code className="rounded bg-cream px-1.5 py-0.5 text-[12px]">/don.html</code> du
          site public. Les changements sont visibles sur le site après quelques
          secondes.
        </p>
      </header>

      <div className="space-y-6">
        {methods.length === 0 ? (
          <div className="rounded-lg border border-dashed border-line bg-parchment/60 p-10 text-center">
            <p className="font-display text-2xl italic text-ink">
              Aucune méthode de don.
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              La migration SQL <code>lib/donations/migration.sql</code> n&apos;a peut-être
              pas encore été exécutée dans Supabase.
            </p>
          </div>
        ) : (
          methods.map((m) => <DonationMethodCard key={m.id} method={m} />)
        )}
      </div>
    </div>
  );
}
