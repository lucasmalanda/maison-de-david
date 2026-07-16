-- ============================================
-- ALLOWED EMAILS — Migration à exécuter dans le
-- SQL Editor de Supabase (idempotente, sans risque
-- si la table existe déjà).
-- ============================================

-- 1. Table allowed_emails : la liste des personnes
--    autorisées à se connecter au dashboard + leur rôle.
create table if not exists public.allowed_emails (
  email       text primary key,
  role        text not null default 'editor' check (role in ('admin', 'editor')),
  invited_by  text,
  created_at  timestamptz not null default now()
);

-- 2. RLS : personne ne peut lire cette table côté client,
--    sauf sa propre ligne. Toutes les écritures passent par
--    les Server Actions qui utilisent la clé secrète (bypass RLS).
alter table public.allowed_emails enable row level security;

drop policy if exists "allowed_emails_read_self" on public.allowed_emails;
create policy "allowed_emails_read_self"
  on public.allowed_emails for select
  to authenticated
  using ((auth.jwt() ->> 'email') = email);

-- 3. Seed : on s'assure que Lucas (le porteur du projet) est
--    admin pour ne jamais être verrouillé hors de cette page.
--    David (compte déjà créé manuellement) est ajouté en admin.
insert into public.allowed_emails (email, role, invited_by)
values
  ('planetoile@gmail.com',     'admin', 'seed'),
  ('info@maisondedavid.com',   'admin', 'seed')
on conflict (email) do nothing;
