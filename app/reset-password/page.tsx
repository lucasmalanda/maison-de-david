"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Status =
  | { kind: "checking" }
  | { kind: "ready" }
  | { kind: "no-session" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "success" };

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "checking" });

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setStatus(data.user ? { kind: "ready" } : { kind: "no-session" });
    });
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setStatus({
        kind: "error",
        message: "Le mot de passe doit faire au moins 8 caractères.",
      });
      return;
    }
    if (password !== confirm) {
      setStatus({
        kind: "error",
        message: "Les deux mots de passe ne correspondent pas.",
      });
      return;
    }

    setStatus({ kind: "loading" });
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setStatus({ kind: "error", message: error.message });
      return;
    }

    setStatus({ kind: "success" });
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-md">
        <div className="text-center">
          <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
            <span className="h-px w-7 bg-gold" />
            Sécurité
          </span>
          <h1 className="mt-6 font-display text-4xl leading-none tracking-tight md:text-5xl">
            Nouveau <em className="text-gold">mot de passe</em>
          </h1>
          <p className="mt-4 text-sm text-ink-soft">
            Choisis un mot de passe d&apos;au moins 8 caractères.
          </p>
        </div>

        {status.kind === "checking" && (
          <p className="mt-10 text-center text-sm text-ink-soft">
            Vérification du lien...
          </p>
        )}

        {status.kind === "no-session" && (
          <div className="mt-10 rounded-lg border border-burgundy/30 bg-burgundy/5 p-6 text-center">
            <p className="text-sm text-burgundy">
              Lien invalide ou expiré. Demande un nouveau lien depuis la page de
              connexion.
            </p>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="mt-4 text-xs uppercase tracking-widest text-gold-deep underline"
            >
              Retour à la connexion
            </button>
          </div>
        )}

        {status.kind === "success" && (
          <div className="mt-10 rounded-lg border border-gold/40 bg-parchment p-6 text-center">
            <p className="text-3xl">✓</p>
            <p className="mt-3 font-display text-2xl italic text-ink">
              Mot de passe défini !
            </p>
            <p className="mt-2 text-sm text-ink-soft">
              Redirection vers le dashboard...
            </p>
          </div>
        )}

        {(status.kind === "ready" ||
          status.kind === "loading" ||
          status.kind === "error") && (
          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            <div>
              <label
                htmlFor="password"
                className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep"
              >
                Nouveau mot de passe
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                autoFocus
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={status.kind === "loading"}
                placeholder="••••••••"
                minLength={8}
                className="mt-1 w-full rounded-md border border-line bg-parchment px-4 py-3 text-base text-ink placeholder:text-ink-soft/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-50"
              />
            </div>

            <div>
              <label
                htmlFor="confirm"
                className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep"
              >
                Confirmer le mot de passe
              </label>
              <input
                id="confirm"
                type="password"
                required
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                disabled={status.kind === "loading"}
                placeholder="••••••••"
                minLength={8}
                className="mt-1 w-full rounded-md border border-line bg-parchment px-4 py-3 text-base text-ink placeholder:text-ink-soft/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-50"
              />
            </div>

            <button
              type="submit"
              disabled={
                status.kind === "loading" || !password || !confirm
              }
              className="w-full rounded-md bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status.kind === "loading"
                ? "Enregistrement..."
                : "Définir mon mot de passe"}
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
