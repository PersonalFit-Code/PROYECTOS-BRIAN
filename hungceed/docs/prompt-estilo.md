# Prompt: estilo de la maqueta Hungceed (letra, botones y animaciones)

Pega esto en la sesión de la otra web. Está escrito para Next.js + Tailwind 4 + framer-motion,
pero los valores sirven igual en cualquier stack.

---

Aplica a esta web el siguiente sistema de estilo. Respeta los valores exactos.

## 1. Letra

- **Titulares:** Barlow Condensed (Google Fonts), pesos 600, 700 y 800, autoalojada con
  `next/font/google`.
  - Clase `titular`: peso 800, MAYÚSCULAS, `letter-spacing: 0`, `line-height: 0.92`.
  - Clase `subtitular`: peso 700, MAYÚSCULAS, `letter-spacing: 0.01em`, `line-height: 1`.
  - Tamaños con clamp:
    - titular de portada: `clamp(3rem, 9vw, 6.5rem)`;
    - titular de sección: `clamp(2.4rem, 5vw, 3.75rem)`;
    - titulares de carrusel: 28 px en móvil y 34 px en escritorio.
- **Texto:** Poppins, pesos 400, 500, 600, 700 y 800, autoalojada.
  - Cuerpo: 13–14 px, `line-height` 1.5–1.6.
  - Textos secundarios en gris `#5c5d63`.
  - Etiquetas pequeñas: 11–12 px, peso 500.
- Las dos fuentes van como variables CSS en `<html>` (`--font-poppins`, `--font-barlow`) con
  `display: swap`.

## 2. Color

- Blanco, negro y grises. Sin acentos de color salvo el del logo.
- Tokens:
  - `--negro: #0a0a0b`
  - `--carbon: #1c1c1f`
  - `--hueso: #f2f2f2` (fondos de producto y bandas)
  - `--linea: #e4e4e7`
  - `--gris: #5c5d63` (6,6:1 sobre blanco)
  - `--gris-claro: #a1a1aa`
- Selección de texto: fondo negro y texto blanco.
- Foco: `outline: 2px solid` negro con `outline-offset: 3px`.

## 3. Botones

- **Forma:** rectángulos sin redondeo (`border-radius: 0`), MAYÚSCULAS, peso 600,
  `letter-spacing: 0.14em`.
- **Altura:** se fija con `min-height` (no con `height`), así un texto en dos líneas en un móvil de
  320 px no se sale del botón.
  - sm: `min-h 40px`, `px 16px`, texto 11 px
  - md: `min-h 48px`, `px 28px`, texto 12 px
  - lg: `min-h 56px`, `px 36px`, texto 13 px
- **Variantes:**
  - `primario`: fondo negro y texto blanco. Al pasar el ratón, el relleno cambia a `#1c1c1f`.
  - `secundario`: transparente con borde negro. Al pasar el ratón se rellena de negro y el texto
    pasa a blanco.
  - `claro`: blanco con texto negro, para usar sobre fotos. Al pasar el ratón, el relleno es
    `#f2f2f2`.
  - `contorno`: transparente con borde y texto blancos, sobre fotos. Al pasar el ratón se rellena de
    blanco y el texto pasa a negro.
  - `fantasma`: solo texto subrayado, con `underline-offset: 6px`.
- **Hover, barrido de relleno:** un `::before` con `position: absolute; inset: 0; z-index: -1;
  transform: scaleX(0); transform-origin: left`. En `:hover` y en `:focus-visible` pasa a
  `scaleX(1)` en 500 ms con `cubic-bezier(0.16, 1, 0.3, 1)`.
  - El botón lleva `isolation: isolate; overflow: hidden`.
  - El color del texto y del borde cambia en 300 ms.
- **Pulsar (framer-motion):** `whileTap={{ scale: 0.98 }}` con un muelle:
  `{ type: "spring", stiffness: 520, damping: 30, mass: 0.6 }`.
  - No lleva `whileHover` que lo levante.
  - Sin `will-change`.
- **Iconos dentro del botón:** de 16 px.
  - El icono de la derecha se mueve 4 px a la derecha al pasar el ratón (300 ms, misma curva).
  - El de la izquierda gira −6° y crece a 1,1.
- **Movimiento reducido:** con `useReducedMotion()` no hay ningún gesto, y el cambio de color es
  instantáneo.
- Un solo botón `primario` por pantalla. En las fotos a sangre van siempre en pareja: `claro`
  + `contorno`.

## 4. Animaciones

- **Curva de toda la web:** `--ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1)`.
- **Entrada de la portada, sin JavaScript:** clase `.hero-in`.
  - `@keyframes hero-in`: de `opacity: 0; transform: translate3d(0, 22px, 0)` a
    `opacity: 1; transform: none`.
  - Duración 0.9 s, con la curva expo y `both`.
  - Escalonado con una variable: `animation-delay: calc(0.1s + var(--i, 0) * 0.09s)`. Se usa
    `style="--i:0"`, `--i:1`, `--i:2`… en titular, texto y botones.
- **Zoom lento de la foto de portada:** `@keyframes zoom-lento` de `scale(1.08)` a `scale(1)`,
  en 12 s con la curva expo.
- **Revelado al hacer scroll:** atributo `data-reveal` en cada bloque.
  - Estado oculto: `opacity: 0; transform: translate3d(0, 28px, 0)`, con transición de
    `opacity` y `transform` en 0.7 s y la curva expo.
  - Escalonado de 0,1 s entre elementos de la misma tanda.
  - Un solo `IntersectionObserver` para toda la web añade `.is-revealed`, que deja `opacity: 1`
    y `transform: none`.
  - **Red de seguridad:** el estado oculto solo se aplica si `<html>` tiene `data-reveal-armed`. Lo
    pone un script en el `<head>` antes del primer pintado. Si en 2,6 s no se ha montado el hook, el
    script quita el atributo y todo se ve sin animación. Así nunca queda una página en blanco.
- **Fotos de producto y de categoría al pasar el ratón:** `scale(1.04)` en 700 ms con la curva
  expo, dentro de un contenedor con `overflow: hidden`.
  - El nombre del producto se subraya (`underline-offset: 2px`).
- **Fotos de producto sobre gris:** contenedor `bg #f2f2f2` con proporción 4/5 y la foto con
  `mix-blend-mode: multiply` y `object-fit: contain`. El fondo blanco de la foto se funde con el
  gris.
- **Carrusel:** fila con `overflow-x: auto`, `scroll-snap-type: x mandatory` y
  `scroll-snap-align: start`.
  - Usa `scroll-padding-inline` igual al margen de la página: 16 / 24 / 40 px.
  - Barra de scroll oculta.
  - Dos flechas que hacen `scrollBy({ left: ±80 % del ancho, behavior: "smooth" })`.
  - Ancho de tarjeta: 68 % en móvil, 38 % en tablet y 1/5 en escritorio, con 6 px de separación.
- **Marquesina:** una tira infinita.
  - `@keyframes` de `translateX(0)` a `translateX(calc(-100% - var(--gap)))`, en bucle lineal.
  - Variables `--duration: 50s` y `--gap: 2.5rem`.
  - Se pausa al pasar el ratón.
  - Los textos van en `subtitular` de 22 px, separados por un punto gris de 6 px.
- **Menú de la cabecera:** enlaces de 13 px, peso 500, con subrayado de 1 px. Es un `::after` con
  `transform-origin: left`, que va de `scaleX(0)` a `scaleX(1)` en 300 ms. En la página activa se
  queda puesto.
- **Desplegable del menú:** pasa de `opacity: 0; translateY(8px); visibility: hidden` a visible, en
  300 ms. Se abre con `:hover` y con `:focus-within`.
- **Movimiento reducido:** con `prefers-reduced-motion: reduce`, la regla global deja todas las
  animaciones y transiciones en `0.01ms` y `scroll-behavior: auto`.

## 5. Maquetación

- Contenedor de página: `max-width: 90rem`, centrado, con margen lateral de 16 px en móvil, 24 px
  en tablet y 40 px en escritorio.
- **Cabecera blanca y fija:**
  - Una franja gris (`#f2f2f2`) de 32 px con texto de 11 px.
  - Debajo, una sola fila de 64 px: logo a la izquierda, menú en el centro, iconos a la derecha.
  - Al hacer scroll, solo aparece una línea de 1 px debajo.
- **Portada:** foto a sangre (78svh en móvil, 86svh en escritorio) con un degradado de abajo a
  arriba, `from rgba(10,10,11,.8) via .25 to transparent`. El titular va abajo a la izquierda, con
  dos botones `claro` + `contorno` de tamaño sm.
- **Ritmo:** secciones con `padding` vertical de 48 px en móvil y 64 px en escritorio. Se alternan
  bandas blancas y bandas `#f2f2f2`. Las rejillas llevan 6 px de separación.
- **Pie:** fondo `#f2f2f2`, enlaces en gris que se ponen negros al pasar el ratón, y etiquetas de
  columna en mayúscula espaciada.
