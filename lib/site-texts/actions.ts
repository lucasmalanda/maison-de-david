"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { canEditContent, getCurrentUser } from "@/lib/users/queries";
import { SITE_TEXT_BY_KEY } from "./registry";

export type ActionResult = {
  ok: boolean;
  error?: string;
};

const entriesSchema = z
  .array(
    z.object({
      key: z.string().refine((k) => SITE_TEXT_BY_KEY.has(k), "Texte inconnu"),
      value: z.string().max(2000, "Un texte est trop long (max 2000 caractères)"),
    }),
  )
  .max(200);

const normalize = (s: string) => s.replace(/\r\n/g, "\n").trim();

/**
 * Enregistre des textes du site. Un texte identique à l'original (ou vide)
 * est supprimé de la base : le site revient alors au texte d'origine.
 */
export async function saveSiteTexts(
  entries: { key: string; value: string }[],
): Promise<ActionResult> {
  const me = await getCurrentUser();
  if (!me) return { ok: false, error: "Non authentifié" };
  if (!canEditContent(me.role)) {
    return { ok: false, error: "Accès réservé aux admins et éditeurs" };
  }

  const parsed = entriesSchema.safeParse(entries);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  const toUpsert: { key: string; value: string; updated_at: string; updated_by: string }[] = [];
  const toReset: string[] = [];
  const now = new Date().toISOString();

  for (const { key, value } of parsed.data) {
    const v = normalize(value);
    const def = normalize(SITE_TEXT_BY_KEY.get(key)!.default);
    if (v === "" || v === def) toReset.push(key);
    else toUpsert.push({ key, value: v, updated_at: now, updated_by: me.email });
  }

  const admin = createAdminClient();

  if (toUpsert.length > 0) {
    const { error } = await admin.from("site_texts").upsert(toUpsert, { onConflict: "key" });
    if (error) return { ok: false, error: error.message };
  }
  if (toReset.length > 0) {
    const { error } = await admin.from("site_texts").delete().in("key", toReset);
    if (error) return { ok: false, error: error.message };
  }

  revalidatePath("/dashboard/textes");
  return { ok: true };
}
