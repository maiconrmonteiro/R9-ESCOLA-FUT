alter table public.attendance_sessions
  add column session_status text not null default 'finalized' check (session_status in ('draft', 'finalized')),
  add column taken_by uuid references public.admin_profiles(id),
  add column finalized_at timestamptz,
  add column notes text;

alter table public.attendance_records add column notes text;

update public.attendance_sessions
set finalized_at = created_at
where session_status = 'finalized' and finalized_at is null;

create unique index attendance_records_session_registration_idx
on public.attendance_records(session_id, registration_id)
where registration_id is not null;
