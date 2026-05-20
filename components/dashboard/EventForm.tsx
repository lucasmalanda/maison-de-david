"use client";

import { useActionState, useState } from "react";
import type { EventRow } from "@/lib/events/queries";
import type { ActionResult } from "@/lib/events/actions";

type Props = {
  event?: EventRow;
  categorySuggestions: string[];
  action: (
    prev: ActionResult | null,
    formData: FormData,
  ) => Promise<ActionResult>;
  submitLabel: string;
};

/** Convertit un ISO 2026-06-15T18:30:00+00:00 → "2026-06-15T18:30" pour <input type="datetime-local"> */
function toDatetimeLocalValue(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({
  event,
  categorySuggestions,
  action,
  submitLabel,
}: Props) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );

  const [flyerPreview, setFlyerPreview] = useState<string | null>(
    event?.flyer_url ?? null,
  );

  function handleFlyerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setFlyerPreview(url);
  }

  return (
    <form action={formAction} className="space-y-7">
      {/* Titre */}
      <div>
        <label htmlFor="title" className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
          Titre <span className="text-burgundy">*</span>
        </label>
        <input
          id="title"
          name="title"
          required
          defaultValue={event?.title ?? ""}
          maxLength={200}
          placeholder="Holy Disco · soirée louange & gospel"
          className="mt-1 w-full rounded-md border border-line bg-parchment px-4 py-3 text-base text-ink placeholder:text-ink-soft/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      {/* Date + Lieu (2 col) */}
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
            Date & heure <span className="text-burgundy">*</span>
          </label>
          <input
            id="date"
            name="date"
            type="datetime-local"
            required
            defaultValue={toDatetimeLocalValue(event?.date ?? null)}
            className="mt-1 w-full rounded-md border border-line bg-parchment px-4 py-3 text-base text-ink focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <div>
          <label htmlFor="location" className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
            Lieu
          </label>
          <input
            id="location"
            name="location"
            defaultValue={event?.location ?? ""}
            maxLength={200}
            placeholder="Genève · Temple de la Madeleine"
            className="mt-1 w-full rounded-md border border-line bg-parchment px-4 py-3 text-base text-ink placeholder:text-ink-soft/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
      </div>

      {/* Catégorie (avec datalist de suggestions) */}
      <div>
        <label htmlFor="category" className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
          Catégorie
        </label>
        <input
          id="category"
          name="category"
          list="category-suggestions"
          defaultValue={event?.category ?? ""}
          maxLength={80}
          placeholder="Holy Disco, Gospel Night, Culte…"
          className="mt-1 w-full rounded-md border border-line bg-parchment px-4 py-3 text-base text-ink placeholder:text-ink-soft/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
        <datalist id="category-suggestions">
          {categorySuggestions.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
        <p className="mt-1 text-xs text-ink-soft">
          Tu peux choisir une suggestion ou taper ta propre catégorie.
        </p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          defaultValue={event?.description ?? ""}
          maxLength={2000}
          placeholder="Quelques mots pour présenter l'événement…"
          className="mt-1 w-full rounded-md border border-line bg-parchment px-4 py-3 text-base text-ink placeholder:text-ink-soft/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      {/* Flyer */}
      <div>
        <label htmlFor="flyer" className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
          Flyer (image)
        </label>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start">
          <label
            htmlFor="flyer"
            className="flex w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line bg-parchment/60 px-4 py-8 text-center transition hover:border-gold hover:bg-gold/5 sm:w-1/2"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-8 w-8 text-gold-deep">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span className="font-display text-base italic text-ink">
              Choisir une image
            </span>
            <span className="text-xs text-ink-soft">
              {event?.flyer_url
                ? "Remplace l'image actuelle"
                : "PNG, JPG, AVIF · max 50 Mo"}
            </span>
            <input
              id="flyer"
              name="flyer"
              type="file"
              accept="image/*"
              onChange={handleFlyerChange}
              className="sr-only"
            />
          </label>

          {flyerPreview && (
            <div className="w-full sm:w-1/2">
              <div className="overflow-hidden rounded-md border border-line bg-cream">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={flyerPreview}
                  alt="Aperçu du flyer"
                  className="h-48 w-full object-cover"
                />
              </div>
              <p className="mt-2 text-xs text-ink-soft">Aperçu</p>
            </div>
          )}
        </div>
      </div>

      {/* Switch publier */}
      <div className="flex items-start gap-3 rounded-md border border-line bg-parchment p-4">
        <input
          id="is_published"
          name="is_published"
          type="checkbox"
          defaultChecked={event?.is_published ?? false}
          className="mt-0.5 h-5 w-5 cursor-pointer accent-gold-deep"
        />
        <label htmlFor="is_published" className="flex-1 cursor-pointer">
          <span className="block text-sm font-semibold text-ink">
            Publier maintenant
          </span>
          <span className="block text-xs text-ink-soft">
            Si coché, l&apos;événement apparaîtra immédiatement sur le site
            public. Sinon il reste en brouillon, visible seulement ici.
          </span>
        </label>
      </div>

      {/* Erreur */}
      {state?.error && (
        <div className="rounded-md border border-burgundy/30 bg-burgundy/5 p-4 text-sm text-burgundy">
          {state.error}
        </div>
      )}

      {/* Boutons */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <a
          href="/dashboard/evenements"
          className="rounded-md border border-line bg-parchment px-5 py-3 text-center text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft transition hover:text-ink"
        >
          Annuler
        </a>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Enregistrement…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
