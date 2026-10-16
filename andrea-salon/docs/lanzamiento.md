# Lanzamiento · Andrea Salón

Lista para el día del cambio (objetivo: 10–12 de noviembre para web + reserva + panel; bonos,
analítica, chat y gallego hasta el 25). Se marca cada casilla en orden; si una falla, no se sigue.

## Una semana antes

- [ ] **Dominio** comprado y con los nameservers de Vercel (ver `como-publicar.md` §4). Propagado:
      `dig NS andreasalon.es` devuelve `ns1/ns2.vercel-dns.com`.
- [ ] **Resend** con el dominio verificado (los tres registros en verde). Correo de prueba recibido
      en Gmail y en Outlook, sin caer en spam.
- [ ] **Supabase en plan Pro** (copias diarias; el plan gratis pausa proyectos y no tiene copias).
- [ ] Migraciones 0001–0010 aplicadas y `scripts/qa-exclusion.sql` pasado en la base de producción.
- [ ] **Catálogo real** metido desde el panel: servicios con duración, respiro y precio; quién hace
      qué; equipo con horarios; festivos y vacaciones de noviembre y diciembre.
- [ ] Ajustes revisados con Andrea: antelación mínima, horizonte (45 días), plazo de cancelación.
- [ ] Usuarios creados (`scripts/crear-usuario.ts`): Andrea como `owner`, cada empleada como
      `staff` con su `--staff`. Cada una entra una vez y cambia su contraseña.
- [ ] Datos legales completos en `src/data/business.ts` (NIF, domicilio fiscal, correo) → las
      páginas legales dejan de ir con `noindex`. Contrato de encargo de tratamiento (RGPD art. 28)
      firmado con Andrea.
- [ ] Fotos reales en `public/images/` (salón, trabajos, equipo) y `og.jpg` para compartir.
- [ ] Horario confirmado (`hoursPending: false`) y coordenadas de la ficha de Google.

## El día

1. [ ] Variables en Vercel: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_RESERVAR_URL`,
       `NEXT_PUBLIC_PANEL_URL` con el dominio → redesplegar.
2. [ ] Comprobar los cuatro hosts: web, `reservar.`, `panel.` (pide login), `equipo.` (redirige).
3. [ ] **Importar** la agenda: `scripts/importar-clientas.ts` y `scripts/importar-citas.ts` primero
       en ensayo (sin `--aplicar`), revisar el informe con Andrea, y luego `--aplicar`.
4. [ ] Reserva real de prueba desde un móvil (Brian): llega el correo con el .ics, aparece en la
       agenda, se cancela desde el enlace y la hora vuelve a estar libre.
5. [ ] Cron: `curl -H "Authorization: Bearer $CRON_SECRET" https://andreasalon.es/api/cron/diario`
       dos veces → la segunda sale como duplicados.
6. [ ] Andrea cambia el enlace de reservas en **Google Business Profile** e **Instagram** (bio de
       cada profesional: `reservar.andreasalon.es/?con=<slug>`).
7. [ ] Pedir a Elitek por escrito que redirija `andreasalonnails.com` al nuevo dominio o lo apague,
       y la exportación de clientas/citas si no la han dado (portabilidad, RGPD art. 20).

## Gallego (publicado en `/gl`)

- [ ] Que alguien gallegohablante del salón revise la web en `/gl`. Dudas a decidir: «Opinións» o
      «Recensións» (Google usa la segunda); «en liña» u «online»; «agasallo/mercar» o
      «regalo/comprar»; los titulares partidos («con agarimo», «Ven vernos»); y las formas
      «dicímoscho», «cancelámoscha» (correctas; ¿encajan con el tono del salón?).
- [ ] Los **correos** siguen en castellano para todas (plantillas de `src/emails`). Traducirlos si
      Andrea lo quiere; los botones de la página de la cita ya salen en gallego.
- [ ] Los textos legales están traducidos enteros: revisarlos igual que los castellanos.

## Asistente del chat

- Sin `ANTHROPIC_API_KEY` responde con las preguntas frecuentes, en nuestro servidor. Es el modo
  por defecto y no necesita nada más.
- [ ] **Antes de poner la clave:** añadir a la política de privacidad un apartado del chat y marcar
      Anthropic como activo en `SUBPROCESSORS` (`src/data/legal.ts`); redesplegar (el aviso del
      chat cambia según haya clave o no, y se fija al construir).

## La primera semana

- Agenda en paralelo: las citas que entren por teléfono se apuntan en el panel, no en papel.
- Mirar **Hoy** cada mañana: «Ya pasaron y no están cobradas» tiene que quedar vacío al cerrar.
- Revisar en Supabase → `notifications` que no haya correos en `failed`.

## Bonos (fase 2, antes del 25)

- [ ] Stripe de Andrea verificado (KYC) y con IBAN. Brian invitado como Developer.
- [ ] `STRIPE_SECRET_KEY` (`sk_live` en Production, `sk_test` en Preview) y el webhook creado en
      Stripe → `https://andreasalon.es/api/stripe/webhook` con los eventos
      `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `charge.refunded`
      → `STRIPE_WEBHOOK_SECRET`.
- [ ] Catálogo de bonos en el panel, con la caducidad decidida por Andrea (recomendado: no caduca).
- [ ] Compra de prueba con tarjeta de test en Preview: llega el correo con el QR; el QR se escanea
      desde el panel en un iPhone y en un Android; el canje descuenta una sesión.

## Formación (1 hora con Andrea y el equipo)

| Min | Qué | Dónde |
| --- | --- | --- |
| 0–10 | Entrar, Hoy, el semáforo (verde confirmó, ámbar no) y «por cobrar» | `/panel` |
| 10–25 | Agenda día y semana; nueva cita por teléfono; mover, cancelar, «no vino» | `/panel/agenda` |
| 25–35 | Cobrar una cita (tarjeta, efectivo, Bizum, propina; con bono en la fase 2) | ficha de la cita |
| 35–45 | Clientas: buscar, notas de alergias, borrar datos si lo piden | `/panel/clientas` |
| 45–55 | Solo Andrea: servicios y precios, horarios, festivos, ajustes, analítica, exportar | secciones de la dueña |
| 55–60 | Qué ve la clienta: reservar desde el móvil y el correo que le llega | `reservar.` |

Recordar en la formación: las empleadas solo ven su agenda y sus cobros, y las métricas por
empleada solo las ve Andrea (informarlas por escrito, `LEGAL.md` §2). El panel registra cobros
para la gestión; no emite facturas.
