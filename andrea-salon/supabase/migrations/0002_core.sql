-- Núcleo: perfiles, equipo, servicios, horarios y ajustes.
-- Convenciones de todo el esquema: uuid como clave, timestamptz siempre, dinero en CÉNTIMOS
-- enteros, nombres en inglés en SQL (la interfaz traduce), comentarios en castellano.

create or replace function public.set_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Equipo
-- ---------------------------------------------------------------------------
create table public.staff (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  color           text not null default '#B8365A',   -- color de su columna en la agenda
  bio             text,
  specialties     text[] not null default '{}',
  instagram       text,
  photo_path      text,                               -- /images/equipo/<slug>.webp
  active          boolean not null default true,
  bookable_online boolean not null default true,
  position        int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger staff_updated_at before update on public.staff
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Perfiles: uno por usuario de Auth. `role` decide qué ve en el panel; `staff_id` enlaza con su
-- columna de la agenda (la dueña puede tener los dos: ve todo y además atiende).
-- ---------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  role         text not null default 'staff' check (role in ('owner', 'staff')),
  staff_id     uuid references public.staff(id) on delete set null,
  display_name text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Cada usuario nuevo de Auth tiene su perfil al momento, como `staff` por defecto: subir a
-- `owner` es una decisión explícita (scripts/crear-usuario.ts), nunca automática.
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Catálogo de servicios
-- ---------------------------------------------------------------------------
create table public.service_categories (
  id       uuid primary key default gen_random_uuid(),
  slug     text not null unique,
  name     text not null,
  position int not null default 0
);

create table public.services (
  id              uuid primary key default gen_random_uuid(),
  category_id     uuid references public.service_categories(id) on delete set null,
  slug            text not null unique,
  name            text not null,
  description     text,
  duration_min    int not null check (duration_min between 5 and 480),
  -- Tiempo de recogida/limpieza DESPUÉS del servicio. Va sumado en bookings.ends_at, así la
  -- restricción de exclusión lo respeta sin lógica aparte.
  buffer_min      int not null default 0 check (buffer_min between 0 and 120),
  price_cents     int not null check (price_cents >= 0),
  price_is_from   boolean not null default false,   -- "desde 25 €"
  active          boolean not null default true,
  bookable_online boolean not null default true,    -- false = solo con consulta (p. ej. novias)
  position        int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- Quién hace qué. Un servicio sin ninguna profesional no se puede reservar.
create table public.service_staff (
  service_id uuid not null references public.services(id) on delete cascade,
  staff_id   uuid not null references public.staff(id) on delete cascade,
  primary key (service_id, staff_id)
);

-- ---------------------------------------------------------------------------
-- Horarios: plantilla semanal por profesional, con varias franjas por día (mañana y tarde).
-- weekday ISO: 1 = lunes … 7 = domingo. Las horas son LOCALES (Europe/Madrid, en settings).
-- ---------------------------------------------------------------------------
create table public.staff_hours (
  id         uuid primary key default gen_random_uuid(),
  staff_id   uuid not null references public.staff(id) on delete cascade,
  weekday    smallint not null check (weekday between 1 and 7),
  start_time time not null,
  end_time   time not null,
  check (end_time > start_time)
);
create index staff_hours_staff_weekday on public.staff_hours (staff_id, weekday);

-- Ausencias y cierres: vacaciones de una profesional (staff_id) o del salón entero (null).
-- Entran en el cálculo de huecos como tiempo ocupado; no bloquean nada en la base de datos.
create table public.time_off (
  id         uuid primary key default gen_random_uuid(),
  staff_id   uuid references public.staff(id) on delete cascade,
  starts_at  timestamptz not null,
  ends_at    timestamptz not null,
  reason     text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);
create index time_off_staff_starts on public.time_off (staff_id, starts_at);

-- ---------------------------------------------------------------------------
-- Ajustes del negocio, en jsonb para que Andrea los cambie desde el panel sin migraciones.
-- Los escalares se guardan como escalares JSON ('45', '"10:00"') y se leen con (value #>> '{}').
-- Las claves y sus valores por defecto están en seed.sql.
-- ---------------------------------------------------------------------------
create table public.settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);
