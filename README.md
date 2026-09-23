# Plataforma RS9 — primeira versão

Aplicativo Next.js para inscrição pública e gestão administrativa de atletas da Escola de Futebol RS9.

## O que está incluído

- Formulário público em cinco etapas, sem conta para a família.
- Validação compartilhada no cliente e no servidor e armadilha antispam.
- Login administrativo com Supabase Auth.
- Dashboard com totais reais, lista recente e estados vazios.
- Busca, filtro, paginação, ficha completa, aprovação/recusa e dados internos da escola.
- Histórico de decisões e alterações importantes.
- Migration PostgreSQL com restrições, índices e RLS.

## Configurar o Supabase

1. Crie um projeto no Supabase.
2. No SQL Editor, execute `supabase/migrations/202609230001_initial_schema.sql`.
3. Em Authentication > Users, crie manualmente o primeiro usuário. Não habilite cadastro público.
4. Copie o UUID desse usuário e execute uma versão preenchida de `supabase/seed-admin.sql`.
5. Copie `.env.example` para `.env.local` e preencha a URL e a chave `anon` do projeto. Nunca coloque a chave `service_role` no navegador ou no repositório.

## Executar

```bash
npm install
npm run dev
```

Abra `http://localhost:3000/inscricao`. O painel fica em `/admin/login`.

## Publicar na Vercel

Importe o repositório GitHub na Vercel e cadastre as mesmas variáveis de `.env.example`. Defina `NEXT_PUBLIC_SITE_URL` com o domínio final. O comando padrão de build é `npm run build`.

## Pendências antes da produção

- Adicionar a logo oficial como `public/logo-rs9.png` e substituir o marcador textual no componente `Brand`, preservando proporção e arte original.
- Revisar e inserir a transcrição integral do termo de responsabilidade. A fotografia recebida não permite conferência jurídica fiel; a versão atual está identificada como `PENDENTE_REVISAO_2026-01`.
- Definir contato oficial da escola e contato de privacidade nas variáveis correspondentes.
- Para volume público maior, complementar o honeypot com CAPTCHA/Turnstile e limitação de frequência na borda.
- Revisar juridicamente bases legais, prazo de retenção e processo de atendimento aos titulares conforme a LGPD.

Matrícula, categoria, turma, dias, horário e data de início ficam corretamente separados como dados administrativos.
