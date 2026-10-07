-- Numera todos os cadastros existentes pela ordem de criação e mantém a
-- matrícula crescente para os próximos. O preenchimento ocorre no banco para
-- que inscrições públicas e administrativas sigam a mesma regra.
create sequence if not exists public.registration_enrollment_seq;

-- Valores temporários evitam colisões com a restrição unique durante a
-- renumeração de registros que já possuíam matrícula manual.
update public.registrations
set enrollment_number = 'TEMP-' || id::text;

with numbered as (
  select id, row_number() over (order by created_at, id) as number
  from public.registrations
)
update public.registrations as registration
set enrollment_number = lpad(numbered.number::text, 2, '0')
from numbered
where registration.id = numbered.id;

select setval(
  'public.registration_enrollment_seq',
  greatest((select count(*) from public.registrations), 1),
  (select count(*) > 0 from public.registrations)
);

create or replace function public.set_registration_enrollment_number()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.enrollment_number = lpad(nextval('public.registration_enrollment_seq')::text, 2, '0');
  return new;
end;
$$;

drop trigger if exists registrations_set_enrollment_number on public.registrations;
create trigger registrations_set_enrollment_number
before insert on public.registrations
for each row execute function public.set_registration_enrollment_number();

-- O trigger sempre substitui qualquer valor enviado por um número da sequência.
drop policy if exists "public submits pending registrations" on public.registrations;
create policy "public submits pending registrations"
on public.registrations
for insert
to anon
with check (
  status = 'pending'
  and decided_at is null
  and decided_by is null
);
