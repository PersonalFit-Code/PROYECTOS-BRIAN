-- Registro de cambios: quién tocó qué y cuándo. Sirve para el RGPD (registro de accesos y
-- modificaciones) y para las discusiones del día a día ("¿quién movió esta cita?").

create table public.audit_log (
  id          bigserial primary key,
  at          timestamptz not null default now(),
  actor       uuid,            -- auth.uid() cuando hay sesión
  actor_label text,            -- 'web' | 'cron' | 'webhook' | 'script' | rol/uid cuando no hay etiqueta
  action      text not null,   -- INSERT | UPDATE | DELETE
  entity      text not null,   -- nombre de la tabla
  entity_id   uuid,
  before      jsonb,
  after       jsonb
);
create index audit_log_entity on public.audit_log (entity, entity_id);
create index audit_log_at on public.audit_log (at);

-- El servidor, cuando escribe con la clave de servicio (sin usuario), marca quién es con
-- `select set_config('app.actor', 'web', true)` en la misma transacción. Si no lo hace, queda
-- el rol de Postgres, que al menos distingue service_role de authenticated.
create or replace function public.audit_row() returns trigger
language plpgsql security definer set search_path = public as $$
declare
  v_fila   jsonb := case when tg_op = 'DELETE' then to_jsonb(old) else to_jsonb(new) end;
  v_actor  text  := nullif(current_setting('app.actor', true), '');
  v_id     uuid;
begin
  begin
    v_id := (v_fila ->> 'id')::uuid;
  exception when others then
    v_id := null;   -- settings no tiene id
  end;

  insert into public.audit_log (actor, actor_label, action, entity, entity_id, before, after)
  values (
    auth.uid(),
    coalesce(v_actor, auth.role()),
    tg_op,
    tg_table_name,
    v_id,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return null;
end $$;

create trigger audit_bookings after insert or update or delete on public.bookings
  for each row execute function public.audit_row();
create trigger audit_payments after insert or update or delete on public.payments
  for each row execute function public.audit_row();
create trigger audit_vouchers after insert or update or delete on public.vouchers
  for each row execute function public.audit_row();
create trigger audit_voucher_redemptions after insert or update or delete on public.voucher_redemptions
  for each row execute function public.audit_row();
create trigger audit_clients after insert or update or delete on public.clients
  for each row execute function public.audit_row();
create trigger audit_services after insert or update or delete on public.services
  for each row execute function public.audit_row();
create trigger audit_settings after insert or update or delete on public.settings
  for each row execute function public.audit_row();
create trigger audit_time_off after insert or update or delete on public.time_off
  for each row execute function public.audit_row();
