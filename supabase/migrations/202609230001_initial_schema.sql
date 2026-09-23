create extension if not exists pgcrypto;

create type public.registration_status as enum ('pending', 'approved', 'rejected');

create table public.admin_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  status public.registration_status not null default 'pending',
  athlete_name text not null check (char_length(athlete_name) between 3 and 120),
  athlete_nickname text,
  birth_date date not null check (birth_date <= current_date),
  athlete_document text,
  naturality text,
  school_name text,
  school_grade text,
  school_shift text,
  address jsonb not null default '{}'::jsonb,
  family jsonb not null default '{}'::jsonb,
  guardian_name text not null,
  guardian_relationship text not null,
  guardian_phone text not null,
  guardian_email text not null,
  health jsonb not null default '{}'::jsonb,
  allergies text[] not null default '{}',
  responsibility_accepted boolean not null check (responsibility_accepted),
  image_consent boolean not null default false,
  signer_name text not null,
  terms_version text not null,
  accepted_at timestamptz not null,
  enrollment_number text unique,
  category text,
  class_name text,
  training_days text,
  training_time text,
  start_date date,
  rejection_reason text,
  decided_at timestamptz,
  decided_by uuid references public.admin_profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.registration_events (
  id bigint generated always as identity primary key,
  registration_id uuid not null references public.registrations(id) on delete cascade,
  actor_id uuid not null references public.admin_profiles(id),
  event_type text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index registrations_status_created_idx on public.registrations(status, created_at desc);
create index registrations_name_idx on public.registrations using gin (to_tsvector('portuguese', athlete_name));
create unique index registrations_pending_duplicate_idx on public.registrations(lower(guardian_email), lower(athlete_name), birth_date) where status = 'pending';
create index registration_events_registration_idx on public.registration_events(registration_id, created_at desc);

create or replace function public.set_updated_at() returns trigger language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end; $$;
create trigger registrations_set_updated_at before update on public.registrations for each row execute function public.set_updated_at();

alter table public.admin_profiles enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_events enable row level security;

create policy "admins read own profile" on public.admin_profiles for select to authenticated using (id = auth.uid());
create policy "public submits pending registrations" on public.registrations for insert to anon with check (
  status = 'pending' and decided_at is null and decided_by is null and enrollment_number is null
);
create policy "admins read registrations" on public.registrations for select to authenticated using (
  exists (select 1 from public.admin_profiles where id = auth.uid())
);
create policy "admins create registrations" on public.registrations for insert to authenticated with check (
  status = 'pending' and exists (select 1 from public.admin_profiles where id = auth.uid())
);
create policy "admins update registrations" on public.registrations for update to authenticated using (
  exists (select 1 from public.admin_profiles where id = auth.uid())
) with check (exists (select 1 from public.admin_profiles where id = auth.uid()));
create policy "admins read events" on public.registration_events for select to authenticated using (
  exists (select 1 from public.admin_profiles where id = auth.uid())
);
create policy "admins create events" on public.registration_events for insert to authenticated with check (
  actor_id = auth.uid() and exists (select 1 from public.admin_profiles where id = auth.uid())
);

revoke all on public.registrations from anon;
grant insert on public.registrations to anon;
grant select, insert, update on public.registrations to authenticated;
grant select on public.admin_profiles to authenticated;
grant select, insert on public.registration_events to authenticated;
