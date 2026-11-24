# CLAUDE.md — Cómo trabajar conmigo en webs y apps

## Quién soy y cómo hablarme
- Soy Brian Carbajal, de Ourense. Trabajo en neuro·node (consultora tecnológica, neuro-node.com) con mi socio Nico, y como freelance con ViAurea.
- No soy programador. Explícame todo en español, con frases cortas y sin tecnicismos. Si usas un término técnico, explícalo en una línea.
- Antes de empezar algo grande, dime en 3-5 puntos qué vas a hacer y espera mi OK.
- Al terminar, resume en pocas líneas qué has hecho, cómo lo veo funcionando y cuál es el siguiente paso.
- Si algo no está claro, pregunta una sola cosa concreta en vez de suponer.

## Reglas de seguridad (obligatorias)
- Pídeme permiso antes de borrar archivos, carpetas, ramas o datos.
- Nunca escribas claves, contraseñas ni tokens en el código. Van en `.env` (y `.env` en `.gitignore`). Crea un `.env.example` con los nombres vacíos.
- No publiques ni despliegues nada a producción sin que yo lo diga expresamente.
- No instales paquetes raros o sin mantenimiento. Prefiere lo nativo del navegador antes que añadir dependencias.
- No envíes correos, mensajes ni nada a terceros sin mi confirmación.
- Si una acción no se puede deshacer, avísame antes y explícame el riesgo.

## Antes de escribir código web
- Usa SIEMPRE la skill `modern-web-guidance` antes de cualquier tarea de HTML, CSS o JavaScript del navegador (formularios, ventanas emergentes, menús, animaciones, modo oscuro, rendimiento, accesibilidad, imágenes...). Busca la guía, léela y aplícala. No uses patrones antiguos si existe una solución moderna y nativa.
- Si la tarea es una extensión de Chrome, usa la skill `chrome-extensions`.
- Si no tienes la skill disponible, avísame al principio.

## Forma de trabajar
1. Entender: qué quiero, para quién es y qué tiene que conseguir (vender, reservar, informar...).
2. Plan corto por fases. Primero una versión mínima que funcione, luego mejoras.
3. Construir por partes pequeñas, comprobando cada una.
4. Revisar con la lista de calidad de abajo antes de decir que está terminado.
5. Enseñarme el resultado: cómo abrirlo en local (el comando exacto) y qué probar.

## Stack por defecto (si no digo otra cosa)
- Web sencilla o landing: HTML + CSS + JavaScript moderno, sin framework, o Vite si hace falta compilar.
- Web con varias páginas o app: Vue 3 + Vite + TypeScript (es lo que usamos en neuro·node). Si React encaja mucho mejor, propónmelo y explica por qué.
- Estilos: CSS moderno con variables (tokens de diseño). Nada de librerías de estilos pesadas salvo que yo lo pida.
- Backend ligero / formularios: Cloudflare Workers. Correo de formularios: Resend.
- Base de datos si hace falta: Supabase o Cloudflare D1. Explícame la opción antes de elegir.
- Código y comentarios en español. Nombres de archivos y variables claros.

## Diseño
- Nada de diseño "genérico de IA": sin degradados por defecto, sin efecto cristal en todo, sin tarjetas idénticas en fila, sin emojis como iconos.
- Iconos en SVG, consistentes y del mismo estilo.
- Jerarquía clara: en la primera pantalla se entiende qué es, para quién y qué hacer (un solo botón principal).
- Textos reales y concretos. No inventes testimonios, cifras ni logos de clientes. Si falta un dato, pon un marcador claro tipo [DATO PENDIENTE] y avísame.
- Modo claro por defecto. Modo oscuro solo si lo pido.
- Si el proyecto es de neuro·node, usa su marca: color principal #6447FA, degradado oficial azul cielo (#36ADFB) → #6447FA → violeta (#7F1EED) solo en acentos (sale de la carpeta «Marca Brian»; manda sobre esta nota), tipografías Montserrat (títulos) y Quicksand (texto), peso 500 o más, fondo blanco y texto casi negro. Logos en la carpeta de marca que te indique.
- Si es para un cliente, pregúntame por su marca (logo, colores, tipografía) o propón una dirección y espera mi OK.

## Lista de calidad (comprobar siempre antes de entregar)
- Móvil primero: se ve bien a 375 px, 768 px y 1440 px, sin scroll horizontal.
- Accesibilidad: contraste suficiente, textos alternativos en imágenes, títulos en orden, formularios con etiquetas visibles, todo usable con teclado y con foco visible, respeta "reducir movimiento".
- Rendimiento: imágenes optimizadas (WebP/AVIF, tamaño correcto, carga diferida fuera de pantalla), sin saltos de diseño al cargar, nada de scripts pesados para efectos pequeños.
- Formularios: validación clara después de escribir (no antes), mensajes de error útiles, estado de enviado, protección anti-spam sencilla.
- SEO básico: título y descripción en cada página, idioma en `<html lang="es">`, imagen para compartir en redes, favicon, sitemap si hay varias páginas.
- Legal (España): si hay formulario o cookies, aviso legal, política de privacidad y casilla de consentimiento. No metas cookies de seguimiento sin banner.
- Sin errores en la consola del navegador.
- Si hay pruebas o linter en el proyecto, ejecútalos y déjalos en verde.

## Git y publicación
- Si el proyecto no tiene git, inicialízalo y haz un primer commit.
- Commits pequeños con mensajes en español que digan qué cambia.
- En proyectos compartidos (como los de neuro·node): cada cambio en una rama nueva y PR. Nunca directo a `main`.
- Antes de publicar, dime qué se va a publicar, dónde y cómo volver atrás si algo falla.

## Cuando termines una sesión
- Actualiza un archivo `NOTAS.md` en el proyecto con: qué está hecho, qué falta y decisiones tomadas, para que la próxima sesión sepa por dónde seguir.
