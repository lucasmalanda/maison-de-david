"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; email: string }
  | { kind: "error"; message: string };

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;

    setStatus({ kind: "sending" });
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setStatus({ kind: "error", message: error.message });
    } else {
      setStatus({ kind: "sent", email });
    }
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
            <span className="h-px w-7 bg-gold" />
            Espace bénévole
          </span>
          <h1 className="mt-6 font-display text-4xl leading-none tracking-tight md:text-5xl">
            Connexion au <em className="text-gold">dashboard</em>
          </h1>
          <p className="mt-4 text-sm text-ink-soft">
            Entre ton email, on t&apos;envoie un lien magique. Pas de mot de
            passe à retenir.
          </p>
        </div>

        {status.kind === "sent" ? (
          <div className="mt-10 rounded-lg border border-gold/40 bg-parchment p-6 text-center">
            <p className="text-3xl">📬</p>
            <p className="mt-3 font-display text-2xl italic text-ink">
              Email envoyé !
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Ouvre ta boîte <span className="font-semibold">{status.email}</span>{" "}
              et clique sur le lien pour te connecter.
            </p>
            <button
              type="button"
              onClick={() => setStatus({ kind: "idle" })}
              className="mt-6 text-xs uppercase tracking-widest text-gold-deep underline"
            >
              Renvoyer un lien
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status.kind === "sending"}
                placeholder="ton.email@exemple.com"
                className="mt-1 w-full rounded-md border border-line bg-parchment px-4 py-3 text-base text-ink placeholder:text-ink-soft/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={status.kind === "sending" || !email}
              className="w-full rounded-md bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status.kind === "sending"
                ? "Envoi en cours..."
                : "M'envoyer un lien"}
            </button>

            {status.kind === "error" && (
              <p className="rounded-md border border-burgundy/30 bg-burgundy/5 p-3 text-center text-xs text-burgundy">
                {status.message}
              </p>
            )}
          </form>
        )}
      </div>
    </main>
  );
}
