-- Funciones. Las de escritura son SECURITY DEFINER y solo las puede ejecutar el servidor
-- (service_role): la web y el panel nunca las llaman desde el navegador.

-- ---------------------------------------------------------------------------
-- Quién soy (para las políticas RLS). security definer para leer profiles sin pelearse con sus
-- propias políticas; `stable` para que Postgres las evalúe una vez por consulta.
-- ---------------------------------------------------------------------------
create or replace function public.auth_role() returns text
language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.auth_staff_id() returns uuid
language sql stable security definer set search_path = public as $$
  select staff_id from public.profiles where id = auth.uid()
$$;

create or replace function public.setting_int(p_key text, p_default int) returns int
language sql stable set search_path = public as $$
  select coalesce((select (value #>> '{}')::int from public.settings where key = p_key), p_default)
$$;

-- ---------------------------------------------------------------------------
-- Reserva temporal (hold). Primero se barren los hold caducados: la restricción de exclusión no
-- entiende de fechas y, si no, un hold muerto seguiría bloqueando la hora. Si la hora acaba de
-- ocuparse, el INSERT falla con exclusion_violation (23P01) y la API responde 409.
-- p_items: [{ service_id, name, duration_min, price_cents }, …] en el orden elegido.
-- ---------------------------------------------------------------------------
create or replace function public.book_slot(
  p_staff     uuid,
  p_starts    timestamptz,
  p_ends      timestamptz,
  p_items     jsonb,
  p_any_staff boolean default false,
  p_source    text default 'web'
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id   uuid;
  v_hold int := public.setting_int('hold_minutes', 10);
begin
  delete from public.bookings where status = 'hold' and expires_at < now();

  insert into public.bookings (staff_id, starts_at, ends_at, status, expires_at, any_staff, source)
  values (p_staff, p_starts, p_ends, 'hold', now() + make_interval(mins => v_hold),
          coalesce(p_any_staff, false), coalesce(p_source, 'web'))
  returning id into v_id;

  insert into public.booking_items (booking_id, service_id, name, duration_min, price_cents, position)
  select v_id,
         nullif(i ->> 'service_id', '')::uuid,
         i ->> 'name',
         (i ->> 'duration_min')::int,
         (i ->> 'price_cents')::int,
         (ord - 1)::int
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) with ordinality as t(i, ord);

  return v_id;
end $$;

-- ---------------------------------------------------------------------------
-- hold → confirmed. Crea o reutiliza la clienta por teléfono (no se pisa el nombre que ya tenía:
-- lo corrige el salón si hace falta). Devuelve null si el hold ya había caducado: la API responde
-- 410 y el asistente vuelve al paso de la hora.
-- ---------------------------------------------------------------------------
create or replace function public.confirm_hold(
  p_booking   uuid,
  p_name      text,
  p_phone     text,
  p_email     text default null,
  p_notes     text default null,
  p_marketing boolean default false
) returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_client uuid;
  v_total  int;
  v_row    public.bookings;
begin
  -- Primero el hold, bloqueado: si ya caducó se devuelve null sin crear ninguna clienta.
  perform 1 from public.bookings
   where id = p_booking and status = 'hold' and expires_at > now()
   for update;
  if not found then
    return null;
  end if;

  insert into public.clients (name, phone, email, source, marketing_consent, marketing_consent_at)
  values (p_name, p_phone, nullif(p_email, ''), 'web', coalesce(p_marketing, false),
          case when coalesce(p_marketing, false) then now() end)
  on conflict (phone) do update
    set email                = coalesce(excluded.email, public.clients.email),
        marketing_consent    = public.clients.marketing_consent or excluded.marketing_consent,
        marketing_consent_at = coalesce(public.clients.marketing_consent_at, excluded.marketing_consent_at),
        anonymized_at        = null
  returning id into v_client;

  select coalesce(sum(price_cents), 0) into v_total
  from public.booking_items where booking_id = p_booking;

  update public.bookings
     set status      = 'confirmed',
         client_id   = v_client,
         expires_at  = null,
         total_cents = v_total,
         notes       = nullif(p_notes, '')
   where id = p_booking
  returning * into v_row;

  return v_row;
end $$;

-- ---------------------------------------------------------------------------
-- Cambiar una cita de hora: se cancela la vieja y se crea la nueva EN LA MISMA TRANSACCIÓN, en ese
-- orden (si la nueva solapa con la vieja en la misma columna, la exclusión saltaría con la vieja
-- aún viva). Si la nueva choca con otra cita, todo vuelve atrás y la cita original sigue en pie.
-- ---------------------------------------------------------------------------
create or replace function public.reschedule_booking(
  p_old    uuid,
  p_staff  uuid,
  p_starts timestamptz,
  p_ends   timestamptz,
  p_by     text default 'client'
) returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_old public.bookings;
  v_new public.bookings;
begin
  select * into v_old from public.bookings where id = p_old and status = 'confirmed' for update;
  if not found then
    raise exception 'CITA_NO_MODIFICABLE' using errcode = 'P0001';
  end if;

  update public.bookings
     set status = 'cancelled', cancelled_at = now(), cancelled_by = coalesce(p_by, 'client'),
         cancel_reason = 'rescheduled'
   where id = v_old.id;

  insert into public.bookings (client_id, staff_id, starts_at, ends_at, status, source, any_staff,
                               total_cents, notes, rescheduled_from, created_by, manage_token)
  values (v_old.client_id, p_staff, p_starts, p_ends, 'confirmed', v_old.source, false,
          v_old.total_cents, v_old.notes, v_old.id, v_old.created_by, v_old.manage_token)
  returning * into v_new;

  insert into public.booking_items (booking_id, service_id, name, duration_min, price_cents, position)
  select v_new.id, service_id, name, duration_min, price_cents, position
  from public.booking_items where booking_id = v_old.id;

  return v_new;
end $$;

-- ---------------------------------------------------------------------------
-- Canje de bono. Bloquea la fila, comprueba estado, caducidad y saldo, descuenta y apunta el
-- canje. Los errores llevan un código que la interfaz traduce.
-- ---------------------------------------------------------------------------
create or replace function public.redeem_voucher(
  p_code         text,
  p_sessions     int default 1,
  p_amount_cents int default 0,
  p_booking      uuid default null,
  p_actor        uuid default null
) returns public.voucher_redemptions
language plpgsql security definer set search_path = public as $$
declare
  v        public.vouchers;
  v_amount int := 0;
  r        public.voucher_redemptions;
begin
  select * into v from public.vouchers where code = p_code for update;
  if not found then
    raise exception 'BONO_NO_EXISTE' using errcode = 'P0001';
  end if;
  if v.status <> 'active' then
    raise exception 'BONO_NO_ACTIVO' using errcode = 'P0001';
  end if;
  if v.expires_at is not null and v.expires_at < now() then
    update public.vouchers set status = 'expired' where id = v.id;
    raise exception 'BONO_CADUCADO' using errcode = 'P0001';
  end if;

  if v.kind = 'sessions' then
    if coalesce(p_sessions, 0) <= 0 then
      raise exception 'SESIONES_INVALIDAS' using errcode = 'P0001';
    end if;
    if v.sessions_left < p_sessions then
      raise exception 'BONO_SIN_SESIONES' using errcode = 'P0001';
    end if;
    -- Valor consumido, a prorrata del precio pagado (para separar cobrado de consumido).
    v_amount := round(v.price_cents::numeric * p_sessions / v.sessions_total)::int;
    update public.vouchers
       set sessions_left = sessions_left - p_sessions,
           status = case when sessions_left - p_sessions = 0 then 'used' else 'active' end
     where id = v.id;
  else
    if coalesce(p_amount_cents, 0) <= 0 then
      raise exception 'IMPORTE_INVALIDO' using errcode = 'P0001';
    end if;
    if v.balance_cents < p_amount_cents then
      raise exception 'BONO_SIN_SALDO' using errcode = 'P0001';
    end if;
    v_amount := p_amount_cents;
    update public.vouchers
       set balance_cents = balance_cents - p_amount_cents,
           status = case when balance_cents - p_amount_cents = 0 then 'used' else 'active' end
     where id = v.id;
  end if;

  insert into public.voucher_redemptions (voucher_id, booking_id, sessions_used, amount_cents, redeemed_by)
  values (v.id, p_booking, case when v.kind = 'sessions' then p_sessions else 0 end, v_amount, p_actor)
  returning * into r;

  return r;
end $$;

-- ---------------------------------------------------------------------------
-- Apunta una notificación por enviar. Devuelve su id, o NULL si ya existía (ya se envió o ya
-- está en cola): así el cron puede ejecutarse dos veces y el recordatorio sale una sola vez, y
-- una confirmación reintentada no llega duplicada.
-- ---------------------------------------------------------------------------
create or replace function public.queue_notification(
  p_channel   text,
  p_kind      text,
  p_booking   uuid default null,
  p_voucher   uuid default null,
  p_scheduled timestamptz default null
) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_id uuid;
begin
  insert into public.notifications (booking_id, voucher_id, channel, kind, scheduled_for)
  values (p_booking, p_voucher, p_channel, p_kind, p_scheduled)
  on conflict on constraint notifications_once do nothing
  returning id into v_id;
  return v_id;
end $$;

-- Solo el servidor ejecuta las funciones de escritura.
revoke execute on function public.queue_notification(text, text, uuid, uuid, timestamptz) from public, anon, authenticated;
grant execute on function public.queue_notification(text, text, uuid, uuid, timestamptz) to service_role;
revoke execute on function public.book_slot(uuid, timestamptz, timestamptz, jsonb, boolean, text) from public, anon, authenticated;
revoke execute on function public.confirm_hold(uuid, text, text, text, text, boolean) from public, anon, authenticated;
revoke execute on function public.reschedule_booking(uuid, uuid, timestamptz, timestamptz, text) from public, anon, authenticated;
revoke execute on function public.redeem_voucher(text, int, int, uuid, uuid) from public, anon;
grant execute on function public.book_slot(uuid, timestamptz, timestamptz, jsonb, boolean, text) to service_role;
grant execute on function public.confirm_hold(uuid, text, text, text, text, boolean) to service_role;
grant execute on function public.reschedule_booking(uuid, uuid, timestamptz, timestamptz, text) to service_role;
grant execute on function public.redeem_voucher(text, int, int, uuid, uuid) to service_role, authenticated;
