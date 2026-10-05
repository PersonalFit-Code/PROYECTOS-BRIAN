# Café Bar Dos Puertas · web

Propuesta de web para el Dos Puertas (rúa dos Fornos, 7 · Ourense). Mismo lenguaje visual que
`tixola-taperia`, con la marca sacada del rótulo real: tablero azul tinta, letras doradas
(Pirata One) y la luz ámbar que lo ilumina.

**En vivo:** https://dos-puertas.vercel.app (proyecto `dos-puertas` en el equipo BRIAN de Vercel, carpeta raíz
`dos-puertas/`). La integración de GitHub de Vercel no tiene acceso de escritura al repo, así que el
proyecto no se redespliega solo con cada push: cada versión se lanza a producción desde el commit de
GitHub (API de Vercel con `gitSource`). Para que sea automático, dar acceso a la app de Vercel en
GitHub y conectar el repo desde Settings → Git del proyecto.

```bash
npm install
npm run dev        # http://localhost:3000 → redirige a /es
npm run typecheck && npm run lint && npm run build
```

## Rutas

| Ruta | Qué hay |
| --- | --- |
| `/es` | Logo a pantalla completa que se encoge al hacer scroll, entrada con panel modular de pinchos, los cuatro de la casa y reseñas en cascada |
| `/es/carta` | Toda la barra con filtros y ficha de cada pincho (`/es/barra` redirige aquí) |
| `/es/vinos` | Las cinco denominaciones gallegas y la selección de la casa (pendiente) |
| `/es/historia` | Línea de tiempo 1950s → hoy (verificada con La Voz de Galicia), fotos de los 70 y de hoy, y la anécdota de Amancio Ortega |
| `/es/visita` | Mapa (se carga solo con consentimiento), horario en vivo, pago y cómo funciona la barra |
| `/es/preguntas` | Preguntas frecuentes (con JSON-LD FAQPage) |
| `/es/legal/aviso-legal` · `/privacidad` · `/cookies` | Textos legales (noindex hasta tener los datos del titular) |

La navegación va en el menú lateral curvo (`src/components/ui/curved-menu.tsx`, adaptado de 21st.dev).

## Dónde está cada cosa

- Datos: `src/data/business.ts`, `menu.ts`, `reviews.ts` (un dato = un fichero).
- Textos: `src/i18n/messages/es/index.ts` (nada de literales en componentes; para añadir gallego o
  inglés basta con un fichero más y una entrada en `src/i18n/config.ts`).
- Colores y tipografías: `src/app/globals.css` (`@theme`).
- Cookies: `src/lib/consent.ts` (la elección) y `src/components/consent/CookieConsent.tsx` (el
  aviso). Nada que instale cookies se carga antes de aceptar; hoy solo el mapa de Google. Un
  servicio nuevo (analítica, vídeo…) = una categoría más ahí, subir `VERSION` y contarlo en la
  política de cookies.
- Camarero virtual: preguntas, grupos y orden en `src/data/camarero.ts`; textos y palabras clave
  en cuatro idiomas (español, gallego, inglés y portugués) en `src/i18n/camarero/`. Arranca en el
  idioma del navegador si es uno de esos. Funciona en el navegador, sin IA ni servidor.
- Las dos puertas: `src/components/home/DosPuertas.tsx` (tras el logo de entrada) y la transición
  de puertas entre páginas en `src/app/[locale]/template.tsx`.
- Fuentes de los datos: `BRIEF.md`.

## Pendiente de confirmar con Marisa

- [ ] Fotos reales de los pinchos (hoy son ilustraciones) y del local.
- [ ] Precios: la pizarra de la fachada (2025) dice pinchos 2 € y bocadillos 4 €; el brief decía 1,50–2,50 €.
- [ ] Precios de las raciones y referencias de vinos.
- [ ] Alérgenos.
- [ ] Teléfono y horario: TripAdvisor publica otro número (988 22 11 16) y apertura a las 18:00.
- [ ] Coordenadas exactas, dominio propio y datos del titular para el aviso legal.
- [ ] Foto nítida del rótulo para afinar la tipografía.
- [ ] Datos del titular para los textos legales (nombre o razón social, NIF/CIF, domicilio, correo,
      datos registrales) en `src/data/business.ts` → `legal`. Después, quitar el `noindex` y que
      lo revise un profesional.
- [ ] Fotos (`public/images/`): pedir permiso antes de publicar; en las dos salen personas.
      `barra-anos-70.webp` es de La Voz de Galicia (pie original: «Irene, dentro de la barra del Dos
      Puertas, a finales de los años setenta»); `barra-dos-puertas.webp`, del Faro de Vigo según
      Brian: falta el enlace al artículo (`src/data/photos.ts`).
- [ ] Confirmar lo marcado en Preguntas (y en el camarero): perros, para llevar, alérgenos y precios.
- [ ] Foto de los carteles negros del interior: hoy llevan frases de reseñas (`src/data/carteles.ts`).
