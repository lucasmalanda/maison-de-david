import { z } from "zod";

export const eventInputSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(200, "Le titre est trop long (max 200 caractères)"),
  description: z
    .string()
    .max(2000, "La description est trop longue (max 2000 caractères)")
    .optional()
    .or(z.literal("")),
  date: z
    .string()
    .min(1, "La date est requise")
    .refine((v) => !isNaN(new Date(v).getTime()), "Date invalide"),
  location: z
    .string()
    .max(200, "Le lieu est trop long")
    .optional()
    .or(z.literal("")),
  category: z
    .string()
    .max(80, "La catégorie est trop longue")
    .optional()
    .or(z.literal("")),
  is_published: z.boolean().default(false),
});

export type EventInput = z.infer<typeof eventInputSchema>;
