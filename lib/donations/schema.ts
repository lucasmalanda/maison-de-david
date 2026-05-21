import { z } from "zod";

export const DONATION_TYPES = ["twint", "iban", "stripe"] as const;
export type DonationType = (typeof DONATION_TYPES)[number];

export const donationMethodUpdateSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(80),
  subtitle: z.string().max(200).optional().or(z.literal("")),
  // IBAN
  iban_beneficiary: z.string().max(120).optional().or(z.literal("")),
  iban_value: z.string().max(60).optional().or(z.literal("")),
  iban_bank: z.string().max(120).optional().or(z.literal("")),
  iban_bic: z.string().max(20).optional().or(z.literal("")),
  // STRIPE
  stripe_payment_link: z
    .string()
    .max(500)
    .refine(
      (v) => !v || /^https:\/\/(buy\.stripe\.com|checkout\.stripe\.com|donate\.stripe\.com)\//.test(v),
      "Le lien doit commencer par https://buy.stripe.com/ ou https://donate.stripe.com/",
    )
    .optional()
    .or(z.literal("")),
});

export type DonationMethodUpdate = z.infer<typeof donationMethodUpdateSchema>;
