-- Corrige a sequência caso matrículas tenham sido importadas, renumeradas ou
-- alteradas manualmente depois da criação do contador automático.
do $$
declare
  highest_enrollment bigint;
begin
  select coalesce(max(enrollment_number::bigint), 0)
  into highest_enrollment
  from public.registrations
  where enrollment_number ~ '^[0-9]+$';

  if highest_enrollment = 0 then
    perform setval('public.registration_enrollment_seq', 1, false);
  else
    perform setval('public.registration_enrollment_seq', highest_enrollment, true);
  end if;
end;
$$;
