# Bin & Cami Cakes · web

Landing de una página. Datos verificados con el cliente; ver
`../MARCA-BIN-CAMI-CAKES.md` para el brief completo de marca.

## Añadir las fotos

Son 9 motivos (7 se repiten entre la portada y la galería, así que no hacen
falta 16 fotos distintas). **5 ya están puestas**, generadas con IA como
maqueta mientras llegan las reales:

| Motivo | Archivo | Estado |
|---|---|---|
| Tarta de cumpleaños | `assets/tarta-cumpleanos.jpg` | ✅ puesta (IA) |
| Tarta de boda | `assets/tarta-boda.jpg` | ✅ puesta (IA) |
| Tarta temática | `assets/tarta-tematica.jpg` | ✅ puesta (IA) — lleva un rótulo "Feliz Cumpleaños" horneado en la propia foto; conviene regenerarla sin texto |
| Porción de tres leches | `assets/tres-leches.jpg` | ✅ puesta (IA) |
| Golfeados | `assets/golfeados.jpg` | ✅ puesta (IA) |
| Cookies estilo NY | `assets/placeholder-tarta.jpg` (compartido) | ⏳ pendiente |
| Mesa de dulces | `assets/placeholder-tarta.jpg` (compartido) | ⏳ pendiente |
| Piñitas (sólo portada) | `assets/placeholder-tarta.jpg` (compartido) | ⏳ pendiente |
| El obrador (sólo galería) | `assets/placeholder-tarta.jpg` (compartido) | ⏳ pendiente |

Las 4 pendientes comparten un único `placeholder-tarta.jpg` (el mismo degradado
rosa de siempre, sin texto encima) — así en el carrusel de la galería se ve
consistente hasta que llegue cada una. Para sustituir cualquiera cuando llegue
la foto real, hay que cambiarle el `src` en `index.html` a un archivo propio
(por ejemplo `assets/cookies.jpg`) y añadir ese archivo — a diferencia de las
5 ya puestas, éstas SÍ requieren tocar el HTML porque hoy apuntan todas al
mismo placeholder compartido.
Formato: vertical, relación 4:5 (1000×1250 o más).

**Son maqueta con IA, no fotos reales del obrador.** Mientras estén puestas,
la web sigue con `noindex` (ver más abajo) precisamente para que Google no
las indexe como si fueran tartas reales de un negocio real. En cuanto lleguen
las fotos de verdad, sustituir y quitar el `noindex`.

El `alt` no es decorativo: descríbelo de verdad («tarta de unicornio con cuerno
dorado»), que es lo que lee Google y quien usa lector de pantalla.

Antes de subirlas, pásalas a un ancho razonable y comprime. Una foto de móvil
son 4 MB y hace que la web tarde en cargar en datos móviles.

## El carrusel de la galería es un coverflow 3D

La sección «Nuestras tartas» ya no es un scroll horizontal plano: es un
coverflow (tarjeta central grande, las de al lado encogidas y giradas en
perspectiva), adaptado a mano de un componente de React a JS normal — sin
librerías, sin build, igual que el resto de la página. Autoplay cada 5 s en
pausa con el ratón encima, el foco dentro, la pestaña oculta o fuera de
pantalla. Con `prefers-reduced-motion` no hay perspectiva ni autoplay: rejilla
plana con las 8 a la vista, todas las captions visibles de una vez.

Cada tarjeta lleva su propio enlace de WhatsApp con el mensaje ya escrito
("Pregúntanos por esta"), salvo «El obrador», que no vende nada.

Va sobre el blanco de la sección, sin caja oscura detrás. Eso cambia cómo se
finge la profundidad: nada de `brightness()` en las laterales (sobre blanco se
ven grises), el velo oscuro sólo bajo la tarjeta central —la única con texto
encima— y el corte de los lados se funde con una máscara, como en el ticker.

## Tipografía, cristal y emojis

Los titulares van en **Fraunces** (serif con carácter, cálida y algo juguetona,
la letra de rótulo de pastelería) y los acentos a mano —el lema de la portada,
el «Cakes» del nombre, la firma de la cita— en **Caveat**. El texto corrido en
**Plus Jakarta Sans**. Los botones y rótulos pequeños en versalitas se quedan
en la sans a propósito: una serif a 11 px en mayúsculas se emborrona. Clases:
`font-display` (titulares), `font-mano` (Caveat) y `font-rotulo` (botones).
Las citas de las reseñas van en Fraunces cursiva, que es la «otra escritura»
que pidió Brian para los mensajes.

La interfaz usa **cristal líquido** (`.vidrio` y `.vidrio-oscuro`) sólo en lo
que flota sobre contenido: cabecera, menú del móvil, distintivo de la portada,
flechas del carrusel, el pie de foto de la tarta y el asistente. Sobre un fondo
plano no hay nada que desenfocar, así que ahí no se pone. Hay dos respaldos:
sin `backdrop-filter` el vidrio se vuelve opaco, y con
`prefers-reduced-transparency` también.

**Cursor propio** sólo con ratón de verdad (`pointer:fine`) y sin movimiento
reducido: un punto frambuesa y un anillo que le sigue con inercia y se abre
sobre lo que se puede pulsar. Lo activa el JS, así que si el JS no arranca no
se pierde el cursor del sistema.

**Animaciones de scroll**: dentro de cada bloque `.reveal` los hijos entran
uno tras otro (suben, se enfocan de borroso a nítido) y los titulares de
sección entran palabra a palabra (el JS envuelve cada palabra en un `<span>`).
El desenfoque sólo se aplica a texto y tarjetas pequeñas: sobre el carrusel
3D o la cascada un `filter:blur()` en un teléfono se nota a tirones.

Los **emojis**: el tipo de letra de emoji va nombrado con el de Apple primero,
así que en iPhone, iPad y Mac salen los dibujos de Apple. En Windows y Android
el navegador usa los suyos (Segoe, Noto) y no se puede hacer más: los dibujos
de Apple son de Apple y no se pueden servir desde una web ajena.

## Detalles de interfaz

- **Sensación al pulsar**: `:active` encoge un 4% en todo lo pulsable. En el
  móvil no existe `:hover`, así que sin esto un botón no daba señal de haber
  recibido el toque.
- **Barra de progreso de lectura**: se pinta encima del hilo de marca que ya
  cruzaba la cabecera, así que no ocupa un píxel nuevo. Con el menú plegado en
  el móvil era la única forma de saber cuánto llevas de 12 pantallas.
- **Volver arriba**: aparece pasado un scroll y medio; en el móvil se coloca
  por encima de la barra de acciones y devuelve también el foco al principio.
- **Copiar el teléfono**: en un ordenador el enlace `tel:` no suele hacer nada.
  Hay respaldo con `textarea` porque `navigator.clipboard` no existe fuera de
  https (ni en `file://`).
- **Asistente**: cinco segmentos de progreso (`role="progressbar"`) y tres
  puntos de «escribiendo…» antes de cada respuesta. Los puntos van
  `aria-hidden` porque el hilo es `aria-live`.
- **Filtro de reseñas**: fundido de 200 ms en vez del reemplazo seco. Ojo: el
  aviso para lector de pantalla cuenta con el filtro del botón pulsado, no con
  `filtroActivo`, que durante el fundido todavía es el anterior.
- **Acordeón de la FAQ**: exclusivo y con transición de alto mediante la API de
  animaciones, que es la única forma fiable de animar un alto `auto`.
- **Visor de fotos**: `<dialog>` + `showModal()`, que trae Escape, foco
  atrapado y fondo inerte de serie. Flechas, teclado, arrastre lateral, y al
  cerrar el carrusel se queda en la foto que estabas mirando.
- **Carga progresiva**: cada foto lleva detrás una miniatura de 20 px
  incrustada en el CSS (~1 KB cada una) y la foto real se funde encima. Las
  clases las activa el JS desde la cabecera; sin JS las fotos se ven tal cual.

## Idiomas: castellano · galego · English

Selector en la cabecera (y arriba del menú del móvil). El castellano no está
en ningún diccionario: **se lee del propio HTML al arrancar**, así nunca
diverge de la página. Gallego e inglés van por clave en `data-i18n` (137
textos) y en un diccionario dentro del `<script>` de idiomas; lo que genera el
JS (horario, reseñas, carrusel, asistente) pregunta con `t(clave, castellano)`
y se repinta al cambiar. Se guarda la elección en `localStorage` y, si no hay
elección, se usa el idioma del navegador cuando es gallego o inglés.

Lo que NO se traduce, a propósito: las reseñas (son citas reales, se dejan tal
cual), los textos legales (se quedan en castellano hasta que los revise la
titular) y **el mensaje de WhatsApp**, que sale siempre en castellano porque
es lo que habla el obrador — el asistente guarda el índice de cada respuesta,
no el texto, y compone el mensaje con la lista en castellano.

Las traducciones al gallego las he escrito yo; conviene que las repase un
hablante nativo antes de publicar.

## Producción: la carpeta `dist/`

El `index.html` de la raíz es el de trabajo: usa el Tailwind del CDN (unos
400 KB de JavaScript que compilan el CSS en el navegador en cada visita) para
poder iterar sin build. **Lo que se sube a Vercel es `dist/`**, que genera
`construye_dist.py` (en el cuaderno de la sesión): el mismo HTML con el CSS ya
compilado dentro de un `<style>` y la carpeta `assets/` al lado. Con eso la
página pasa de pedir el CDN a no pedir más que las fuentes de Google y el mapa.
Las fotos de la portada cargan sin `loading="lazy"` (están arriba del todo) y
todas con `decoding="async"`.

## El móvil es el caso normal, no el pequeño

Casi todas las visitas entran por el teléfono, así que el móvil manda:

- Los dos botones flotantes (WhatsApp y asistente) se juntan en una **barra
  fija abajo** con su rótulo. Sueltos eran dos círculos que iban tapando lo que
  pillaran y no decían lo que hacían. El `<body>` lleva hueco abajo para que la
  barra no se coma el final de la página. A partir de `sm` vuelven a flotar.
- La portada mide **una pantalla**: las tartas salen del montón central y
  vuelan a su sitio nada más cargar (un segundo, en cascada) y el titular
  entra detrás. Antes era una pila que se desparramaba con el scroll dentro de
  una sección de casi tres pantallas, y en la demo dio tres problemas: la
  primera pantalla salía vacía, las tartas cruzaban por delante del texto y en
  pantallas bajas se montaban unas sobre otras. Cada tarta se aparta del texto
  y de las ya colocadas; medido a seis tamaños, sin solapes (en teléfonos
  quedan esquinas de 20 px).
- Sin JavaScript (el visor de archivos del iPhone, por ejemplo) la página se
  lee entera: un `<noscript>` deja visible todo lo que "aparece al bajar" y
  pone las tartas de la portada en rejilla.
- Las cuatro tarjetas de especialidades ponen el icono al lado del texto.
- El escenario del carrusel mide lo que mide la tarta más un respiro, en vez de
  34 rem fijos que dejaban 170 px de nada arriba y abajo.
- El pie de foto del carrusel se recorta para que se vea la tarta.
- «Pasa el ratón» sólo se enseña donde hay ratón (`@media (hover:none)`).

## El mapa y por qué a veces no se ve

El `<iframe>` de Google Maps no llega en tres casos: bloqueadores de
privacidad, vistas previas en sandbox (la del artefacto de Claude no deja
incrustar nada de fuera) y sin red. Cuando no llega, unas veces se queda el
rectángulo vacío y otras el navegador pinta dentro su propia página de error
—y ahí el evento `load` SÍ salta, así que por ahí no se distingue nada.

Por eso, servida por http(s), la página **sondea** antes con un `fetch` en modo
`no-cors`: si la promesa falla, no se llega a Google y se enseña la ficha del
sitio (chincheta, dirección y botón). Abriendo el archivo desde el disco
(`file://`) el sondeo se salta, porque ahí el navegador corta los fetch a otro
sitio aunque el iframe cargue perfectamente.

Resumen práctico: **el mapa se ve en Vercel y abriendo el archivo en el
ordenador; no se ve en la vista previa del artefacto.**

## Falta todavía

- [ ] Las 4 fotos que faltan (cookies, mesa de dulces, piñitas, obrador) + regenerar la de "tarta temática" sin texto horneado
- [ ] Imagen de compartir `assets/og-image.png` (1200×630)
- [ ] Denominación social y NIF para el aviso legal
- [ ] Confirmar el horario del martes (la ficha de Google pone «10:00–2:00»)
- [ ] Dominio: ahora el canonical apunta a `bincamicakes.es`, que hay que ajustar
      al dominio real antes de publicar

## Despliegue

Proyecto en Vercel, equipo **BRIAN** (`centropersonalfit`).

| | |
|---|---|
| URL de producción | https://bin-cami-cakes-centropersonalfit.vercel.app *(sin verificar)* |
| Project ID | `prj_cYpupFUqwiUhVJFiEXSKHNrWj6uG` |
| Team ID | `team_NO14SkEOGredEikP1xjacWZu` |

La URL está sin verificar a propósito: desde aquí no se puede abrir (el proxy
bloquea `*.vercel.app`) ni consultar por la API, así que no se afirma que esté
en pie. Ábrela tú para saberlo.

### Ahora mismo no se puede desplegar desde aquí

Los dos caminos están cerrados, y los dos se abren desde tu cuenta:

1. **GitHub.** `git push` devuelve 403: «Claude doesn't have GitHub access to
   PersonalFit-Code/PROYECTOS-BRIAN for your organization». Falta instalar la
   app de Claude en la organización, desde https://claude.ai/connect-github.
2. **Vercel.** La conexión de Vercel de esta sesión sólo alcanza los proyectos
   `personalfit` y `personalfit-xi.vercel.app`. El proyecto `bin-cami-cakes`
   existe (crearlo devuelve «already exists») pero no se ve ni se puede
   desplegar: producción y preview devuelven 403. Hay que volver a autorizar
   la conexión de Vercel incluyendo `bin-cami-cakes`, o darle acceso a todos
   los proyectos.

Con lo primero arreglado, lo segundo sobra: se conecta el repo a Vercel y cada
push publica solo. Poner `bin-cami-cakes` como *Root Directory* del proyecto.

La web está con `noindex` a propósito hasta que lleguen las fotos y el dominio
real; hasta entonces se puede compartir el enlace sin que Google la indexe.

## Publicar en Vercel (alternativas)

Es estático, no necesita build:

```bash
npx vercel --prod          # desde esta carpeta
```

Si se conecta el repositorio, en la configuración del proyecto hay que poner
`bin-cami-cakes` como *Root Directory* para que no despliegue la raíz.

## Nota sobre Tailwind

Usa el CDN de Tailwind, que compila en el navegador: cómodo para enseñar, pero
añade unos 400 KB de JavaScript y provoca un parpadeo al cargar. Para producción
conviene compilar el CSS (en esta página ocupa **20 KB**):

```bash
npx tailwindcss@3.4.16 -i entrada.css -o estilos.css --content index.html --minify
```

Después, en `index.html`: quitar el `<script src="https://cdn.tailwindcss.com...">`
y el `<script>` con `tailwind.config`, y poner `<link rel="stylesheet" href="estilos.css">`.
Los valores del config están en ese mismo `<script>` para pasarlos a un
`tailwind.config.js`.
