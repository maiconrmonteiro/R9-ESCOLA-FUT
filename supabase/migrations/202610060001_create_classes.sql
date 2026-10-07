create table public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 3 and 100),
  shift text not null check (shift in ('Matutino', 'Vespertino')),
  training_days text not null check (char_length(trim(training_days)) between 3 and 100),
  start_time time not null,
  end_time time not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint classes_valid_time check (end_time > start_time),
  constraint classes_unique_schedule unique (name, shift, training_days, start_time, end_time)
);

create trigger classes_set_updated_at before update on public.classes
for each row execute function public.set_updated_at();

alter table public.classes enable row level security;

create policy "admins read classes" on public.classes for select to authenticated using (
  exists (select 1 from public.admin_profiles where id = auth.uid())
);
create policy "admins create classes" on public.classes for insert to authenticated with check (
  exists (select 1 from public.admin_profiles where id = auth.uid())
);
create policy "admins update classes" on public.classes for update to authenticated using (
  exists (select 1 from public.admin_profiles where id = auth.uid())
) with check (exists (select 1 from public.admin_profiles where id = auth.uid()));
create policy "admins delete classes" on public.classes for delete to authenticated using (
  exists (select 1 from public.admin_profiles where id = auth.uid())
);

grant select, insert, update, delete on public.classes to authenticated;

insert into public.classes (name, shift, training_days, start_time, end_time) values
  ('Sub 14 ao Sub 16', 'Matutino', 'Terça e Quinta-feira', '10:20', '11:20'),
  ('Sub 14 ao Sub 16', 'Vespertino', 'Terça e Quinta-feira', '16:20', '17:20'),
  ('Sub 10 ao Sub 13', 'Matutino', 'Terça e Quinta-feira', '09:10', '10:10'),
  ('Sub 10 ao Sub 13', 'Vespertino', 'Terça e Quinta-feira', '15:10', '16:10'),
  ('Sub 7 ao Sub 9', 'Matutino', 'Terça-feira', '08:00', '09:00'),
  ('Sub 7 ao Sub 9', 'Vespertino', 'Terça-feira', '14:00', '15:00'),
  ('Feminino Sub 8 ao Sub 16', 'Matutino', 'Quinta-feira', '08:00', '09:00')
on conflict (name, shift, training_days, start_time, end_time) do nothing;
