-- Gera a matrícula apenas na aprovação e garante que o valor escolhido esteja
-- realmente livre. O mesmo lock serializa aprovações concorrentes.
create or replace function public.set_registration_enrollment_number_on_approval()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_enrollment bigint;
  candidate text;
begin
  if new.status = 'approved'
     and old.status is distinct from 'approved'
     and new.enrollment_number is null then
    perform pg_catalog.pg_advisory_xact_lock(917202610160003);

    select coalesce(
      max(
        case
          when pg_catalog.btrim(enrollment_number) ~ '^[0-9]+$'
          then pg_catalog.btrim(enrollment_number)::bigint
        end
      ),
      0
    ) + 1
    into next_enrollment
    from public.registrations;

    loop
      candidate := pg_catalog.lpad(next_enrollment::text, 2, '0');

      exit when not exists (
        select 1
        from public.registrations
        where enrollment_number = candidate
      );

      next_enrollment := next_enrollment + 1;
    end loop;

    new.enrollment_number = candidate;
  end if;

  return new;
end;
$$;

drop trigger if exists registrations_set_enrollment_number on public.registrations;
drop trigger if exists registrations_set_enrollment_on_approval on public.registrations;

create trigger registrations_set_enrollment_on_approval
before update of status on public.registrations
for each row execute function public.set_registration_enrollment_number_on_approval();
