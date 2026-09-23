-- 1. Crie o usuário no painel Supabase: Authentication > Users > Add user.
-- 2. Copie o UUID criado e execute abaixo no SQL Editor com os valores corretos.
insert into public.admin_profiles (id, full_name)
values ('UUID-DO-USUARIO', 'Nome do administrador');
