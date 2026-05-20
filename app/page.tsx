export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-xl text-center">
        <span className="inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
          <span className="h-px w-7 bg-gold" />
          Dashboard · étape 1
        </span>

        <h1 className="mt-6 font-display text-5xl leading-none tracking-tight md:text-7xl">
          La Maison <em className="text-gold">de David</em>
        </h1>

        <p className="mt-6 text-base text-ink-soft">
          Espace d&apos;administration des bénévoles. Le site public reste
          inchangé.
        </p>

        <div className="mt-10 rounded-lg border border-line bg-parchment p-6 text-left text-sm text-ink-soft">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
            Police titres
          </p>
          <p className="mt-1 font-display text-2xl italic text-ink">
            Fraunces — venez vous abreuver.
          </p>

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
            Police texte
          </p>
          <p className="mt-1 font-sans text-base text-ink">
            Manrope — Genève · Suisse
          </p>

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
            Palette
          </p>
          <div className="mt-2 flex items-center gap-2">
            <span className="h-6 w-6 rounded-full bg-cream ring-1 ring-line" title="crème" />
            <span className="h-6 w-6 rounded-full bg-parchment ring-1 ring-line" title="parchemin" />
            <span className="h-6 w-6 rounded-full bg-ink" title="bleu nuit" />
            <span className="h-6 w-6 rounded-full bg-ink-soft" title="bleu nuit clair" />
            <span className="h-6 w-6 rounded-full bg-gold" title="or" />
            <span className="h-6 w-6 rounded-full bg-gold-deep" title="or profond" />
            <span className="h-6 w-6 rounded-full bg-burgundy" title="bordeaux" />
          </div>
        </div>

        <p className="mt-8 text-xs uppercase tracking-widest text-gold-deep">
          Étape 1 terminée ✓
        </p>
      </div>
    </main>
  );
}
