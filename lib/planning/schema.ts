import { z } from "zod";
import { INSTRUMENT_KEYS, SERVICE_KEYS } from "./services";

export const serviceProfileSchema = z.object({
  full_name: z
    .string()
    .trim()
    .max(120, "Le nom est trop long (max 120 caractères)"),
  phone: z
    .string()
    .trim()
    .max(40, "Le numéro est trop long"),
  services: z.array(z.enum(SERVICE_KEYS)),
  instruments: z.array(z.enum(INSTRUMENT_KEYS)),
  other_details: z
    .string()
    .trim()
    .max(200, "Le détail est trop long (max 200 caractères)"),
  notes: z
    .string()
    .trim()
    .max(1000, "La remarque est trop longue (max 1000 caractères)"),
});

export type ServiceProfileInput = z.infer<typeof serviceProfileSchema>;
