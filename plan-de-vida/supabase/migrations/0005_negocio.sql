-- Lo que el coach necesita saber de los negocios del usuario (qué vende, a quién, precios, ideas),
-- editable en Ajustes → Tu negocio y ampliable por el propio coach (herramienta guardar_nota_negocio).
alter table public.settings add column if not exists negocio text;

-- Nombre del coach, cambiable en Ajustes → Coach.
alter table public.settings add column if not exists coach_name text not null default 'Noah';
