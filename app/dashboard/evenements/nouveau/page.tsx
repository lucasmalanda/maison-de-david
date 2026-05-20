import Link from "next/link";
import { EventForm } from "@/components/dashboard/EventForm";
import { listCategorySuggestions } from "@/lib/events/queries";
import { createEvent } from "@/lib/events/actions";

export default async function NouvelEvenementPage() {
  const categorySuggestions = await listCategorySuggestions();

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
          Nouvel événement
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
          Ajouter un <em className="text-gold">rendez-vous.</em>
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Remplis les informations ci-dessous. Tu pourras toujours les modifier
          plus tard.
        </p>
      </header>

      <div className="max-w-3xl">
        <EventForm
          categorySuggestions={categorySuggestions}
          action={createEvent}
          submitLabel="Créer l'événement"
        />
      </div>
    </div>
  );
}
