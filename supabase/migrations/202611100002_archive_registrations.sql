-- Substitui a exclusao definitiva por arquivamento reversivel.
alter table public.registrations
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.admin_profiles(id),
  add column if not exists archived_reason text;

alter table public.registrations
  drop constraint if exists registrations_archive_actor_required;

alter table public.registrations
  add constraint registrations_archive_actor_required
  check (
    (archived_at is null and archived_by is null)
    or (archived_at is not null and archived_by is not null)
  );

create index if not exists registrations_active_status_created_idx
  on public.registrations(status, created_at desc)
  where archived_at is null;

-- Uma inscricao arquivada nao deve bloquear um novo cadastro pendente.
drop index if exists public.registrations_pending_duplicate_idx;
create unique index registrations_pending_duplicate_idx
  on public.registrations(lower(guardian_email), lower(athlete_name), birth_date)
  where status = 'pending' and archived_at is null;

-- Nem a aplicacao nem um usuario autenticado devem apagar fichas definitivamente.
drop policy if exists "admins delete registrations" on public.registrations;
revoke delete on public.registrations from authenticated;

