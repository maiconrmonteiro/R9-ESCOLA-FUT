-- Mantém registros antigos e exige autorização de imagem nas novas inscrições.
alter table public.registrations
  add constraint registrations_image_consent_required
  check (image_consent) not valid;
