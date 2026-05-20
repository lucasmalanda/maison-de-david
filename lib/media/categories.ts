/**
 * Les 5 catégories canoniques de la galerie.
 * "soins" a été retiré le 2026-05-20 — ne pas ré-ajouter sans validation produit.
 */
export const MEDIA_CATEGORIES = [
  { slug: "evangelisation", label: "Évangélisation" },
  { slug: "priere", label: "Groupe de prière" },
  { slug: "culte", label: "Culte protestant" },
  { slug: "gospel-night", label: "Gospel Night" },
  { slug: "atelier", label: "Atelier gospel" },
] as const;

export type MediaCategorySlug = (typeof MEDIA_CATEGORIES)[number]["slug"];

export const MEDIA_CATEGORY_SLUGS = MEDIA_CATEGORIES.map(
  (c) => c.slug,
) as MediaCategorySlug[];

export function getCategoryLabel(slug: string): string {
  return MEDIA_CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

export const SIZE_HINTS = ["square", "tall", "wide", "large"] as const;
export type SizeHint = (typeof SIZE_HINTS)[number];
