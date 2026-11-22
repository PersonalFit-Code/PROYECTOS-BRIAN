-- Inscripciones del torneo. Ejecutar una vez en el SQL editor de Supabase.
-- La tabla no es legible desde la web (contiene DNI): solo se accede por las dos funciones.

create table if not exists public.equipos (
  id                bigint generated always as identity primary key,
  creado            timestamptz not null default now(),
  nombre            text not null,
  color             text,
  capitan_nombre    text not null,
  capitan_dni       text not null,
  capitan_telefono  text not null,
  capitan_email     text not null,
  jugadores         jsonb not null,
  estado            text not null default 'pendiente'
                    check (estado in ('pendiente','pagado','espera','cancelado')),
  precio            integer not null,
  notas             text
);

create unique index if not exists equipos_nombre_unico
  on public.equipos (lower(trim(nombre))) where estado <> 'cancelado';

alter table public.equipos enable row level security;
-- Sin políticas: anon no puede leer ni escribir la tabla directamente.

-- Ajustes del torneo
create or replace function public._cfg() returns jsonb language sql immutable as $$
  select jsonb_build_object(
    'total', 32,            -- plazas
    'early', 10,            -- equipos con precio reducido
    'precio_early', 150,
    'precio', 180,
    'horas_reserva', 72     -- una inscripción sin pagar deja de ocupar plaza pasadas estas horas
  );
$$;

create or replace function public._ocupadas() returns integer
language sql stable security definer set search_path = public as $$
  select count(*)::int from public.equipos
  where estado = 'pagado'
     or (estado = 'pendiente'
         and creado > now() - make_interval(hours => (public._cfg()->>'horas_reserva')::int));
$$;

-- Lo que muestra el contador de la web
create or replace function public.plazas() returns jsonb
language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'total',     (c->>'total')::int,
    'ocupadas',  least(o, (c->>'total')::int),
    'libres',    greatest((c->>'total')::int - o, 0),
    'precio',    case when o < (c->>'early')::int then (c->>'precio_early')::int else (c->>'precio')::int end,
    'early_restantes', greatest((c->>'early')::int - o, 0)
  )
  from (select public._cfg() c, public._ocupadas() o) x;
$$;

-- Alta de un equipo. Atómica: dos inscripciones simultáneas no pueden coger la misma plaza.
create or replace function public.inscribir(datos jsonb) returns jsonb
language plpgsql security definer set search_path = public as $$
declare
  c jsonb := public._cfg();
  o integer;
  n integer;
  v_estado text;
  v_precio integer;
  v_id bigint;
  j jsonb;
begin
  perform pg_advisory_xact_lock(74120261226);

  if length(trim(coalesce(datos->>'nombre',''))) < 2 then raise exception 'Falta el nombre del equipo'; end if;
  if length(trim(coalesce(datos->>'capitan_nombre',''))) < 3 then raise exception 'Falta el nombre del capitán'; end if;
  if length(trim(coalesce(datos->>'capitan_dni',''))) < 8 then raise exception 'DNI del capitán no válido'; end if;
  if length(regexp_replace(coalesce(datos->>'capitan_telefono',''), '\D', '', 'g')) < 9 then raise exception 'Teléfono no válido'; end if;
  if coalesce(datos->>'capitan_email','') !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Email no válido'; end if;
  if jsonb_typeof(datos->'jugadores') <> 'array' then raise exception 'Faltan los jugadores'; end if;

  n := jsonb_array_length(datos->'jugadores');
  if n < 9 or n > 14 then raise exception 'El equipo debe tener entre 9 y 14 jugadores'; end if;
  for j in select * from jsonb_array_elements(datos->'jugadores') loop
    if length(trim(coalesce(j->>'nombre',''))) < 3 or length(trim(coalesce(j->>'dni',''))) < 8
       or coalesce(j->>'nacimiento','') !~ '^\d{4}-\d{2}-\d{2}$' then
      raise exception 'Revisa los datos de los jugadores (nombre, DNI y fecha de nacimiento)';
    end if;
  end loop;

  if exists (select 1 from public.equipos
             where lower(trim(nombre)) = lower(trim(datos->>'nombre')) and estado <> 'cancelado') then
    raise exception 'Ya hay un equipo inscrito con ese nombre';
  end if;

  o := public._ocupadas();
  v_estado := case when o >= (c->>'total')::int then 'espera' else 'pendiente' end;
  v_precio := case when o < (c->>'early')::int then (c->>'precio_early')::int else (c->>'precio')::int end;

  insert into public.equipos (nombre, color, capitan_nombre, capitan_dni, capitan_telefono, capitan_email, jugadores, estado, precio)
  values (trim(datos->>'nombre'), nullif(trim(coalesce(datos->>'color','')), ''), trim(datos->>'capitan_nombre'),
          upper(trim(datos->>'capitan_dni')), trim(datos->>'capitan_telefono'), lower(trim(datos->>'capitan_email')),
          datos->'jugadores', v_estado, v_precio)
  returning id into v_id;

  return jsonb_build_object('id', v_id, 'estado', v_estado, 'precio', v_precio,
                            'horas_reserva', (c->>'horas_reserva')::int);
end;
$$;

revoke all on function public._cfg(), public._ocupadas() from public, anon, authenticated;
revoke all on function public.plazas(), public.inscribir(jsonb) from public;
grant execute on function public.plazas(), public.inscribir(jsonb) to anon, authenticated;
