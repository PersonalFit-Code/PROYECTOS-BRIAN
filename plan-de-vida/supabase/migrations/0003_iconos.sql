-- Los emojis pasan a ser iconos. La columna se sigue llamando `emoji` (cambiarle el nombre obligaría a
-- tocar todas las consultas) pero ahora guarda el NOMBRE de un icono de src/components/ui/iconos.tsx
-- ("dumbbell", "wallet"…). Un valor desconocido se pinta como un círculo.

update public.areas set emoji = case slug
  when 'salud' then 'heart-pulse'
  when 'dinero' then 'wallet'
  when 'crecimiento' then 'book-open'
  when 'relaciones' then 'users'
  else 'circle' end
where emoji !~ '^[a-z0-9-]+$';

update public.categories set emoji = case name
  when 'Comida' then 'shopping-cart'
  when 'Restaurantes' then 'utensils'
  when 'Casa' then 'house'
  when 'Transporte' then 'fuel'
  when 'Suscripciones' then 'repeat'
  when 'Salud' then 'pill'
  when 'Ocio' then 'party-popper'
  when 'Ropa' then 'shirt'
  when 'Formación' then 'graduation-cap'
  when 'Negocio' then 'briefcase'
  when 'Nómina / clientes' then 'banknote'
  when 'Otros ingresos' then 'plus'
  else 'circle' end
where emoji !~ '^[a-z0-9-]+$';

update public.habits set emoji = 'check' where emoji !~ '^[a-z0-9-]+$';
update public.savings_goals set emoji = 'piggy-bank' where emoji !~ '^[a-z0-9-]+$';

alter table public.areas alter column emoji set default 'circle';
alter table public.categories alter column emoji set default 'circle';
alter table public.habits alter column emoji set default 'check';
alter table public.savings_goals alter column emoji set default 'piggy-bank';

-- Datos de partida con iconos.
create or replace function public.seed_user(uid uuid) returns void
language plpgsql security definer set search_path = public as $$
begin
  if exists (select 1 from public.settings where user_id = uid) then
    return;
  end if;

  insert into public.settings (user_id) values (uid);

  insert into public.areas (user_id, slug, name, emoji, color, position) values
    (uid, 'salud',       'Salud y físico',       'heart-pulse', 'green',  0),
    (uid, 'dinero',      'Dinero y negocio',     'wallet',      'yellow', 1),
    (uid, 'crecimiento', 'Crecimiento personal', 'book-open',   'blue',   2),
    (uid, 'relaciones',  'Relaciones y ocio',    'users',       'pink',   3);

  insert into public.categories (user_id, name, emoji, kind, position) values
    (uid, 'Comida',            'shopping-cart',  'gasto', 0),
    (uid, 'Restaurantes',      'utensils',       'gasto', 1),
    (uid, 'Casa',              'house',          'gasto', 2),
    (uid, 'Transporte',        'fuel',           'gasto', 3),
    (uid, 'Suscripciones',     'repeat',         'gasto', 4),
    (uid, 'Salud',             'pill',           'gasto', 5),
    (uid, 'Ocio',              'party-popper',   'gasto', 6),
    (uid, 'Ropa',              'shirt',          'gasto', 7),
    (uid, 'Formación',         'graduation-cap', 'gasto', 8),
    (uid, 'Negocio',           'briefcase',      'gasto', 9),
    (uid, 'Otros',             'circle',         'gasto', 10),
    (uid, 'Nómina / clientes', 'banknote',       'ingreso', 0),
    (uid, 'Otros ingresos',    'plus',           'ingreso', 1);

  insert into public.watchlist (user_id, symbol, name, asset_class, sleeve, target_pct, quoted, yield_pct, position) values
    (uid, 'IWDA.AS', 'iShares Core MSCI World',     'renta_variable', 'nucleo',   50, true,  null, 0),
    (uid, 'IS3N.DE', 'iShares Core MSCI EM IMI',    'renta_variable', 'nucleo',   10, true,  null, 1),
    (uid, 'IBGS.AS', 'iShares € Govt Bond 1-3yr',   'renta_fija',     'nucleo',   10, true,  null, 2),
    (uid, 'LETRAS',  'Letras del Tesoro 12 meses',  'renta_fija',     'nucleo',   10, false, 2.10, 3),
    (uid, 'SXR8.DE', 'iShares Core S&P 500',        'renta_variable', 'satelite', 10, true,  null, 4),
    (uid, 'EXSA.DE', 'iShares STOXX Europe 600',    'renta_variable', 'satelite', 10, true,  null, 5),
    (uid, 'CUENTA',  'Cuenta remunerada (colchón)', 'liquidez',       'nucleo',    0, false, 2.00, 6);
end;
$$;

revoke all on function public.seed_user(uuid) from public, anon, authenticated;
