import Link from "next/link";
import { notFound } from "next/navigation";
import { EventForm } from "@/components/dashboard/EventForm";
import { getEvent, listCategorySuggestions } from "@/lib/events/queries";
import { updateEvent } from "@/lib/events/actions";

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [event, categorySuggestions] = await Promise.all([
    getEvent(id),
    listCategorySuggestions(),
  ]);

  if (!event) {
    notFound();
  }

  const action = updateEvent.bind(null, id);

  return (
    <div className="px-6 py-10 pt-20 lg:px-12 lg:py-14 lg:pt-14">
      <header className="mb-10 max-w-2xl">
        <Link
          href="/dashboard/evenements"
          className="text-[11px] font-semibold uppercase tracking-widest text-gold-deep underline-offset-4 hover:underline"
        >
          ← Retour à la liste
        </Link>
        <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
          Modifier l&apos;événement
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
          {event.title}
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Modifie les informations ci-dessous puis enregistre.
        </p>
      </header>

      <div className="max-w-3xl">
        <EventForm
          event={event}
          categorySuggestions={categorySuggestions}
          action={action}
          submitLabel="Enregistrer les modifications"
        />
      </div>
    </div>
  );
}
