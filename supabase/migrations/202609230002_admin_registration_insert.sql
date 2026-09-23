-- Permite que administradores autenticados cadastrem inscrições pelo painel.
create policy "admins create registrations"
on public.registrations
for insert
to authenticated
with check (
  status = 'pending'
  and exists (
    select 1 from public.admin_profiles
    where id = auth.uid()
  )
);

grant insert on public.registrations to authenticated;
