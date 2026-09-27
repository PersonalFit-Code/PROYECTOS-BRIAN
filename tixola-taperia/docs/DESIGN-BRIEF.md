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
### Platos estrella (#platos)
- `DishCarousel3D` es la pieza por defecto: los ocho platos ocupan las caras de un cilindro que se arrastra para girar. El radio sale de `(ancho de cara / 2) / tan(π / nº de caras)` —así las caras encajan borde con borde— y el cilindro se retranquea con `translateZ(-radio)` para que la de delante se dibuje a su tamaño real.
- Pulsar la cara de delante abre `DishSpotlight` (ingredientes, alérgenos y maridaje); pulsar una lateral la trae al frente. Enfocar con el tabulador también la trae al frente.
- En gama baja y con `prefers-reduced-motion` se sirve `DishCarousel` (Embla, plano): mismo contenido, mismo detalle, sin perspectiva ni giro.
- `STAR_DISHES` tiene ocho platos porque un cilindro con cuatro caras no cierra: las tarjetas se solapan. Cada uno enlaza con su ítem de la carta por `menuId`, y el manifiesto de fotos se consulta por los dos ids.

### Chat (camarero virtual)
- `useChat()` de `@/components/chat/ChatProvider` → `open({ prefill, page })`, `close`, `isOpen`. El widget lo monta el módulo de chat dentro del provider (ya envuelve ambas páginas).
- El panel lleva un telón opaco propio: `glass-smoke` cuenta con el `backdrop-filter` y ese filtro no siempre llega (navegador sin soporte, sin aceleración), dejando la conversación transparente sobre la portada.
- `THINKING_MIN_MS` (`useChatSession`) retiene el primer fragmento de la respuesta: los puntos de "escribiendo…" llegan a verse y el texto no aparece de golpe. Solo afecta al primer fragmento.
### Scroll cinematográfico
- El módulo de scroll crea `src/components/scroll/SmoothScrollProvider.tsx` (Lenis + `gsap.ticker` + `ScrollTrigger.update`) y envuelve `<main>` en `app/[locale]/page.tsx`. Los demás módulos mantienen `data-reveal`/`useScrollReveal`/`whileInView`; NO instancian Lenis ni cambian el scroller de ScrollTrigger.
### Anclas y navegación
- Ids obligatorios: `hero`, `platos`, `experiencia`, `opiniones`, `footer`. Enlaces siempre con `lp()`.
### Calidad
- Sin `any`, `npx tsc --noEmit` y `npx eslint <ficheros>` limpios. Mobile‑first, 44 px táctiles, `prefers-reduced-motion`, sin overflow horizontal, contraste AA (`text-pimenton-a11y` para texto pequeño rojo).

---

# ITERACIÓN 3 — CONTRATO DE COMPOSICIÓN (cristal horneado, brasas y revelados)

Decisión del cliente: la web tiene que ir fina en **gama media** —portátil con gráfica integrada y móvil
de gama media—, no solo en un equipo potente. Lo que más caro sale ahí no son los polígonos: son las
**capas que el compositor tiene que rehacer**. `backdrop-filter`, `filter: blur()` y `mix-blend-mode`
obligan al navegador a leer lo que hay detrás de una capa, rasterizarla aparte y recomponerla cada vez
que algo se mueve por encima o por debajo. Este apartado fija cómo se pintan esas superficies.

## 1 · Cristal: horneado por defecto, real solo en gama alta MEDIDA

`glass`, `glass-smoke` y `glass-red` (`src/app/globals.css`) **ya no llevan `backdrop-filter`**. La
utilidad es un degradado + borde + `box-shadow`: se ve como cristal porque el ojo lee el borde y el filo
de luz superior, no el desenfoque. El desenfoque real se reactiva desde **un único punto**:

```css
:root[data-gpu="high"] .glass       { backdrop-filter: blur(18px) saturate(140%); }
:root[data-gpu="high"] .glass-smoke { backdrop-filter: blur(22px) saturate(120%); }
:root[data-gpu="high"] .glass-red   { backdrop-filter: blur(18px) saturate(140%); }
/* Excepción documentada: la banda de la cabecera (`[data-navbar-surface]`, solo en ≥ md). */
```

- **`data-gpu="high"` en `<html>` lo escribe `syncGlassSwitch()`** en
  `src/hooks/usePerformanceTier.ts`, desde el `commit()` del almacén: una sola vez, solo en cliente y solo
  con la gama alta **ya medida** (no basta la heurística optimista de partida — mientras la sonda mide es
  el peor momento para añadir una recomposición del viewport por superficie). Es el ÚNICO escritor y el
  único lector del atributo. Si esta función desaparece, el cristal no vuelve en NINGÚN equipo y la
  decisión del cliente pasa de "se reserva a gama alta" a "se elimina": era exactamente el estado en el
  que estaba el árbol a mitad de esta iteración.
- **Única superficie que no es una tarjeta: la cabecera.** La banda `fixed` de 72 px se pinta con su propio
  degradado casi opaco (0,96/0,92) por defecto, porque es la superficie que más se recompone de toda la
  sesión; pero en escritorio eso la convertía en una franja negra maciza, y es lo que el cliente tiene
  delante durante toda la demo. Recupera el degradado translúcido + desenfoque en ≥ md bajo el MISMO
  selector de arriba. El componente solo marca la capa con `data-navbar-surface`: no consulta la gama.
- Las opacidades horneadas suben un par de puntos respecto a las de la iteración 2 para compensar la
  pérdida del desenfoque: `glass` 0,08 → **0,10**, `glass-smoke` 0,72 → 0,78/0,90, `glass-red` 0,22 →
  0,30. Suben las tres, sin excepciones. Efecto lateral bienvenido: **el texto sobre cristal gana
  contraste**.
- **Prohibido volver a condicionar el cristal a mano.** Nada de `tier === "high" ? "glass-smoke" : …` ni
  de props `glass` viajando por el árbol: la clase se pone siempre y el selector de arriba decide. Si un
  componente necesita un fondo distinto del de la utilidad, escribe su propio degradado (ver OpenStatus)
  y no pide `backdrop-filter` en ningún caso.
- Excepción deliberada: **el aviso de cookies nunca lleva cristal, en ningún ancho**. Se pinta encima del
  lienzo WebGL de la portada, ya en marcha, y es lo primero que ve un visitante.

## 2 · Brasas: utilidades `ember-glow` / `ember-wash`, nunca `blur-2xl` / `blur-3xl`

Desenfocar un degradado radial es trabajo tirado: el degradado ya es suave. La utilidad `ember-glow`
lleva la caída horneada en cuatro paradas y se ajusta con dos variables:

```html
<span aria-hidden class="ember-glow h-56 w-56 rounded-full [--ember-a1:0.45] [--ember-rgb:216_50_60]" />
```

`--ember-a1` es la opacidad del centro; las dos paradas intermedias se derivan de ella (×0.47 y ×0.17),
así que **no se declara una clase arbitraria por parada** — si cada componente escribiera su propio
`bg-[radial-gradient(...)]`, la hoja global engordaría y se perdería el cambio. `--ember-rgb` toma el
color en componentes separados por espacio (en Tailwind, con `_`).

**Dos utilidades, y elegir la correcta importa.** `ember-glow` reparte el alfa desde el pico y cae rápido
(×0,47 al 35 %, ×0,17 al 62 %): es el sustituto honesto de un `radial-gradient` que ya caía así.
`ember-wash` mantiene el alfa casi plano hasta el 70 % del radio y solo pluma el último tramo: es el
sustituto de un **color macizo** al que el `blur-3xl` solo le plumeaba el borde. Confundirlas cuesta
~3,5 veces de luz (alfa media ≈ 0,21·a1 frente a ≈ 0,6·a1), y en esta web eso se vio en seis sitios: el
resplandor del pie del menú móvil, el del pie de página, el de las páginas legales, el del aviso de
cookies, el de las cuatro tarjetas de indicadores y el del modal de reserva pasaron de un lavado claro a
un rubor casi invisible. **Regla práctica: ¿el original era `bg-<color>/<alfa>` plano? → `ember-wash` con
el MISMO alfa. ¿Era ya un radial? → `ember-glow`.** Nunca hace falta compensar el alfa a ojo.

Regla: **ningún `blur-2xl` / `blur-3xl` sobre un área mayor de 200×200 px.** Para halos pequeños de
adorno el filtro es tolerable; para una capa de 420² px o de 1400×760 no.

## 3 · Grano (`noise-after`): sin `mix-blend-mode`

`mix-blend-mode` compone el contexto de apilamiento ENTERO fuera de pantalla, incluida la parte que no se
ve — en las secciones a pantalla completa y en el envoltorio de /carta (~9000 px) son megapíxeles por
scroll a cambio de un grano al 7 %. Se ha quitado en **todos** los anchos (la mitigación anterior lo
apagaba en móvil, donde ya iba bien, y lo dejaba encendido justo en el portátil con gráfica integrada).
El grano se superpone en modo normal, con la turbulencia desaturada y la opacidad en **0,055**: en modo
`overlay` el grano se modulaba con el fondo y sobre el negro pizarra era casi invisible; en modo normal es
un velo gris uniforme, y a 0,075 levantaba el negro 3-4 niveles RGB —dejaba de ser negro— y se posaba
igual sobre las fotos a sangre y sobre el texto crema. Es un cambio visible en pantalla grande: el grano
ya no se modula, solo es más discreto.

## 4 · Halo del fondo: capa fija, no `background-image` del `<body>`

Los dos radiales de burdeos viven en `body::before { position: fixed; inset: 0; z-index: -50 }`. En el
`background-image` del `<body>` su caja de pintado era el documento entero y se reevaluaban al cambiar el
viewport (barra de direcciones de iOS, rotación). Un viewport de caja en vez de 9000 px.

**No es la misma imagen**, y conviene decirlo: antes las manchas estaban ancladas al DOCUMENTO y se pasaba
por delante de ellas al bajar; ahora están clavadas a la PANTALLA y viajan con el scroll de principio a
fin (se nota en /carta, donde el lavado rojizo se queda en la esquina superior derecha). Se acepta porque
es luz ambiental y no un elemento de composición, pero **es una decisión para enseñar al cliente**.

## 5 · Revelados al entrar en pantalla: el estado vive en CSS

Contrato entre `globals.css` y el sistema de scroll. **El JS solo añade la clase `.is-revealed`**; el
estado inicial, la transición y el final son CSS:

| Nombre | Qué es |
| --- | --- |
| `[data-reveal-armed]` (en `<html>`) | **interruptor**: sin él no se oculta nada |
| `[data-reveal]` | fundido + desplazamiento (modo por defecto) |
| `[data-reveal="fade"]` | solo fundido |
| `[data-reveal="letterbox"]` | se abre como un fotograma (`clip-path` vertical) |
| `[data-reveal="wipe"]` | barrido de izquierda a derecha |
| `--reveal-y` | desplazamiento inicial (28 px por defecto) |
| `--reveal-delay` | retardo, para escalonar por índice |
| `.is-revealed` | estado final; libera la capa con `will-change: auto` |

Todo va dentro de `@media (prefers-reduced-motion: no-preference)`: quien pide menos movimiento ve el
contenido visible y quieto **sin que intervenga nada de JS**. No renombrar estas claves sin avisar al
módulo de scroll.

**Y todo cuelga además de `:root[data-reveal-armed]`.** El atributo `data-reveal` viaja YA en el HTML del
servidor (27 nodos en la home), así que una regla global `[data-reveal]{opacity:0}` deja toda la página por
debajo de la portada invisible hasta que React hidrate — y para siempre si el JavaScript no llega. Con la
wifi de un local eso es una página en blanco delante del cliente. Por eso:

1. un script síncrono en `[locale]/layout.tsx` escribe el atributo **antes del primer pintado** (sin JS no
   existe y el HTML del servidor se lee tal cual, sin parpadeo);
2. ese mismo script arma un vigía de 2,6 s que lo retira si nadie llega a montar `useScrollReveal`
   (bundle lento, error de hidratación): la página aparece sin animación, que es mucho mejor que en blanco;
3. `useScrollReveal` cancela el vigía al montarse (`disarmRevealWatchdog`).

Efecto lateral bienvenido: reutilizar un componente genérico con `data-reveal` (`SectionHeading`, `Faq`,
`PhotoGallery`) en una sección **sin** el hook ya no deja ese bloque en blanco para siempre.

Y un detalle que costó caro: en JSX un atributo sin valor (`<h2 data-reveal>`) es `data-reveal={true}` y
React lo serializa como la **cadena `"true"`**, no como vacío. Quien mire `el.dataset.reveal` para decidir
si hay un modo explícito tiene que contar `"true"` como "no hay modo", o la opción `cinematic` del hook no
hace nada (fue el caso: Experience y SocialProof revelaban todo en modo `up` y las reglas `letterbox` /
`wipe` no las usaba nadie).

## 6 · `will-change` atado a la animación

`will-change: transform` promueve una capa GPU y la mantiene viva mientras la clase esté puesta. En las
marquesinas, las brasas CSS y las capas parallax se aplica **solo mientras la animación está corriendo**
(`!paused && "will-change-transform"`): una capa promovida que no se mueve es memoria a cambio de nada.
Lo mismo con los `filter` sobre texto: el halo de los contadores llega al TERMINAR la cuenta, no durante.

## 7 · Visibilidad en pantalla sin Framer Motion

`@/hooks/useInViewOnce` → `useInView(ref, {amount, rootMargin})` (vivo, cambia al entrar y al salir) y
`useInViewOnce(ref, opts)` (con trinquete). Un `IntersectionObserver` compartido por configuración para
toda la web + `useSyncExternalStore`. **Úsalo en vez del `useInView` de Framer** cuando solo hace falta
saber si algo se ve para pausar una animación o para montar un bloque pesado: Framer arrastra el paquete
entero a componentes que por lo demás no animan nada.

## 8 · Bloqueo de scroll: contado, en un solo sitio

`src/lib/scrollLock.ts` → `const release = lockScroll()` y `release()` en la limpieza del efecto. Lo usan
los cinco paneles a pantalla completa (menú de la cabecera, modal de reserva, detalle de plato, visor de la
galería, leyenda de alérgenos). **Nadie escribe `data-scroll-lock` ni `body.style.overflow` a mano.**

El contrato son dos cosas y las dos las mira el resto de la web: `overflow: hidden` en el `<body>`, que
congela el scroll, y `data-scroll-lock` en el `<html>`, que es lo que consultan `SmoothScrollProvider`
(para parar Lenis) y `HeroCanvas` (para dejar de pintar la escena detrás de un panel opaco). Sin contador,
dos paneles solapados se pisaban: el interior borraba el atributo al cerrarse y el exterior se quedaba
abierto con Lenis vivo y el lienzo WebGL pintando debajo. La leyenda de alérgenos, además, bloqueaba el
`<body>` sin escribir el atributo, así que con ella abierta eso pasaba siempre.

El `padding-right` que compensa la barra de desplazamiento sigue ahí, pero ya no hace falta: `<html>` lleva
`scrollbar-gutter: stable`, que reserva el hueco de entrada. Sin eso, compensar el `<body>` estabilizaba el
contenido del documento pero **no** las capas `position: fixed` (cabecera, barra inferior de móvil, botón
de WhatsApp, lanzador del chat), que se posicionan contra el viewport y saltaban 7,5-15 px al abrir un
modal en escritorio.

## 9 · Degradación medida: un solo sentido y una sola vez

La sonda vive DENTRO del Canvas (`FrameProbe`, en `HeroScene`) y publica en el almacén de gama, que es un
trinquete: la gama baja, nunca sube. Dos consecuencias que hay que respetar al escribir cualquier consumidor:

- **Un consumidor puede perder su capacidad EN CALIENTE.** `useCanAfford(...)` puede pasar de `true` a
  `false` a los 2-4 s de cargar. Todo lo que se haya escrito en el DOM tiene que poder deshacerse en la
  limpieza del efecto —ojo con `gsap.quickSetter`, que escribe estilo en línea sin crear ningún tween y por
  tanto `ctx.revert()` NO lo deshace— y todo estado derivado de "esto está montado" tiene que leerse junto
  con la condición que lo monta (`ready && show3D`, no `ready` a secas), o queda un hueco negro sin error.
- **Lo que cambia el TACTO no se decide con la heurística.** Lenis exige gama alta **y medida**
  (`tier === "high" && measured`): con la heurística optimista se montaba en el primer render y se
  destruía dos segundos después, y el scroll cambiaba de tacto en vivo delante del cliente. Así el
  interruptor se acciona una sola vez y siempre hacia "responde mejor". Mismo criterio para el cristal.
