create extension if not exists pg_trgm;
create extension if not exists unaccent;

create type public.attendance_status as enum ('C', 'F', 'FJ');

create table public.attendance_sessions (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references public.classes(id) on delete cascade,
  session_date date not null,
  source_file text,
  created_at timestamptz not null default now(),
  unique (class_id, session_date)
);

create table public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.attendance_sessions(id) on delete cascade,
  registration_id uuid references public.registrations(id) on delete set null,
  raw_athlete_name text not null,
  status public.attendance_status not null,
  match_confidence numeric(4,3),
  needs_review boolean not null default false,
  created_at timestamptz not null default now(),
  unique (session_id, raw_athlete_name)
);

create index attendance_sessions_date_idx on public.attendance_sessions(session_date desc);
create index attendance_records_registration_idx on public.attendance_records(registration_id);
create index attendance_records_review_idx on public.attendance_records(needs_review) where needs_review;

alter table public.attendance_sessions enable row level security;
alter table public.attendance_records enable row level security;

create policy "admins manage attendance sessions" on public.attendance_sessions for all to authenticated
using (exists (select 1 from public.admin_profiles where id = auth.uid()))
with check (exists (select 1 from public.admin_profiles where id = auth.uid()));
create policy "admins manage attendance records" on public.attendance_records for all to authenticated
using (exists (select 1 from public.admin_profiles where id = auth.uid()))
with check (exists (select 1 from public.admin_profiles where id = auth.uid()));

grant select, insert, update, delete on public.attendance_sessions, public.attendance_records to authenticated;
