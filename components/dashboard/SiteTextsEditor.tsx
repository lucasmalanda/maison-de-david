"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { saveSiteTexts } from "@/lib/site-texts/actions";
import type { SiteTextField, SiteTextSection } from "@/lib/site-texts/registry";

type Props = {
  sections: SiteTextSection[];
  overrides: Record<string, string>;
};

const inputClass =
  "mt-1 w-full rounded-md border border-line bg-cream px-4 py-3 text-base text-ink placeholder:text-ink-soft/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30";

export function SiteTextsEditor({ sections, overrides }: Props) {
  return (
    <div className="max-w-3xl space-y-4">
      {sections.map((section) => (
        <SectionEditor key={section.id} section={section} overrides={overrides} />
      ))}
    </div>
  );
}

function SectionEditor({
  section,
  overrides,
}: {
  section: SiteTextSection;
  overrides: Record<string, string>;
}) {
  const initial = Object.fromEntries(
    section.fields.map((f) => [f.key, overrides[f.key] ?? f.default]),
  );
  const [saved, setSaved] = useState<Record<string, string>>(initial);
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [pending, startTransition] = useTransition();

  const dirtyKeys = section.fields.map((f) => f.key).filter((k) => values[k] !== saved[k]);
  const modifiedCount = section.fields.filter((f) => saved[f.key].trim() !== f.default).length;

  function handleSave() {
    const entries = dirtyKeys.map((key) => ({ key, value: values[key] }));
    startTransition(async () => {
      const res = await saveSiteTexts(entries);
      if (res.ok) {
        // Un texte vidé revient à l'original.
        const next = { ...values };
        for (const f of section.fields) if (next[f.key].trim() === "") next[f.key] = f.default;
        setValues(next);
        setSaved(next);
        toast.success("Textes enregistrés. Recharge le site pour les voir.");
      } else {
        toast.error(res.error ?? "Impossible d'enregistrer les textes.");
      }
    });
  }

  return (
    <details className="group overflow-hidden rounded-lg border border-line bg-parchment/60">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 sm:p-6">
        <div className="min-w-0">
          <h2 className="font-display text-xl text-ink sm:text-2xl">{section.title}</h2>
          <p className="mt-0.5 text-xs text-ink-soft">
            {section.fields.length} textes
            {modifiedCount > 0 && ` · ${modifiedCount} modifié${modifiedCount > 1 ? "s" : ""}`}
            {dirtyKeys.length > 0 && (
              <span className="font-semibold text-burgundy"> · non enregistré</span>
            )}
          </p>
        </div>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="h-5 w-5 shrink-0 text-gold-deep transition group-open:rotate-180"
        >
          <path d="M6 9l6 6 6-6" />
        </svg>
      </summary>

      <div className="space-y-6 border-t border-line p-5 sm:p-6">
        {section.description && <p className="text-sm text-ink-soft">{section.description}</p>}

        {section.fields.map((field) => (
          <FieldEditor
            key={field.key}
            field={field}
            value={values[field.key]}
            onChange={(v) => setValues((prev) => ({ ...prev, [field.key]: v }))}
          />
        ))}

        <div className="sticky bottom-0 -mx-5 -mb-5 border-t border-line bg-parchment/95 p-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">
          <button
            type="button"
            onClick={handleSave}
            disabled={pending || dirtyKeys.length === 0}
            className="w-full rounded-md bg-ink px-6 py-3.5 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
          >
            {pending
              ? "Enregistrement…"
              : dirtyKeys.length > 0
                ? `Enregistrer (${dirtyKeys.length})`
                : "Aucune modification"}
          </button>
        </div>
      </div>
    </details>
  );
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: SiteTextField;
  value: string;
  onChange: (v: string) => void;
}) {
  const isModified = value.trim() !== field.default;
  const multiline = field.kind !== "line";
  const rows = Math.min(8, Math.max(field.kind === "text" ? 3 : 2, value.split("\n").length));

  return (
    <div>
      <div className="flex items-end justify-between gap-3">
        <label
          htmlFor={field.key}
          className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep"
        >
          {field.label}
        </label>
        {isModified && (
          <button
            type="button"
            onClick={() => onChange(field.default)}
            className="shrink-0 text-[10px] font-semibold uppercase tracking-widest text-ink-soft underline-offset-4 transition hover:text-burgundy hover:underline"
          >
            Remettre l&apos;original
          </button>
        )}
      </div>

      {multiline ? (
        <textarea
          id={field.key}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          maxLength={2000}
          className={inputClass}
        />
      ) : (
        <input
          id={field.key}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={2000}
          className={inputClass}
        />
      )}

      {field.kind === "rich" && (
        <p className="mt-1.5 text-xs text-ink-soft">
          Entoure des mots d&apos;astérisques pour les écrire en{" "}
          <em className="font-display text-gold-deep">italique doré</em> : *comme ceci*.
          Un retour à la ligne crée un saut de ligne.
        </p>
      )}
      {field.kind === "list" && (
        <p className="mt-1.5 text-xs text-ink-soft">Un mot par ligne.</p>
      )}
      {isModified && (
        <p className="mt-1.5 text-xs text-ink-soft/80">
          Original : <span className="italic">{field.default.replace(/\n/g, " / ")}</span>
        </p>
      )}
    </div>
  );
}
