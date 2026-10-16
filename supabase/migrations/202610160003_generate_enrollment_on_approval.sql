-- Inscrições entram como pendentes e ainda não são matrículas. O número só é
-- reservado quando o cadastro é aprovado pela escola.
drop trigger if exists registrations_set_enrollment_number on public.registrations;

create or replace function public.set_registration_enrollment_number_on_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_enrollment bigint;
begin
  if new.status = 'approved'
     and old.status is distinct from 'approved'
     and new.enrollment_number is null then
    perform pg_advisory_xact_lock(917202610160003);

    select coalesce(max(enrollment_number::bigint), 0) + 1
    into next_enrollment
    from public.registrations
    where enrollment_number ~ '^[0-9]+$';

    new.enrollment_number = lpad(next_enrollment::text, 2, '0');
  end if;

  return new;
end;
$$;

drop trigger if exists registrations_set_enrollment_on_approval on public.registrations;
create trigger registrations_set_enrollment_on_approval
before update of status on public.registrations
for each row execute function public.set_registration_enrollment_number_on_approval();
