import Link from "next/link";
import { listEvents } from "@/lib/events/queries";
import { DeleteEventButton } from "@/components/dashboard/DeleteEventButton";
import { PublishToggle } from "@/components/dashboard/PublishToggle";

const DAY_FMT = new Intl.DateTimeFormat("fr-FR", { day: "2-digit" });
const MONTH_FMT = new Intl.DateTimeFormat("fr-FR", {
  month: "short",
  year: "numeric",
});
const TIME_FMT = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});

export default async function EvenementsListPage() {
  const events = await listEvents();

  return (
    <div className="px-6 py-10 pt-20 lg:px-12 lg:py-14 lg:pt-14">
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
            Événements
          </p>
          <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
            Prochains <em className="text-gold">rendez-vous.</em>
          </h1>
          <p className="mt-3 text-sm text-ink-soft">
            {events.length === 0
              ? "Aucun événement pour l'instant."
              : `${events.length} événement${events.length > 1 ? "s" : ""} au total.`}
          </p>
        </div>
        <Link
          href="/dashboard/evenements/nouveau"
          className="inline-flex items-center gap-2 self-start rounded-md bg-ink px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Nouvel événement
        </Link>
      </header>

      {events.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-parchment/60 p-10 text-center">
          <p className="font-display text-2xl italic text-ink">
            Aucun événement pour le moment.
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            Crée ton premier événement pour démarrer.
          </p>
          <Link
            href="/dashboard/evenements/nouveau"
            className="mt-6 inline-block rounded-md bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep"
          >
            Créer un événement →
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {events.map((event) => {
            const d = new Date(event.date);
            const day = DAY_FMT.format(d);
            const month = MONTH_FMT.format(d);
            const time = TIME_FMT.format(d);
            return (
              <li
                key={event.id}
                className="grid grid-cols-[80px_1fr] gap-4 py-5 sm:grid-cols-[100px_1fr_auto] sm:items-center sm:gap-6 sm:py-6"
              >
                {/* Date */}
                <div className="text-center text-gold-deep">
                  <p className="font-display text-4xl leading-none font-light">
                    {day}
                  </p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-ink">
                    {month}
                  </p>
                </div>

                {/* Titre + lieu + catégorie */}
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-display text-xl text-ink">
                      {event.title}
                    </h2>
                    <PublishToggle
                      id={event.id}
                      isPublished={event.is_published}
                    />
                  </div>
                  <p className="mt-1 text-xs text-ink-soft">
                    {time}
                    {event.location ? ` · ${event.location}` : ""}
                    {event.category ? ` · ${event.category}` : ""}
                  </p>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex items-center gap-5 sm:col-span-1 sm:justify-end">
                  {event.flyer_url && (
                    <a
                      href={event.flyer_url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-xs font-semibold uppercase tracking-widest text-ink-soft transition hover:text-gold-deep"
                    >
                      Flyer
                    </a>
                  )}
                  <Link
                    href={`/dashboard/evenements/${event.id}`}
                    className="text-xs font-semibold uppercase tracking-widest text-ink transition hover:text-gold-deep"
                  >
                    Modifier
                  </Link>
                  <DeleteEventButton id={event.id} title={event.title} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
