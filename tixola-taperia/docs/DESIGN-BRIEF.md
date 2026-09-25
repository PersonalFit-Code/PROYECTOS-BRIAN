# Tixola Tapería — Brief de diseño y contrato técnico

Landing page 3D ultra‑inmersiva para **Tixola Tapería** (Rúa Juan de Austria, 7 · Ourense · junto a la Catedral).
Prueba social: **4,4 ★ Google · 858 reseñas** · TripAdvisor 4,2 · nº 19 de 496 · Travellers' Choice. Precio 10‑20 €/persona.
CTA: **Reservar Mesa** (modal → llamar / WhatsApp) · **Ver Carta** (`/carta`) · **Llamar 646 45 72 74** · **Cómo llegar**.

## Stack (ya instalado — no cambiar versiones)
Next 16 (App Router, Turbopack) · React 19 · TypeScript strict · Tailwind CSS **v4** (`@theme` en `src/app/globals.css`) ·
@react-three/fiber 9 · @react-three/drei 10 · three 0.186 · @react-three/postprocessing 3 · maath · gsap 3.15 (ScrollTrigger) · framer-motion 13 · lucide-react.

## Paleta y tipografía (tokens Tailwind v4 — usar como clases: `bg-pimenton`, `text-cream`, `border-cream/20`…)
| Token | Valor | Uso |
|---|---|---|
| `pimenton` / `pimenton-light` / `pimenton-dark` | #B21E27 / #D8323C / #7D131A | CTA, neones, luces 3D |
| `ember` / `gold` | #FF6A3D / #E8C27A | brasas, detalles cálidos |
| `iron` / `iron-900` / `iron-800` / `iron-700` / `iron-600` | #121212 … #2E2E2E | fondos hierro fundido / pizarra |
| `burgundy` / `burgundy-deep` | #3A0E13 / #22080B | degradados de fondo |
| `cream` / `cream-200` / `cream-400` / `cream-muted` / `cream-faint` | #F9F6F0 … | texto, tarjetas limpias |

Fuentes: `font-display` (Playfair Display, titulares serif, cursiva para acentos) · `font-sans` (Manrope, cuerpo/UI) · `font-condensed` (Bebas Neue, nombres de platos en carta, contadores grandes, estilo RavioXO).

Utilidades de marca (definidas en globals.css): `glass`, `glass-smoke`, `glass-red`, `neon-red`, `text-glow-red`, `text-gradient-cream`, `text-gradient-ember`, `text-3d`, `noise` + `after:noise-after`, `perspective-1200`, `preserve-3d`, `backface-hidden`, `container-page`, `no-scrollbar`, `divider-iron`.
Animaciones: `animate-neon-pulse`, `animate-float`, `animate-marquee`, `animate-shimmer`, `animate-ember-rise`.
Sombras: `shadow-neon`, `shadow-card`, `shadow-glass`. Easings: `ease-[var(--ease-out-expo)]`.
Variables CSS: `--header-h` (72px) y `--mobile-bar-h` (64px). El body ya reserva padding inferior en móvil para la barra flotante.

## Texturas (public/textures/*.webp — generadas proceduralmente; el cliente puede sustituirlas por sus fotos)
`/textures/iron.webp` (hierro fundido oscuro con óxido rojo) · `/textures/slate.webp` (pizarra negra rayada) · `/textures/stone.webp` (piedra dorada de catedral con arcos) · `/textures/embers.webp` (brasas y chispas sobre negro).
Úsalas como fondo CSS con color de respaldo: `bg-iron bg-[url('/textures/iron.webp')] bg-cover bg-center` + overlay degradado para legibilidad.
Imágenes: `/images/fachada.jpg` (fachada real del local, 806×490) · `/images/carta-pizarra.png` y `/images/carta-fisica.png` (miniaturas 112 px de la pizarra y la carta física; úsalas pequeñas, como polaroids decorativas).

## Datos (src/data) — NO modificar, solo consumir
- `business.ts` → `BUSINESS` (name, tagline, subtitle, address, geo {lat,lng}, phone {display,tel,whatsapp,e164}, ratings.google {value,count}, ratings.tripadvisor, features[], hours, social {directions,tripadvisor,googleReviews}), `DAY_LABELS`, `NAV_LINKS`.
- `dishes.ts` → `STAR_DISHES: StarDish[]` (4 platos estrella con ingredients, pairing {wine,do,why}, accent, emoji, badge, allergens, price, unit).
- `menu.ts` → `MENU_CATEGORIES`, `MENU_ITEMS: MenuItem[]` (id, name, category, description, price, unit, variants?, allergens[], tags[], pairing?, emoji), `DIET_TAG_LABELS`, `formatPrice()`.
- `allergens.ts` → `ALLERGENS` (14 UE), `ALLERGEN_MAP`, tipo `AllergenId`.
- `reviews.ts` → `REVIEWS: Review[]`, `SOCIAL_STATS` (contadores).

## Utilidades y hooks compartidos — NO modificar, solo consumir
- `@/components/ui/NeonButton` — `<NeonButton variant="primary|ghost|outline|cream" size="sm|md|lg" pulse icon iconRight href?>`. Con `href` renderiza enlace (tel:/https:/rutas internas).
- `@/components/ui/AllergenIcon` — `default AllergenIcon({id,size,withLabel,active})` y `AllergenRow({ids,size})`.
- `@/components/ui/SectionHeading` — `{kicker,title,accent,description,align,as}`; marca hijos con `data-reveal` para animarlos con GSAP.
- `@/components/ui/ReservationProvider` — `useReservation()` → `{open, close, isOpen}`. Ya envuelve ambas páginas. El modal real es `ReservationModal.tsx` (firma `{open,onClose}`).
- `@/hooks/usePerformanceTier` → `{tier:'low'|'mid'|'high', isMobile, isTouch, reducedMotion, dpr, particles, shadows, postprocessing, floaters}`. **Obligatorio** para escalar efectos 3D y mantener 60 FPS en móvil.
- `@/hooks/useIsMobile` → `useIsMobile()`, `usePrefersReducedMotion()`.
- `@/lib/gsap` → `getGsap()` devuelve `{gsap, ScrollTrigger}` ya registrados (solo cliente).
- `@/lib/openStatus` → `getOpenStatus(now?)` → `{isOpen,label,detail,mood,minutesToChange,todayKey,todayRanges}`, `formatRanges()`.
- `@/lib/utils` → `cn()`, `clamp()`, `lerp()`.

## Estructura de página (src/app/page.tsx ya ensambla esto; ids obligatorios para la navegación)
`<Navbar/>` → `<main>` `<Hero id="hero"/>` `<StarDishes id="platos"/>` `<Experience id="experiencia"/>` `<SocialProof id="opiniones"/>` → `<Footer id="footer"/>` → `<MobileStickyBar/>`.
`/carta` → `<CartaExplorer/>` (main ya tiene `pt-[var(--header-h)]`).

## Reglas de código
1. Componentes con hooks, R3F, GSAP o framer-motion llevan `"use client"`. El `<Canvas>` de R3F **siempre** se carga con `next/dynamic(() => import(...), { ssr: false })` desde un componente cliente, con un fallback visual (degradado + glow) mientras carga.
2. TypeScript estricto, sin `any`. Debe pasar `npx eslint <tus ficheros>` (reglas next/core-web-vitals) y `npx tsc --noEmit` sin errores en tus ficheros.
3. Mobile‑first: diseña primero a 375 px, luego `md:` y `lg:`. Áreas táctiles ≥ 44 px. Nada de scroll horizontal accidental.
4. Rendimiento: `usePerformanceTier()` decide sombras, partículas, DPR y post‑procesado. En `tier==='low'` no montes Canvas pesados (usa fallback estático). Respeta `prefers-reduced-motion`.
5. Accesibilidad: semántica (section/h2), `aria-label` en botones de icono, foco visible, contraste AA sobre fondos oscuros, `alt` en imágenes.
6. Textos en **español de España**, tono gastronómico y cercano; puedes usar toques en gallego ("tixola" = sartén).
7. No ejecutes `next build` ni `next dev` (otros agentes trabajan en paralelo): valida con `npx tsc --noEmit 2>&1 | grep -E "tu/ruta"` y `npx eslint tus/ficheros`.
8. Solo toca los ficheros que te pertenecen. Si necesitas algo de otro módulo, impórtalo por su ruta prevista y documenta la dependencia en tu resumen.

---

# ITERACIÓN 2 — Feedback del cliente y nuevas convenciones (leer entero)

## Feedback del cliente (literal, resumido)
1. **Portada (lo más importante).** Le gusta la animación 3D de la tixola: mantenerla. Pero el bloque de texto (kicker "Tapería · Vinoteca · Ourense", H1, subtítulo) "parece una pegatina": cambiar la tipografía, quitar el panel de cristal y colocarlo con criterio de PORTADA editorial. Quitar las 3 píldoras (4,4 · 858 reseñas / 10‑20 €/persona / 1 min Catedral). El subtítulo no debe girar solo en torno a las zamburiñas (hay muchos más platos). Mantener los CTAs "Reservar Mesa" e "Ir a la Carta".
2. **Botones flotantes.** Un botón de WhatsApp fijo en el lateral derecho y un lanzador del **chatbot "camarero virtual"** abajo a la izquierda.
3. **Scroll.** "Desliza" es incómodo: quiere una experiencia de desplazamiento cinematográfica, "como una película" (scroll suave, transiciones entre secciones, hero anclado que se transforma).
4. **Platos estrella.** Convertir en un **carrusel de fotos reales**; al pulsar, aparece la información (como el flip/spotlight actual). **Iconos, no emojis**, en toda la web.
5. **Carta.** Los filtros de alérgenos están bien (RGPD/UE) pero NO deben ser el centro: al entrar se ve **toda la carta** y se filtra por **categorías** (chips: Todo / Croquetas / Tixolas / …). Buscador y alérgenos en segundo plano (panel plegable). Quitar el botón "Imprimir carta". El maridaje de vino es "brutal": mantenerlo. El **camarero virtual** debe tener gran protagonismo aquí.
6. **Idiomas.** Selector de idioma: ES / GL / EN / PT (turismo en Ourense).
7. **Legal.** Añadir política de privacidad, aviso legal y cookies (con banner).
8. **Marquee.** Le gusta; cambiar a una letra más fina y elegante (no gruesa, no cursiva).
9. **Experiencia.** Quitar los chips "Casco histórico / Zona de viños / Terraza todo el año" y dar otro punto de vista (foto real de la terraza con Santa Eufemia al fondo). El mapa 3D gusta pero no es la ubicación real: hacerlo más fiel (manzana de Rúa Juan de Austria, Catedral de San Martiño, iglesia de Santa Eufemia).
10. **Prueba social.** "Muy básico": columnas de reseñas reales de 5★ en marquee vertical (referencia marquee‑03 de 21st.dev adaptada a Tailwind v4 y a nuestra paleta) + galería de fotos del local que se desliza.
11. **SEO** orgánico y orientado a marketing: metadatos por idioma, hreflang, JSON‑LD, alt descriptivos, semántica.
12. **Logo** "TIXOLA" arriba a la izquierda más grande, aprovechando el margen.
13. Paleta y fondos: le gustan. Contacto y horario: bien. Cómo llegar / Llamar: bien.

## Nuevas convenciones (obligatorias)
### Tipografía
- `font-display` → **Cormorant Garamond** (300/400/500/600, normal + itálica). Titulares editoriales grandes, tracking ligeramente negativo, leading ~0.95.
- `font-caps` → **Cinzel** (400/500/600). Kickers, etiquetas, versalitas con tracking amplio (`uppercase tracking-[0.3em] text-xs`).
- `font-sans` → Manrope (cuerpo/UI). `font-condensed` → Bebas Neue (nombres de plato en carta, contadores).
- Marquee: `font-display font-light uppercase tracking-[0.3em]` (fina y elegante).
### i18n (src/i18n)
- Rutas con prefijo: `/es`, `/gl`, `/en`, `/pt` (`src/proxy.ts` redirige `/` según cookie/Accept‑Language). `app/[locale]/layout.tsx` es el root layout y monta `<LocaleProvider>`.
- En componentes cliente: `const m = useMessages(); const locale = useLocale(); const lp = useLocalePath(); const t = useFormat();` → `m.hero.title`, `<Link href={lp("/carta")}>`, `lp("/#platos")`, `t(m.carta.results, { count })`.
- En server components: `const m = await getMessages(locale)`.
- **Todo texto visible sale de `src/i18n/messages/es/<sección>.ts`** (cada agente edita SOLO su fichero de sección y puede añadir claves). Nada de strings sueltos en JSX.
- Datos localizados: `localizeMenuItems(locale)`, `localizeCategories(locale)`, `localizeStarDishes(locale)`, `localizeAllergens(locale)`, `localizeAllergenMap(locale)`, `localizeDietTags(locale)`, `localizeFeatures(locale)` desde `@/i18n/data`. Usa estas funciones en lugar de importar MENU_ITEMS/STAR_DISHES/ALLERGENS directamente en la UI.
- Formato de precios: `formatPrice(n, locale?)` — usa `Intl.NumberFormat(LOCALE_META[locale].intl, …)`; si `formatPrice` aún no acepta locale, usa `new Intl.NumberFormat(LOCALE_META[locale].intl, { style: "currency", currency: "EUR" })`.
- `getOpenStatus()` devuelve etiquetas en español: los componentes deben mostrar `m.common.status.*` según `isOpen`/`minutesToChange`/`detailKind` (ver openStatus.ts) — el módulo de Experiencia lo adapta.
### Iconos
- **Prohibido pintar emojis.** `import { DishIcon } from "@/components/icons/DishIcons"` → `<DishIcon iconKey={item.emoji} size={28} />` (el campo `emoji` de los datos es solo una clave). Iconos de UI: lucide-react.
### Fotos
- `import { PHOTOS, photosForDish, photosByTag } from "@/data/photos"`; `StarDish.image` y `MenuItem.image` opcionales. Usa `next/image` con `sizes` correcto y `alt` descriptivo (SEO). Formato: object-cover con `style={{ objectPosition: photo.focus }}`.
### Chat (camarero virtual)
- `useChat()` de `@/components/chat/ChatProvider` → `open({ prefill, page })`, `close`, `isOpen`. El widget lo monta el módulo de chat dentro del provider (ya envuelve ambas páginas).
### Scroll cinematográfico
- El módulo de scroll crea `src/components/scroll/SmoothScrollProvider.tsx` (Lenis + `gsap.ticker` + `ScrollTrigger.update`) y envuelve `<main>` en `app/[locale]/page.tsx`. Los demás módulos mantienen `data-reveal`/`useScrollReveal`/`whileInView`; NO instancian Lenis ni cambian el scroller de ScrollTrigger.
### Anclas y navegación
- Ids obligatorios: `hero`, `platos`, `experiencia`, `opiniones`, `footer`. Enlaces siempre con `lp()`.
### Calidad
- Sin `any`, `npx tsc --noEmit` y `npx eslint <ficheros>` limpios. Mobile‑first, 44 px táctiles, `prefers-reduced-motion`, sin overflow horizontal, contraste AA (`text-pimenton-a11y` para texto pequeño rojo).
