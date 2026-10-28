-- Efectivo o tarjeta en cada movimiento, y que el saldo de la cuenta correspondiente se mueva solo.
-- accounts.pago dice qué cuenta paga cada método; un trigger resuelve la cuenta al apuntar y ajusta su
-- saldo al crear, cambiar o borrar el movimiento (venga del botón +, del coach o del cron de fijos).

alter table public.transactions add column if not exists method text check (method in ('efectivo', 'tarjeta'));
alter table public.transactions add column if not exists account_id uuid references public.accounts (id) on delete set null;
alter table public.recurring_items add column if not exists method text not null default 'tarjeta' check (method in ('efectivo', 'tarjeta'));
alter table public.accounts add column if not exists pago text check (pago in ('efectivo', 'tarjeta'));

create unique index if not exists accounts_pago_unico on public.accounts (user_id, pago) where pago is not null and active;

-- Antes de insertar: la cuenta del método, si no viene dada.
create or replace function public.cuenta_del_metodo() returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  if new.account_id is null and new.method is not null then
    select id into new.account_id from public.accounts
      where user_id = new.user_id and pago = new.method and active
      limit 1;
  end if;
  return new;
end;
$$;

-- Después: + para ingresos, − para gastos; al cambiar, se deshace lo anterior y se aplica lo nuevo.
create or replace function public.ajustar_saldo_movimiento() returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  if tg_op in ('UPDATE', 'DELETE') and old.account_id is not null then
    update public.accounts
      set balance = balance - (case when old.kind = 'ingreso' then old.amount else -old.amount end), updated_at = now()
      where id = old.account_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') and new.account_id is not null then
    update public.accounts
      set balance = balance + (case when new.kind = 'ingreso' then new.amount else -new.amount end), updated_at = now()
      where id = new.account_id;
  end if;
  return null;
end;
$$;

create or replace trigger transactions_cuenta before insert on public.transactions
  for each row execute function public.cuenta_del_metodo();

create or replace trigger transactions_saldo after insert or delete or update of amount, kind, account_id on public.transactions
  for each row execute function public.ajustar_saldo_movimiento();

-- Las cuentas que ya hacían de efectivo y de banco.
update public.accounts set pago = 'efectivo' where pago is null and kind = 'liquidez' and lower(name) = 'efectivo';
update public.accounts set pago = 'tarjeta' where pago is null and kind = 'liquidez' and lower(name) like 'cuenta del banco%';
