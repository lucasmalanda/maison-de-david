import { createAdminClient } from "@/lib/supabase/admin";

/** Textes modifiés, par clé. Les clés absentes = texte d'origine. */
export async function getSiteTextOverrides(): Promise<Record<string, string>> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("site_texts").select("key, value");
  if (error) throw new Error(error.message);
  return Object.fromEntries((data ?? []).map((r) => [r.key as string, r.value as string]));
}
