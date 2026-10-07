-- Transcrição das folhas em docs/1.jpeg ... docs/7.jpeg.
-- C = presença, F = falta, FJ = falta justificada. Células vazias não são importadas.
create temporary table attendance_import (
  class_name text, shift text, session_date date, athlete_name text,
  status public.attendance_status, source_file text
) on commit drop;

insert into attendance_import values
-- Feminino - Matutino (1.jpeg)
('Feminino Sub 8 ao Sub 16','Matutino','2026-08-06','Isabelly da Silva Machado','C','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-08-06','Jennifer Vitória da Silva','F','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-08-06','Raquel Victória Santos Santana','C','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-08-06','Emilly Victória da Silva Corrêa','C','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-08-06','Alice Patorello Farias','C','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-08-27','Isabelly da Silva Machado','C','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-08-27','Jennifer Vitória da Silva','F','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-08-27','Raquel Victória Santos Santana','C','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-08-27','Emilly Victória da Silva Corrêa','C','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-08-27','Alice Patorello Farias','C','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-09-03','Isabelly da Silva Machado','C','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-09-03','Jennifer Vitória da Silva','C','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-09-03','Raquel Victória Santos Santana','F','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-09-03','Emilly Victória da Silva Corrêa','F','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-09-03','Alice Patorello Farias','C','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-09-03','Julia Borba','C','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-09-17','Isabelly da Silva Machado','F','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-09-17','Jennifer Vitória da Silva','F','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-09-17','Raquel Victória Santos Santana','F','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-09-17','Emilly Victória da Silva Corrêa','F','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-09-17','Alice Patorello Farias','C','1.jpeg'),
('Feminino Sub 8 ao Sub 16','Matutino','2026-09-17','Julia Borba','C','1.jpeg'),

-- Sub 7 ao Sub 9 - Matutino (2.jpeg)
('Sub 7 ao Sub 9','Matutino','2026-08-11','Benjamin Soares','F','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-11','Jackson Voldrich da Silva','C','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-11','Enzo Gabriel da Silva Almeida','F','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-11','Matheus Golini Martins','FJ','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-11','Enzo Lourenço','C','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-11','Benício Padilha Goulart','F','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-11','Levi Dalla Porta','C','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-11','Luiz Miguel Amorim Dalla Porta','C','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-11','Luiz Miguel dos Passos','F','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-25','Benjamin Soares','F','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-25','Jackson Voldrich da Silva','C','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-25','Enzo Gabriel da Silva Almeida','F','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-25','Matheus Golini Martins','C','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-25','Enzo Lourenço','C','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-25','Benício Padilha Goulart','C','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-25','Levi Dalla Porta','C','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-25','Luiz Miguel Amorim Dalla Porta','C','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-25','Luiz Miguel dos Passos','C','2.jpeg'),
('Sub 7 ao Sub 9','Matutino','2026-08-25','Eduardo Ferroz Xavier','C','2.jpeg'),

-- Sub 7 ao Sub 9 - Vespertino (7.jpeg)
('Sub 7 ao Sub 9','Vespertino','2026-07-28','João Gabriel de Jesus','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-08-11','Vinícius da Silva Mello','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-08-11','Antônio Moreira Feltz','FJ','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-08-11','Miguel dos Santos','F','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-08-11','Téo Carlos Oliveira Cavalcante','F','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-08-11','Davi Fernandes Ferreira','F','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-08-11','João Gabriel de Jesus','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-08-25','Vinícius da Silva Mello','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-08-25','Antônio Moreira Feltz','FJ','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-08-25','Miguel dos Santos','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-08-25','Téo Carlos Oliveira Cavalcante','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-08-25','Davi Fernandes Ferreira','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-08-25','João Gabriel de Jesus','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-09-08','Vinícius da Silva Mello','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-09-08','Antônio Moreira Feltz','FJ','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-09-08','Miguel dos Santos','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-09-08','Téo Carlos Oliveira Cavalcante','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-09-08','Davi Fernandes Ferreira','F','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-09-08','João Gabriel de Jesus','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-09-15','Vinícius da Silva Mello','FJ','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-09-15','Antônio Moreira Feltz','FJ','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-09-15','Miguel dos Santos','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-09-15','Téo Carlos Oliveira Cavalcante','C','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-09-15','Davi Fernandes Ferreira','F','7.jpeg'),
('Sub 7 ao Sub 9','Vespertino','2026-09-15','João Gabriel de Jesus','C','7.jpeg');

-- Registros legíveis das folhas com maior volume (3.jpeg a 6.jpeg).
-- Marcações “SUSP”, rasuras e células sem leitura segura foram deliberadamente omitidas.
insert into attendance_import values
('Sub 10 ao Sub 13','Matutino','2026-09-17','Nicolas Raphael Lemos Ribeiro','F','3.jpeg'),
('Sub 10 ao Sub 13','Matutino','2026-09-17','Emmanuel Crismarques Oliveira Alves','C','3.jpeg'),
('Sub 10 ao Sub 13','Matutino','2026-09-17','Vitor Hugo da Silva','C','3.jpeg'),
('Sub 10 ao Sub 13','Matutino','2026-09-17','Marco Aurélio Eis Filho','C','3.jpeg'),
('Sub 10 ao Sub 13','Matutino','2026-09-17','Vicente Luiz de Souza Silva','C','3.jpeg'),
('Sub 10 ao Sub 13','Matutino','2026-09-17','Vitor Hugo de Souza Loreto','C','3.jpeg'),
('Sub 10 ao Sub 13','Matutino','2026-09-17','João Marcos da Silva','C','3.jpeg'),
('Sub 10 ao Sub 13','Matutino','2026-09-17','Luiz Henrique Andrade Nascimento','C','3.jpeg'),
('Sub 10 ao Sub 13','Matutino','2026-09-17','Richard Yuri Klaus da Silva','F','3.jpeg'),
('Sub 10 ao Sub 13','Matutino','2026-09-17','Alex Bernardo da Luz Oliveira','C','3.jpeg'),
('Sub 10 ao Sub 13','Matutino','2026-09-17','Heitor B. V. Banos','C','3.jpeg'),

('Sub 14 ao Sub 16','Matutino','2026-09-17','Daniel Medeiros da Silva','C','4.jpeg'),
('Sub 14 ao Sub 16','Matutino','2026-09-17','Bernardo L. Zanella Brancaglione','C','4.jpeg'),
('Sub 14 ao Sub 16','Matutino','2026-09-17','Maycon Natan Machado','C','4.jpeg'),
('Sub 14 ao Sub 16','Matutino','2026-09-17','Erick dos Passos de Oliveira','C','4.jpeg'),
('Sub 14 ao Sub 16','Matutino','2026-09-17','Adryan Lucas de Oliveira Trancoso','C','4.jpeg'),
('Sub 14 ao Sub 16','Matutino','2026-09-17','Lucas Vieira Machado','C','4.jpeg'),
('Sub 14 ao Sub 16','Matutino','2026-09-17','Antony Rafael Buhrer','C','4.jpeg'),
('Sub 14 ao Sub 16','Matutino','2026-09-17','Enzo da Luz de Oliveira','C','4.jpeg'),
('Sub 14 ao Sub 16','Matutino','2026-09-17','Jean Gustavo de Liz','C','4.jpeg'),
('Sub 14 ao Sub 16','Matutino','2026-09-17','Henrique de Liz Gonçalvez','C','4.jpeg'),
('Sub 14 ao Sub 16','Matutino','2026-09-17','Lucas Davi Santos Xavier','F','4.jpeg'),
('Sub 14 ao Sub 16','Matutino','2026-09-17','João Pedro da Rosa','C','4.jpeg'),
('Sub 14 ao Sub 16','Matutino','2026-09-17','Christopher Ricardo','C','4.jpeg'),

('Sub 10 ao Sub 13','Vespertino','2026-09-17','Rafael Rodrigo Silva','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Davi Daniel Antunes de Jesus','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Davi da Silva de Lima','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Arthur Borba','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Pedro Marcos da Silva Martins','F','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Eduardo de Freitas Camargo','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Kaio Vinícius Silva','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Pietro Garcia Magalhães','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Lohan de Almeida José','FJ','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Arthur Neves de Carvalho','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Vitor Alexandre Cabral Machado','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Liam Noel Volggi','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Andrey Oliveira Neyssinger','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Vinicius S Amorim','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Davi Luiz Peres','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Alysson Back dos Santos','C','5.jpeg'),
('Sub 10 ao Sub 13','Vespertino','2026-09-17','Ryan Gomes Ramos','FJ','5.jpeg'),

('Sub 14 ao Sub 16','Vespertino','2026-09-15','Danilo Alves Ferreira','C','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Diogo Vidal da Silva','F','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Elias Alves Junior','F','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','João Arthur Valêncio','FJ','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Ícaro Reis Ferreira','F','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Edson Adriano Veiga Junior','C','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Pedro Lucas Xavier','C','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Rafael Fernando de Souza Silva','FJ','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Samir Alejandro Machado Perez','F','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Irineu Vieira Santi','FJ','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Ícaro de Paiva Gomes','C','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Francisco Nunes de Souza','C','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Lucas Eduardo M Kachenlorge','F','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Matheus da Silva Paz','C','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Victor Gabriel da Silva','C','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Sohan B. Hernandez','F','6.jpeg'),
('Sub 14 ao Sub 16','Vespertino','2026-09-15','Nicolas Matheus P. da Silva','C','6.jpeg');

-- Cria as aulas encontradas nas folhas.
insert into public.attendance_sessions (class_id, session_date, source_file)
select distinct c.id, i.session_date, i.source_file
from attendance_import i join public.classes c on lower(c.name) = lower(i.class_name) and c.shift = i.shift
on conflict (class_id, session_date) do update set source_file = excluded.source_file;

-- Resolve o melhor atleta pelo nome e prioriza quem já pertence à mesma turma.
with candidates as (
  select i.*, s.id session_id, r.id registration_id,
    similarity(lower(unaccent(r.athlete_name)), lower(unaccent(i.athlete_name))) score,
    row_number() over (partition by s.id, i.athlete_name order by
      (r.class_id = s.class_id) desc nulls last,
      similarity(lower(unaccent(r.athlete_name)), lower(unaccent(i.athlete_name))) desc
    ) ranking
  from attendance_import i
  join public.classes c on lower(c.name) = lower(i.class_name) and c.shift = i.shift
  join public.attendance_sessions s on s.class_id = c.id and s.session_date = i.session_date
  left join public.registrations r on similarity(lower(unaccent(r.athlete_name)), lower(unaccent(i.athlete_name))) >= 0.42
), best as (
  select * from candidates where ranking = 1
)
insert into public.attendance_records (session_id, registration_id, raw_athlete_name, status, match_confidence, needs_review)
select session_id,
  case when score >= 0.62 then registration_id else null end,
  athlete_name, status, score,
  coalesce(score, 0) < 0.82
from best
on conflict (session_id, raw_athlete_name) do update set
  registration_id = excluded.registration_id, status = excluded.status,
  match_confidence = excluded.match_confidence, needs_review = excluded.needs_review;
