"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { donationMethodUpdateSchema, type DonationType } from "./schema";

const DONATIONS_BUCKET = "donations";

export type ActionResult = {
  ok: boolean;
  error?: string;
};

/** Met à jour les champs texte + toggle d'une méthode de don. */
export async function updateDonationMethod(
  type: DonationType,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const parsed = donationMethodUpdateSchema.safeParse({
    title: formData.get("title") ?? "",
    subtitle: formData.get("subtitle") ?? "",
    iban_beneficiary: formData.get("iban_beneficiary") ?? "",
    iban_value: formData.get("iban_value") ?? "",
    iban_bank: formData.get("iban_bank") ?? "",
    iban_bic: formData.get("iban_bic") ?? "",
    stripe_payment_link: formData.get("stripe_payment_link") ?? "",
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const v = parsed.data;
  const { error } = await supabase
    .from("donation_methods")
    .update({
      title: v.title,
      subtitle: v.subtitle || null,
      iban_beneficiary: v.iban_beneficiary || null,
      iban_value: v.iban_value || null,
      iban_bank: v.iban_bank || null,
      iban_bic: v.iban_bic || null,
      stripe_payment_link: v.stripe_payment_link || null,
    })
    .eq("type", type);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/dons");
  return { ok: true };
}

/** Toggle rapide actif/inactif (sans passer par le formulaire complet). */
export async function toggleDonationMethod(
  type: DonationType,
  isEnabled: boolean,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("donation_methods")
    .update({ is_enabled: isEnabled })
    .eq("type", type);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/dons");
}

/** Upload du QR TWINT : remplace l'ancien fichier si présent. */
export async function uploadTwintQr(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Aucun fichier sélectionné" };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Le fichier doit être une image (PNG, JPG, AVIF…)" };
  }
  if (file.size > 4 * 1024 * 1024) {
    return { ok: false, error: "L'image dépasse 4 Mo" };
  }

  // Récupère l'URL actuelle pour pouvoir supprimer l'ancien fichier après upload
  const { data: current } = await supabase
    .from("donation_methods")
    .select("twint_image_url")
    .eq("type", "twint")
    .maybeSingle();

  const ext = file.name.split(".").pop()?.toLowerCase() ?? "png";
  const path = `twint/qr-${Date.now()}.${ext}`;

  const { data: upload, error: uploadError } = await supabase.storage
    .from(DONATIONS_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) return { ok: false, error: uploadError.message };

  const { data: pub } = supabase.storage
    .from(DONATIONS_BUCKET)
    .getPublicUrl(upload.path);

  const { error: updateError } = await supabase
    .from("donation_methods")
    .update({ twint_image_url: pub.publicUrl })
    .eq("type", "twint");

  if (updateError) {
    // Rollback du fichier uploadé
    await supabase.storage.from(DONATIONS_BUCKET).remove([upload.path]);
    return { ok: false, error: updateError.message };
  }

  // Nettoyage best-effort de l'ancien fichier
  if (current?.twint_image_url) {
    const oldPath = extractBucketPath(current.twint_image_url, DONATIONS_BUCKET);
    if (oldPath && oldPath !== upload.path) {
      await supabase.storage.from(DONATIONS_BUCKET).remove([oldPath]);
    }
  }

  revalidatePath("/dashboard/dons");
  return { ok: true };
}

/** Supprime le QR TWINT (retour au fallback local du site public). */
export async function removeTwintQr(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { data: current } = await supabase
    .from("donation_methods")
    .select("twint_image_url")
    .eq("type", "twint")
    .maybeSingle();

  await supabase
    .from("donation_methods")
    .update({ twint_image_url: null })
    .eq("type", "twint");

  if (current?.twint_image_url) {
    const path = extractBucketPath(current.twint_image_url, DONATIONS_BUCKET);
    if (path) {
      await supabase.storage.from(DONATIONS_BUCKET).remove([path]);
    }
  }

  revalidatePath("/dashboard/dons");
}

function extractBucketPath(publicUrl: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}
