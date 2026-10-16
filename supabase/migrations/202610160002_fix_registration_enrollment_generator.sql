-- Gera a matrícula a partir do maior número realmente gravado. O lock
-- transacional impede que duas inscrições concorrentes recebam o mesmo valor.
create or replace function public.set_registration_enrollment_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_enrollment bigint;
begin
  perform pg_advisory_xact_lock(917202610160002);

  select coalesce(max(enrollment_number::bigint), 0) + 1
  into next_enrollment
  from public.registrations
  where enrollment_number ~ '^[0-9]+$';

  new.enrollment_number = lpad(next_enrollment::text, 2, '0');
  return new;
end;
$$;

drop trigger if exists registrations_set_enrollment_number on public.registrations;
create trigger registrations_set_enrollment_number
before insert on public.registrations
for each row execute function public.set_registration_enrollment_number();
