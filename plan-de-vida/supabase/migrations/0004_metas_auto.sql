-- Metas que se miden solas. 'ingreso_mensual': el valor actual es lo que entra en el mes en curso
-- (ingresos apuntados, o los fijos comprometidos si aún no constan). Ver src/lib/metas/auto.ts.
alter table public.goals add column if not exists auto text check (auto in ('ingreso_mensual'));
