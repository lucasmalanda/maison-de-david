"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentUser } from "@/lib/users/queries";
import { serviceProfileSchema, type ServiceProfileInput } from "./schema";

export type ActionResult = {
  ok: boolean;
  error?: string;
};

/** Enregistre le profil de service de l'utilisateur connecté (et de lui seul). */
export async function saveMyServiceProfile(
  input: ServiceProfileInput,
): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "Non authentifié" };
  if (!me.role) return { ok: false, error: "Ton accès n'est pas encore activé" };

  const parsed = serviceProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const p = parsed.data;
  // Pas d'instrument si « Musique » n'est pas coché.
  const instruments = p.services.includes("musique") ? p.instruments : [];

  const admin = createAdminClient();
  const { error } = await admin.from("service_profiles").upsert(
    {
      email: me.email.toLowerCase(),
      full_name: p.full_name || null,
      phone: p.phone || null,
      services: p.services,
      instruments,
      other_details: p.other_details || null,
      notes: p.notes || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "email" },
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/profil");
  return { ok: true };
}
