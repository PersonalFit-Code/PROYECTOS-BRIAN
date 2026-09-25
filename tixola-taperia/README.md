# Tixola Tapería — Landing 3D inmersiva

Landing page de alto impacto para **Tixola Tapería** (Rúa Juan de Austria, 7 · Ourense · junto a la Catedral) con una
**carta digital interactiva** con filtros y leyenda de alérgenos.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · React Three Fiber + drei · GSAP ScrollTrigger · Framer Motion · lucide-react.

## Arranque rápido

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de producción
npm run start      # servir el build
npm run lint       # ESLint (next/core-web-vitals)
npm run typecheck  # tsc --noEmit
```

Copia `.env.example` a `.env.local` y ajusta `NEXT_PUBLIC_SITE_URL` (se usa en metadata, sitemap, robots y Open Graph).

## Estructura

```
src/
├─ app/
│  ├─ layout.tsx          # fuentes (Playfair Display, Manrope, Bebas Neue), metadata SEO, JSON-LD Restaurant
│  ├─ page.tsx            # Home: Hero 3D → Platos estrella → Experiencia/Ubicación → Prueba social → Footer
│  ├─ carta/page.tsx      # Carta interactiva (filtros + alérgenos)
│  ├─ globals.css         # tokens de diseño (@theme), utilidades glass/neón/3D, animaciones
│  ├─ robots.ts · sitemap.ts
├─ components/
│  ├─ three/              # Escena R3F del Hero (sartén, comida flotante, partículas, luces, bloom) + mapa 3D
│  ├─ sections/           # Hero, StarDishes, Experience, SocialProof, Footer
│  ├─ ui/                 # Navbar, MobileStickyBar, NeonButton, TiltCard, DishFlipCard, Counter, ReviewCarousel,
│  │                      # OpenStatus, MapCard, ReservationModal, AllergenIcon, SectionHeading…
│  └─ carta/              # CartaExplorer, CategoryNav, FilterBar, AllergenLegend, MenuItemCard, CategorySection…
├─ data/                  # ← TODO EL CONTENIDO EDITABLE
│  ├─ business.ts         # nombre, dirección, teléfono, coordenadas, HORARIO, valoraciones, enlaces
│  ├─ menu.ts             # carta completa (categorías, platos, precios, alérgenos, etiquetas, maridajes)
│  ├─ dishes.ts           # los 4 platos estrella del módulo 3D
│  ├─ reviews.ts          # reseñas reales (TripAdvisor / Google) y cifras de prueba social
│  └─ allergens.ts        # los 14 alérgenos UE (Reglamento 1169/2011)
├─ hooks/                 # usePerformanceTier (60 FPS en móvil), useIsMobile, usePointerParallax, useScrollReveal
└─ lib/                   # openStatus (indicador "Abierto ahora"), gsap (registro ScrollTrigger), utils
public/
├─ textures/              # iron / slate / stone / embers (.webp) — generadas proceduralmente, sustituibles
├─ images/                # fachada.jpg (foto real), carta-pizarra.png, carta-fisica.png
├─ og.jpg · favicon.svg
scripts/
├─ generate-textures.cjs  # regenera texturas + og.jpg con Chromium headless
└─ screenshot.cjs         # capturas desktop/móvil del build para QA visual
docs/DESIGN-BRIEF.md      # brief de diseño y contrato técnico
```

## Qué debe revisar el cliente antes de publicar

1. **Horario** (`src/data/business.ts` → `hours`). Tomado de la ficha de Google (lun 19:30–00:00, mar–sáb 12:00–16:00 y 20:00–00:00, dom cerrado); TripAdvisor muestra otro horario desactualizado.
   El indicador "Abierto ahora · Ideal para cenar" y el JSON-LD se calculan a partir de este objeto.
2. **Precios de la carta** (`src/data/menu.ts`). Son orientativos dentro del rango 10‑20 €/persona; la carta física
   no era legible en las fotos recibidas. Ajusta nombres, precios, alérgenos y etiquetas (vegano, sin gluten…).
3. **Reservas.** Alguna fuente indica que el local no acepta reservas. El CTA "Reservar Mesa" abre un modal que
   deriva a llamada / WhatsApp con mensaje prellenado (sin backend). Si no se admiten reservas, cambia el texto en
   `ReservationModal.tsx` o convierte el CTA en "Llamar".
4. **Texturas.** `public/textures/*.webp` son procedurales. Para usar fotos reales (hierro fundido, brasas, piedra
   de la Catedral, pizarra) basta con sustituir los ficheros manteniendo el nombre.
5. **Enlaces de reseñas** en `business.ts → social` (Google Maps / TripAdvisor) y el `NEXT_PUBLIC_SITE_URL`.

## Rendimiento y móvil

`usePerformanceTier()` clasifica el dispositivo (`low` / `mid` / `high`) según tamaño, táctil, núcleos, memoria,
"ahorro de datos" y `prefers-reduced-motion`, y escala DPR, nº de partículas, sombras, bloom y objetos flotantes.
En `low` el Hero y el mapa 3D renderizan un fallback estático (sin WebGL). Los Canvas se pausan fuera de pantalla.

## Captura de pantalla / QA

```bash
npm run build
NODE_PATH=/opt/node22/lib/node_modules node scripts/screenshot.cjs   # requiere playwright instalado globalmente
```
