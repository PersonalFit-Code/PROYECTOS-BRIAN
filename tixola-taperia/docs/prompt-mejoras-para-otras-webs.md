# Prompt: aplicar a otra web las mejoras de Tixola

Copia todo lo que hay debajo de la línea y pégalo en Claude Code, dentro del proyecto de la otra web.
Lo que va entre ‹ › es lo que cambias tú. La web de referencia es `tixola-taperia` (repo
`PersonalFit-Code/PROYECTOS-BRIAN`, carpeta `tixola-taperia/`): Claude puede leer ahí el código exacto.

---

Quiero que apliques a esta web las mejoras que hicimos en la web de Tixola Tapería. Antes de tocar nada,
lee el código de esta web y adapta cada punto a su estructura (framework, estilos, idiomas, componentes).
Reglas generales: no cambies la lógica, los datos, los nombres de funciones, los ids ni los atributos
existentes; no inventes datos del negocio (precios, alérgenos, horarios, reseñas); respeta la paleta y la
tipografía de ESTA web, no copies las de Tixola. Trabaja en la rama ‹rama›. Al acabar: `tsc`, `eslint`,
`build`, comprobación en navegador (móvil y escritorio, todos los idiomas) y resumen de lo hecho.

## 1 · Estilo visual "Liquid Glass" (estilo Apple)
Crea un sistema de material de cristal en el CSS global y aplícalo a los CONTROLES que flotan sobre el
contenido (barra de navegación, dock/barra inferior móvil, botones flotantes, chat, banner de cookies,
selector de idioma, filtros, chips, flechas de carruseles, botones de cerrar de ventanas), no a las
secciones enteras.
- Tokens en `:root`: fondo translúcido, variante fuerte (≈ .82 de opacidad, necesaria para que el texto
  cumpla contraste AA sobre fondos claros), variante sólida, desenfoque `blur(20px) saturate(180%)`,
  borde, brillo interior (`inset` box-shadow), reflejo (`background-image` degradado, no pseudo-elemento),
  sombra, y curva de muelle para las transiciones.
- Utilidades: `liquid-glass`, `liquid-glass-strong`, `liquid-glass-accent`, `sin-desenfoque` (para
  elementos grandes o muchos a la vez), y `pulsable` (escala .96 al pulsar).
- Rendimiento: el desenfoque se paga. No lo pongas en elementos anchos ni en listas; en esos usa solo
  fondo translúcido + bordes. Para los anchos, activa el blur solo si el dispositivo es potente
  (`data-gpu="high"`). Mide fotogramas antes y después; si empeora, quítalo.
- Accesibilidad: respeta `prefers-reduced-transparency` (fondo sólido), `prefers-contrast: more` (borde
  fuerte) y `prefers-reduced-motion` (sin animaciones). Comprueba contraste ≥ 4.5:1 en cada texto.
- No escribas `-webkit-backdrop-filter` a mano: el compilador de CSS lo añade solo.

## 2 · Animaciones al hacer scroll
- Un único `IntersectionObserver` compartido (hook `useReveal`) que añade `.is-revealed` a los elementos
  `[data-reveal]` cuando entran en pantalla, con escalonado. Sin GSAP para esto. Modos: `up`, `fade`,
  `letterbox`, `wipe`. Todo el CSS dentro de `@media (prefers-reduced-motion: no-preference)`.
- Si hay parallax, va en un hook aparte (con GSAP/ScrollTrigger) usado solo donde GSAP ya se carga, para no
  meter esa librería en todas las páginas.
- Un "vigía" de seguridad: si el JavaScript no llega, quita la clase que oculta los elementos tras un
  tiempo, para que la página nunca se quede en blanco.
- No pongas `data-reveal` en el mismo elemento que ya tiene transiciones propias de Tailwind (la regla de
  revelado las pisa); ponlo en un contenedor.

## 3 · Preguntas frecuentes (FAQ) con despliegue animado
Cambia `<details>` por botón + panel (`aria-expanded`, `aria-controls`, `role="region"`). Altura animada
con `height: auto` (framer-motion), el texto entra un poco después deslizándose, el signo "+" gira hasta
convertirse en "−", filo de color que crece en el borde. Se pueden abrir varias a la vez. La respuesta
SIEMPRE está en el HTML del servidor (plegada, `visibility: hidden`, nunca desmontada) para buscadores y
Ctrl+F. Sin movimiento si `prefers-reduced-motion`.

## 4 · Galería de fotos
Sustituye el carrusel por un mural tipo masonry (columnas CSS), con chips para filtrar por tema, unas 12
fotos iniciales y botón "ver todas", y visor a pantalla completa con teclado y gestos. Cada foto con
`alt` útil en todos los idiomas, ancho y alto reales (sin saltos de maquetación) y `sizes` correcto.
Revisa que ninguna foto tenga capturas de pantalla ni caras reconocibles de clientes.

## 5 · Marca de agua en el pie
Palabra grande de la marca en la tipografía del logo, muy tenue (≈ 5 % de opacidad), detrás del pie, con
revelado suave. Sin parallax dentro de contenedores con `overflow: hidden` (se congela).

## 6 · Desplegables en vez de listas largas
Cuando una lista de opciones (denominaciones, categorías, filtros) ocupa mucho, conviértela en un
desplegable en una barra de cristal, con el panel animado (escala desde su esquina), cierre con Escape y
clic fuera, y foco gestionado. Un solo panel abierto a la vez.

## 7 · Camarero virtual / chatbot (si esta web tiene uno): cumplimiento legal
- Dice desde el primer mensaje que es un asistente de inteligencia artificial, no una persona (en todos
  los idiomas), y el prompt del sistema lo hace repetir si se lo preguntan.
- Aviso de privacidad visible y exacto: qué proveedor procesa los mensajes (nombre y país), cuánto tiempo
  los conserva, y que NO se piden ni se guardan datos personales ni de salud.
- El prompt le prohíbe pedir nombre, teléfono, correo, dirección o datos de salud; si el usuario los
  escribe, no los repite y le dice que no hace falta.
- No se guarda la conversación en servidor ni en base de datos: solo `sessionStorage` del navegador, con
  botón "Nueva conversación" que lo borra. No se registra el contenido en logs.
- Actualiza la política de privacidad (proveedor, plazo, transferencia internacional) y la fecha de
  "última actualización".

## 8 · Seguridad antes de lanzar (checklist de 20 puntos)
Aplica lo que corresponda y dime qué NO aplica (si no hay base de datos, login ni subida de archivos, los
puntos de BD, RLS, contraseñas, sesiones y archivos no aplican).
1. Claves solo en el servidor (variables de entorno de Vercel marcadas como sensibles); ninguna en el
   código que descarga el navegador. Comprueba el bundle.
2. Ningún secreto en Git: escanea TODO el historial (`git log --all -p`), `.env` en `.gitignore`.
3. Cabeceras de seguridad en `next.config` (`async headers()`): `Content-Security-Policy` (lista cerrada;
   `script-src 'self' 'unsafe-inline'` si no usas nonces; `frame-src` solo lo necesario, p. ej. el mapa;
   `frame-ancestors 'none'`; `object-src 'none'`; `upgrade-insecure-requests`), `Strict-Transport-Security`
   (2 años), `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`,
   `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` (apaga cámara, micro,
   geolocalización y pagos si no se usan) y `Cross-Origin-Opener-Policy: same-origin`.
   `poweredByHeader: false`. Si luego se añade analítica, su dominio va en `script-src` y `connect-src`.
4. Rutas de API que cuestan dinero (IA, correo…): límite por IP, tope de mensajes y de caracteres,
   comprobación de que la petición viene de la propia web (cabecera `Origin` = host) → 403 si no,
   tope de tamaño del cuerpo (≈ 96 KB, leyendo el texto y midiéndolo) → 413, y exigir
   `content-type: application/json` → 415. Sin cabecera `Origin` también se rechaza.
5. Validar entradas en el servidor (roles, longitudes, listas cerradas para idioma y página) y no
   confiar en el cliente.
6. Sanitizar salidas: nada de `dangerouslySetInnerHTML` salvo JSON-LD, y ese pasa por una función que
   escapa `<`, `>` y `&`. Enlaces del chat solo con protocolos seguros.
7. Cookies: `Secure` (solo por https), `SameSite=Lax`, y solo las técnicas imprescindibles. Revisa
   también las que se escriben desde el navegador.
8. La API devuelve solo lo necesario y los errores no revelan detalles internos.
9. HTTPS forzado (Vercel redirige) + HSTS.
10. `npm audit` y `npm audit fix` (sin `--force`). Fija versiones exactas de las dependencias críticas
    (p. ej. Next) y comprueba que un parche nuevo no rompe el build en Vercel antes de subirlo.
11. Recuerda a la persona responsable: poner un tope de gasto mensual en la consola del proveedor de IA
    y desactivar la recarga automática de créditos.
12. Verifica con `curl -I` las cabeceras y con el navegador (Playwright) que la CSP no rompe mapa,
    fuentes, imágenes ni chat; y que la API responde 403/413 en los casos malos y 200 en el bueno.
13. Documenta todo en `docs/lanzamiento.md` en una tabla de los 20 puntos: aplicado / ya estaba /
    no aplica.

## 9 · Revisión legal y de lanzamiento
Haz una lista en `docs/lanzamiento.md` con cuatro grupos: (A) lo que bloquea el lanzamiento (plan de
hosting que permita uso comercial —Vercel Hobby no lo permite—, correo de contacto real, dominio y
`NEXT_PUBLIC_SITE_URL`, datos fiscales en el aviso legal, alérgenos firmados por el negocio),
(B) decisiones de la casa (reseñas copiadas, afirmaciones como "el mejor/nº 1" sin fuente, valoraciones
fijas en el código, fotos), (C) lo que ya está bien, (D) lo que hacer después de lanzar. No publiques
nada que no esté documentado y marca lo inferido para que lo confirme el dueño.

## Cómo trabajar
Haz los puntos por orden de riesgo (8 y 9 primero si la web va a salir ya; 1–6 si es un rediseño). Un
commit por bloque. Si un punto no encaja con esta web, dilo y sáltalo en vez de forzarlo.
