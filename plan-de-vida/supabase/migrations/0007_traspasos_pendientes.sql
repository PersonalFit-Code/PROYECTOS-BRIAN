-- 1) Traspasos entre cuentas (cambiar efectivo por banco, sacar del cajero…): no son ingreso ni gasto,
--    así que van en su propia tabla y no se mezclan con las sumas de movimientos. Un trigger resta de
--    la cuenta de origen y suma a la de destino, y lo deshace al borrar.
-- 2) Movimientos pendientes: dinero que viene de camino (o un cargo aún no pasado). No mueven el saldo ni
--    cuentan en las sumas hasta que se marcan como llegados.

create table if not exists public.transfers (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  day             date not null,
  amount          numeric(12,2) not null check (amount > 0),
  from_account_id uuid not null references public.accounts (id) on delete cascade,
  to_account_id   uuid not null references public.accounts (id) on delete cascade,
  note            text,
  created_at      timestamptz not null default now(),
  check (from_account_id <> to_account_id)
);
create index if not exists transfers_user_day_idx on public.transfers (user_id, day desc);

alter table public.transfers enable row level security;
do $$ begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'transfers' and policyname = 'solo el dueño') then
    create policy "solo el dueño" on public.transfers for all to authenticated
      using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
  end if;
end $$;

create or replace function public.ajustar_saldo_traspaso() returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  if tg_op = 'DELETE' then
    update public.accounts set balance = balance + old.amount, updated_at = now() where id = old.from_account_id;
    update public.accounts set balance = balance - old.amount, updated_at = now() where id = old.to_account_id;
    return null;
  end if;
  update public.accounts set balance = balance - new.amount, updated_at = now() where id = new.from_account_id;
  update public.accounts set balance = balance + new.amount, updated_at = now() where id = new.to_account_id;
  return null;
end;
$$;

create or replace trigger transfers_saldo after insert or delete on public.transfers
  for each row execute function public.ajustar_saldo_traspaso();

-- Pendientes
alter table public.transactions add column if not exists pending boolean not null default false;

create or replace function public.ajustar_saldo_movimiento() returns trigger
language plpgsql security invoker set search_path = public as $$
begin
  if tg_op in ('UPDATE', 'DELETE') and old.account_id is not null and not old.pending then
    update public.accounts
      set balance = balance - (case when old.kind = 'ingreso' then old.amount else -old.amount end), updated_at = now()
      where id = old.account_id;
  end if;
  if tg_op in ('INSERT', 'UPDATE') and new.account_id is not null and not new.pending then
    update public.accounts
      set balance = balance + (case when new.kind = 'ingreso' then new.amount else -new.amount end), updated_at = now()
      where id = new.account_id;
  end if;
  return null;
end;
$$;

create or replace trigger transactions_saldo after insert or delete or update of amount, kind, account_id, pending on public.transactions
  for each row execute function public.ajustar_saldo_movimiento();
