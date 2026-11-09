# 720 GYM CLUB · web + gestión

Demo publicada: **https://720gym-club.vercel.app** (proyecto `720gym-club` en Vercel, desplegado desde esta rama).

Web de 720 GYM CLUB (Ourense) con todo lo del **plan completo**: web, inscripción y pago online,
reservas de clases con plazas, asistente con IA y panel de gestión para la gerencia.

Fuentes de datos: `comercial/720gym/DATOS.md` (dosier oficial 2025-26, PDF de 720 Pilates, Beacons,
Google), guía de marca en `comercial/720gym/MARCA.md` y contexto en `comercial/720gym/CONTEXTO.md`.

- Next.js 16 + Tailwind 4. Blanco y negro con toques de gris (Brian, 09/11); letra Barlow Condensed
  en titulares (la stencil, solo en el logo y las marcas «720 ___»). Inter para el texto.
- Selector de color en el pie: blanco y negro (por defecto), naranja del dosier o rojo de las máquinas.
  También `?acento=bn|naranja|rojo` en la URL.
- **720 Pilates** (`/pilates`) lleva la paleta de su propio dosier (crema, naranja y menta).
- **Liquid Glass** solo en la capa que flota (cabecera, desplegable, barra del móvil, botones flotantes,
  deslizador, chat y ventana de reserva): utilidades `.vidrio`, `.vidrio-fuerte` y `.vidrio-verde` en
  `globals.css`, con alternativa opaca si el usuario pide reducir transparencia.
- **Botones**: `venta` (Inscríbete, pagar, reservar) e `info` (información, WhatsApp), animados.
  «Desliza para inscribirte» en la portada y en el cierre; barra fija en el móvil.

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck && npm run lint && npm run build
```

## Qué hay
| Ruta | Qué es |
|---|---|
| `/` | Portada, conceptos, horario con reservas, tarifas, formulario único, equipo, historia, comunidad, enlaces a clubes / 720P / preguntas y contacto |
| `/conceptos/[slug]` | Página por disciplina: gimnasio, entrenamiento personal, yoga, powerlifting, CrossGym |
| `/pilates` | 720 Pilates con su paleta |
| `/clubes` | Clubes que entrenan en 720 y espacios para profesionales (720P) |
| `/preguntas` | Preguntas frecuentes (con marcado FAQPage para Google) |
| `/alta` | Inscripción + pago (plan → datos → pasarela) |
| `/panel` | Panel de gestión (PIN de demo **0720**). Enlace «Acceso gestión» en el pie |
| `/api/aviso` | Reenvía solicitudes y reservas a un webhook (Make → WhatsApp/email) |
| `/api/pago` | Crea el pago en Stripe Checkout |
| `/api/asistente` | Asistente: Claude con los datos del negocio, o motor local |

## Variables de entorno (en Vercel, nunca en el código: el repositorio es público)
| Variable | Para qué | Sin ella |
|---|---|---|
| `STRIPE_SECRET_KEY` | Cobros reales (tarjeta, Apple Pay, Google Pay; cuotas como suscripción) | Pasarela en modo demostración |
| `ANTHROPIC_API_KEY` | El asistente responde con Claude | Responde el motor local con los mismos datos |
| `AVISO_WEBHOOK_URL` | Avisos automáticos al gimnasio (escenario de Make) | El aviso llega por el WhatsApp que abre el formulario |
| `NEXT_PUBLIC_INDEXAR=1` | Permite a Google indexar (al publicar con su dominio) | `noindex` |
| `NEXT_PUBLIC_SITE_URL` | URL canónica con dominio propio | La de Vercel |

## Modo demostración (importante)
Reservas, solicitudes, conversaciones del asistente y pagos de demo se guardan **en el navegador**
(`src/lib/demo.ts`), para que en la reunión lo que se hace en la web salga al momento en `/panel` del
mismo dispositivo. Los datos del panel que no vienen de la web son **ficticios** y van rotulados.
En producción: base de datos (Supabase) y acceso con usuario y contraseña en lugar del PIN.

## Pendiente de 720 (confirmar el lunes)
- Horario: el dosier dice 06:00–00:00; Google e Instagram, 08:00–22:30 (se usa este). `src/data/negocio.ts`.
- Teléfono y WhatsApp que poner (672 00 94 51 de Google, o los del dosier 661 16 35 89 / 687 83 12 86).
- Horario real de clases y plazas por clase (`src/data/horario.ts`, `src/data/plazas.ts`): ahora son de ejemplo.
- Precio de yoga, CrossGym, powerlifting y pases temporales. Si la oferta de apertura (35 €) y el Paquete Inicio siguen.
- Fotos (Instagram @720gym; para publicar, permiso y originales). Cada hueco dice qué foto va.
- Logo en vectorial y logos de submarcas y clubes. El de ahora es tipográfico provisional.
- Textos del equipo (Brais, Bea, Pablo) y tres reseñas reales de Google con nombre y fecha.
- Números de WhatsApp de cada club; datos del titular para los textos legales.
- Cuenta de Stripe a su nombre (los cobros van directos a su banco).

## SEO
- Título y descripción propios en cada página (títulos de 40–60 caracteres, descripciones de 140–160),
  canonical, un solo `h1`, Open Graph con imagen y tarjeta de Twitter.
- Datos estructurados: `ExerciseGym` (dirección, horario, teléfono, rango de precios, mapa) en todas,
  `BreadcrumbList` en las internas y `FAQPage` en `/preguntas`.
- `sitemap.xml`, `manifest.webmanifest` e icono para iPhone.
- **Indexación apagada** mientras sea URL de prueba (`noindex` y `robots.txt` bloqueando). Al publicar
  con su dominio: `NEXT_PUBLIC_INDEXAR=1` y `NEXT_PUBLIC_SITE_URL=https://su-dominio`, y dar de alta
  la web en Google Search Console y en su ficha de Google Business.
