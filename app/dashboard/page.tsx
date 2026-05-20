import { createClient } from "@/lib/supabase/server";

type KPI = {
  label: string;
  value: number | string;
  hint: string;
  accent?: boolean;
};

export default async function DashboardHome() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nowIso = new Date().toISOString();

  const [eventsUpcomingRes, mediaRes, profilesRes] = await Promise.all([
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .gte("date", nowIso)
      .eq("is_published", true),
    supabase.from("media").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const kpis: KPI[] = [
    {
      label: "Événements à venir",
      value: eventsUpcomingRes.count ?? 0,
      hint: "publiés et postérieurs à aujourd'hui",
      accent: true,
    },
    {
      label: "Photos & vidéos",
      value: mediaRes.count ?? 0,
      hint: "dans la galerie publique",
    },
    {
      label: "Bénévoles",
      value: profilesRes.count ?? 0,
      hint: "comptes actifs sur l'espace admin",
    },
  ];

  const today = new Intl.DateTimeFormat("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const firstName = user?.email?.split("@")[0] ?? "bénévole";

  return (
    <div className="px-6 py-10 pt-20 lg:px-12 lg:py-14 lg:pt-14">
      {/* En-tête */}
      <header className="mb-12 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
          {today}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
          Bonjour <em className="text-gold">{firstName}</em>,
        </h1>
        <p className="mt-3 max-w-xl text-base text-ink-soft">
          Voici un aperçu de l&apos;activité. Tu peux gérer les événements et
          la galerie depuis la barre latérale.
        </p>
      </header>

      {/* KPI */}
      <section aria-label="Indicateurs clés" className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {kpis.map((kpi) => (
          <article
            key={kpi.label}
            className={`relative overflow-hidden rounded-lg border p-7 transition ${
              kpi.accent
                ? "border-gold/40 bg-ink text-cream"
                : "border-line bg-parchment text-ink"
            }`}
          >
            <p
              className={`text-[10px] font-semibold uppercase tracking-[0.28em] ${
                kpi.accent ? "text-gold" : "text-gold-deep"
              }`}
            >
              {kpi.label}
            </p>
            <p
              className={`mt-5 font-display text-6xl leading-none ${
                kpi.accent ? "text-cream" : "text-ink"
              }`}
            >
              {kpi.value}
            </p>
            <p
              className={`mt-3 text-xs ${
                kpi.accent ? "text-cream/70" : "text-ink-soft"
              }`}
            >
              {kpi.hint}
            </p>
            {kpi.accent && (
              <span
                aria-hidden
                className="absolute -right-12 -top-12 h-44 w-44 rounded-full bg-gradient-to-br from-gold/30 to-transparent blur-2xl"
              />
            )}
          </article>
        ))}
      </section>

      {/* Section secondaire — placeholder pour les prochains événements */}
      <section className="mt-14">
        <div className="flex items-end justify-between border-b border-line pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
              À venir
            </p>
            <h2 className="mt-2 font-display text-2xl italic text-ink">
              Prochains rendez-vous
            </h2>
          </div>
          <a
            href="/dashboard/evenements"
            className="text-[11px] font-semibold uppercase tracking-widest text-gold-deep underline-offset-4 hover:underline"
          >
            Tout voir →
          </a>
        </div>
        <p className="mt-6 max-w-md text-sm text-ink-soft">
          {eventsUpcomingRes.count
            ? "Liste à venir à l'étape 5."
            : "Aucun événement à venir pour l'instant. Tu pourras en créer à l'étape 5."}
        </p>
      </section>
    </div>
  );
}
