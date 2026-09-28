"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveMyServiceProfile } from "@/lib/planning/actions";
import type { ServiceProfile } from "@/lib/planning/queries";
import {
  INSTRUMENTS,
  SERVICES,
  type InstrumentKey,
  type ServiceKey,
} from "@/lib/planning/services";

type Props = {
  email: string;
  profile: ServiceProfile | null;
};

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-cream px-4 py-3 text-base text-ink placeholder:text-ink-soft/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
      {children}
    </label>
  );
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function ServiceProfileForm({ email, profile }: Props) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [services, setServices] = useState<ServiceKey[]>(profile?.services ?? []);
  const [instruments, setInstruments] = useState<InstrumentKey[]>(
    profile?.instruments ?? [],
  );
  const [otherDetails, setOtherDetails] = useState(profile?.other_details ?? "");
  const [notes, setNotes] = useState(profile?.notes ?? "");
  const [pending, startTransition] = useTransition();

  const plays = services.includes("musique");
  const needsDetails = services.includes("autre") || instruments.includes("autre");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await saveMyServiceProfile({
        full_name: fullName,
        phone,
        services,
        instruments,
        other_details: otherDetails,
        notes,
      });
      if (res.ok) {
        toast.success("Profil enregistré.");
      } else {
        toast.error(res.error ?? "Impossible d'enregistrer le profil.");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-8">
      {/* Identité */}
      <section className="rounded-lg border border-line bg-parchment/60 p-6 sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
          Identité
        </p>
        <p className="mt-1 text-sm text-ink-soft">{email}</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Prénom et nom</Label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Marie Dupont"
              autoComplete="name"
              className={inputClass}
            />
          </div>
          <div>
            <Label>Téléphone</Label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+41 79 000 00 00"
              autoComplete="tel"
              className={inputClass}
            />
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="rounded-lg border border-line bg-parchment/60 p-6 sm:p-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
          Mes services
        </p>
        <p className="mt-1 text-sm text-ink-soft">Coche tout ce que tu peux faire.</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {SERVICES.map((s) => (
            <Chip
              key={s.key}
              active={services.includes(s.key)}
              onClick={() => setServices((list) => toggle(list, s.key))}
            >
              {s.label}
            </Chip>
          ))}
        </div>

        {plays && (
          <div className="mt-6 border-t border-line pt-5">
            <Label>Instruments</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {INSTRUMENTS.map((i) => (
                <Chip
                  key={i.key}
                  active={instruments.includes(i.key)}
                  onClick={() => setInstruments((list) => toggle(list, i.key))}
                >
                  {i.label}
                </Chip>
              ))}
            </div>
          </div>
        )}

        {needsDetails && (
          <div className="mt-6">
            <Label>Précise « autre »</Label>
            <input
              type="text"
              value={otherDetails}
              onChange={(e) => setOtherDetails(e.target.value)}
              placeholder="Ex. flûte, photographie, décoration…"
              className={inputClass}
            />
          </div>
        )}
      </section>

      {/* Remarque */}
      <section className="rounded-lg border border-line bg-parchment/60 p-6 sm:p-7">
        <Label>Remarque (facultatif)</Label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="Ex. disponible surtout le week-end, je débute à la basse…"
          className={inputClass}
        />
      </section>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-ink px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        {pending ? "Enregistrement…" : "Enregistrer mon profil"}
      </button>
    </form>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        active
          ? "border-gold bg-gold/15 font-semibold text-gold-deep"
          : "border-line bg-cream text-ink-soft hover:border-gold/50"
      }`}
    >
      {active && "✓ "}
      {children}
    </button>
  );
}
