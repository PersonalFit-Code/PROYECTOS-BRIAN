-- Políticas de acceso por fila. En una frase:
--   · anon (la web sin sesión): solo lee el catálogo activo. NO escribe nada: todo lo público
--     entra por el servidor con la clave de servicio, que se salta estas políticas.
--   · staff: ve el catálogo y los ajustes, trabaja con las clientas (todas: con dos o tres
--     empleadas, restringir por "sus" clientas crea duplicados en mostrador), y SOLO SUS citas y
--     sus cobros. Nada de notificaciones, registro ni analítica.
--   · owner: todo.
-- Las métricas por empleada solo las ve la dueña TAMBIÉN AQUÍ, no solo en la interfaz.

alter table public.staff              enable row level security;
alter table public.profiles           enable row level security;
alter table public.service_categories enable row level security;
alter table public.services           enable row level security;
alter table public.service_staff      enable row level security;
alter table public.staff_hours        enable row level security;
alter table public.time_off           enable row level security;
alter table public.settings           enable row level security;
alter table public.clients            enable row level security;
alter table public.bookings           enable row level security;
alter table public.booking_items      enable row level security;
alter table public.voucher_products   enable row level security;
alter table public.vouchers           enable row level security;
alter table public.voucher_redemptions enable row level security;
alter table public.payments           enable row level security;
alter table public.notifications      enable row level security;
alter table public.audit_log          enable row level security;

-- ---------------------------------------------------------------------------
-- Catálogo
-- ---------------------------------------------------------------------------
create policy "catalogo publico: categorias" on public.service_categories
  for select to anon, authenticated using (true);
create policy "catalogo publico: servicios activos" on public.services
  for select to anon, authenticated using (active or public.auth_role() is not null);
create policy "catalogo publico: quien hace que" on public.service_staff
  for select to anon, authenticated using (true);
create policy "catalogo publico: bonos activos" on public.voucher_products
  for select to anon, authenticated using (active or public.auth_role() is not null);
create policy "equipo: leer con sesion" on public.staff
  for select to authenticated using (true);

create policy "owner: categorias" on public.service_categories
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');
create policy "owner: servicios" on public.services
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');
create policy "owner: quien hace que" on public.service_staff
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');
create policy "owner: bonos catalogo" on public.voucher_products
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');
create policy "owner: equipo" on public.staff
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');

-- ---------------------------------------------------------------------------
-- Perfiles, horarios, ausencias, ajustes
-- ---------------------------------------------------------------------------
create policy "perfil: el propio" on public.profiles
  for select to authenticated using (id = auth.uid());
create policy "owner: perfiles" on public.profiles
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');

create policy "staff: leer horarios" on public.staff_hours
  for select to authenticated using (true);
create policy "owner: horarios" on public.staff_hours
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');

create policy "staff: leer ausencias" on public.time_off
  for select to authenticated using (true);
create policy "staff: sus propias ausencias" on public.time_off
  for insert to authenticated with check (staff_id = public.auth_staff_id());
create policy "owner: ausencias" on public.time_off
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');

create policy "staff: leer ajustes" on public.settings
  for select to authenticated using (true);
create policy "owner: ajustes" on public.settings
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');

-- ---------------------------------------------------------------------------
-- Clientas y citas
-- ---------------------------------------------------------------------------
create policy "staff: clientas" on public.clients
  for select to authenticated using (public.auth_role() is not null);
create policy "staff: alta de clientas" on public.clients
  for insert to authenticated with check (public.auth_role() is not null);
create policy "staff: editar clientas" on public.clients
  for update to authenticated using (public.auth_role() is not null) with check (public.auth_role() is not null);
create policy "owner: clientas" on public.clients
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');

create policy "staff: sus citas" on public.bookings
  for select to authenticated using (staff_id = public.auth_staff_id());
create policy "staff: crear sus citas" on public.bookings
  for insert to authenticated with check (staff_id = public.auth_staff_id());
create policy "staff: editar sus citas" on public.bookings
  for update to authenticated using (staff_id = public.auth_staff_id()) with check (staff_id = public.auth_staff_id());
create policy "owner: citas" on public.bookings
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');

create policy "staff: servicios de sus citas" on public.booking_items
  for select to authenticated using (
    exists (select 1 from public.bookings b where b.id = booking_id and b.staff_id = public.auth_staff_id())
  );
create policy "staff: anadir servicios a sus citas" on public.booking_items
  for insert to authenticated with check (
    exists (select 1 from public.bookings b where b.id = booking_id and b.staff_id = public.auth_staff_id())
  );
create policy "staff: editar servicios de sus citas" on public.booking_items
  for update to authenticated using (
    exists (select 1 from public.bookings b where b.id = booking_id and b.staff_id = public.auth_staff_id())
  );
create policy "staff: quitar servicios de sus citas" on public.booking_items
  for delete to authenticated using (
    exists (select 1 from public.bookings b where b.id = booking_id and b.staff_id = public.auth_staff_id())
  );
create policy "owner: servicios de citas" on public.booking_items
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');

-- ---------------------------------------------------------------------------
-- Cobros y bonos
-- ---------------------------------------------------------------------------
create policy "staff: cobros de sus citas" on public.payments
  for select to authenticated using (
    booking_id is not null
    and exists (select 1 from public.bookings b where b.id = booking_id and b.staff_id = public.auth_staff_id())
  );
create policy "staff: cobrar sus citas" on public.payments
  for insert to authenticated with check (
    booking_id is not null
    and exists (select 1 from public.bookings b where b.id = booking_id and b.staff_id = public.auth_staff_id())
  );
create policy "owner: cobros" on public.payments
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');

create policy "staff: ver bonos" on public.vouchers
  for select to authenticated using (public.auth_role() is not null);
create policy "owner: bonos" on public.vouchers
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');

create policy "staff: ver canjes" on public.voucher_redemptions
  for select to authenticated using (public.auth_role() is not null);
create policy "owner: canjes" on public.voucher_redemptions
  for all to authenticated using (public.auth_role() = 'owner') with check (public.auth_role() = 'owner');

-- ---------------------------------------------------------------------------
-- Solo la dueña: notificaciones y registro
-- ---------------------------------------------------------------------------
create policy "owner: notificaciones" on public.notifications
  for select to authenticated using (public.auth_role() = 'owner');
create policy "owner: registro" on public.audit_log
  for select to authenticated using (public.auth_role() = 'owner');
