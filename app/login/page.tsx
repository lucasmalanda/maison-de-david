"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Status =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setStatus({ kind: "loading" });
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setStatus({
        kind: "error",
        message: friendlyError(error.message),
      });
      return;
    }

    router.push("/dashboard");
    router.refresh();
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
            Entre ton email et ton mot de passe pour accéder au tableau de bord.
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-10 space-y-4">
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
              disabled={status.kind === "loading"}
              placeholder="ton.email@exemple.com"
              className="mt-1 w-full rounded-md border border-line bg-parchment px-4 py-3 text-base text-ink placeholder:text-ink-soft/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-[10px] font-semibold uppercase tracking-widest text-gold-deep"
            >
              Mot de passe
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={status.kind === "loading"}
              placeholder="••••••••"
              className="mt-1 w-full rounded-md border border-line bg-parchment px-4 py-3 text-base text-ink placeholder:text-ink-soft/50 focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:opacity-50"
            />
          </div>

          <button
            type="submit"
            disabled={status.kind === "loading" || !email || !password}
            className="w-full rounded-md bg-ink px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status.kind === "loading" ? "Connexion..." : "Se connecter"}
          </button>

          {status.kind === "error" && (
            <p className="rounded-md border border-burgundy/30 bg-burgundy/5 p-3 text-center text-xs text-burgundy">
              {status.message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

function friendlyError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login credentials")) {
    return "Email ou mot de passe incorrect.";
  }
  if (m.includes("email not confirmed")) {
    return "Email non confirmé. Contacte l'administrateur.";
  }
  return message;
}
