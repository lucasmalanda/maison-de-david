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

export type SignupStatus = "yes" | "maybe" | "no";

export type Signup = {
  event_id: string;
  email: string;
  status: SignupStatus;
  services: ServiceKey[];
  note: string | null;
  /** Nom affiché : prénom/nom du profil, sinon début de l'email. */
  name: string;
  /** Instruments du profil (utile quand « Musique » est choisi). */
  instruments: InstrumentKey[];
};

export type PlanningEvent = {
  id: string;
  title: string;
  date: string;
  location: string | null;
  is_published: boolean;
  signups: Signup[];
};

/**
 * Événements à venir (à partir d'aujourd'hui 00:00, brouillons compris)
 * avec toutes les réponses de l'équipe.
 */
export async function listPlanning(): Promise<PlanningEvent[]> {
  const admin = createAdminClient();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const { data: events, error } = await admin
    .from("events")
    .select("id, title, date, location, is_published")
    .gte("date", startOfToday.toISOString())
    .order("date", { ascending: true });

  if (error) throw new Error(error.message);
  if (!events || events.length === 0) return [];

  const [{ data: signups, error: sErr }, { data: profiles }] = await Promise.all([
    admin
      .from("event_signups")
      .select("event_id, email, status, services, note")
      .in(
        "event_id",
        events.map((e) => e.id),
      )
      .order("created_at", { ascending: true }),
    admin.from("service_profiles").select("email, full_name, instruments"),
  ]);

  if (sErr) throw new Error(sErr.message);

  const profileByEmail = new Map(
    (profiles ?? []).map((p) => [p.email as string, p]),
  );

  return events.map((e) => ({
    ...e,
    signups: (signups ?? [])
      .filter((s) => s.event_id === e.id)
      .map((s) => {
        const p = profileByEmail.get(s.email);
        return {
          ...s,
          name: p?.full_name || s.email.split("@")[0],
          instruments: (p?.instruments ?? []) as InstrumentKey[],
        } as Signup;
      }),
  }));
}
