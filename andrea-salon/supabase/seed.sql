-- Datos iniciales que no dependen del salón: ajustes por defecto y categorías.
-- El catálogo real (servicios, equipo, bonos) se carga con `npm run seed` desde scripts/seed/*.ts
-- cuando Andrea mande los datos. Este fichero se puede ejecutar varias veces.

insert into public.settings (key, value) values
  ('timezone',                    '"Europe/Madrid"'),
  ('horizon_days',                '45'),       -- hasta cuándo se puede reservar
  ('min_lead_minutes',            '120'),      -- nada antes de dos horas
  ('slot_step_min',               '15'),
  ('hold_minutes',                '10'),       -- lo que dura la reserva temporal mientras rellena datos
  ('cancel_hours',                '24'),       -- hasta cuándo puede cancelar/cambiar la clienta sola
  ('reminder_hour_local',         '"10:00"'),  -- a qué hora sale el recordatorio del día antes
  ('voucher_expiry_warning_days', '30'),
  ('salon_hours', '{
    "mon": [{"open": "09:30", "close": "13:30"}, {"open": "15:30", "close": "19:30"}],
    "tue": [{"open": "09:30", "close": "13:30"}, {"open": "15:30", "close": "19:30"}],
    "wed": [{"open": "09:30", "close": "13:30"}, {"open": "15:30", "close": "19:30"}],
    "thu": [{"open": "09:30", "close": "13:30"}, {"open": "15:30", "close": "19:30"}],
    "fri": [{"open": "09:30", "close": "19:30"}],
    "sat": [],
    "sun": []
  }'),
  ('notices', '[]')                            -- avisos de la web (cierres, festivos…)
on conflict (key) do nothing;

insert into public.service_categories (slug, name, position) values
  ('manicura',        'Manicura',           1),
  ('pedicura',        'Pedicura',           2),
  ('unas-esculpidas', 'Uñas de gel y acrílico', 3),
  ('nail-art',        'Nail art',           4),
  ('mirada',          'Diseño de mirada',   5)
on conflict (slug) do nothing;
