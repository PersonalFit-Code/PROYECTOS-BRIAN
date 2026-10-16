-- Prueba de las funciones de la base de datos, de punta a punta, contra una base de DESARROLLO
-- recién migrada (0001–0010 + seed). Todo en una transacción que se deshace al final.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/qa-funciones.sql
--
-- Cada comprobación lanza un error con un mensaje claro si falla; si llega al final, imprime
-- «QA FUNCIONES: TODO OK». Cubre: hold y doble reserva, confirmación (sin pisar la ficha de otra
-- clienta), tope de citas web, cambio de hora, notificaciones únicas, panel (crear, cobrar, falta),
-- bonos (emitir idempotente, canjear, cobrar con bono, devolver) y permisos (un usuario sin perfil
-- no ve nada; nadie salvo el servidor ejecuta las funciones).
begin;

do $$
declare
  v_staff uuid; v_staff2 uuid; v_srv uuid; v_hold uuid; v_hold2 uuid; v_b public.bookings; v_b2 public.bookings;
  v_cli uuid; v_email text; v_n uuid; v_n2 uuid; v_prod uuid; v_v public.vouchers; v_v2 public.vouchers;
  v_r public.voucher_redemptions; v_pay public.payments; v_items jsonb; d timestamptz := date_trunc('day', now()) + interval '30 days';
  v_err text; i int;
begin
  insert into public.staff (slug, name) values ('qa-a', 'QA A') returning id into v_staff;
  insert into public.staff (slug, name) values ('qa-b', 'QA B') returning id into v_staff2;
  insert into public.services (slug, name, duration_min, price_cents) values ('qa-mani', 'Manicura QA', 60, 2500) returning id into v_srv;
  v_items := jsonb_build_array(jsonb_build_object('service_id', v_srv, 'name', 'Manicura QA', 'duration_min', 60, 'price_cents', 2500));

  -- 1. Hold y doble reserva
  v_hold := public.book_slot(v_staff, d + interval '10 hours', d + interval '11 hours', v_items, false, 'web');
  begin
    perform public.book_slot(v_staff, d + interval '10 hours 30 minutes', d + interval '11 hours 30 minutes', v_items, false, 'web');
    raise exception 'FALLO: dos holds solapados en la misma profesional';
  exception when exclusion_violation then null;
  end;
  -- tocarse por el borde no es solaparse; otra profesional a la misma hora, tampoco
  perform public.book_slot(v_staff, d + interval '11 hours', d + interval '12 hours', v_items, false, 'web');
  perform public.book_slot(v_staff2, d + interval '10 hours', d + interval '11 hours', v_items, false, 'web');

  -- 2. Confirmar crea la ficha y guarda el contacto en la cita
  v_b := public.confirm_hold(v_hold, 'Ana Real', '+34600000001', 'ana@real.es', 'alergia al látex', true);
  if v_b.id is null or v_b.status <> 'confirmed' or v_b.total_cents <> 2500 then raise exception 'FALLO: confirm_hold no confirmó'; end if;
  if v_b.contact_email <> 'ana@real.es' then raise exception 'FALLO: contacto de la cita'; end if;
  select id, email into v_cli, v_email from public.clients where phone = '+34600000001';
  if v_email <> 'ana@real.es' then raise exception 'FALLO: ficha nueva sin correo'; end if;
  update public.clients set notes = 'Alergia al látex' where id = v_cli; -- la nota de la ficha (la del formulario va en la cita)

  -- 3. Otra persona reserva con el MISMO teléfono y otro correo: la ficha no cambia
  v_hold2 := public.book_slot(v_staff, d + interval '1 day 10 hours', d + interval '1 day 11 hours', v_items, false, 'web');
  v_b2 := public.confirm_hold(v_hold2, 'Atacante', '+34600000001', 'malo@x.com', null, true);
  select email into v_email from public.clients where id = v_cli;
  if v_email <> 'ana@real.es' then raise exception 'FALLO: una reserva web cambió el correo de la ficha (%)', v_email; end if;
  if (select name from public.clients where id = v_cli) <> 'Ana Real' then raise exception 'FALLO: cambió el nombre de la ficha'; end if;
  if v_b2.contact_email <> 'malo@x.com' or v_b2.client_id <> v_cli then raise exception 'FALLO: contacto de la segunda cita'; end if;

  -- 4. Tope: la cuarta cita web futura con el mismo teléfono se rechaza
  v_hold2 := public.book_slot(v_staff, d + interval '2 days 10 hours', d + interval '2 days 11 hours', v_items, false, 'web');
  perform public.confirm_hold(v_hold2, 'Ana', '+34600000001', null, null, false);
  v_hold2 := public.book_slot(v_staff, d + interval '3 days 10 hours', d + interval '3 days 11 hours', v_items, false, 'web');
  begin
    perform public.confirm_hold(v_hold2, 'Ana', '+34600000001', null, null, false);
    raise exception 'FALLO: se aceptó una cuarta cita web futura';
  exception when raise_exception then
    get stacked diagnostics v_err = message_text;
    if v_err <> 'DEMASIADAS_CITAS' then raise; end if;
  end;

  -- 5. Hold caducado → null, y no deja ficha nueva
  update public.bookings set expires_at = now() - interval '1 minute' where id = v_hold2;
  if (public.confirm_hold(v_hold2, 'Nadie', '+34600000099', null, null, false)).id is not null then raise exception 'FALLO: confirmó un hold caducado'; end if;
  if exists (select 1 from public.clients where phone = '+34600000099') then raise exception 'FALLO: hold caducado creó ficha'; end if;
  -- y un hold caducado no bloquea: book_slot lo borra y la hora vuelve a estar libre
  perform public.book_slot(v_staff, d + interval '3 days 10 hours', d + interval '3 days 11 hours', v_items, false, 'web');

  -- 6. Cambiar de hora: misma clave de enlace, mismo contacto, la vieja cancelada
  v_b2 := public.reschedule_booking(v_b.id, v_staff, d + interval '4 days 10 hours', d + interval '4 days 11 hours', 'client');
  if v_b2.manage_token <> v_b.manage_token or v_b2.contact_email <> 'ana@real.es' then raise exception 'FALLO: reschedule no conserva enlace o contacto'; end if;
  if (select status from public.bookings where id = v_b.id) <> 'cancelled' then raise exception 'FALLO: la cita vieja sigue viva'; end if;
  if (select count(*) from public.booking_items where booking_id = v_b2.id) <> 1 then raise exception 'FALLO: reschedule no copió servicios'; end if;

  -- 7. Notificaciones: la segunda vez no se apunta
  v_n := public.queue_notification('email', 'reminder', v_b2.id, null, null);
  v_n2 := public.queue_notification('email', 'reminder', v_b2.id, null, null);
  if v_n is null or v_n2 is not null then raise exception 'FALLO: queue_notification no es idempotente'; end if;

  -- 8. Panel: crear (choca igual), cobrar, falta
  begin
    perform public.create_booking(v_cli, v_staff, d + interval '4 days 10 hours 30 minutes', d + interval '4 days 11 hours 30 minutes', v_items, 'phone', null, null);
    raise exception 'FALLO: el panel creó una cita solapada';
  exception when exclusion_violation then null;
  end;
  v_b := public.create_booking(v_cli, v_staff2, d + interval '5 days 9 hours', d + interval '5 days 10 hours', v_items, 'phone', 'nota', null);
  if v_b.total_cents <> 2500 or v_b.status <> 'confirmed' then raise exception 'FALLO: create_booking'; end if;
  v_pay := public.complete_booking(v_b.id, 'cash', 2500, 300, null, null);
  if (select status from public.bookings where id = v_b.id) <> 'done' or v_pay.tip_cents <> 300 then raise exception 'FALLO: complete_booking'; end if;
  v_b := public.create_booking(v_cli, v_staff2, d + interval '6 days 9 hours', d + interval '6 days 10 hours', v_items, 'phone', null, null);
  perform public.set_booking_status(v_b.id, 'no_show', null, null, null);
  if (select status from public.bookings where id = v_b.id) <> 'no_show' then raise exception 'FALLO: falta'; end if;
  -- una falta libera la hora (la exclusión no la cuenta)
  perform public.create_booking(v_cli, v_staff2, d + interval '6 days 9 hours', d + interval '6 days 10 hours', v_items, 'phone', null, null);

  -- 9. Bonos
  insert into public.voucher_products (slug, name, kind, sessions, price_cents) values ('qa-5', 'Bono 5 QA', 'sessions', 5, 10000) returning id into v_prod;
  v_v := public.issue_voucher(v_prod, 'AS-QAQA-0001', 'Compradora', 'c@x.es', null, null, 'cs_test_qa', 'pi_qa', 'stripe', false, null);
  v_v2 := public.issue_voucher(v_prod, 'AS-QAQA-0002', 'Compradora', 'c@x.es', null, null, 'cs_test_qa', 'pi_qa', 'stripe', false, null);
  if v_v.id is null or v_v2.id is not null then raise exception 'FALLO: el webhook repetido emitió dos bonos'; end if;
  if (select count(*) from public.payments where voucher_id = v_v.id and kind = 'voucher_sale') <> 1 then raise exception 'FALLO: cobro de la venta'; end if;
  v_r := public.redeem_voucher('AS-QAQA-0001', 1, 0, null, null);
  if (select sessions_left from public.vouchers where id = v_v.id) <> 4 or v_r.amount_cents <> 2000 then raise exception 'FALLO: canje de sesión'; end if;
  v_b := public.create_booking(v_cli, v_staff2, d + interval '7 days 9 hours', d + interval '7 days 10 hours', v_items, 'phone', null, null);
  perform public.complete_booking_with_voucher(v_b.id, 'AS-QAQA-0001', 0, 0, null);
  if (select sessions_left from public.vouchers where id = v_v.id) <> 3 then raise exception 'FALLO: cobrar con bono'; end if;
  if (select method from public.payments where booking_id = v_b.id) <> 'voucher' then raise exception 'FALLO: cobro con bono sin método voucher'; end if;
  for i in 1..3 loop perform public.redeem_voucher('AS-QAQA-0001', 1, 0, null, null); end loop;
  if (select status from public.vouchers where id = v_v.id) <> 'used' then raise exception 'FALLO: bono gastado no pasa a used'; end if;
  begin
    perform public.redeem_voucher('AS-QAQA-0001', 1, 0, null, null);
    raise exception 'FALLO: se canjeó un bono gastado';
  exception when raise_exception then
    get stacked diagnostics v_err = message_text;
    if v_err <> 'BONO_NO_ACTIVO' then raise; end if;
  end;
  perform public.refund_voucher('pi_qa', 10000);
  perform public.refund_voucher('pi_qa', 10000);
  if (select count(*) from public.payments where voucher_id = v_v.id and kind = 'refund') <> 1 then raise exception 'FALLO: devolución repetida'; end if;

  -- 10. Las vistas responden
  perform * from public.v_clients where id = v_cli;
  perform * from public.v_voucher_balance;
  perform * from public.public_staff;

  raise notice 'funciones: OK';
end $$;

-- 11. Permisos: un usuario de Auth SIN perfil no ve clientas ni bonos, ni puede ejecutar funciones.
insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000aa', 'intruso@x.com');
select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000aa', true);
set local role authenticated;
do $$
begin
  if exists (select 1 from public.profiles) then raise exception 'FALLO: un registro nuevo tiene perfil'; end if;
  if exists (select 1 from public.clients) then raise exception 'FALLO: un usuario sin perfil ve clientas'; end if;
  if exists (select 1 from public.vouchers) then raise exception 'FALLO: un usuario sin perfil ve bonos'; end if;
  if exists (select 1 from public.bookings) then raise exception 'FALLO: un usuario sin perfil ve citas'; end if;
  begin
    perform public.redeem_voucher('AS-QAQA-0001', 1, 0, null, null);
    raise exception 'FALLO: authenticated puede ejecutar redeem_voucher';
  exception when insufficient_privilege then null;
  end;
  begin
    perform public.book_slot(gen_random_uuid(), now(), now() + interval '1 hour', '[]'::jsonb, false, 'web');
    raise exception 'FALLO: authenticated puede ejecutar book_slot';
  exception when insufficient_privilege then null;
  end;
  raise notice 'permisos (sin perfil): OK';
end $$;
reset role;

-- 12. Anónimo: solo el catálogo público
set local role anon;
do $$
begin
  if exists (select 1 from public.clients) or exists (select 1 from public.bookings) then raise exception 'FALLO: anon ve datos privados'; end if;
  perform * from public.services;
  perform * from public.public_staff;
  begin
    insert into public.clients (name) values ('x');
    raise exception 'FALLO: anon puede insertar clientas';
  exception when insufficient_privilege then null;
  end;
  raise notice 'permisos (anónimo): OK';
end $$;
reset role;

-- 13. Empleada y dueña: cada empleada ve solo sus citas y sus cobros; la dueña lo ve todo.
insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-0000000000a1', 'empleada@x.com'),
  ('00000000-0000-0000-0000-0000000000a2', 'duena@x.com');
insert into public.profiles (id, role, staff_id, display_name)
select '00000000-0000-0000-0000-0000000000a1', 'staff', id, 'Empleada' from public.staff where slug = 'qa-a';
insert into public.profiles (id, role, display_name) values ('00000000-0000-0000-0000-0000000000a2', 'owner', 'Dueña');

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a1', true);
set local role authenticated;
do $$
begin
  if exists (select 1 from public.bookings b join public.staff s on s.id = b.staff_id where s.slug <> 'qa-a') then
    raise exception 'FALLO: la empleada ve citas de otra profesional';
  end if;
  if not exists (select 1 from public.bookings) then raise exception 'FALLO: la empleada no ve sus propias citas'; end if;
  -- los cobros de la QA B (cobro en efectivo del paso 8) no le salen
  if exists (select 1 from public.payments where kind = 'booking' and method = 'cash') then
    raise exception 'FALLO: la empleada ve cobros de otra profesional';
  end if;
  if exists (select 1 from public.notifications) or exists (select 1 from public.audit_log) then
    raise exception 'FALLO: la empleada ve notificaciones o el registro';
  end if;
  -- las notas de la ficha sí (son las alergias que necesita)
  if not exists (select 1 from public.clients where notes is not null) then raise exception 'FALLO: la empleada no ve las notas'; end if;
  raise notice 'permisos (empleada): OK';
end $$;
reset role;

select set_config('request.jwt.claim.sub', '00000000-0000-0000-0000-0000000000a2', true);
set local role authenticated;
do $$
begin
  if not exists (select 1 from public.bookings b join public.staff s on s.id = b.staff_id where s.slug = 'qa-b') then
    raise exception 'FALLO: la dueña no ve todas las citas';
  end if;
  if not exists (select 1 from public.payments where method = 'cash') then raise exception 'FALLO: la dueña no ve todos los cobros'; end if;
  if not exists (select 1 from public.audit_log) then raise exception 'FALLO: la dueña no ve el registro'; end if;
  raise notice 'permisos (dueña): OK';
end $$;
reset role;

do $$ begin raise notice 'QA FUNCIONES: TODO OK'; end $$;
rollback;
