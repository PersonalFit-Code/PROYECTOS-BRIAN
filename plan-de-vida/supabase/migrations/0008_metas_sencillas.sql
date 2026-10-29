-- Metas sencillas (salud, crecimiento…): en vez de números, cómo estoy ahora y qué quiero conseguir, en
-- texto. El avance se marca a mano. Las de números (dinero) siguen usando start_value / target_value.
alter table public.goals add column if not exists start_text text;
alter table public.goals add column if not exists target_text text;
