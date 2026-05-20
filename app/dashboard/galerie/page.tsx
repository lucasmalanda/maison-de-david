import { MediaUploader } from "@/components/dashboard/MediaUploader";
import { MediaGrid } from "@/components/dashboard/MediaGrid";
import { listMedia } from "@/lib/media/queries";

export default async function GaleriePage() {
  const media = await listMedia();

  return (
    <div className="px-6 py-10 pt-20 lg:px-12 lg:py-14 lg:pt-14">
      <header className="mb-10 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gold-deep">
          Galerie
        </p>
        <h1 className="mt-2 font-display text-4xl leading-tight tracking-tight text-ink md:text-5xl">
          Photos & <em className="text-gold">vidéos.</em>
        </h1>
        <p className="mt-3 text-sm text-ink-soft">
          Upload, filtre et réorganise les médias affichés sur le site public.
          Les fichiers supprimés ici sont retirés du stockage.
        </p>
      </header>

      <section className="mb-12 max-w-4xl">
        <h2 className="sr-only">Ajouter des médias</h2>
        <MediaUploader />
      </section>

      <section>
        <div className="mb-6 flex items-end justify-between border-b border-line pb-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold-deep">
              Bibliothèque
            </p>
            <h2 className="mt-2 font-display text-2xl italic text-ink">
              {media.length === 0
                ? "Aucun média pour l'instant"
                : `${media.length} média${media.length > 1 ? "s" : ""}`}
            </h2>
          </div>
        </div>
        <MediaGrid initialMedia={media} />
      </section>
    </div>
  );
}
