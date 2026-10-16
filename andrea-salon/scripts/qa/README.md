# Banco de pruebas de la interfaz (sin Supabase)

Para ver y revisar la reserva y el panel **con datos** sin tener todavía el proyecto de Supabase:
un Supabase falso en memoria (`supabase-falso.mjs`) y un recorrido automático con Playwright +
axe-core (`accesibilidad.mjs`) que pasa por la web, el asistente de reserva paso a paso, el chat y
todas las pantallas del panel a ancho de móvil (390 px).

No sustituye a las pruebas de la base de datos: el Supabase falso no tiene la restricción de
exclusión, ni RLS, ni la lógica real de las funciones. Eso lo prueba `scripts/qa-funciones.sql`
contra un Postgres de verdad.

## Uso

Tres terminales, desde `andrea-salon/`:

```bash
# 1 · Supabase falso en :54399 (HOLD_SEGUNDOS=100 → el hold nace dentro del aviso de tiempo)
HOLD_SEGUNDOS=100 node scripts/qa/supabase-falso.mjs

# 2 · la app en dev apuntando a él (las NEXT_PUBLIC_ se leen al compilar: hace falta `dev`, no `start`)
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54399 NEXT_PUBLIC_SUPABASE_ANON_KEY=anon \
SUPABASE_SERVICE_ROLE_KEY=service TOKEN_SECRET=0123456789abcdef0123456789abcdef \
npx next dev -p 3100

# 3 · el recorrido (sale con código 1 si hay algún aviso)
node scripts/qa/accesibilidad.mjs --capturas /tmp/capturas      # todo
node scripts/qa/accesibilidad.mjs --solo panel                  # o web | reserva | panel
```

Para mirar el panel a mano en el navegador: `node scripts/qa/supabase-falso.mjs --cookie` imprime la
cookie de sesión de la dueña de prueba; se pega en `localhost:3100` (DevTools → Application →
Cookies) y `/panel` entra sin contraseña.

## Qué apunta

- Violaciones de axe-core con las reglas WCAG 2.0/2.1 A y AA (contraste, nombres, roles, listas…).
- Controles visibles de menos de 24 × 24 px (WCAG 2.2, 2.5.8), salvo enlaces dentro de un texto.
- Errores de consola y excepciones (una pantalla que revienta con datos reales).
- Desbordamiento horizontal a 390 px.

Lo que ninguna herramienta automática ve sigue siendo manual: probar con VoiceOver en un iPhone y
con TalkBack en Android la reserva completa, y el panel con el teclado (Tab, Escape en el menú «Más»
y en el chat).

## Si cambia la base

El Supabase falso sabe de las tablas por su nombre y resuelve las relaciones embebidas por
convención (`staff(name)` → columna `staff_id`; `booking_items(...)` → filas con `booking_id`). Si
una migración añade una tabla o una función `rpc` que use la interfaz, se añade su dato de partida en
`db` o su función en `rpc` (si falta, responde 404 y la pantalla lo enseñará como error).
