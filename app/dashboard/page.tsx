import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

async function signOut() {
  "use server";
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Filet de sécurité — normalement le middleware nous a déjà filtrés
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-xl text-center">
        <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
          <span className="h-px w-7 bg-gold" />
          Dashboard · étape 3
        </span>

        <h1 className="mt-6 font-display text-5xl leading-none tracking-tight md:text-6xl">
          Bienvenue,
          <br />
          <em className="text-gold">{user.email}</em>
        </h1>

        <p className="mt-6 text-base text-ink-soft">
          Tu es bien connecté. La vraie interface arrive à l&apos;étape 4.
        </p>

        <form action={signOut} className="mt-10">
          <button
            type="submit"
            className="rounded-md border border-line bg-parchment px-5 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-ink transition hover:border-gold hover:text-gold-deep"
          >
            Se déconnecter
          </button>
        </form>

        <p className="mt-10 text-xs uppercase tracking-widest text-gold-deep">
          Étape 3 — auth ✓
        </p>
      </div>
    </main>
  );
}
