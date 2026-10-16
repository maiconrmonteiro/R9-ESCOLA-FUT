drop policy if exists "admins delete registrations" on public.registrations;

create policy "admins delete registrations"
on public.registrations
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where id = auth.uid()
  )
);

grant delete on public.registrations to authenticated;
