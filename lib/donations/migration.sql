-- ============================================
-- DONATION METHODS — Migration à exécuter dans
-- le SQL Editor de Supabase (une seule fois)
-- ============================================

-- 1. Table donation_methods
create table if not exists public.donation_methods (
  id              uuid primary key default gen_random_uuid(),
  type            text not null unique check (type in ('twint', 'iban', 'stripe')),
  is_enabled      boolean not null default true,
  display_order   integer not null default 0,
  title           text not null,
  subtitle        text,
  -- TWINT
  twint_image_url text,
  -- IBAN
  iban_beneficiary text,
  iban_value       text,
  iban_bank        text,
  iban_bic         text,
  -- STRIPE
  stripe_payment_link text,
  updated_at       timestamptz not null default now()
);

-- 2. RLS
alter table public.donation_methods enable row level security;

drop policy if exists "donation_methods_read_public" on public.donation_methods;
create policy "donation_methods_read_public"
  on public.donation_methods for select
  to anon, authenticated
  using (true);

drop policy if exists "donation_methods_write_authenticated" on public.donation_methods;
create policy "donation_methods_write_authenticated"
  on public.donation_methods for all
  to authenticated
  using (true)
  with check (true);

-- 3. Trigger updated_at (réutilise public.set_updated_at si déjà créé, sinon créé ici)
create or replace function public.set_donation_methods_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_donation_methods_updated_at on public.donation_methods;
create trigger trg_donation_methods_updated_at
  before update on public.donation_methods
  for each row execute function public.set_donation_methods_updated_at();

-- 4. Seed initial (3 méthodes pré-remplies avec les valeurs actuelles)
insert into public.donation_methods (type, display_order, title, subtitle, iban_beneficiary, iban_value, iban_bank, iban_bic)
values
  ('twint',  1, 'TWINT',             'Le moyen le plus rapide depuis la Suisse.',  null, null, null, null),
  ('iban',   2, 'Virement bancaire', 'Suisse et international.',                   'La Maison de David', 'CH37 0078 8000 0510 8559 6', 'Banque Cantonale de Genève (BCGE)', 'BCGECHGGXXX'),
  ('stripe', 3, 'Carte bancaire',    'Visa, Mastercard, Apple Pay, Google Pay.',   null, null, null, null)
on conflict (type) do nothing;

-- 5. Bucket Storage "donations" (pour le QR TWINT)
insert into storage.buckets (id, name, public)
values ('donations', 'donations', true)
on conflict (id) do nothing;

-- 6. Policies sur le bucket
drop policy if exists "donations_public_read"            on storage.objects;
drop policy if exists "donations_authenticated_write"    on storage.objects;
drop policy if exists "donations_authenticated_update"   on storage.objects;
drop policy if exists "donations_authenticated_delete"   on storage.objects;

create policy "donations_public_read"
  on storage.objects for select
  using (bucket_id = 'donations');

create policy "donations_authenticated_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'donations');

create policy "donations_authenticated_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'donations');

create policy "donations_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'donations');
