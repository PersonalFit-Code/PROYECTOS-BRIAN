-- Bonos, cobros y notificaciones.
-- Los cobros son CONTABILIDAD DE GESTIÓN (cuánto se ha cobrado, cómo, por qué): no son facturas
-- ni tickets con validez fiscal. Eso sigue saliendo del TPV del salón.

-- Catálogo de bonos (lo edita Andrea). 'sessions' = N sesiones de un servicio (o de cualquiera,
-- service_id null); 'gift' = tarjeta regalo con saldo.
create table public.voucher_products (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  name            text not null,
  description     text,
  kind            text not null check (kind in ('sessions', 'gift')),
  sessions        int check (sessions is null or sessions > 0),
  service_id      uuid references public.services(id) on delete set null,
  value_cents     int check (value_cents is null or value_cents > 0),
  price_cents     int not null check (price_cents > 0),
  -- null = NO CADUCA (lo que recomienda Consumo). Si se pone plazo, va en grande antes de pagar.
  validity_months int check (validity_months is null or validity_months > 0),
  active          boolean not null default true,
  position        int not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint voucher_products_shape check (
    (kind = 'sessions' and sessions is not null) or (kind = 'gift' and value_cents is not null)
  )
);
create trigger voucher_products_updated_at before update on public.voucher_products
  for each row execute function public.set_updated_at();

-- Un bono vendido. `stripe_checkout_session_id` único = idempotencia del webhook: Stripe reintenta
-- y nunca se crean dos bonos del mismo pago.
create table public.vouchers (
  id                         uuid primary key default gen_random_uuid(),
  code                       text not null unique,          -- "AS-7K3M-Q9ZD"
  product_id                 uuid references public.voucher_products(id) on delete set null,
  kind                       text not null check (kind in ('sessions', 'gift')),
  name                       text not null,                 -- nombre del producto, congelado
  sessions_total             int,
  sessions_left              int,
  value_cents                int,
  balance_cents              int,
  price_cents                int not null check (price_cents >= 0),
  buyer_name                 text,
  buyer_email                citext,
  recipient_name             text,
  gift_message               text,
  purchased_at               timestamptz not null default now(),
  expires_at                 timestamptz,
  status                     text not null default 'active'
                               check (status in ('active', 'used', 'expired', 'refunded', 'void')),
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id   text,
  sold_in_salon              boolean not null default false,
  created_by                 uuid references public.profiles(id) on delete set null,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  constraint vouchers_sessions_shape check (
    kind <> 'sessions' or (sessions_total > 0 and sessions_left between 0 and sessions_total)
  ),
  constraint vouchers_gift_shape check (
    kind <> 'gift' or (value_cents > 0 and balance_cents between 0 and value_cents)
  )
);
create trigger vouchers_updated_at before update on public.vouchers
  for each row execute function public.set_updated_at();
create index vouchers_expires on public.vouchers (expires_at) where status = 'active';

create table public.voucher_redemptions (
  id            uuid primary key default gen_random_uuid(),
  voucher_id    uuid not null references public.vouchers(id) on delete cascade,
  booking_id    uuid references public.bookings(id) on delete set null,
  sessions_used int not null default 0 check (sessions_used >= 0),
  amount_cents  int not null default 0 check (amount_cents >= 0),  -- valor consumido (gestión)
  redeemed_by   uuid references public.profiles(id) on delete set null,
  redeemed_at   timestamptz not null default now()
);
create index voucher_redemptions_voucher on public.voucher_redemptions (voucher_id);

-- Cobros. kind: 'booking' (una cita), 'voucher_sale' (venta de bono), 'refund' (devolución, en
-- negativo). method 'voucher' = se pagó con bono (amount = valor consumido, para la analítica).
create table public.payments (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid references public.bookings(id) on delete set null,
  voucher_id    uuid references public.vouchers(id) on delete set null,
  kind          text not null check (kind in ('booking', 'voucher_sale', 'refund')),
  method        text not null check (method in ('card', 'cash', 'bizum', 'voucher', 'stripe')),
  amount_cents  int not null,
  tip_cents     int not null default 0 check (tip_cents >= 0),
  paid_at       timestamptz not null default now(),
  registered_by uuid references public.profiles(id) on delete set null,
  note          text,
  created_at    timestamptz not null default now()
);
create index payments_paid_at on public.payments (paid_at);
create index payments_booking on public.payments (booking_id);

-- Notificaciones enviadas o por enviar. El par (destino, canal, tipo) es único: el cron puede
-- ejecutarse dos veces y el recordatorio solo sale una. Añadir WhatsApp mañana es solo otro
-- valor de `channel`.
create table public.notifications (
  id            uuid primary key default gen_random_uuid(),
  booking_id    uuid references public.bookings(id) on delete cascade,
  voucher_id    uuid references public.vouchers(id) on delete cascade,
  channel       text not null check (channel in ('email', 'whatsapp')),
  kind          text not null check (kind in (
                  'confirmation', 'reminder', 'cancelled', 'rescheduled',
                  'voucher', 'voucher_expiring')),
  status        text not null default 'queued' check (status in ('queued', 'sent', 'failed')),
  attempts      int not null default 0,
  provider_id   text,
  error         text,
  scheduled_for timestamptz,
  sent_at       timestamptz,
  created_at    timestamptz not null default now(),
  constraint notifications_target check (booking_id is not null or voucher_id is not null),
  -- `nulls not distinct` (Postgres 15+): dos filas (cita X, null, email, reminder) chocan aunque
  -- voucher_id sea null. Es una restricción normal, no un índice parcial, para que ON CONFLICT
  -- la encuentre desde PostgREST sin trucos.
  constraint notifications_once unique nulls not distinct (booking_id, voucher_id, channel, kind)
);
create index notifications_pending on public.notifications (status, scheduled_for)
  where status in ('queued', 'failed');
