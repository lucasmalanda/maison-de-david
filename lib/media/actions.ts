"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMaxDisplayOrder } from "./queries";
import { mediaUploadSchema, mediaUpdateSchema } from "./schema";
import type { MediaCategorySlug } from "./categories";

const GALLERY_BUCKET = "gallery";

export type ActionResult = {
  ok: boolean;
  error?: string;
  uploaded?: number;
};

function detectType(file: File): "photo" | "video" {
  return file.type.startsWith("video/") ? "video" : "photo";
}

/**
 * Upload d'un ou plusieurs fichiers dans le bucket gallery, puis création
 * d'une ligne "media" par fichier. Le type (photo|video) est auto-détecté
 * depuis le mime-type. L'ordre d'affichage est ajouté à la fin de la liste.
 */
export async function uploadMediaBatch(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const parsed = mediaUploadSchema.safeParse({
    category: formData.get("category"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const category = parsed.data.category as MediaCategorySlug;
  const files = formData.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);

  if (files.length === 0) {
    return { ok: false, error: "Aucun fichier sélectionné" };
  }

  let startOrder = (await getMaxDisplayOrder()) + 1;
  let uploaded = 0;
  const errors: string[] = [];

  for (const file of files) {
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
    const filename = `${category}/${crypto.randomUUID()}.${ext}`;

    const { data: upload, error: uploadError } = await supabase.storage
      .from(GALLERY_BUCKET)
      .upload(filename, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      errors.push(`${file.name} → ${uploadError.message}`);
      continue;
    }

    const { data: pub } = supabase.storage
      .from(GALLERY_BUCKET)
      .getPublicUrl(upload.path);

    const type = detectType(file);
    const { error: insertError } = await supabase.from("media").insert({
      type,
      category,
      title: null,
      src_url: pub.publicUrl,
      poster_url: null,
      size_hint: "square",
      display_order: startOrder++,
      uploaded_by: user.id,
    });

    if (insertError) {
      errors.push(`${file.name} (insert) → ${insertError.message}`);
      // Tente de nettoyer le fichier orphelin
      await supabase.storage.from(GALLERY_BUCKET).remove([upload.path]);
      continue;
    }

    uploaded++;
  }

  revalidatePath("/dashboard/galerie");
  revalidatePath("/dashboard");

  if (errors.length > 0 && uploaded === 0) {
    return { ok: false, error: errors.join(" · ") };
  }
  if (errors.length > 0) {
    return {
      ok: true,
      uploaded,
      error: `${uploaded} fichier(s) uploadé(s), mais erreurs : ${errors.join(" · ")}`,
    };
  }
  return { ok: true, uploaded };
}

/** Supprime la ligne média + le fichier dans le bucket. */
export async function deleteMedia(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Récupère src_url pour calculer le path bucket
  const { data: row, error: fetchError } = await supabase
    .from("media")
    .select("src_url")
    .eq("id", id)
    .maybeSingle();
  if (fetchError) throw new Error(fetchError.message);

  // Suppression de la ligne
  const { error: deleteError } = await supabase.from("media").delete().eq("id", id);
  if (deleteError) throw new Error(deleteError.message);

  // Suppression du fichier (best-effort, on log mais on ne plante pas)
  if (row?.src_url) {
    const path = extractBucketPath(row.src_url, GALLERY_BUCKET);
    if (path) {
      await supabase.storage.from(GALLERY_BUCKET).remove([path]);
    }
  }

  revalidatePath("/dashboard/galerie");
  revalidatePath("/dashboard");
}

/**
 * Réapplique un nouvel ordre à partir d'une liste d'IDs.
 * L'ordre dans le tableau devient le display_order final (0, 1, 2…).
 */
export async function reorderMedia(orderedIds: string[]): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // Update en boucle (Supabase ne supporte pas un UPDATE batch via la lib).
  // Le nombre de médias étant raisonnable (< 200), c'est OK en termes de perf.
  const promises = orderedIds.map((id, idx) =>
    supabase.from("media").update({ display_order: idx }).eq("id", id),
  );
  const results = await Promise.all(promises);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw new Error(failed.error.message);

  revalidatePath("/dashboard/galerie");
}

/** Met à jour les méta d'un média (titre, catégorie, format). */
export async function updateMediaMeta(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const parsed = mediaUpdateSchema.safeParse({
    title: formData.get("title") || undefined,
    category: formData.get("category"),
    size_hint: formData.get("size_hint"),
  });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Données invalides",
    };
  }

  const { error } = await supabase
    .from("media")
    .update({
      title: parsed.data.title || null,
      category: parsed.data.category,
      size_hint: parsed.data.size_hint,
    })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/galerie");
  return { ok: true };
}

/**
 * Extrait le path "category/uuid.ext" depuis une URL publique Supabase Storage.
 * Ex: https://xxx.supabase.co/storage/v1/object/public/gallery/culte/abc.jpg
 *  → culte/abc.jpg
 */
function extractBucketPath(publicUrl: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  return publicUrl.slice(idx + marker.length);
}
