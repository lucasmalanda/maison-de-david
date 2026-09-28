"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveMySignup } from "@/lib/planning/actions";
import type { PlanningEvent, Signup, SignupStatus } from "@/lib/planning/queries";
import { INSTRUMENTS, SERVICES, type ServiceKey } from "@/lib/planning/services";

type Props = {
  event: PlanningEvent;
  myEmail: string;
  defaultServices: ServiceKey[];
};

const STATUS: { key: SignupStatus; label: string }[] = [
  { key: "yes", label: "✅ Disponible" },
  { key: "maybe", label: "❔ Peut-être" },
  { key: "no", label: "❌ Pas dispo" },
];

const SERVICE_LABEL = Object.fromEntries(SERVICES.map((s) => [s.key, s.label])) as Record<
  ServiceKey,
  string
>;
const INSTRUMENT_LABEL = Object.fromEntries(INSTRUMENTS.map((i) => [i.key, i.label])) as Record<
  string,
  string
>;

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function PlanningEventCard({ event, myEmail, defaultServices }: Props) {
  const mine = event.signups.find((s) => s.email === myEmail);

  const [status, setStatus] = useState<SignupStatus | null>(mine?.status ?? null);
  const [services, setServices] = useState<ServiceKey[]>(
    mine ? mine.services : defaultServices,
  );
  const [note, setNote] = useState(mine?.note ?? "");
  const [editing, setEditing] = useState(!mine);
  const [pending, startTransition] = useTransition();

  const serving = event.signups.filter((s) => s.status === "yes");
  const maybe = event.signups.filter((s) => s.status === "maybe");
  const unavailable = event.signups.filter((s) => s.status === "no");

  function handleSave() {
    if (!status) return;
    if (status !== "no" && services.length === 0) {
      toast.error("Choisis au moins un service.");
      return;
    }
    startTransition(async () => {
      const res = await saveMySignup({ event_id: event.id, status, services, note });
      if (res.ok) {
        toast.success("Réponse enregistrée. Merci !");
        setEditing(false);
      } else {
        toast.error(res.error ?? "Impossible d'enregistrer ta réponse.");
      }
    });
  }

  return (
    <article className="overflow-hidden rounded-lg border border-line bg-parchment/60">
      {/* En-tête de l'événement */}
      <div className="flex items-start gap-4 border-b border-line p-5 sm:p-6">
        <DateBadge iso={event.date} />
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl leading-tight text-ink">{event.title}</h2>
          <p className="mt-1 text-sm text-ink-soft">
            {formatTime(event.date)}
            {event.location ? ` · ${event.location}` : ""}
          </p>
          {!event.is_published && (
            <span className="mt-2 inline-flex rounded-full bg-ink/8 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-ink-soft">
              Brouillon · pas encore sur le site
            </span>
          )}
        </div>
      </div>

      {/* Ma réponse */}
      <div className="border-b border-line p-5 sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
          Ma réponse
        </p>

        {!editing && mine ? (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink">
              <span className="font-semibold">
                {STATUS.find((s) => s.key === status)?.label}
              </span>
              {status !== "no" && services.length > 0 && (
                <> — {services.map((k) => SERVICE_LABEL[k]).join(", ")}</>
              )}
              {note && <span className="block text-ink-soft">« {note} »</span>}
            </p>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="rounded-md border border-line px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-soft transition hover:border-gold hover:text-gold-deep"
            >
              Modifier
            </button>
          </div>
        ) : (
          <div className="mt-3 space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {STATUS.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setStatus(s.key)}
                  aria-pressed={status === s.key}
                  className={`rounded-md border px-2 py-2.5 text-xs font-semibold transition sm:text-sm ${
                    status === s.key
                      ? "border-gold bg-gold/15 text-gold-deep"
                      : "border-line bg-cream text-ink-soft hover:border-gold/50"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            {status && status !== "no" && (
              <div>
                <p className="text-sm text-ink-soft">Je veux servir en :</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {SERVICES.map((s) => {
                    const active = services.includes(s.key);
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setServices((list) => toggle(list, s.key))}
                        aria-pressed={active}
                        className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
                          active
                            ? "border-gold bg-gold/15 font-semibold text-gold-deep"
                            : "border-line bg-cream text-ink-soft hover:border-gold/50"
                        }`}
                      >
                        {active && "✓ "}
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {status && (
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={300}
                placeholder="Remarque (facultatif) : ex. j'arrive à 19h"
                className="w-full rounded-md border border-line bg-cream px-4 py-3 text-base text-ink placeholder:text-ink-soft/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            )}

            <div className="flex gap-3">
              {mine && (
                <button
                  type="button"
                  onClick={() => {
                    setStatus(mine.status);
                    setServices(mine.services);
                    setNote(mine.note ?? "");
                    setEditing(false);
                  }}
                  className="flex-1 rounded-md border border-line px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-ink-soft transition hover:border-ink/30 sm:flex-none"
                >
                  Annuler
                </button>
              )}
              <button
                type="button"
                onClick={handleSave}
                disabled={pending || !status}
                className="flex-1 rounded-md bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
              >
                {pending ? "Enregistrement…" : "Enregistrer"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* L'équipe */}
      <div className="p-5 sm:p-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
          L&apos;équipe · {serving.length} {serving.length > 1 ? "personnes servent" : "personne sert"}
        </p>
        <TeamSummary serving={serving} />

        {serving.length > 0 && (
          <ul className="mt-4 space-y-2">
            {serving.map((s) => (
              <PersonRow key={s.email} signup={s} />
            ))}
          </ul>
        )}

        {(maybe.length > 0 || unavailable.length > 0) && (
          <div className="mt-4 space-y-1 text-sm text-ink-soft">
            {maybe.length > 0 && (
              <p>
                <span className="font-semibold">Peut-être :</span>{" "}
                {maybe.map((s) => s.name).join(", ")}
              </p>
            )}
            {unavailable.length > 0 && (
              <p>
                <span className="font-semibold">Pas dispo :</span>{" "}
                {unavailable.map((s) => s.name).join(", ")}
              </p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/** Compteur par poste : « Chant 2 · Musique 1 · Son & lumière 0 ». */
function TeamSummary({ serving }: { serving: Signup[] }) {
  const counts = SERVICES.map((s) => ({
    ...s,
    count: serving.filter((p) => p.services.includes(s.key)).length,
  })).filter((s) => s.count > 0 || ["chant", "musique", "son"].includes(s.key));

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {counts.map((s) => (
        <span
          key={s.key}
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            s.count > 0 ? "bg-gold/15 text-gold-deep" : "bg-burgundy/10 text-burgundy"
          }`}
        >
          {s.label} · {s.count === 0 ? "personne" : s.count}
        </span>
      ))}
    </div>
  );
}

function PersonRow({ signup }: { signup: Signup }) {
  const instruments =
    signup.services.includes("musique") && signup.instruments.length > 0
      ? ` (${signup.instruments.map((i) => INSTRUMENT_LABEL[i] ?? i).join(", ")})`
      : "";
  return (
    <li className="flex items-start gap-3 text-sm">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-[10px] font-semibold uppercase text-cream">
        {signup.name.slice(0, 1)}
      </span>
      <div className="min-w-0">
        <p className="font-semibold text-ink">{signup.name}</p>
        <p className="text-ink-soft">
          {signup.services.map((k) => SERVICE_LABEL[k]).join(", ")}
          {instruments}
          {signup.note && <span className="block italic">« {signup.note} »</span>}
        </p>
      </div>
    </li>
  );
}

function DateBadge({ iso }: { iso: string }) {
  const d = new Date(iso);
  return (
    <div className="flex w-14 shrink-0 flex-col items-center rounded-md bg-ink py-2 text-cream">
      <span className="font-display text-2xl leading-none">
        {d.toLocaleDateString("fr-CH", { day: "2-digit", timeZone: "Europe/Zurich" })}
      </span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-gold">
        {d.toLocaleDateString("fr-CH", { month: "short", timeZone: "Europe/Zurich" })}
      </span>
    </div>
  );
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleString("fr-CH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Zurich",
  });
}
