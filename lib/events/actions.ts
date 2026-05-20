"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { eventInputSchema } from "./schema";

const FLYERS_BUCKET = "flyers";

export type ActionResult = {
  ok: boolean;
  error?: string;
};

function parseFormData(formData: FormData) {
  return eventInputSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    date: formData.get("date"),
    location: formData.get("location") || undefined,
    category: formData.get("category") || undefined,
    is_published: formData.get("is_published") === "on",
  });
}

async function uploadFlyer(
  flyer: File,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<{ url: string } | { error: string }> {
  const ext = flyer.name.split(".").pop()?.toLowerCase() ?? "bin";
  const filename = `${crypto.randomUUID()}.${ext}`;

  const { data, error } = await supabase.storage
    .from(FLYERS_BUCKET)
    .upload(filename, flyer, {
      cacheControl: "3600",
      upsert: false,
    });

  if (error) return { error: error.message };

  const { data: publicUrl } = supabase.storage
    .from(FLYERS_BUCKET)
    .getPublicUrl(data.path);

  return { url: publicUrl.publicUrl };
}

export async function createEvent(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  let flyerUrl: string | null = null;
  const flyer = formData.get("flyer");
  if (flyer instanceof File && flyer.size > 0) {
    const result = await uploadFlyer(flyer, supabase);
    if ("error" in result) {
      return { ok: false, error: `Upload du flyer : ${result.error}` };
    }
    flyerUrl = result.url;
  }

  const { error } = await supabase.from("events").insert({
    title: parsed.data.title,
    description: parsed.data.description || null,
    date: parsed.data.date,
    location: parsed.data.location || null,
    category: parsed.data.category || null,
    is_published: parsed.data.is_published,
    flyer_url: flyerUrl,
    created_by: user.id,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/evenements");
  revalidatePath("/dashboard");
  redirect("/dashboard/evenements");
}

export async function updateEvent(
  id: string,
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Non authentifié" };

  const parsed = parseFormData(formData);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Données invalides" };
  }

  // Upload du nouveau flyer si fourni (sinon on garde l'ancien)
  const flyer = formData.get("flyer");
  const update: Record<string, unknown> = {
    title: parsed.data.title,
    description: parsed.data.description || null,
    date: parsed.data.date,
    location: parsed.data.location || null,
    category: parsed.data.category || null,
    is_published: parsed.data.is_published,
    updated_at: new Date().toISOString(),
  };

  if (flyer instanceof File && flyer.size > 0) {
    const result = await uploadFlyer(flyer, supabase);
    if ("error" in result) {
      return { ok: false, error: `Upload du flyer : ${result.error}` };
    }
    update.flyer_url = result.url;
  }

  const { error } = await supabase.from("events").update(update).eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/evenements");
  revalidatePath(`/dashboard/evenements/${id}`);
  revalidatePath("/dashboard");
  redirect("/dashboard/evenements");
}

export async function deleteEvent(id: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  // On supprime la ligne — le flyer reste dans le bucket (choix de Lucas).
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/evenements");
  revalidatePath("/dashboard");
}

export async function togglePublishEvent(
  id: string,
  next: boolean,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Non authentifié");

  const { error } = await supabase
    .from("events")
    .update({ is_published: next, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/evenements");
  revalidatePath("/dashboard");
}
