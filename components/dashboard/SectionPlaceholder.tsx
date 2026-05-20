type Props = {
  eyebrow: string;
  title: string;
  description: string;
  nextStep: string;
};

export function SectionPlaceholder({
  eyebrow,
  title,
  description,
  nextStep,
}: Props) {
  return (
    <div className="px-6 py-10 pt-20 lg:px-12 lg:py-14 lg:pt-14">
      <header className="max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
          {eyebrow}
        </p>
        <h1 className="mt-3 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
          {title}
        </h1>
        <p className="mt-4 text-base text-ink-soft">{description}</p>
      </header>

      <div className="mt-12 max-w-xl rounded-lg border border-dashed border-line bg-parchment/60 p-8">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
          En préparation
        </p>
        <p className="mt-3 font-display text-2xl italic text-ink">
          {nextStep}
        </p>
        <p className="mt-3 text-sm text-ink-soft">
          Cette section sera construite à l&apos;étape suivante du chantier.
          En attendant, tu peux continuer à explorer le dashboard.
        </p>
      </div>
    </div>
  );
}
