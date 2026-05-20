import { z } from "zod";
import { MEDIA_CATEGORY_SLUGS, SIZE_HINTS } from "./categories";

export const mediaUploadSchema = z.object({
  category: z.enum(MEDIA_CATEGORY_SLUGS as [string, ...string[]], {
    message: "Catégorie invalide",
  }),
});

export const mediaUpdateSchema = z.object({
  title: z.string().max(200).optional().or(z.literal("")),
  category: z.enum(MEDIA_CATEGORY_SLUGS as [string, ...string[]]),
  size_hint: z.enum(SIZE_HINTS),
});

export type MediaUpdateInput = z.infer<typeof mediaUpdateSchema>;
