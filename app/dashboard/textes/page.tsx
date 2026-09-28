import { getSiteTextOverrides } from "@/lib/site-texts/queries";
import { SITE_TEXT_SECTIONS } from "@/lib/site-texts/registry";
import { SiteTextsEditor } from "@/components/dashboard/SiteTextsEditor";

export default async function TextesPage() {
  const overrides = await getSiteTextOverrides();

  return (
    <div className="px-6 py-10 pt-20 lg:px-12 lg:py-14 lg:pt-14">
      <header className="mb-10 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
          Textes du site
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
          Les mots du <em className="text-gold">site.</em>
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Ouvre une section, modifie les textes puis enregistre. Le site public
          affiche les nouveaux textes après un simple rechargement de la page.
        </p>
      </header>

      <SiteTextsEditor sections={SITE_TEXT_SECTIONS} overrides={overrides} />
    </div>
  );
}
