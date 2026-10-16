# Andrea Salón · web, reservas y panel

Web, reserva online y panel de gestión de **Andrea Salón · Uñas y Belleza** (Rúa Río Mao, 23 bajo,
Ourense). Una sola app de Next.js con tres entradas sobre la misma base de datos:

| Entrada | Sin dominio (hoy) | Con dominio propio |
| --- | --- | --- |
| Web pública | `andreasalonnails.vercel.app/es` | `andreasalon.es/es` |
| Reserva | `/es/reservar` | `reservar.andreasalon.es` |
| Panel | `/panel` | `panel.andreasalon.es` |
| Equipo (alias) | `/es/equipo` | `equipo.andreasalon.es` → redirige a la web |

El paso de rutas a subdominios no toca código: se rellenan `NEXT_PUBLIC_RESERVAR_URL` y
`NEXT_PUBLIC_PANEL_URL` y se redespliega. Todo enlace entre secciones (botones, correos, QR) sale de
`urlFor()` en `src/lib/hosts.ts`, y `src/proxy.ts` decide qué sección sirve según el host.

Plan y decisiones: `PLAN.md`. Lo comercial en `OFERTA.md`; lo legal en `LEGAL.md`. Cómo publicar y qué cuentas hacen falta: `docs/como-publicar.md`.

```bash
npm install
cp .env.example .env.local   # y rellenar (ver docs/como-publicar.md)
npm run dev                  # http://localhost:3000 → /es
npm run typecheck && npm run lint && npm test && npm run build
```

## Stack

Next 16.3.8 (fijado) · React 19 · Tailwind 4 · Supabase (Postgres + Auth + RLS, Frankfurt) ·
Resend + react-email · Stripe Checkout alojado (fase 2) · Vercel Cron · zod · framer-motion, GSAP, Lenis.

## Dónde está cada cosa

- **Motor de huecos** (puro, con tests): `src/lib/booking/` (`slots.ts`, `tz.ts`, `assign.ts`).
  Lo usan la API pública y el panel; nadie más decide qué horas hay.
- **Base de datos**: `supabase/migrations/0001…0010`. La doble reserva es imposible por la
  restricción de exclusión `bookings_no_overlap` (0003); los holds viven en la misma tabla.
  Funciones en 0006 (`book_slot`, `confirm_hold`, `reschedule_booking`, `redeem_voucher`,
  `queue_notification`), 0009 (operaciones del panel) y 0010 (bonos). Tipos a mano en `src/lib/supabase/types.ts`
  hasta poder generarlos con `supabase gen types`.
- **Reserva**: API en `src/app/api/reservar/*`; asistente en `src/components/reservar/Asistente.tsx`;
  correos en `src/emails/*` y `src/lib/reservas/correos.tsx` (todo envío pasa por `src/lib/mail.ts`,
  que lo apunta en `notifications` y no lo repite).
- **Cron diario** (`vercel.json`, 09:05 UTC): recordatorios de mañana, reintentos, holds y bonos
  caducados → `src/app/api/cron/diario/route.ts`.
- **Panel**: `src/app/(panel)/panel/` (sin idioma). Sesión y roles en `src/lib/panel/sesion.ts`:
  cada Server Action empieza por `requireSesion()` o `requireOwner()`. Las secciones de la dueña
  están en `(owner)/`.
- **Web pública**: `src/app/[locale]/(web)/`, textos en `src/i18n/messages/es/*` (nada de literales en
  componentes), datos fijos en `src/data/*` (un dato = un fichero), diseño en `src/app/globals.css`.

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm test` | Tests del motor de huecos y utilidades (`tsx --test`) |
| `npm run seed` | Carga el catálogo de PRUEBA (servicios y equipo de `src/data/fixtures.ts`) en la base de desarrollo |
| `npx tsx scripts/crear-usuario.ts --email … --nombre … --rol owner\|staff [--staff <slug>]` | Crea un usuario del panel (no hay registro público) |
| `scripts/qa-exclusion.sql` | Comprueba en el SQL editor que dos citas solapadas no pueden existir |
| `scripts/qa-funciones.sql` | Prueba todas las funciones y permisos de la base (reserva, cambio, panel, bonos, RLS por rol). En local: `scripts/qa-prelude-postgres.sql` primero |
| `npx tsx scripts/importar-clientas.ts <csv> [--aplicar]` | Importa clientas (Elitek u hoja del salón). Sin `--aplicar` solo ensaya e informa |
| `npx tsx scripts/importar-citas.ts <csv> [--aplicar]` | Importa citas futuras; informa de servicios o profesionales desconocidos y de choques |

El día del cambio se sigue `docs/lanzamiento.md` (incluye la formación de una hora).
