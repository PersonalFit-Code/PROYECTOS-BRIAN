-- Oficina: guion a medida por negocio y diario de lo que hace cada puesto.

-- Guion a medida (lo escribe el puesto de Guion). Si está vacío, la app monta uno con lo que sabe del negocio.
alter table propuestas add column guion jsonb;

-- Diario de la oficina: qué ha hecho cada puesto y cuándo.
create table actividad (
  id uuid primary key default gen_random_uuid(),
  puesto text not null check (puesto in ('captacion', 'diagnostico', 'guion', 'oferta', 'diseno')),
  texto text not null check (char_length(texto) between 1 and 300),
  creado timestamptz not null default now()
);
create index actividad_creado_idx on actividad (creado desc);

alter table actividad enable row level security;
create policy equipo_actividad on actividad for all to authenticated
  using ((select auth.uid()) in (select user_id from equipo))
  with check ((select auth.uid()) in (select user_id from equipo));
