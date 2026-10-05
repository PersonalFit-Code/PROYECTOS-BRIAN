# Prompt de diseño web — el lenguaje visual de Tixola, para recrearlo en otra página

Pégalo tal cual en Claude (o en cualquier IA de código) al empezar el proyecto nuevo. Todo lo que
está entre `‹ ›` es lo único que hay que cambiar: marca, colores y tipografías. Lo demás (estructura,
reglas de movimiento, de cristal y de rendimiento) es lo que hace que se vea "como esta web".

---

## PROMPT

Diseña y construye la web de **‹nombre del negocio›** (‹tipo de negocio, ciudad›) con el siguiente
lenguaje visual. Es una web editorial, cálida y oscura, de "local con carácter", no una plantilla
SaaS. Aplica los cambios, no entregues solo una propuesta.

### 1 · Stack
Next.js (App Router) + React + TypeScript estricto + Tailwind CSS v4 (tokens en `@theme`), framer-motion
para entradas y hojas, i18n por ruta `/[locale]` con todo el texto en ficheros de mensajes (nada de
literales en los componentes). Imágenes con `next/image`, tipografías con `next/font`.

### 2 · Color: sale de la marca real, no de un muestrario
- **Fondo de página oscuro y cálido**, con una escala de 4-5 superficies de la más oscura (página) a
  la más clara (tarjeta elevada). En Tixola: granate `#3b1613`, `#2a0f0d`, `#472019`, `#552a20`.
  Nunca negro puro ni gris neutro: el tinte de marca va en TODAS las superficies.
- **Un solo color de acento**, rojo pimentón `‹#9e1618›`, con tres usos distintos y cada uno con su
  tono para pasar contraste: el base para fondos de botón (con texto crema 7,4:1), uno claro
  `‹#e8565a›` solo para texto grande, iconos y bordes, y uno intermedio `‹#f0838a›` para texto normal
  pequeño sobre las superficies (≥ 4,5:1).
- **Crema** `‹#f6f4e7›` como color de texto (no blanco). Texto secundario = crema al 68 %, terciario
  al 62 % (nunca menos: no pasa AA).
- **Un degradado de marca** (oro `#e8c27a` → ámbar `#ff6a3d` → acento claro) SOLO para UNA palabra
  destacada por titular, con `background-clip: text`.
- Todo texto sobre una superficie translúcida se valida contra el PEOR fondo posible, no el medio.

### 3 · Tipografía: cuatro voces con un trabajo cada una
- **Display / titulares:** serif editorial fina (Cormorant Garamond 300-500). Titulares grandes,
  `leading` apretado (0,95-1), `text-balance`.
- **Versalitas / kickers y etiquetas:** serif de inscripción (Cinzel), mayúsculas, `tracking` 0,25-0,3em,
  10-12 px, en el color de acento medio. Siempre con un filete de 32 px delante.
- **Manuscrita de la marca:** la del logo (Niconne), SOLO para el nombre de la casa y una palabra
  destacada de un titular (a `1.26em` y `line-height` ~0,74 para que no rompa el interlineado). Nunca
  para texto corrido. También como marca de agua gigante (≈ 5 % de opacidad) en el pie y el menú.
- **Cuerpo:** sans geométrica legible (Manrope), 14-16 px, `leading-relaxed`, `text-pretty`.
- **Cifras grandes y etiquetas de filtro:** condensada (Bebas Neue).
Identifica la manuscrita comparando fuentes con el logo real renderizadas lado a lado, no a ojo.

### 4 · Atmósfera (sin coste de rendimiento)
- **Textura:** foto de fondo oscura (hierro/pizarra) a baja opacidad bajo un velo de degradado, y
  **grano** de ruido SVG al 5,5 % de opacidad encima.
- **Brasa:** halos de color de marca como `radial-gradient` con paradas repartidas, NUNCA `blur()` de
  64 px sobre elementos grandes (se rasteriza entero en cada scroll). Chispas/brasas sutiles en bucle
  solo en una sección y pausadas cuando no está en pantalla.
- Filetes de 1 px con degradado transparente→crema 25 %→transparente entre secciones.

### 5 · Liquid Glass: el cristal es para los CONTROLES
Regla central: cabecera, barra inferior móvil, menús, popovers, hojas, modales y botones flotantes
llevan cristal; tarjetas, filas y celdas NO (superficies translúcidas sin `backdrop-filter`). Nunca
cristal sobre cristal.
- Tokens en `:root`: `--glass-bg` (tinte de marca al 58 %), `--glass-bg-strong` (al 82 %, para todo
  control con texto), `--glass-blur: blur(20px) saturate(180%)`, `--glass-border` (crema 16 %),
  `--glass-highlight` (sombra interior superior blanca 22 %), `--glass-sheen` (degradado blanco 15 %→0
  en el 50 % superior, como `background-image`, no `::before`), `--glass-shadow` ancha y suave,
  `--capa-1/2/3` para contenido, `--on-accent` para texto sobre el acento.
- Cabecera y barra inferior son **cápsulas flotantes** a 8-20 px de los cantos, radio `999px` /
  concéntrico (radio hijo = radio padre − padding). Las barras de filtros, igual; sus paneles son
  popovers que crecen desde el botón (`transform-origin` en el botón) con muelle.
- **Las superficies anchas (cabecera, barras de filtro, dock) solo desenfocan en gama alta**
  (`data-gpu="high"`): medido, un desenfoque ancho con la página deslizándose debajo duplica los
  fotogramas perdidos. Los controles pequeños (botones flotantes, menús) sí desenfocan siempre.
- Las hojas que se arrastran o animan llevan el canto del cristal pero SIN desenfoque, sobre un velo
  casi opaco.
- `prefers-reduced-transparency` → cristal macizo; `prefers-contrast: more` → bordes y fondos más
  fuertes; `-webkit-backdrop-filter` lo añade el minificador, comprobarlo en el CSS compilado.
- En filas con `overflow-x:auto` (chips, pestañas) solo sombras `inset`: las exteriores se recortan
  en un recuadro de bordes rectos. Los desvanecidos laterales con `mask-image`, no con degradados
  encima.

### 6 · Movimiento
- Curva de la casa `cubic-bezier(0.16, 1, 0.3, 1)` para entradas y revelados; muelle
  `cubic-bezier(0.2, 0.9, 0.3, 1.2)` en pulsaciones y morfismos de estado (250-400 ms).
- **Revelados al scroll con UN solo `IntersectionObserver` compartido** que añade `.is-revealed`;
  estado inicial, transición y final en CSS (`[data-reveal]`, modos `up | fade | letterbox | wipe`,
  retardo escalonado por variable CSS). Todo bajo `prefers-reduced-motion: no-preference`, y el
  ocultado solo se arma si hay JS (atributo en `<html>` + vigía de 2,6 s) para que sin JS no haya
  secciones en blanco. Nada de un ScrollTrigger por elemento.
- Parallax y scroll suave (Lenis) solo en la portada; el parallax con GSAP y los revelados sin GSAP,
  en módulos separados para no cargar GSAP donde no hace falta.
- Pulsar = `scale(.96)` con muelle. Solo se animan `transform` y `opacity` (nunca width/height/top).
- Acordeones y desplegables: estado de React + `height: "auto"` de framer, contenido SIEMPRE en el
  HTML (rastreable), `visibility: hidden` al cerrar, contenido entrando 80 ms después de la altura.
  El signo "+" se transforma en "−" (un palo gira y se encoge), no en una ×.
- `will-change` solo durante la animación, nunca fijo.

### 7 · Estructura y componentes
- **Portada:** titular enorme con una palabra en manuscrita y degradado, dos botones (acción primaria
  en cápsula acento + secundaria translúcida), una línea de prueba social (valoración + nº de reseñas),
  foto de ambiente a sangre con velo, y un riel lateral de capítulos con puntos (cristal).
- **Secciones:** kicker en versalitas con filete → titular con acento → entradilla → contenido.
  Entre secciones, filete de degradado.
- **Carrusel de destacados** con fotos reales, ficha de detalle que se abre como hoja (móvil: desde
  abajo, arrastrable; escritorio: diálogo) y la foto viajando desde la tarjeta (`layoutId`).
- **Prueba social:** cifras grandes en 2×2 / 1×4 separadas por filos de 1 px, reseñas en columnas con
  marquee, enlaces a las plataformas.
- **Galería:** mural tipo masonry con `columns` de CSS (cada foto a su proporción real, sin recortar),
  filtro por tema calculado de los datos, 12 visibles + "ver las N", visor a pantalla completa con
  teclado, foco devuelto y fondo `inert`.
- **Carta/catálogo:** barra pegajosa (cápsula de cristal) con chips de categoría de selección única,
  buscador y botón "Filtros" con panel; contador de resultados en `aria-live`.
- **Pie:** 4 columnas (marca+valoraciones, contacto, horario con día de hoy resaltado y estado "abierto
  ahora" en vivo, enlaces), barra legal, selector de idioma como enlaces reales, marca de agua manuscrita.
- **Botones flotantes** (WhatsApp y asistente) en esquinas opuestas, 36 px visibles con zona
  pulsable de 44; se apartan solos cuando tapan algo.

### 8 · Reglas que no se negocian
- **Nunca inventar contenido:** ni precios, ni alérgenos, ni datos de producto, ni cifras. Lo que no
  está documentado se marca "pendiente de confirmar" para el dueño.
- Un dato = un fichero (`menu.ts`, `business.ts`…) tipado; los ids que se referencian entre ficheros
  se tipan para que un id roto rompa la compilación.
- Accesibilidad: AA en todo, zonas táctiles ≥ 44 px, foco visible, `aria-expanded/controls` en todo
  desplegable, `Escape` cierra y devuelve el foco, `prefers-reduced-motion` respetado.
- SEO: metadatos por idioma, `hreflang`, JSON-LD (LocalBusiness, Menu, FAQPage con el MISMO texto
  visible), sitemap; las páginas legales `noindex` hasta tener los datos del responsable.
- Rendimiento: medir el scroll con Chrome (fotograma medio y perdidos) ANTES y DESPUÉS, comparando
  builds intercalados; si empeora, se quita lo que lo causa.
- Verificar siempre: `tsc`, `eslint`, `build`, barrido de todas las rutas × idiomas × anchos
  (320-1440 px) sin desbordes ni imágenes rotas, y capturas a 390 y 1440 px.

### 9 · Qué cambiar para la página nueva
Marca y logo · paleta (acento + escala de 4-5 superficies de la MISMA familia de tono) · las cuatro
fuentes (mismos roles) · textura de fondo y foto de la portada · idiomas · datos del negocio · la
estructura de secciones (quita las que no apliquen, p. ej. carta → catálogo/servicios).
