"use client";

import { useActionState, useRef, useState, useTransition } from "react";
import {
  updateDonationMethod,
  toggleDonationMethod,
  uploadTwintQr,
  removeTwintQr,
  type ActionResult,
} from "@/lib/donations/actions";
import type { DonationMethodRow } from "@/lib/donations/queries";

type Props = {
  method: DonationMethodRow;
};

const TYPE_LABEL: Record<DonationMethodRow["type"], string> = {
  twint: "TWINT",
  iban: "Virement bancaire",
  stripe: "Carte bancaire (Stripe)",
};

const TYPE_HELP: Record<DonationMethodRow["type"], string> = {
  twint: "Le QR code que les donateurs scannent depuis leur app TWINT.",
  iban: "Coordonnées bancaires pour les virements SEPA et internationaux.",
  stripe:
    "Lien Payment Link Stripe (ex : https://buy.stripe.com/...). Tant que ce champ est vide, la carte affiche « Bientôt disponible » sur le site.",
};

export function DonationMethodCard({ method }: Props) {
  const updateAction = updateDonationMethod.bind(null, method.type);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    updateAction,
    null,
  );

  return (
    <section className="rounded-lg border border-line bg-parchment/60 p-7">
      <header className="flex items-start justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
            Méthode
          </p>
          <h2 className="mt-1 font-display text-2xl text-ink">
            {TYPE_LABEL[method.type]}
          </h2>
          <p className="mt-1 text-xs text-ink-soft">{TYPE_HELP[method.type]}</p>
        </div>
        <EnabledToggle method={method} />
      </header>

      {method.type === "twint" && <TwintUpload method={method} />}

      <form action={formAction} className="mt-6 space-y-5">
        {/* Champs communs */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Titre affiché"
            name="title"
            defaultValue={method.title}
            required
            maxLength={80}
          />
          <Field
            label="Sous-titre"
            name="subtitle"
            defaultValue={method.subtitle ?? ""}
            maxLength={200}
            placeholder="Sera affiché sous le titre"
          />
        </div>

        {/* Spécifique IBAN */}
        {method.type === "iban" && (
          <>
            <Field
              label="Nom du bénéficiaire"
              name="iban_beneficiary"
              defaultValue={method.iban_beneficiary ?? ""}
              placeholder="La Maison de David"
            />
            <Field
              label="IBAN"
              name="iban_value"
              defaultValue={method.iban_value ?? ""}
              placeholder="CH00 0000 0000 0000 0000 0"
              mono
            />
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Banque"
                name="iban_bank"
                defaultValue={method.iban_bank ?? ""}
                placeholder="Banque Cantonale de Genève (BCGE)"
              />
              <Field
                label="BIC / SWIFT"
                name="iban_bic"
                defaultValue={method.iban_bic ?? ""}
                placeholder="BCGECHGGXXX"
                mono
              />
            </div>
          </>
        )}

        {/* Spécifique STRIPE */}
        {method.type === "stripe" && (
          <Field
            label="Payment Link Stripe"
            name="stripe_payment_link"
            defaultValue={method.stripe_payment_link ?? ""}
            placeholder="https://buy.stripe.com/xxxxxxxxxx"
            type="url"
          />
        )}

        {/* Champs hidden pour les types non concernés (sinon zod parse "undefined") */}
        {method.type !== "iban" && (
          <>
            <input type="hidden" name="iban_beneficiary" value={method.iban_beneficiary ?? ""} />
            <input type="hidden" name="iban_value" value={method.iban_value ?? ""} />
            <input type="hidden" name="iban_bank" value={method.iban_bank ?? ""} />
            <input type="hidden" name="iban_bic" value={method.iban_bic ?? ""} />
          </>
        )}
        {method.type !== "stripe" && (
          <input type="hidden" name="stripe_payment_link" value={method.stripe_payment_link ?? ""} />
        )}
        <div className="flex items-center justify-between gap-3 pt-2">
          <div className="text-xs">
            {state?.ok && !pending && (
              <span className="text-gold-deep">Enregistré ✓</span>
            )}
            {state && !state.ok && (
              <span className="text-burgundy">{state.error}</span>
            )}
          </div>
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-ink px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep disabled:opacity-50"
          >
            {pending ? "Enregistrement…" : "Enregistrer"}
          </button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  maxLength,
  type = "text",
  mono = false,
}: {
  label: string;
  name: string;
  defaultValue: string;
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  type?: string;
  mono?: boolean;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep"
      >
        {label} {required && <span className="text-burgundy">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        maxLength={maxLength}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className={`mt-1 w-full rounded-md border border-line bg-cream px-4 py-3 text-base text-ink placeholder:text-ink-soft/40 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 ${
          mono ? "font-mono tracking-wider" : ""
        }`}
      />
    </div>
  );
}

function EnabledToggle({ method }: { method: DonationMethodRow }) {
  const [pending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(method.is_enabled);

  function handleClick() {
    const next = !enabled;
    setEnabled(next); // optimiste
    startTransition(async () => {
      try {
        await toggleDonationMethod(method.type, next);
      } catch {
        setEnabled(!next); // rollback
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className={`shrink-0 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest transition disabled:opacity-50 ${
        enabled
          ? "bg-gold/15 text-gold-deep hover:bg-gold/25"
          : "bg-ink/10 text-ink-soft hover:bg-ink/15"
      }`}
      title={enabled ? "Cliquer pour masquer du site" : "Cliquer pour afficher sur le site"}
    >
      <span
        className={`inline-block h-2 w-2 rounded-full ${
          enabled ? "bg-gold-deep" : "bg-ink-soft/50"
        }`}
      />
      {pending ? "…" : enabled ? "Affiché" : "Masqué"}
    </button>
  );
}

function TwintUpload({ method }: { method: DonationMethodRow }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const [preview, setPreview] = useState<string | null>(method.twint_image_url);
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    uploadTwintQr,
    null,
  );
  const [removing, startRemove] = useTransition();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    // Submit auto dès qu'un fichier est choisi
    formRef.current?.requestSubmit();
  }

  function handleRemove() {
    if (!confirm("Supprimer le QR actuel ? Le site repassera sur l'image par défaut.")) return;
    startRemove(async () => {
      await removeTwintQr();
      setPreview(null);
    });
  }

  return (
    <div className="mt-6 grid gap-5 sm:grid-cols-[180px_1fr] sm:items-start">
      <div className="aspect-square w-full overflow-hidden rounded-lg border border-line bg-white p-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={preview}
            alt="QR TWINT"
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-center text-[11px] text-ink-soft/60">
            Pas de QR<br />uploadé
          </div>
        )}
      </div>

      <form ref={formRef} action={formAction} className="flex flex-col gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
          QR code TWINT
        </p>
        <p className="text-xs text-ink-soft">
          Génère ton QR depuis ton app TWINT (Paramètres → Code QR personnel), prends
          une capture, et upload ici. PNG, JPG ou AVIF, max 4 Mo.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={pending}
            className="rounded-md bg-ink px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-cream transition hover:bg-gold-deep disabled:opacity-50"
          >
            {pending ? "Upload…" : preview ? "Remplacer le QR" : "Uploader un QR"}
          </button>
          {preview && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={removing}
              className="rounded-md border border-line px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-ink-soft transition hover:border-burgundy/40 hover:text-burgundy disabled:opacity-50"
            >
              {removing ? "…" : "Supprimer"}
            </button>
          )}
        </div>
        {state && !state.ok && (
          <p className="text-xs text-burgundy">{state.error}</p>
        )}
        {state?.ok && <p className="text-xs text-gold-deep">QR mis à jour ✓</p>}
      </form>
    </div>
  );
}
