-- Políticas de acceso por fila. Regla única: cada uno solo ve y toca sus filas (user_id = auth.uid()).
-- La app lee y escribe con la sesión del usuario; el cron usa la clave de servicio, que se salta RLS.
-- `anon` (sin sesión) no ve nada.

do $$
declare
  t text;
begin
  foreach t in array array[
    'settings', 'areas', 'goals', 'tasks', 'habits', 'habit_logs', 'journal_entries', 'reviews',
    'categories', 'recurring_items', 'transactions', 'savings_goals', 'accounts', 'account_snapshots',
    'watchlist', 'investment_reports', 'recommendations', 'recommendation_outcomes', 'strategy_notes',
    'chat_messages', 'push_subscriptions'
  ] loop
    execute format('alter table public.%I enable row level security', t);
    execute format(
      'create policy "solo el dueño" on public.%I for all to authenticated
         using (user_id = auth.uid()) with check (user_id = auth.uid())', t);
  end loop;
end;
$$;

-- Cotizaciones: no son personales. Se leen con sesión; solo escribe el cron (clave de servicio).
alter table public.prices enable row level security;
create policy "leer cotizaciones con sesion" on public.prices for select to authenticated using (true);
