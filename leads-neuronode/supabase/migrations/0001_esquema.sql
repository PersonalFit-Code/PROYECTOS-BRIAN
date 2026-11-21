-- Leads neuro·node: esquema inicial.
-- App de equipo (Brian y Nico): todo usuario con sesión ve y edita todo. Sin sesión, nada.

create extension if not exists pgcrypto;

-- Negocios a contactar. Solo datos públicos del negocio, nunca de personas.
create table negocios (
  id uuid primary key default gen_random_uuid(),
  clave_unica text not null unique,            -- nombre + localidad normalizados: evita duplicados al importar
  nombre text not null check (char_length(nombre) between 1 and 200),
  sector text not null check (sector in ('fitness', 'clinica', 'hosteleria', 'otro')),
  subsector text,
  comunidad text not null,
  provincia text,
  localidad text,
  direccion text,
  telefono text,
  web text,
  instagram text,
  email_generico text,
  fuente_url text,
  notas text,
  lote int not null default 1,
  dia int check (dia between 1 and 10),        -- día del reto en que toca contactarlo
  estado text not null default 'pendiente' check (
    estado in ('pendiente', 'sin_respuesta', 'volver', 'interesado', 'quiere_propuesta', 'reunion', 'no_interesa', 'no_contactar')
  ),
  responsable uuid references auth.users (id) on delete set null,
  creado timestamptz not null default now(),
  actualizado timestamptz not null default now()
);
create index negocios_dia_idx on negocios (dia);
create index negocios_estado_idx on negocios (estado);
create index negocios_comunidad_sector_idx on negocios (comunidad, sector);

-- Dolores encontrados, cada uno con su prueba. Si no hay prueba, no se apunta.
create table diagnosticos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios (id) on delete cascade,
  dolor text not null check (char_length(dolor) between 1 and 300),
  prueba text not null check (char_length(prueba) between 1 and 600),
  prueba_url text,
  creado timestamptz not null default now()
);
create index diagnosticos_negocio_idx on diagnosticos (negocio_id);

-- Propuesta de cada negocio: guion de llamada, mensaje corto y, si la piden, correo y página visual.
create table propuestas (
  negocio_id uuid primary key references negocios (id) on delete cascade,
  guion_llamada text,
  mensaje_corto text,
  correo_asunto text,
  correo_cuerpo text,
  url_visual text,
  estado text not null default 'borrador' check (estado in ('borrador', 'lista', 'enviada')),
  actualizado timestamptz not null default now()
);

-- Historial de contactos.
create table contactos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios (id) on delete cascade,
  canal text not null check (canal in ('llamada', 'formulario', 'instagram', 'whatsapp', 'correo', 'visita')),
  resultado text not null check (
    resultado in ('sin_respuesta', 'volver', 'interesado', 'quiere_propuesta', 'reunion', 'no_interesa', 'no_contactar')
  ),
  nota text check (char_length(nota) <= 1000),
  proxima_fecha date,
  usuario uuid references auth.users (id) on delete set null,
  creado timestamptz not null default now()
);
create index contactos_negocio_idx on contactos (negocio_id, creado desc);
create index contactos_creado_idx on contactos (creado);

-- Quién ha pedido que se le escriba por correo. Sin una fila aquí, no se le envía nada (LSSI art. 21).
create table consentimientos (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references negocios (id) on delete cascade,
  canal_pedido text not null,                  -- por dónde lo pidió: llamada, instagram…
  detalle text check (char_length(detalle) <= 500),
  usuario uuid references auth.users (id) on delete set null,
  creado timestamptz not null default now()
);
create index consentimientos_negocio_idx on consentimientos (negocio_id);

-- `actualizado` al día.
create function tocar_actualizado() returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.actualizado := now();
  return new;
end;
$$;
create trigger negocios_actualizado before update on negocios for each row execute function tocar_actualizado();
create trigger propuestas_actualizado before update on propuestas for each row execute function tocar_actualizado();

-- Seguridad por filas: solo usuarios con sesión.
alter table negocios enable row level security;
alter table diagnosticos enable row level security;
alter table propuestas enable row level security;
alter table contactos enable row level security;
alter table consentimientos enable row level security;

create policy equipo_negocios on negocios for all to authenticated using (true) with check (true);
create policy equipo_diagnosticos on diagnosticos for all to authenticated using (true) with check (true);
create policy equipo_propuestas on propuestas for all to authenticated using (true) with check (true);
create policy equipo_contactos on contactos for all to authenticated using (true) with check (true);
create policy equipo_consentimientos on consentimientos for all to authenticated using (true) with check (true);
