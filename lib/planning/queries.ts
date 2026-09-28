import { createAdminClient } from "@/lib/supabase/admin";
import type { InstrumentKey, ServiceKey } from "./services";

export type ServiceProfile = {
  email: string;
  full_name: string | null;
  phone: string | null;
  services: ServiceKey[];
  instruments: InstrumentKey[];
  other_details: string | null;
  notes: string | null;
  updated_at: string;
};

/** Profil de service d'un membre, ou null s'il ne l'a pas encore rempli. */
export async function getServiceProfile(
  email: string,
): Promise<ServiceProfile | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("service_profiles")
    .select("*")
    .eq("email", email.toLowerCase())
    .maybeSingle();

  if (error) throw new Error(error.message);
  return (data as ServiceProfile | null) ?? null;
}
