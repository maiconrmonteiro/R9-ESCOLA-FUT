alter table public.registrations
  add column class_id uuid references public.classes(id) on delete set null;

create index registrations_class_idx on public.registrations(class_id, athlete_name);

-- Aproveita vínculos digitados anteriormente quando o texto corresponde à turma.
update public.registrations r
set class_id = c.id
from public.classes c
where r.class_id is null
  and regexp_replace(lower(coalesce(r.class_name, '')), '[^a-z0-9]+', '', 'g') =
      regexp_replace(lower(c.name || c.shift), '[^a-z0-9]+', '', 'g');

create or replace function public.sync_registration_class_fields()
returns trigger language plpgsql security invoker set search_path = '' as $$
declare selected_class public.classes%rowtype;
begin
  if new.class_id is null then
    if tg_op = 'UPDATE' and old.class_id is not null then
      new.class_name = null;
      new.training_days = null;
      new.training_time = null;
    end if;
    return new;
  end if;

  select * into selected_class from public.classes where id = new.class_id;
  new.class_name = selected_class.name || ' ' || selected_class.shift;
  new.training_days = selected_class.training_days;
  new.training_time = to_char(selected_class.start_time, 'HH24:MI') || ' às ' || to_char(selected_class.end_time, 'HH24:MI');
  return new;
end;
$$;

create trigger registrations_sync_class_fields
before insert or update of class_id on public.registrations
for each row execute function public.sync_registration_class_fields();

create or replace function public.propagate_class_fields()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  update public.registrations
  set class_name = new.name || ' ' || new.shift,
      training_days = new.training_days,
      training_time = to_char(new.start_time, 'HH24:MI') || ' às ' || to_char(new.end_time, 'HH24:MI')
  where class_id = new.id;
  return new;
end;
$$;

create trigger classes_propagate_fields
after update of name, shift, training_days, start_time, end_time on public.classes
for each row execute function public.propagate_class_fields();
