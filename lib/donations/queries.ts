import { createClient } from "@/lib/supabase/server";
import type { DonationType } from "./schema";

export type DonationMethodRow = {
  id: string;
  type: DonationType;
  is_enabled: boolean;
  display_order: number;
  title: string;
  subtitle: string | null;
  twint_image_url: string | null;
  iban_beneficiary: string | null;
  iban_value: string | null;
  iban_bank: string | null;
  iban_bic: string | null;
  stripe_payment_link: string | null;
  updated_at: string;
};

export async function listDonationMethods(): Promise<DonationMethodRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donation_methods")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as DonationMethodRow[];
}
