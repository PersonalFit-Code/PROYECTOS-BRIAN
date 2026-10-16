-- Extensiones. Supabase las instala en el esquema `extensions`, que está en el search_path.
--  · btree_gist: hace falta para la restricción de exclusión de `bookings` (uuid = y tstzrange &&
--    en el mismo índice GiST). Es LA pieza que hace imposible la doble reserva.
--  · pgcrypto: gen_random_uuid().
--  · citext: correos comparados sin distinguir mayúsculas.
create extension if not exists btree_gist with schema extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists citext with schema extensions;
