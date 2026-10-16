-- Solo para probar las migraciones en un Postgres normal (sin Supabase): crea los roles, el esquema
-- `auth` y las funciones mínimas que Supabase trae de serie. NUNCA en el proyecto de Supabase.
--   createdb salon_qa && psql -d salon_qa -f scripts/qa-prelude-postgres.sql
--   for f in supabase/migrations/*.sql supabase/seed.sql; do psql -v ON_ERROR_STOP=1 -d salon_qa -f $f; done
--   psql -v ON_ERROR_STOP=1 -d salon_qa -f scripts/qa-funciones.sql
do $$ begin if not exists (select 1 from pg_roles where rolname = 'anon') then create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls; end if; end $$;
create schema extensions;
create schema auth;
create table auth.users (id uuid primary key default gen_random_uuid(), email text, raw_user_meta_data jsonb default '{}');
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create function auth.role() returns text language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.role', true), ''), current_user) $$;
grant usage on schema public, extensions, auth to anon, authenticated, service_role;
grant all on all tables in schema public to service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant insert, update, delete on tables to authenticated;
-- Supabase pone `extensions` en el search_path de la base de datos; aquí se imita.
alter database salon_qa set search_path = "$user", public, extensions;
