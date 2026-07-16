import { createClient } from "@supabase/supabase-js";

/**
 * Client Supabase « admin » : utilise la clé secrète (service role).
 * Il bypasse la RLS et donne accès à l'API admin (auth.admin.*).
 *
 * ⚠️ À N'UTILISER QUE CÔTÉ SERVEUR (Server Actions / Server Components).
 * La clé SUPABASE_SECRET_KEY ne doit JAMAIS finir dans un bundle client.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    throw new Error(
      "Configuration Supabase admin manquante (NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SECRET_KEY).",
    );
  }

  return createClient(url, secret, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
