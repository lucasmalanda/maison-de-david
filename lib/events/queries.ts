import { createClient } from "@/lib/supabase/server";

export type EventRow = {
  id: string;
  title: string;
  description: string | null;
  date: string;
  location: string | null;
  category: string | null;
  flyer_url: string | null;
  is_published: boolean;
  created_at: string;
  updated_at: string | null;
  created_by: string | null;
};

export async function listEvents(): Promise<EventRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as EventRow[];
}

export async function getEvent(id: string): Promise<EventRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data as EventRow | null;
}

/**
 * Récupère la liste des catégories déjà utilisées (pour le datalist du form).
 */
export async function listCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("category")
    .not("category", "is", null);

  if (error) return [];

  const seen = new Set<string>();
  for (const row of data ?? []) {
    const c = (row as { category: string | null }).category?.trim();
    if (c) seen.add(c);
  }
  return Array.from(seen).sort();
}

const SUGGESTED_CATEGORIES = [
  "Holy Disco",
  "Gospel Night",
  "Évangélisation",
  "Culte protestant",
  "Atelier gospel",
  "Groupe de prière",
  "Soins d'âme",
];

/**
 * Mélange suggestions par défaut + catégories déjà utilisées (dédupliquées).
 */
export async function listCategorySuggestions(): Promise<string[]> {
  const used = await listCategories();
  const set = new Set<string>([...SUGGESTED_CATEGORIES, ...used]);
  return Array.from(set);
}
