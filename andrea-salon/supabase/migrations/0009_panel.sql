-- Operaciones del panel. Las Server Actions comprueban la sesión y el rol y luego llaman a estas
-- funciones con la clave de servicio; aquí se hace cada cambio en UNA transacción y se deja
-- escrito quién fue (`app.actor` = 'panel:<uid>') para que `audit_log` lo recoja.

create or replace function public.set_actor(p_actor uuid) returns void
language sql as $$
  select set_config('app.actor', 'panel:' || coalesce(p_actor::text, 'desconocido'), true);
$$;

-- Cita creada desde el panel (teléfono, mostrador): directamente confirmada. Si choca con otra,
-- la restricción de exclusión salta con 23P01 igual que en la web.
create or replace function public.create_booking(
  p_client  uuid,
  p_staff   uuid,
  p_starts  timestamptz,
  p_ends    timestamptz,
  p_items   jsonb,
  p_source  text,
  p_notes   text,
  p_actor   uuid
) returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_row public.bookings;
begin
  perform public.set_actor(p_actor);
  insert into public.bookings (client_id, staff_id, starts_at, ends_at, status, source, notes, created_by, total_cents)
  values (p_client, p_staff, p_starts, p_ends, 'confirmed', coalesce(p_source, 'panel'), nullif(p_notes, ''), p_actor,
          (select coalesce(sum((i ->> 'price_cents')::int), 0) from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) i))
  returning * into v_row;

  insert into public.booking_items (booking_id, service_id, name, duration_min, price_cents, position)
  select v_row.id, nullif(i ->> 'service_id', '')::uuid, i ->> 'name', (i ->> 'duration_min')::int,
         (i ->> 'price_cents')::int, (ord - 1)::int
  from jsonb_array_elements(coalesce(p_items, '[]'::jsonb)) with ordinality as t(i, ord);

  return v_row;
end $$;

-- Cobrar: la cita pasa a hecha y se apunta el cobro. Es registro de gestión, no una factura.
create or replace function public.complete_booking(
  p_booking uuid,
  p_method  text,
  p_amount  int,
  p_tip     int,
  p_note    text,
  p_actor   uuid
) returns public.payments
language plpgsql security definer set search_path = public as $$
declare
  v_b   public.bookings;
  v_pay public.payments;
begin
  perform public.set_actor(p_actor);
  select * into v_b from public.bookings where id = p_booking for update;
  if not found or v_b.status not in ('confirmed', 'done') then
    raise exception 'CITA_NO_COBRABLE' using errcode = 'P0001';
  end if;
  if p_amount < 0 or coalesce(p_tip, 0) < 0 then
    raise exception 'IMPORTE_INVALIDO' using errcode = 'P0001';
  end if;

  update public.bookings set status = 'done' where id = p_booking;

  insert into public.payments (kind, booking_id, method, amount_cents, tip_cents, note, registered_by)
  values ('booking', p_booking, p_method, p_amount, coalesce(p_tip, 0), nullif(p_note, ''), p_actor)
  returning * into v_pay;
  return v_pay;
end $$;

-- Cambiar el estado sin cobro: cancelada por el salón o por la clienta (que llamó), o falta.
create or replace function public.set_booking_status(
  p_booking uuid,
  p_status  public.booking_status,
  p_by      text,
  p_reason  text,
  p_actor   uuid
) returns public.bookings
language plpgsql security definer set search_path = public as $$
declare
  v_row public.bookings;
begin
  perform public.set_actor(p_actor);
  if p_status not in ('cancelled', 'no_show', 'confirmed') then
    raise exception 'ESTADO_INVALIDO' using errcode = 'P0001';
  end if;
  update public.bookings
     set status        = p_status,
         cancelled_at  = case when p_status = 'cancelled' then now() else null end,
         cancelled_by  = case when p_status = 'cancelled' then coalesce(p_by, 'salon') else null end,
         cancel_reason = case when p_status = 'cancelled' then nullif(p_reason, '') else null end
   where id = p_booking and status in ('confirmed', 'no_show', 'cancelled')
  returning * into v_row;
  if not found then
    raise exception 'CITA_NO_MODIFICABLE' using errcode = 'P0001';
  end if;
  return v_row;
end $$;

revoke execute on function public.set_actor(uuid) from public, anon, authenticated;
revoke execute on function public.create_booking(uuid, uuid, timestamptz, timestamptz, jsonb, text, text, uuid) from public, anon, authenticated;
revoke execute on function public.complete_booking(uuid, text, int, int, text, uuid) from public, anon, authenticated;
revoke execute on function public.set_booking_status(uuid, public.booking_status, text, text, uuid) from public, anon, authenticated;
grant execute on function public.set_actor(uuid) to service_role;
grant execute on function public.create_booking(uuid, uuid, timestamptz, timestamptz, jsonb, text, text, uuid) to service_role;
grant execute on function public.complete_booking(uuid, text, int, int, text, uuid) to service_role;
grant execute on function public.set_booking_status(uuid, public.booking_status, text, text, uuid) to service_role;
