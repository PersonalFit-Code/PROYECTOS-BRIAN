-- Plan de Vida — esquema completo.
--
-- Una sola persona usa la app, pero cada tabla lleva `user_id` igualmente: así las políticas RLS
-- (0002_rls.sql) cierran la base de datos a cualquiera que no sea el dueño de la fila, y si algún
-- día entra otra persona (pareja, un cliente) no hay que rehacer nada.
--
-- Fechas "de calendario" (un hábito de hoy, un gasto de ayer) van en `date` y se calculan en la zona
-- de Madrid desde la app (lib/fechas.ts). Los instantes van en `timestamptz`.
-- Dinero en `numeric(12,2)` y en euros: es una app personal, no una pasarela de pago.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Ajustes y áreas de vida
-- ---------------------------------------------------------------------------
create table public.settings (
  user_id            uuid primary key references auth.users (id) on delete cascade,
  display_name       text not null default 'Brian',
  -- personalidad del coach; vacío = la de serie (lib/coach/personalidad.ts)
  coach_prompt       text,
  -- inversión: aportación mensual prevista y peso de la parte activa (satélite) en %
  monthly_investment numeric(12,2) not null default 300,
  satellite_pct      numeric(5,2) not null default 20,
  inflation_pct      numeric(5,2) not null default 2.5,
  benchmark_symbol   text not null default 'IWDA.AS',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table public.areas (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  slug       text not null,
  name       text not null,
  emoji      text not null default '•',
  color      text not null default 'gray',
  vision     text,
  position   int not null default 0,
  unique (user_id, slug)
);

-- ---------------------------------------------------------------------------
-- Metas y tareas
-- ---------------------------------------------------------------------------
create table public.goals (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  area_id       uuid references public.areas (id) on delete set null,
  title         text not null,
  description   text,
  period        text not null default 'anual' check (period in ('anual', 'trimestral', 'mensual')),
  year          int not null,
  quarter       int check (quarter between 1 and 4),
  month         int check (month between 1 and 12),
  -- progreso medible opcional: de start_value a target_value; sin métrica se usa progress_pct
  unit          text,
  start_value   numeric,
  target_value  numeric,
  current_value numeric,
  progress_pct  numeric(5,2) not null default 0 check (progress_pct between 0 and 100),
  status        text not null default 'activa' check (status in ('activa', 'hecha', 'pausada', 'descartada')),
  due_date      date,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index goals_user_idx on public.goals (user_id, year, status);

create table public.tasks (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  goal_id    uuid references public.goals (id) on delete set null,
  title      text not null,
  due_date   date,
  priority   int not null default 2 check (priority between 1 and 3),
  done       boolean not null default false,
  done_at    timestamptz,
  created_at timestamptz not null default now()
);
create index tasks_user_idx on public.tasks (user_id, done, due_date);

-- ---------------------------------------------------------------------------
-- Hábitos y rutinas
-- ---------------------------------------------------------------------------
-- kind:
--   check    → casilla sí/no
--   cantidad → hecho cuando el valor del día llega a target (vasos de agua, minutos, pasos)
--   dejar    → hábito a dejar: la casilla del día es "hoy NO lo he hecho"; racha = días limpios
-- weekdays: días en que toca (0 = lunes … 6 = domingo). weekly_target: alternativa "N veces por
-- semana, el día que sea"; si está puesto, manda sobre weekdays para el cumplimiento.
create table public.habits (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users (id) on delete cascade,
  area_id       uuid references public.areas (id) on delete set null,
  name          text not null,
  emoji         text not null default '✅',
  kind          text not null default 'check' check (kind in ('check', 'cantidad', 'dejar')),
  target        numeric,
  unit          text,
  routine       text not null default 'dia' check (routine in ('manana', 'dia', 'noche')),
  weekdays      smallint[] not null default '{0,1,2,3,4,5,6}',
  weekly_target smallint check (weekly_target between 1 and 7),
  start_date    date not null default current_date,
  active        boolean not null default true,
  position      int not null default 0,
  created_at    timestamptz not null default now()
);

create table public.habit_logs (
  habit_id   uuid not null references public.habits (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  day        date not null,
  done       boolean not null default false,
  value      numeric,
  note       text,
  updated_at timestamptz not null default now(),
  primary key (habit_id, day)
);
create index habit_logs_user_day_idx on public.habit_logs (user_id, day);

-- ---------------------------------------------------------------------------
-- Diario y revisiones
-- ---------------------------------------------------------------------------
create table public.journal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  day        date not null,
  mood       smallint check (mood between 1 and 5),
  energy     smallint check (energy between 1 and 5),
  gratitude  text,
  body       text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, day)
);

-- period: '2026-W44' (semanal) o '2026-10' (mensual). report: métricas calculadas + ideas.
create table public.reviews (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  kind       text not null check (kind in ('semanal', 'mensual')),
  period     text not null,
  answers    jsonb not null default '{}'::jsonb,
  report     jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, kind, period)
);

-- ---------------------------------------------------------------------------
-- Finanzas
-- ---------------------------------------------------------------------------
create table public.categories (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users (id) on delete cascade,
  name           text not null,
  emoji          text not null default '•',
  kind           text not null check (kind in ('gasto', 'ingreso')),
  monthly_budget numeric(12,2),
  position       int not null default 0,
  unique (user_id, kind, name)
);

-- Gastos fijos, ingresos fijos y suscripciones. El cron apunta el movimiento el día que toca y
-- adelanta next_date.
create table public.recurring_items (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  name            text not null,
  amount          numeric(12,2) not null check (amount > 0),
  kind            text not null default 'gasto' check (kind in ('gasto', 'ingreso')),
  category_id     uuid references public.categories (id) on delete set null,
  frequency       text not null default 'mensual' check (frequency in ('semanal', 'mensual', 'anual')),
  next_date       date not null,
  is_subscription boolean not null default false,
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);

create table public.transactions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  day          date not null,
  amount       numeric(12,2) not null check (amount > 0),
  kind         text not null check (kind in ('gasto', 'ingreso')),
  category_id  uuid references public.categories (id) on delete set null,
  note         text,
  recurring_id uuid references public.recurring_items (id) on delete set null,
  created_at   timestamptz not null default now(),
  -- un recurrente no se apunta dos veces el mismo día aunque el cron corra dos veces
  unique (recurring_id, day)
);
create index transactions_user_day_idx on public.transactions (user_id, day desc);

create table public.savings_goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  emoji       text not null default '🐷',
  target      numeric(12,2) not null check (target > 0),
  saved       numeric(12,2) not null default 0,
  target_date date,
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Patrimonio: cuentas, inversiones y deudas (saldo de deuda en positivo; resta en el neto).
-- symbol: si la cuenta es una posición en un ETF de la lista de seguimiento, para calcular pesos.
create table public.accounts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  name       text not null,
  kind       text not null check (kind in ('liquidez', 'inversion', 'deuda', 'otro')),
  balance    numeric(14,2) not null default 0,
  symbol     text,
  active     boolean not null default true,
  position   int not null default 0,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- Foto del saldo de cada cuenta a principio de mes (cron) → gráfica de patrimonio neto.
create table public.account_snapshots (
  account_id uuid not null references public.accounts (id) on delete cascade,
  user_id    uuid not null references auth.users (id) on delete cascade,
  month      date not null,
  balance    numeric(14,2) not null,
  primary key (account_id, month)
);

-- ---------------------------------------------------------------------------
-- Inversión
-- ---------------------------------------------------------------------------
-- asset_class: renta_variable | renta_fija | liquidez. sleeve: nucleo | satelite.
-- Para renta fija/liquidez sin cotización (cuenta remunerada, Letras) se usa yield_pct a mano.
create table public.watchlist (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  symbol       text not null,
  name         text not null,
  asset_class  text not null check (asset_class in ('renta_variable', 'renta_fija', 'liquidez')),
  sleeve       text not null default 'nucleo' check (sleeve in ('nucleo', 'satelite')),
  target_pct   numeric(5,2) not null default 0,
  quoted       boolean not null default true,
  yield_pct    numeric(5,2),
  active       boolean not null default true,
  position     int not null default 0,
  unique (user_id, symbol)
);

-- Cierres diarios. Compartidos (no son datos personales): sin user_id.
create table public.prices (
  symbol text not null,
  day    date not null,
  close  numeric(14,4) not null,
  primary key (symbol, day)
);

create table public.investment_reports (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  day        date not null,
  summary    text not null,
  mode       text not null check (mode in ('claude', 'reglas')),
  context    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, day)
);

-- Cada recomendación guarda el precio y el benchmark del día para poder puntuarla después.
-- signal: la regla que la generó (lib/inversion/senales.ts); es la unidad que aprende el loop.
create table public.recommendations (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  report_id       uuid references public.investment_reports (id) on delete cascade,
  day             date not null,
  symbol          text not null,
  action          text not null check (action in ('aportar', 'mantener', 'reducir', 'vigilar')),
  sleeve          text not null check (sleeve in ('nucleo', 'satelite')),
  signal          text not null,
  thesis          text not null,
  confidence      smallint not null check (confidence between 1 and 5),
  horizon_days    int not null default 30,
  price_ref       numeric(14,4),
  benchmark_ref   numeric(14,4),
  -- feedback de Brian
  feedback        text check (feedback in ('util', 'no_util')),
  followed        boolean,
  feedback_note   text,
  created_at      timestamptz not null default now(),
  unique (user_id, day, symbol, signal)
);
create index recommendations_user_day_idx on public.recommendations (user_id, day desc);

create table public.recommendation_outcomes (
  recommendation_id uuid not null references public.recommendations (id) on delete cascade,
  user_id           uuid not null references auth.users (id) on delete cascade,
  horizon_days      int not null,
  price             numeric(14,4) not null,
  benchmark         numeric(14,4),
  return_pct        numeric(8,3) not null,
  benchmark_pct     numeric(8,3),
  hit               boolean not null,
  evaluated_at      timestamptz not null default now(),
  primary key (recommendation_id, horizon_days)
);

-- Lo que el loop aprende cada semana: acierto por señal, feedback y pesos resultantes.
create table public.strategy_notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  week       text not null,
  summary    text not null,
  metrics    jsonb not null default '{}'::jsonb,
  weights    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (user_id, week)
);

-- ---------------------------------------------------------------------------
-- Coach y avisos
-- ---------------------------------------------------------------------------
create table public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);
create index chat_messages_user_idx on public.chat_messages (user_id, created_at desc);

create table public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Datos de partida. Idempotente: la app lo llama al entrar (lib/datos/inicio.ts).
-- ---------------------------------------------------------------------------
create or replace function public.seed_user(uid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.settings where user_id = uid) then
    return;
  end if;

  insert into public.settings (user_id) values (uid);

  insert into public.areas (user_id, slug, name, emoji, color, position) values
    (uid, 'salud',       'Salud y físico',       '💪', 'green',  0),
    (uid, 'dinero',      'Dinero y negocio',     '💰', 'yellow', 1),
    (uid, 'crecimiento', 'Crecimiento personal', '📚', 'blue',   2),
    (uid, 'relaciones',  'Relaciones y ocio',    '❤️', 'pink',   3);

  insert into public.categories (user_id, name, emoji, kind, position) values
    (uid, 'Comida',         '🛒', 'gasto', 0),
    (uid, 'Restaurantes',   '🍽️', 'gasto', 1),
    (uid, 'Casa',           '🏠', 'gasto', 2),
    (uid, 'Transporte',     '⛽', 'gasto', 3),
    (uid, 'Suscripciones',  '🔁', 'gasto', 4),
    (uid, 'Salud',          '💊', 'gasto', 5),
    (uid, 'Ocio',           '🎉', 'gasto', 6),
    (uid, 'Ropa',           '👕', 'gasto', 7),
    (uid, 'Formación',      '📚', 'gasto', 8),
    (uid, 'Negocio',        '💼', 'gasto', 9),
    (uid, 'Otros',          '•',  'gasto', 10),
    (uid, 'Nómina / clientes', '💶', 'ingreso', 0),
    (uid, 'Otros ingresos',    '➕', 'ingreso', 1);

  -- Cartera mixta de partida: 80 % núcleo indexado, 20 % satélite. Se cambia en Ajustes.
  insert into public.watchlist (user_id, symbol, name, asset_class, sleeve, target_pct, quoted, yield_pct, position) values
    (uid, 'IWDA.AS', 'iShares Core MSCI World',             'renta_variable', 'nucleo',   50, true,  null, 0),
    (uid, 'IS3N.DE', 'iShares Core MSCI EM IMI',            'renta_variable', 'nucleo',   10, true,  null, 1),
    (uid, 'IBGS.AS', 'iShares € Govt Bond 1-3yr',           'renta_fija',     'nucleo',   10, true,  null, 2),
    (uid, 'LETRAS',  'Letras del Tesoro 12 meses',          'renta_fija',     'nucleo',   10, false, 2.10, 3),
    (uid, 'SXR8.DE', 'iShares Core S&P 500',                'renta_variable', 'satelite', 10, true,  null, 4),
    (uid, 'EXSA.DE', 'iShares STOXX Europe 600',            'renta_variable', 'satelite', 10, true,  null, 5),
    (uid, 'CUENTA',  'Cuenta remunerada (colchón)',         'liquidez',       'nucleo',    0, false, 2.00, 6);
end;
$$;

revoke all on function public.seed_user(uuid) from public, anon, authenticated;
