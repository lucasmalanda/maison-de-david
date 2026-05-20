"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderMedia } from "@/lib/media/actions";
import { DeleteMediaButton } from "./DeleteMediaButton";
import {
  MEDIA_CATEGORIES,
  getCategoryLabel,
  type MediaCategorySlug,
} from "@/lib/media/categories";
import type { MediaRow } from "@/lib/media/queries";

type Filter = {
  category: MediaCategorySlug | "all";
  type: "all" | "photo" | "video";
};

export function MediaGrid({ initialMedia }: { initialMedia: MediaRow[] }) {
  const [items, setItems] = useState(initialMedia);
  const [filter, setFilter] = useState<Filter>({ category: "all", type: "all" });
  const [_pending, startTransition] = useTransition();

  // Sync l'état local quand l'ensemble des médias change côté serveur
  // (upload, suppression). On compare les IDs en tant qu'ensembles, pas
  // de liste ordonnée — ainsi un drag-and-drop optimiste en cours n'est
  // pas écrasé tant que ses IDs sont les mêmes.
  useEffect(() => {
    const sameSet =
      items.length === initialMedia.length &&
      items.every((m) => initialMedia.some((im) => im.id === m.id));
    if (!sameSet) {
      setItems(initialMedia);
    }
  }, [initialMedia, items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length };
    for (const m of items) c[m.category] = (c[m.category] ?? 0) + 1;
    return c;
  }, [items]);

  const visibleItems = useMemo(() => {
    return items.filter(
      (m) =>
        (filter.category === "all" || m.category === filter.category) &&
        (filter.type === "all" || m.type === filter.type),
    );
  }, [items, filter]);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    // On ne réordonne que les items visibles, mais on doit recomposer
    // la liste totale en respectant l'ordre des items hors filtre.
    const oldVisIdx = visibleItems.findIndex((m) => m.id === active.id);
    const newVisIdx = visibleItems.findIndex((m) => m.id === over.id);
    if (oldVisIdx === -1 || newVisIdx === -1) return;

    const newVisible = arrayMove(visibleItems, oldVisIdx, newVisIdx);
    // Recomposition de la liste complète : on remplace les visibles dans leur ordre
    const visibleIds = new Set(visibleItems.map((m) => m.id));
    const newAll: MediaRow[] = [];
    let visibleCursor = 0;
    for (const m of items) {
      if (visibleIds.has(m.id)) {
        newAll.push(newVisible[visibleCursor++]);
      } else {
        newAll.push(m);
      }
    }
    setItems(newAll);

    startTransition(async () => {
      await reorderMedia(newAll.map((m) => m.id));
    });
  }

  return (
    <div>
      {/* Barre de filtres */}
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
            Catégorie
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <FilterChip
              active={filter.category === "all"}
              onClick={() => setFilter({ ...filter, category: "all" })}
              count={counts["all"]}
            >
              Tout
            </FilterChip>
            {MEDIA_CATEGORIES.map((c) => (
              <FilterChip
                key={c.slug}
                active={filter.category === c.slug}
                onClick={() => setFilter({ ...filter, category: c.slug })}
                count={counts[c.slug] ?? 0}
              >
                {c.label}
              </FilterChip>
            ))}
          </div>
        </div>

        <div className="lg:ml-auto">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-gold-deep">
            Type
          </p>
          <div className="mt-2 flex gap-1.5">
            <FilterChip
              active={filter.type === "all"}
              onClick={() => setFilter({ ...filter, type: "all" })}
            >
              Tout
            </FilterChip>
            <FilterChip
              active={filter.type === "photo"}
              onClick={() => setFilter({ ...filter, type: "photo" })}
            >
              Photos
            </FilterChip>
            <FilterChip
              active={filter.type === "video"}
              onClick={() => setFilter({ ...filter, type: "video" })}
            >
              Vidéos
            </FilterChip>
          </div>
        </div>
      </div>

      {visibleItems.length === 0 ? (
        <div className="rounded-lg border border-dashed border-line bg-parchment/60 p-10 text-center">
          <p className="font-display text-2xl italic text-ink">
            Aucun média
          </p>
          <p className="mt-2 text-sm text-ink-soft">
            {items.length === 0
              ? "La galerie est encore vide. Upload tes premières photos ci-dessus."
              : "Aucun média ne correspond à ces filtres."}
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-xs text-ink-soft">
            Glisse les vignettes pour les réorganiser. L&apos;ordre est sauvegardé automatiquement.
          </p>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={visibleItems.map((m) => m.id)}
              strategy={rectSortingStrategy}
            >
              <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {visibleItems.map((media) => (
                  <SortableMediaCard key={media.id} media={media} />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-widest transition ${
        active
          ? "border-gold-deep bg-gold-deep text-cream"
          : "border-line bg-parchment text-ink-soft hover:border-gold hover:text-ink"
      }`}
    >
      {children}
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 text-[10px] font-normal ${
            active ? "bg-ink/20 text-cream" : "bg-ink/5 text-ink-soft"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function SortableMediaCard({ media }: { media: MediaRow }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: media.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="group relative aspect-square overflow-hidden rounded-md border border-line bg-ink"
    >
      {media.type === "photo" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={media.src_url}
          alt={media.title ?? ""}
          className="h-full w-full object-cover transition group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <video
          src={media.src_url}
          className="h-full w-full object-cover"
          muted
          loop
          playsInline
          preload="metadata"
        />
      )}

      {/* Voile bas avec catégorie */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/95 via-ink/60 to-transparent p-3">
        <p className="text-[9px] font-semibold uppercase tracking-widest text-gold">
          {getCategoryLabel(media.category)}
        </p>
        {media.title && (
          <p className="mt-0.5 truncate font-display text-sm text-cream">
            {media.title}
          </p>
        )}
      </div>

      {/* Badge type */}
      {media.type === "video" && (
        <span className="pointer-events-none absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-ink/80 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-cream backdrop-blur-sm">
          <svg viewBox="0 0 12 14" className="h-2.5 w-2.5 fill-current">
            <path d="M0 0v14l12-7z" />
          </svg>
          Vidéo
        </span>
      )}

      {/* Actions au survol */}
      <div className="absolute right-2 top-2 flex gap-1.5 opacity-0 transition group-hover:opacity-100">
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="inline-flex h-8 w-8 cursor-grab items-center justify-center rounded-full bg-ink/80 text-cream backdrop-blur-sm active:cursor-grabbing"
          title="Glisser pour réorganiser"
          aria-label="Glisser pour réorganiser"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <circle cx="9" cy="5" r="1.5" />
            <circle cx="15" cy="5" r="1.5" />
            <circle cx="9" cy="12" r="1.5" />
            <circle cx="15" cy="12" r="1.5" />
            <circle cx="9" cy="19" r="1.5" />
            <circle cx="15" cy="19" r="1.5" />
          </svg>
        </button>
        <DeleteMediaButton id={media.id} />
      </div>
    </li>
  );
}
