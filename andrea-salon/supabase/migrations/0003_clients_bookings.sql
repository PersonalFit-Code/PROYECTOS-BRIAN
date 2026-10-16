-- Clientas y citas. Aquí vive la regla más importante del proyecto: la restricción de exclusión
-- que hace que dos citas de la misma profesional no puedan solaparse, pase lo que pase en la
-- aplicación (dos clientas pulsando a la vez, el panel y la web a la vez, una importación…).

create table public.clients (
  id                   uuid primary key default gen_random_uuid(),
  name                 text not null,
  phone                text unique,          -- E.164 (+34…), normalizado en la app (lib/phone.ts)
  email                citext,
  -- Notas del salón: aquí acaban alergias y reacciones a productos, que pueden ser dato de
  -- salud. Solo las ve el equipo con sesión y no salen en exportaciones por defecto.
  notes                text,
  marketing_consent    boolean not null default false,
  marketing_consent_at timestamptz,
  whatsapp_consent     boolean not null default false,   -- preparado para cuando se active
  source               text not null default 'web' check (source in ('web', 'panel', 'import')),
  anonymized_at        timestamptz,          -- derecho de supresión: se borra el contenido, no la fila
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
create trigger clients_updated_at before update on public.clients
  for each row execute function public.set_updated_at();
create index clients_name_idx on public.clients (lower(name));

-- hold: la clienta ha elegido hora y está rellenando sus datos (caduca en minutos).
-- confirmed → done (cobrada) | cancelled | no_show.
create type public.booking_status as enum ('hold', 'confirmed', 'done', 'cancelled', 'no_show');

create table public.bookings (
  id                  uuid primary key default gen_random_uuid(),
  client_id           uuid references public.clients(id) on delete set null,  -- null solo en hold
  staff_id            uuid not null references public.staff(id),
  starts_at           timestamptz not null,
  ends_at             timestamptz not null,   -- incluye el buffer del último servicio
  status              public.booking_status not null default 'hold',
  expires_at          timestamptz,            -- solo para hold
  source              text not null default 'web'
                        check (source in ('web', 'phone', 'walkin', 'panel', 'import')),
  any_staff           boolean not null default false,  -- "me da igual": la asignó el sistema
  manage_token        uuid not null default gen_random_uuid(),  -- enlace de la clienta (+ HMAC)
  client_confirmed_at timestamptz,            -- "Sí, voy" del recordatorio (semáforo verde)
  cancelled_at        timestamptz,
  cancelled_by        text check (cancelled_by in ('client', 'salon', 'system')),
  cancel_reason       text,
  rescheduled_from    uuid references public.bookings(id) on delete set null,
  total_cents         int,
  notes               text,
  -- Contacto tecleado AL RESERVAR por la web. Los correos de esta cita van aquí, no al correo de la
  -- ficha: quien reserva con el teléfono de otra persona no puede cambiar a dónde le llegan a ella
  -- sus avisos, ni ver su nombre. Null en las citas del panel (se usa la ficha).
  contact_name        text,
  contact_email       citext,
  created_by          uuid references public.profiles(id) on delete set null,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint bookings_ends_after_starts check (ends_at > starts_at),
  constraint bookings_hold_has_expiry  check (status <> 'hold' or expires_at is not null)
);
create trigger bookings_updated_at before update on public.bookings
  for each row execute function public.set_updated_at();

-- LA restricción. `[)` para que una cita que acaba a las 11:00 y otra que empieza a las 11:00 no
-- choquen. El predicado deja fuera las canceladas y las faltas (liberan la hora) e INCLUYE los
-- hold: la reserva temporal está protegida por la misma regla, sin tabla aparte. Un hold caducado
-- lo borra book_slot() antes de insertar (ver 0006), porque la restricción no sabe de fechas.
alter table public.bookings add constraint bookings_no_overlap
  exclude using gist (
    staff_id with =,
    tstzrange(starts_at, ends_at, '[)') with &&
  )
  where (status in ('hold', 'confirmed', 'done'));

create index bookings_staff_starts on public.bookings (staff_id, starts_at);
create index bookings_client on public.bookings (client_id);
create index bookings_hold_expiry on public.bookings (expires_at) where status = 'hold';
create index bookings_confirmed_starts on public.bookings (starts_at) where status = 'confirmed';
-- NO es único: reschedule_booking() copia el manage_token a la cita nueva para que el enlace del
-- correo siga valiendo. Quien busque por token coge la más reciente (created_at desc).
create index bookings_manage_token on public.bookings (manage_token);

-- Servicios de la cita con nombre, duración y precio CONGELADOS: si Andrea sube un precio mañana,
-- la cita de hoy sigue valiendo lo que se le dijo a la clienta.
create table public.booking_items (
  id           uuid primary key default gen_random_uuid(),
  booking_id   uuid not null references public.bookings(id) on delete cascade,
  service_id   uuid references public.services(id) on delete set null,
  name         text not null,
  duration_min int not null check (duration_min > 0),
  price_cents  int not null check (price_cents >= 0),
  position     int not null default 0
);
create index booking_items_booking on public.booking_items (booking_id);
