-- Bonos (fase 2): emitir un bono y su cobro en UNA transacción, idempotente para el webhook de
-- Stripe, y devolverlo. Lo llaman el webhook (venta online) y el panel (venta en el salón), siempre
-- con la clave de servicio.
--
-- Convención de importes en `payments`: SIEMPRE positivos; el signo lo da `kind` ('refund' resta).
-- (El comentario de 0004 decía "en negativo"; manda este.)

create or replace function public.issue_voucher(
  p_product        uuid,
  p_code           text,
  p_buyer_name     text,
  p_buyer_email    text,
  p_recipient_name text,
  p_gift_message   text,
  p_stripe_session text,
  p_payment_intent text,
  p_method         text,      -- 'stripe' online; 'card' | 'cash' | 'bizum' en el salón
  p_sold_in_salon  boolean,
  p_actor          uuid
) returns public.vouchers
language plpgsql security definer set search_path = public as $$
declare
  p public.voucher_products;
  v public.vouchers;
begin
  if p_actor is not null then
    perform public.set_actor(p_actor);
  else
    perform set_config('app.actor', case when p_stripe_session is not null then 'webhook' else 'panel' end, true);
  end if;

  select * into p from public.voucher_products where id = p_product;
  if not found then
    raise exception 'BONO_PRODUCTO_NO_EXISTE' using errcode = 'P0001';
  end if;

  insert into public.vouchers (code, product_id, kind, name, sessions_total, sessions_left, value_cents,
                               balance_cents, price_cents, buyer_name, buyer_email, recipient_name,
                               gift_message, expires_at, stripe_checkout_session_id,
                               stripe_payment_intent_id, sold_in_salon, created_by)
  values (p_code, p.id, p.kind, p.name, p.sessions, p.sessions, p.value_cents, p.value_cents,
          p.price_cents, nullif(p_buyer_name, ''), nullif(p_buyer_email, ''), nullif(p_recipient_name, ''),
          nullif(p_gift_message, ''),
          case when p.validity_months is null then null else now() + make_interval(months => p.validity_months) end,
          p_stripe_session, p_payment_intent, coalesce(p_sold_in_salon, false), p_actor)
  on conflict (stripe_checkout_session_id) do nothing
  returning * into v;

  -- Sin fila = ese pago de Stripe ya había emitido su bono (reintento del webhook): nada más.
  if v.id is null then
    return null;
  end if;

  insert into public.payments (kind, voucher_id, method, amount_cents, registered_by, note)
  values ('voucher_sale', v.id, p_method, p.price_cents, p_actor, 'Venta de bono ' || v.code);

  return v;
end $$;

-- Devolución hecha en el dashboard de Stripe (charge.refunded): el bono deja de valer y se apunta
-- la devolución. Idempotente: si ya estaba devuelto no hace nada.
create or replace function public.refund_voucher(p_payment_intent text, p_amount int)
returns public.vouchers
language plpgsql security definer set search_path = public as $$
declare
  v public.vouchers;
begin
  perform set_config('app.actor', 'webhook', true);
  update public.vouchers set status = 'refunded'
   where stripe_payment_intent_id = p_payment_intent and status <> 'refunded'
  returning * into v;
  if v.id is null then
    return null;
  end if;
  insert into public.payments (kind, voucher_id, method, amount_cents, note)
  values ('refund', v.id, 'stripe', greatest(coalesce(p_amount, v.price_cents), 0), 'Devolución en Stripe');
  return v;
end $$;

-- Cobrar una cita con bono: se descuenta (redeem_voucher) y la cita se cierra con un cobro de
-- método 'voucher' por el valor consumido, en la misma transacción.
create or replace function public.complete_booking_with_voucher(
  p_booking uuid,
  p_code    text,
  p_amount  int,     -- solo para tarjetas regalo (importe a descontar)
  p_tip     int,
  p_actor   uuid
) returns public.voucher_redemptions
language plpgsql security definer set search_path = public as $$
declare
  b public.bookings;
  r public.voucher_redemptions;
begin
  perform public.set_actor(p_actor);
  select * into b from public.bookings where id = p_booking for update;
  if not found or b.status not in ('confirmed', 'done') then
    raise exception 'CITA_NO_COBRABLE' using errcode = 'P0001';
  end if;
  r := public.redeem_voucher(p_code, 1, coalesce(p_amount, 0), p_booking, p_actor);
  update public.bookings set status = 'done' where id = p_booking;
  insert into public.payments (kind, booking_id, voucher_id, method, amount_cents, tip_cents, registered_by, note)
  values ('booking', p_booking, r.voucher_id, 'voucher', r.amount_cents, coalesce(p_tip, 0), p_actor, 'Pagado con bono ' || p_code);
  return r;
end $$;

revoke execute on function public.issue_voucher(uuid, text, text, text, text, text, text, text, text, boolean, uuid) from public, anon, authenticated;
revoke execute on function public.refund_voucher(text, int) from public, anon, authenticated;
revoke execute on function public.complete_booking_with_voucher(uuid, text, int, int, uuid) from public, anon, authenticated;
grant execute on function public.issue_voucher(uuid, text, text, text, text, text, text, text, text, boolean, uuid) to service_role;
grant execute on function public.refund_voucher(text, int) to service_role;
grant execute on function public.complete_booking_with_voucher(uuid, text, int, int, uuid) to service_role;
