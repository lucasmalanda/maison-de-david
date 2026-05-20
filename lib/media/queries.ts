import { createClient } from "@/lib/supabase/server";
import type { MediaCategorySlug, SizeHint } from "./categories";

export type MediaRow = {
  id: string;
  type: "photo" | "video";
  category: MediaCategorySlug;
  title: string | null;
  src_url: string;
  poster_url: string | null;
  size_hint: SizeHint;
  display_order: number;
  created_at: string;
  uploaded_by: string | null;
};

export async function listMedia(): Promise<MediaRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as MediaRow[];
}

export async function getMaxDisplayOrder(): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media")
    .select("display_order")
    .order("display_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return 0;
  return data.display_order ?? 0;
}
