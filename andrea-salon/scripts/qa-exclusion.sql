-- Prueba de la restricción que hace imposible la doble reserva. Se ejecuta en el SQL editor de
-- Supabase (o con psql) contra la base de DESARROLLO. Todo va dentro de una transacción que se
-- deshace al final: no deja nada.
--
-- Resultado esperado: el segundo insert falla con
--   ERROR: conflicting key value violates exclusion constraint "bookings_no_overlap" (23P01)
-- y los casos "tocarse por el borde" y "cancelada no bloquea" pasan sin error.
begin;

with s as (select id from public.staff order by position limit 1)
insert into public.bookings (staff_id, starts_at, ends_at, status)
select id, '2030-01-07 10:00+01', '2030-01-07 11:00+01', 'confirmed' from s;

-- Toca por el borde (11:00): NO choca.
with s as (select id from public.staff order by position limit 1)
insert into public.bookings (staff_id, starts_at, ends_at, status)
select id, '2030-01-07 11:00+01', '2030-01-07 12:00+01', 'confirmed' from s;

-- Cancelada encima: NO choca (las canceladas liberan la hora).
with s as (select id from public.staff order by position limit 1)
insert into public.bookings (staff_id, starts_at, ends_at, status, cancelled_at, cancelled_by)
select id, '2030-01-07 10:30+01', '2030-01-07 11:30+01', 'cancelled', now(), 'client' from s;

-- Hold encima de la confirmada: DEBE FALLAR con 23P01.
savepoint antes_del_choque;
with s as (select id from public.staff order by position limit 1)
insert into public.bookings (staff_id, starts_at, ends_at, status, expires_at)
select id, '2030-01-07 10:30+01', '2030-01-07 11:30+01', 'hold', now() + interval '10 minutes' from s;

rollback;
