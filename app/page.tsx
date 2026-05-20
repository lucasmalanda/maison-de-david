import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const [eventsRes, mediaRes] = await Promise.all([
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase.from("media").select("id", { count: "exact", head: true }),
  ]);

  const eventsCount = eventsRes.count ?? 0;
  const mediaCount = mediaRes.count ?? 0;
  const errorMessage = eventsRes.error?.message ?? mediaRes.error?.message;

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-xl text-center">
        <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
          <span className="h-px w-7 bg-gold" />
          Dashboard · étape 2
        </span>

        <h1 className="mt-6 font-display text-5xl leading-none tracking-tight md:text-7xl">
          Connecté à <em className="text-gold">Supabase</em>
        </h1>

        <p className="mt-6 text-base text-ink-soft">
          Test de la connexion à la base de données.
        </p>

        <div className="mt-10 grid grid-cols-2 gap-4 text-left">
          <div className="rounded-lg border border-line bg-parchment p-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
              Événements
            </p>
            <p className="mt-2 font-display text-5xl text-ink">{eventsCount}</p>
            <p className="mt-1 text-xs text-ink-soft">en base</p>
          </div>
          <div className="rounded-lg border border-line bg-parchment p-6">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
              Médias
            </p>
            <p className="mt-2 font-display text-5xl text-ink">{mediaCount}</p>
            <p className="mt-1 text-xs text-ink-soft">en base</p>
          </div>
        </div>

        {errorMessage ? (
          <div className="mt-6 rounded-lg border border-burgundy/30 bg-burgundy/5 p-4 text-left text-sm text-burgundy">
            <p className="font-semibold">Erreur de connexion :</p>
            <p className="mt-1 font-mono text-xs">{errorMessage}</p>
          </div>
        ) : (
          <>
            <Link
              href="/login"
              className="mt-10 inline-block rounded-md bg-ink px-6 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-cream transition hover:bg-gold-deep"
            >
              Accéder au dashboard →
            </Link>
            <p className="mt-6 text-xs uppercase tracking-widest text-gold-deep">
              Étape 2 ✓
            </p>
          </>
        )}
      </div>
    </main>
  );
}
