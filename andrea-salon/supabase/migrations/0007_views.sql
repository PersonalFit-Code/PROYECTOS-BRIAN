-- Vistas de lectura. Todas `security_invoker`: se aplican las políticas RLS de quien consulta,
-- así una empleada no ve por una vista lo que no vería en la tabla.
-- Las de analítica (facturación, ocupación, mapa de calor, equipo) llegan en la fase 3
-- (0009_analytics.sql); aquí van las que necesita el panel básico.

-- ---------------------------------------------------------------------------
-- Ficha resumida de cada clienta con sus etiquetas, calculadas al leer (nada se queda viejo).
--   nueva     : una visita o menos, o alta hace menos de 30 días
--   vip       : 8 o más visitas en 12 meses, o gasto en 12 meses en el 10 % más alto
--   en_riesgo : lleva más de 1,5 veces su intervalo habitual sin venir (y más de 45 días)
--   dormida   : más de 120 días sin venir
-- ---------------------------------------------------------------------------
create or replace view public.v_clients with (security_invoker = true) as
with visitas as (
  select b.client_id,
         b.starts_at,
         lag(b.starts_at) over (partition by b.client_id order by b.starts_at) as anterior
  from public.bookings b
  where b.status = 'done' and b.client_id is not null
),
gaps as (
  select client_id,
         percentile_cont(0.5) within group (order by extract(epoch from (starts_at - anterior)) / 86400)
           as median_gap_days
  from visitas
  where anterior is not null
  group by client_id
),
resumen as (
  select c.id,
         count(b.id) filter (where b.status = 'done')                                    as visits,
         count(b.id) filter (where b.status = 'done' and b.starts_at > now() - interval '12 months')
                                                                                          as visits_12m,
         count(b.id) filter (where b.status = 'no_show')                                 as no_shows,
         max(b.starts_at) filter (where b.status = 'done')                                as last_visit_at,
         min(b.starts_at) filter (where b.status in ('confirmed') and b.starts_at > now())
                                                                                          as next_visit_at
  from public.clients c
  left join public.bookings b on b.client_id = c.id
  group by c.id
),
gasto as (
  select b.client_id,
         coalesce(sum(p.amount_cents + p.tip_cents), 0)                                   as spent_cents,
         coalesce(sum(p.amount_cents + p.tip_cents) filter (where p.paid_at > now() - interval '12 months'), 0)
                                                                                          as spent_12m_cents
  from public.payments p
  join public.bookings b on b.id = p.booking_id
  where p.kind = 'booking' and b.client_id is not null
  group by b.client_id
),
umbral as (
  select coalesce(percentile_cont(0.9) within group (order by spent_12m_cents), 0) as vip_cents
  from gasto where spent_12m_cents > 0
),
favorito as (
  select distinct on (b.client_id) b.client_id, bi.name as favorite_service
  from public.bookings b
  join public.booking_items bi on bi.booking_id = b.id
  where b.status = 'done' and b.client_id is not null
  group by b.client_id, bi.name
  order by b.client_id, count(*) desc, bi.name
),
habitual as (
  select distinct on (b.client_id) b.client_id, s.name as usual_staff
  from public.bookings b
  join public.staff s on s.id = b.staff_id
  where b.status = 'done' and b.client_id is not null
  group by b.client_id, s.name
  order by b.client_id, count(*) desc, s.name
)
select c.id, c.name, c.phone, c.email, c.notes, c.source, c.created_at, c.anonymized_at,
       c.marketing_consent, c.whatsapp_consent,
       r.visits, r.visits_12m, r.no_shows, r.last_visit_at, r.next_visit_at,
       coalesce(g.spent_cents, 0)     as spent_cents,
       coalesce(g.spent_12m_cents, 0) as spent_12m_cents,
       gp.median_gap_days,
       f.favorite_service,
       h.usual_staff,
       array_remove(array[
         case when r.visits <= 1 or c.created_at > now() - interval '30 days' then 'nueva' end,
         case when r.visits_12m >= 8 or (u.vip_cents > 0 and coalesce(g.spent_12m_cents, 0) >= u.vip_cents)
              then 'vip' end,
         case when r.last_visit_at is not null
               and r.last_visit_at < now() - interval '120 days' then 'dormida' end,
         case when r.last_visit_at is not null
               and gp.median_gap_days is not null
               and r.last_visit_at < now() - interval '45 days'
               and r.last_visit_at < now() - make_interval(days => ceil(gp.median_gap_days * 1.5)::int)
               and r.last_visit_at >= now() - interval '120 days' then 'en_riesgo' end
       ], null)::text[] as tags
from public.clients c
join resumen r on r.id = c.id
left join gasto g on g.client_id = c.id
left join gaps gp on gp.client_id = c.id
left join favorito f on f.client_id = c.id
left join habitual h on h.client_id = c.id
cross join umbral u;

-- ---------------------------------------------------------------------------
-- Bonos: lo cobrado no es beneficio hasta que se da la sesión. Cobrado, consumido y pendiente.
-- ---------------------------------------------------------------------------
create or replace view public.v_voucher_balance with (security_invoker = true) as
select v.id, v.code, v.name, v.kind, v.status, v.purchased_at, v.expires_at,
       v.sessions_total, v.sessions_left, v.value_cents, v.balance_cents, v.price_cents,
       v.buyer_name, v.recipient_name, v.sold_in_salon,
       coalesce(sum(r.amount_cents), 0)::int                       as consumed_cents,
       (v.price_cents - coalesce(sum(r.amount_cents), 0))::int     as pending_cents,
       (v.status = 'active' and v.expires_at is not null
          and v.expires_at < now() + make_interval(days => public.setting_int('voucher_expiry_warning_days', 30)))
                                                                   as expiring_soon
from public.vouchers v
left join public.voucher_redemptions r on r.voucher_id = v.id
group by v.id;

-- Equipo visible desde la web: solo las activas y sin nada que no deba salir.
create or replace view public.public_staff with (security_invoker = false) as
select id, slug, name, bio, specialties, instagram, photo_path, bookable_online, position
from public.staff
where active;

grant select on public.public_staff to anon, authenticated;
