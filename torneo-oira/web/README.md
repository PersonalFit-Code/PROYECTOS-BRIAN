# Web de inscripción

Página estática (`index.html`, `app.js`, `config.js`) con contador de plazas y formulario. Los datos van a una base de datos Supabase; el pago es por Bizum o transferencia y lo confirmáis vosotros a mano.

## Cómo funciona
- El contador muestra plazas libres de 32 y el precio vigente (150 € los 10 primeros equipos, luego 180 €).
- Al inscribirse, el equipo queda **pendiente** y ocupa plaza durante 72 horas. Se le muestran los datos de pago.
- Cuando llega el pago, cambiáis su `estado` a `pagado` en la tabla `equipos` de Supabase (Table Editor). Si no paga en 72 h, la plaza se libera sola.
- Con las 32 plazas ocupadas, las nuevas inscripciones entran como `espera`.
- Para dar de baja a un equipo: `estado = cancelado`.

El precio reducido se asigna por orden de inscripción (no de pago) para que la web pueda decir el importe al momento.

## Puesta en marcha
1. Crear un proyecto en Supabase y ejecutar `supabase/schema.sql` en el SQL Editor.
2. Copiar la URL del proyecto y la clave pública (anon) en `config.js`, junto con Bizum, IBAN, contacto y entidad responsable.
3. Subir la carpeta `web/` a cualquier hosting estático (Vercel, Netlify, GitHub Pages).

Sin `SUPABASE_URL`, la web arranca en **modo demo**: sirve para verla y probarla, pero las inscripciones no salen del navegador.

## Datos personales
La tabla guarda DNI y fechas de nacimiento. Está cerrada al público (solo se escribe a través de la función `inscribir` y no se puede leer desde la web). Rellenad el responsable de los datos en `config.js`, no compartáis el acceso a Supabase fuera de los tres, y borrad la tabla al terminar el torneo.

## Ajustes
Plazas, precios y horas de reserva están en la función `_cfg()` de `schema.sql`. Para cerrar inscripciones: `inscripcionesAbiertas: false` en `config.js`.
