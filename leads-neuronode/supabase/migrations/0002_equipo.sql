-- Lista cerrada de quién puede usar la app. Tener sesión no basta: hay que estar aquí.
create table equipo (
  user_id uuid primary key references auth.users (id) on delete cascade,
  nombre text not null,
  creado timestamptz not null default now()
);
alter table equipo enable row level security;
-- Cada uno solo ve su propia fila; nadie puede añadirse desde la app (las altas se hacen a mano).
create policy equipo_propia on equipo for select to authenticated using (user_id = (select auth.uid()));

drop policy equipo_negocios on negocios;
drop policy equipo_diagnosticos on diagnosticos;
drop policy equipo_propuestas on propuestas;
drop policy equipo_contactos on contactos;
drop policy equipo_consentimientos on consentimientos;

create policy equipo_negocios on negocios for all to authenticated
  using ((select auth.uid()) in (select user_id from equipo)) with check ((select auth.uid()) in (select user_id from equipo));
create policy equipo_diagnosticos on diagnosticos for all to authenticated
  using ((select auth.uid()) in (select user_id from equipo)) with check ((select auth.uid()) in (select user_id from equipo));
create policy equipo_propuestas on propuestas for all to authenticated
  using ((select auth.uid()) in (select user_id from equipo)) with check ((select auth.uid()) in (select user_id from equipo));
create policy equipo_contactos on contactos for all to authenticated
  using ((select auth.uid()) in (select user_id from equipo)) with check ((select auth.uid()) in (select user_id from equipo));
create policy equipo_consentimientos on consentimientos for all to authenticated
  using ((select auth.uid()) in (select user_id from equipo)) with check ((select auth.uid()) in (select user_id from equipo));
