-- ============================================
-- PLANNING (étape 1) — Rôle « membre » + profils
-- de service. À exécuter dans le SQL Editor de
-- Supabase (idempotente, sans risque si relancée).
-- ============================================

-- 1. Nouveau rôle « member » : il peut servir (profil,
--    disponibilités) mais ne modifie pas le site.
alter table public.allowed_emails
  drop constraint if exists allowed_emails_role_check;
alter table public.allowed_emails
  add constraint allowed_emails_role_check
  check (role in ('admin', 'editor', 'member'));

-- 2. Rôle de l'utilisateur connecté (lu dans allowed_emails).
--    security definer : la fonction peut lire la table même
--    si la RLS la cache à l'utilisateur.
create or replace function public.dashboard_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.allowed_emails
  where email = lower(auth.jwt() ->> 'email')
$$;

-- 3. Verrous RESTRICTIVE : ils s'ajoutent aux policies
--    existantes (« authenticated peut écrire ») et exigent
--    en plus le bon rôle. La lecture publique ne change pas.
--    - events / media / flyers / gallery : admin ou éditeur
--    - donation_methods / donations      : admin uniquement

-- events
drop policy if exists "events_write_role_insert" on public.events;
drop policy if exists "events_write_role_update" on public.events;
drop policy if exists "events_write_role_delete" on public.events;
create policy "events_write_role_insert" on public.events
  as restrictive for insert to authenticated
  with check (public.dashboard_role() in ('admin', 'editor'));
create policy "events_write_role_update" on public.events
  as restrictive for update to authenticated
  using (public.dashboard_role() in ('admin', 'editor'))
  with check (public.dashboard_role() in ('admin', 'editor'));
create policy "events_write_role_delete" on public.events
  as restrictive for delete to authenticated
  using (public.dashboard_role() in ('admin', 'editor'));

-- media
drop policy if exists "media_write_role_insert" on public.media;
drop policy if exists "media_write_role_update" on public.media;
drop policy if exists "media_write_role_delete" on public.media;
create policy "media_write_role_insert" on public.media
  as restrictive for insert to authenticated
  with check (public.dashboard_role() in ('admin', 'editor'));
create policy "media_write_role_update" on public.media
  as restrictive for update to authenticated
  using (public.dashboard_role() in ('admin', 'editor'))
  with check (public.dashboard_role() in ('admin', 'editor'));
create policy "media_write_role_delete" on public.media
  as restrictive for delete to authenticated
  using (public.dashboard_role() in ('admin', 'editor'));

-- donation_methods
drop policy if exists "donation_methods_write_role_insert" on public.donation_methods;
drop policy if exists "donation_methods_write_role_update" on public.donation_methods;
drop policy if exists "donation_methods_write_role_delete" on public.donation_methods;
create policy "donation_methods_write_role_insert" on public.donation_methods
  as restrictive for insert to authenticated
  with check (public.dashboard_role() = 'admin');
create policy "donation_methods_write_role_update" on public.donation_methods
  as restrictive for update to authenticated
  using (public.dashboard_role() = 'admin')
  with check (public.dashboard_role() = 'admin');
create policy "donation_methods_write_role_delete" on public.donation_methods
  as restrictive for delete to authenticated
  using (public.dashboard_role() = 'admin');

-- storage : les autres buckets ne sont pas concernés.
drop policy if exists "dashboard_buckets_role_insert" on storage.objects;
drop policy if exists "dashboard_buckets_role_update" on storage.objects;
drop policy if exists "dashboard_buckets_role_delete" on storage.objects;
create policy "dashboard_buckets_role_insert" on storage.objects
  as restrictive for insert to authenticated
  with check (
    bucket_id not in ('flyers', 'gallery', 'donations')
    or (bucket_id in ('flyers', 'gallery') and public.dashboard_role() in ('admin', 'editor'))
    or (bucket_id = 'donations' and public.dashboard_role() = 'admin')
  );
create policy "dashboard_buckets_role_update" on storage.objects
  as restrictive for update to authenticated
  using (
    bucket_id not in ('flyers', 'gallery', 'donations')
    or (bucket_id in ('flyers', 'gallery') and public.dashboard_role() in ('admin', 'editor'))
    or (bucket_id = 'donations' and public.dashboard_role() = 'admin')
  );
create policy "dashboard_buckets_role_delete" on storage.objects
  as restrictive for delete to authenticated
  using (
    bucket_id not in ('flyers', 'gallery', 'donations')
    or (bucket_id in ('flyers', 'gallery') and public.dashboard_role() in ('admin', 'editor'))
    or (bucket_id = 'donations' and public.dashboard_role() = 'admin')
  );

-- 4. Profils de service : ce que chacun sait faire.
--    Supprimé automatiquement quand l'accès est retiré.
create table if not exists public.service_profiles (
  email          text primary key
                 references public.allowed_emails (email)
                 on delete cascade on update cascade,
  full_name      text,
  phone          text,
  services       text[] not null default '{}',
  instruments    text[] not null default '{}',
  other_details  text,
  notes          text,
  updated_at     timestamptz not null default now()
);

-- RLS sans policy : aucun accès côté client. Tout passe par
-- les Server Actions (clé secrète) qui vérifient l'utilisateur.
alter table public.service_profiles enable row level security;
