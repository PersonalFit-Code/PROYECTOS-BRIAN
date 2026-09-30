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

**Las 4 pendientes están escondidas** desde el remate de antes de la
presentación (ver «El remate antes de enseñarla»): una foto de rayas en medio
de las de verdad es lo primero que se ve. En la portada sus tarjetas siguen en
el HTML pero una regla (`.carta:has(.foto-pendiente){ display:none }`) las
oculta; en la galería, sus tres diapositivas están dentro de un comentario
HTML justo después de la de los golfeados. Cuando llegue cada foto: cambiar el
`src` a un archivo propio (por ejemplo `assets/cookies.webp`), quitar la clase
`foto-pendiente` de la tarjeta de portada, y en la galería sacar la diapositiva
del comentario y añadir su punto abajo (`data-punto` 5, 6 y 7, y las etiquetas
«de 5» pasan a «de 6», «de 7»…).
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
**Plus Jakarta Sans**.

**Las tres se sirven desde la propia web**, en `assets/fuentes/`, no desde
Google Fonts. Los bytes que se descargan son casi los mismos (son las mismas
fuentes); lo que se quita es la dependencia:

1. Una hoja de estilo de otro dominio **bloquea el pintado**. Si esa petición
   tarda —el wifi de un local, una presentación— la página aparece con la letra
   del sistema delante del cliente.
2. Se ahorran dos conexiones nuevas (DNS + TLS) antes del primer pintado.
3. La IP del visitante deja de salir hacia un tercero sólo por abrir la web,
   que es lo que obligaba a nombrar a Google Fonts en la política de privacidad.

Se regeneran con `fuentes_locales.py` del cuaderno de trabajo, que se queda con
el subconjunto *latin* (castellano, galego e inglés caben enteros) y recorta los
ejes variables a los pesos que la web usa: 245 KB → 221 KB. Si algún día hace
falta un carácter de fuera, el navegador lo pinta con la letra del sistema, que
es lo mismo que pasaba antes. Los botones y rótulos pequeños en versalitas se quedan
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

## Ficha de cada dulce, y por qué los alérgenos llevan aviso

Los cuatro dulces del mostrador abren una ficha con ingredientes, formato,
conservación, precio y los catorce alérgenos del anexo II del Reglamento UE
1169/2011. Es un `<dialog>` nativo con `showModal()`, igual que el visor de
fotos: Escape, foco atrapado y fondo inerte salen gratis.

**También se abre pinchando una tarta del carrusel.** Ahí hay dos clases de
ficha:

- **Del mostrador** (tres leches, golfeados, cookies): ingredientes,
  conservación y una lista cerrada de alérgenos, porque la receta es fija.
- **Por encargo** (cumpleaños, boda, temática, mesa de dulces): sabores,
  antelación y formato. Una tarta a medida **no tiene** lista de ingredientes,
  así que no se publica ninguna: se marcan los alérgenos que lleva
  prácticamente cualquier bizcocho (gluten, huevo, lácteos, y frutos secos en
  trazas) y se dice que los definitivos dependen del sabor y la decoración.
  Inventar una lista cerrada para una tarta a medida sería peor que no poner
  ninguna.

La lupa de la esquina sigue abriendo la foto en grande; el clic en la tarta
abre la ficha. El obrador es la única tarjeta sin ficha, porque no es un
producto.

**Los datos de alérgenos están deducidos, no confirmados.** Salen de lo que la
propia web ya dice de cada producto (un bizcocho lleva harina de trigo; el
golfeado lleva papelón y queso blanco; el obrador manipula gluten, huevo,
lácteos y frutos secos, que es lo que contesta la pregunta frecuente). Mientras
`ALERGENOS_VALIDADOS` siga en `false`, cada ficha lo avisa en amarillo. Cuando
la titular repase los cuatro, se corrigen los datos y se pone en `true`: el
aviso desaparece de las cuatro de golpe.

Un dato de alérgenos equivocado en una pastelería no es una errata: es un riesgo
para quien lo lea. Que nadie lo publique sin ese repaso.

## Cookies: el banner no es un cartel

Lo único de esta web que carga algo de un tercero con cookies es el mapa de
Google. No hay analítica, ni píxeles, ni publicidad, y desde que las
tipografías se sirven desde aquí tampoco hay peticiones a Google Fonts.

Por eso el iframe del mapa **arranca sin `src`**: la dirección va en `data-src`
y el navegador no pide nada a Google hasta que se acepta. Comprobado
interceptando el tráfico de red: cero peticiones. Un banner que sale cuando el
iframe ya se ha cargado no sirve para nada.

Dos reglas más que se cumplen aquí y que la mayoría de banners se salta:

- **«Rechazar» está al mismo nivel** que «Aceptar», con el mismo tamaño y el
  mismo contraste.
- **No aceptar no rompe nada**: siguen la dirección, el horario y el enlace a
  Google Maps, que es lo que de verdad necesita quien quiere venir.

Lo elegido se guarda en el almacenamiento local (no hace falta mandarlo a
ningún servidor), caduca a los doce meses y se puede cambiar desde
«Preferencias de cookies», en el pie.

El banner espera a que la persona baje de la portada, o a seis segundos si se
queda arriba. Puesto nada más cargar se plantaba justo encima de los dos
botones de la portada.

## El vídeo

Sección `#video`, entre la galería y las opiniones. **Autoalojado a propósito**:
un Reel incrustado metería el script de Meta y sus cookies, y aquí se sirve el
archivo y ya. Nada se descarga hasta que alguien pulsa play (`preload="none"`),
que la mayoría entra por el móvil con datos.

El hueco lleva de momento un **adelanto** (`.video-pronto`): la foto de la
pastelera con un velo oscuro, un botón de play que no hace nada y la píldora
«Vídeo del obrador · en camino». Antes era una caja de rayas con un icono, y
en un recorrido por la web era el único bloque que parecía a medio hacer.
Ahora se lee como «aquí va un vídeo», que es lo que es. El script del vídeo
busca un `<video>` dentro de la caja y, si no lo hay, no hace nada, así que el
adelanto no le molesta. **Cuando llegue el clip**, `prepara_video.py` (en el
cuaderno de la sesión) hace todo el trabajo:

    python3 prepara_video.py /ruta/al/clip.mov [nombre]

Reencoda a H.264 + AAC (lo único que reproducen todos los navegadores sin
excepciones: un `.mov` de iPhone con HEVC no se ve en Chrome de Android), pone
el lado largo a 1280 px, mete `-movflags +faststart` (sin eso el navegador
descarga el archivo entero antes del primer fotograma), `-pix_fmt yuv420p`
(sin eso Safari no lo reproduce), saca la portada de un fotograma al 10% del
clip y sustituye el marcador del `index.html` por el `<video>`.

El CSS no le fija proporción: el clip puede venir apaisado o vertical tipo
Reel, y forzarle una recortaría o metería barras. Manda el propio archivo, con
un techo de alto para que un vertical no ocupe tres pantallas.

**Ojo con el origen**: una grabación de pantalla de un Reel de Instagram no
vale — lleva la interfaz de Instagram dentro y va recomprimida dos veces. El
original lo tiene quien lo grabó, o se baja desde la propia cuenta de
Instagram (⋯ → «Guardar en el carrete» en su propio Reel).

## La dirección de Vercel ha cambiado tres veces

`bincamicakes` → `bincamicakess` → **`binycamicakes`** (con «y», como el correo).
Cada vez que cambia, las **tres etiquetas de compartir** del `<head>`
(`og:url`, `og:image`, `twitter:image`) se quedan apuntando a un proyecto que ya
no existe y WhatsApp enseña el enlace sin foto. No da error en ningún sitio:
simplemente deja de salir la imagen. Si vuelve a cambiar, hay que tocarlas.

Un despiste que costó un rato: Brian dijo que la web no reflejaba los cambios.
Comparando el SHA-1 del `index.html` publicado con el del repositorio,
**coincidía exactamente**: estaba todo subido. Lo que parecía un hueco era el
recuadro del pie que decía «Razón social y NIF en el aviso legal», que no era un
hueco sino un texto que remitía al aviso legal.

Ese recuadro pasó por dos manos el mismo día: primero se cambió para que dijera
el nombre y el NIF directamente (así no parecía un hueco), y enseguida Brian
pidió esconderlo, con razón: el nombre completo y el número fiscal de Luisa no
tienen por qué ir de cartel en todas las páginas. Ahora es un `<details>`
plegado que sólo enseña «Datos de la empresa», con el mismo gesto de + y − que
los textos legales. La ley pide que el dato esté **accesible**, no a la vista.

**Un detalle de navegador que hay que saber para testear esto:** el Chromium de
ahora ya no esconde el contenido de un `<details>` cerrado con `display:none`,
sino con `content-visibility`. No se pinta, pero **sí se puede medir**:
`getBoundingClientRect()` devuelve su alto igual que si estuviera abierto. Un
test que compruebe `alto === 0` falla aunque todo esté bien; hay que usar
`checkVisibility()`. Es lo mismo que hizo que `pulsables.mjs` diera por
«tapados» los correos de dentro del aviso legal.

## Idiomas: castellano · galego · English · português

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
- La portada mide **una pantalla** en tableta y escritorio: las tartas salen
  del montón central y vuelan a su sitio nada más cargar (un segundo, en
  cascada) y el titular entra detrás. Antes era una pila que se desparramaba
  con el scroll dentro de una sección de casi tres pantallas, y en la demo dio
  tres problemas: la primera pantalla salía vacía, las tartas cruzaban por
  delante del texto y en pantallas bajas se montaban unas sobre otras. Cada
  tarta se aparta del texto y de las ya colocadas; medido a seis tamaños, sin
  solapes.

  **En el teléfono (≤639px) esto no se usa.** Brian lo probó en su iPhone real
  y encontró dos cosas: la cabecera tapaba las tarjetas de arriba, y las fotos
  se veían diminutas. La causa de lo primero es instructiva — el JS colocaba
  las tarjetas con `position:absolute` dejando un margen de 76 px para la
  cabecera (`.cabecera-caja{height:4.75rem}`), un número que coincidía
  exactamente con el alto medido en este mismo contenedor de pruebas, pero
  bastaba con que el aparato real difiriera un poco de esa suposición para que
  una esquina quedara tapada. **En vez de perseguir el número exacto para cada
  móvil**, por debajo de 640px la portada pasa al mismo camino que ya llevaba
  `prefers-reduced-motion`: todo en flujo normal, sin `position:absolute` en
  ningún sitio. Es estructuralmente imposible que algo quede tapado por la
  cabecera, porque nada se coloca cerca de ella salvo el propio documento.

  Las cinco fotos reales pasan a verse grandes (la primera, "Tarta de
  cumpleaños", a todo el ancho como foto de bienvenida; las otras cuatro en
  una rejilla de 2×2 debajo) en vez de ocho tarjetas diminutas y rotadas. Las
  tres que aún no tenemos (cookies, mesa de dulces, piñitas) se ocultan con
  `.carta:has(.foto-pendiente){ display:none }`: agrandar un hueco con un
  icono de cámara es peor que no enseñarlo, y en cuanto lleguen las fotos
  reales la regla deja de encontrar `.foto-pendiente` y la tarjeta vuelve
  sola, sin tocar nada de esto. El párrafo del hero, oculto siempre en el
  modo de escritorio por falta de sitio, también se enseña aquí: ahora sobra
  espacio de verdad.

  En la tableta y el escritorio (≥640px) sigue siendo la JS quien coloca las
  tarjetas, así que ahí el margen de la cabecera se mide de verdad
  (`getBoundingClientRect()`) en vez de asumirse fijo, y se recalcula también
  con `visualViewport.resize` — el evento `resize` normal no siempre salta
  cuando la barra de direcciones de un móvil se encoge, `visualViewport` sí.
- Sin JavaScript (el visor de archivos del iPhone, por ejemplo) la página se
  lee entera: un `<noscript>` deja visible todo lo que "aparece al bajar" y
  pone las tartas de la portada en rejilla.
- Las cuatro tarjetas de especialidades ponen el icono al lado del texto.
- El escenario del carrusel mide lo que mide la tarta más un respiro, en vez de
  34 rem fijos que dejaban 170 px de nada arriba y abajo.
- El pie de foto del carrusel se recorta para que se vea la tarta.
- «Pasa el ratón» sólo se enseña donde hay ratón (`@media (hover:none)`).

## Pensada como una app de móvil que además se ve bien en ordenador

Es la frase de Brian y es una forma de pensar, no un ajuste suelto. Lo que
separa "una app" de "una web encogida" son tres cosas muy concretas, y las
tres están hechas:

**1. La barra de abajo es navegación, y sólo navegación.** Cuatro sitios fijos
(Inicio · Tartas · Encargar · Contacto), icono arriba y rótulo debajo, y el que
estás mirando en frambuesa. No es un menú que se despliega: está siempre ahí,
como en cualquier app del teléfono. De 640 px para arriba no existe, porque ahí
ya está el menú de la cabecera.

Los enlaces de la barra llevan la misma clase `.nav-enlace` que el menú de
arriba, así que los marca el mismo vigía (`IntersectionObserver`) y no hay dos
mecanismos que puedan decir cosas distintas. Para que eso funcionara hubo que
arreglar un fallo real que llevaba ahí desde siempre: el vigía buscaba la
sección con `secciones.indexOf(target)`, que devuelve **la primera** posición
que la nombra. Con dos enlaces apuntando a `#galeria` (el del menú y el de la
barra), sólo se encendía uno de los dos, y la pestaña nunca se habría marcado.
Ahora se compara por el `href` y se enciende todo lo que apunte a esa sección.

**2. Las dos acciones son dos botones pequeños, apilados en la esquina
derecha.** Antes ocupaban todo el ancho de abajo y pesaban más que el
contenido. Ahora son dos círculos de 2,6 rem en el móvil (3 rem en el
escritorio): arriba el presupuesto, en crema con borde; abajo WhatsApp,
relleno en frambuesa, que es el que queremos que se pulse. **Los dos con la
paleta de la casa**: se quitó el verde de WhatsApp, que era el único color de
toda la página que no era nuestro. Hay una prueba que falla si vuelve a
aparecer un `rgb(37, 211, 102)` por ahí dentro.

Al hacerlos pequeños y subirlos aparecieron justo debajo del aviso de cookies,
que se ponía encima. Mientras el aviso está delante, los dos botones se apartan
solos (`#banner-cookies.a-la-vista ~ #acciones .acciones-flotantes`): una
decisión cada vez. Eso destapó además que la prueba del banner en el móvil
llevaba tiempo pasando en falso — medía el banner **antes** de que saliera, o
sea, una caja de 0 px de alto, que no pisa nada por definición. Ahora baja
media pantalla, espera a `.a-la-vista` y mide el banner de verdad.

**3. La ficha de producto sube desde abajo, no aparece en el centro.** Una
ventana centrada y encogida es el gesto de un ordenador. En el teléfono la
ficha se pega al borde inferior, redondea sólo las esquinas de arriba, lleva su
tirador y **se cierra arrastrándola hacia abajo**, que es donde el pulgar ya
está. Cerrar sigue estando en el botón, en Escape y en el fondo: el arrastre es
un atajo, no la única salida.

Lo delicado del arrastre es no robarle el scroll al texto: el gesto sólo
engancha si el dedo empieza en el tirador o en la foto, o si el texto todavía
no se ha bajado (`scrollTop === 0`), y hasta que no baja 8 px no se decide que
es un arrastre. Hay pruebas de las dos cosas: que arrastrando se cierra, y que
dentro de los alérgenos el dedo sigue haciendo scroll.

## "¿Llegamos a tu fecha?": dos pasos numerados

Brian lo señaló en una captura del teléfono: "que sea más cómodo y que el
cliente entienda dónde está y qué tiene que hacer". Tenía razón y además había
un fallo de verdad detrás. Los tres tipos de tarta usaban la clase `.rot-btn`,
que era **del rotulador** — la función que se quitó. Al borrar su CSS, los tres
botones se quedaron sin borde y sin fondo: parecían texto suelto. Nadie pulsa
lo que no parece un botón.

Ahora la sección son dos pasos numerados, uno debajo del otro, que se leen de
arriba abajo:

1. **¿Qué tarta tienes en la cabeza?** — tres botones de verdad, con borde, y
   el elegido relleno en frambuesa. Debajo, el plazo de ese tipo escrito en
   palabras, así que sabes contra qué juegas antes de abrir el calendario.
2. **¿Para qué día la necesitas?**

Y mientras no hay fecha, el hueco del resultado no está vacío: dice qué falta
("Elige el día de arriba y aquí te decimos si llegamos"). Los plazos siguen
saliendo de un único sitio, el mismo que publica la pregunta frecuente de
debajo.

## Lo que Chromium no enseña: el Safari del iPhone

**Aquí no hay WebKit.** Todo lo que se ha probado se ha probado en Chromium, y
Brian enseña desde un iPhone. No se puede abrir Safari desde el sandbox, así
que lo que se hizo fue pasar revista, una por una, a las cosas que Safari trata
distinto y que Chromium jamás iba a delatar:

- **`vh` mide la pantalla SIN las barras del navegador.** En iPhone (y en
  Chrome de Android) `100vh` es la altura con las barras escondidas, así que
  con la barra puesta las cajas ancladas abajo o al centro salían más altas que
  lo visible y se comían la X de cerrar (en un iPhone SE, la ficha se pasaba
  unos 35 px por arriba). Ahora la ficha, el visor de fotos y el panel del
  presupuesto usan `--vh-visible`, que vale `1svh` (la pantalla con las barras
  puestas, que es la que se ve) y cae a `1vh` en navegadores que no lo saben.
  En el ordenador valen lo mismo, así que allí no cambia nada.
- **Zoom al tocar un campo.** Safari hace zoom a toda la página al enfocar un
  campo con letra menor de 16 px y no lo deshace solo. El del correo del
  boletín tenía 15. Ahora 16.
- **`scroll-behavior:smooth` al restaurar el scroll.** Al cerrar la ficha se
  devuelve la página a su sitio; con el scroll suave de la web eso se veía como
  un deslizamiento. Se quita un instante y se devuelve.

Lo que **no** se ha podido comprobar y hay que mirar en un iPhone real la
primera vez que se despliegue (un minuto):

1. Tocar «Ver ficha e ingredientes»: la hoja sube desde abajo, se ve la X, y
   arrastrando hacia abajo se cierra. Con la barra de Safari desplegada y
   recogida.
2. Tocar el campo del correo (sección de novedades): **no** debe hacer zoom.
3. Con la ficha abierta, intentar mover la página de detrás con el dedo: no
   debe moverse. Es el punto más dudoso: se bloquea con `overflow:hidden` en
   `<html>`, y Safari no siempre lo respeta.
4. Calendario: elegir un día, cambiar de mes, cambiar de tipo de tarta.

## Las pistas de primera visita, en el móvil

Las dos burbujas oscuras («¿No sabes por dónde empezar?» y «Pulsa cualquier
dulce…») funcionaban en el ordenador y en el móvil fallaban de tres maneras que
sólo se ven bajando la página con el dedo:

- **La del mostrador se descartaba sin salir.** Observaba la *sección* entera y
  se daba por avisada en cuanto asomaba el 30%; en el móvil eso ocurre con las
  tarjetas todavía por debajo de la pantalla, así que no salía y no volvía
  nunca. Ahora observa la *tarjeta*, y el observador no se apaga hasta que la
  pista ha salido de verdad.
- **Salían las dos a la vez**, apiladas, tapando medio contenido. Ahora sale una
  a la vez; la segunda espera a que se cierre la primera.
- **Tapaban la barra de abajo**, y el piquito de la del asistente apuntaba al
  lado contrario del botón. Ahora se colocan por encima de la barra, el piquito
  mira hacia donde está el botón, y la del mostrador no le cae encima a los dos
  botones redondos.

Y una más, la que le habría pasado a Luisa en su primera visita: a los 3 s salía
la pista del asistente y a los 6 s (o al bajar media pantalla) el aviso de
cookies encima, que además esconde los botones. Ahora las pistas **esperan a
que las cookies estén decididas**.

## El calendario está escrito a mano, y no por capricho

Brian pasó un componente de calendario de shadcn/React Aria. **No se puede
pegar aquí**: eso es React + TypeScript + un build, y esto es un HTML suelto
que se abre con doble clic. Meterlo significaría rehacer el proyecto entero y
perder justo lo que lo hace fácil de mantener y de desplegar. Así que se hizo
el mismo calendario en el idioma de esta casa, con dos ventajas sobre el
componente original:

**Sabe los plazos.** El calendario del navegador enseña los 365 días iguales.
Éste tacha los que no dan tiempo para el tipo de tarta elegido en el paso 1, y
se vuelve a pintar solo al cambiar de tipo: eliges «Boda o evento» y ves cómo
se tachan dos semanas de golpe. Debajo dice en palabras cuál es el primer día
al que llegan. Es la misma fuente de siempre (72 h / una semana / dos semanas,
lo que publica la pregunta frecuente de abajo).

**Los días tachados se pueden elegir igual.** No están bloqueados a propósito:
el obrador quiere recibir ese mensaje («a veces hay hueco»), y la respuesta ya
lo explica. Tachar es avisar, no prohibir.

El `<input type="date">` sigue existiendo, escondido: es quien guarda el valor
y a quien miran todas las cuentas. Así el dibujo es sustituible sin tocar nada
de lo que ya funcionaba.

Detalles que costaron su rato:

- **La rejilla es una `<table>`, no `<div>`s con `display:contents`.** Con
  `display:contents` hay navegadores que se dejan las filas fuera del árbol de
  accesibilidad; una tabla da esa semántica de balde.
- **El galego no lo trae Chromium.** `toLocaleDateString('gl')` contesta en
  inglés, o sea que un vecino de Ourense leyendo la web en galego vería
  «October». Los doce meses y los siete días van escritos en el módulo. No es
  copia de la web (eso va en el diccionario): es el calendario del sistema, que
  en este idioma no existe.
- **Teclado completo**: flechas para moverse, Re/Av Pág para cambiar de mes,
  Inicio/Fin para los extremos de la semana, Intro para elegir, y un solo día
  tabulable en todo el mes (*roving tabindex*).
- En el móvil se sale del sangrado que deja el número del paso, y esos 45 px de
  más son la diferencia entre una casilla de 33 px y una de 40.

## El cursor propio, fuera

Había un cursor dibujado (un punto y un anillo que lo perseguía con inercia) y
`cursor:none` en toda la página. Brian: «cuando entramos a la ficha de un
producto, para cerrarlo es difícil encontrar la X, no se ve el cursor, no es
cómodo». Tenía razón, y es el tipo de detalle que sólo se ve usando la página
de verdad: el anillo iba con retraso, así que en un movimiento rápido hacia una
equis de 40 px lo que ves no está donde está el ratón.

Fuera entero — CSS, HTML y JS, unas 55 líneas — no escondido. Se gana en
comodidad y se ahorra un `requestAnimationFrame` corriendo en cada movimiento
del ratón.

## Lo que sacó la revisión a fondo (y por qué hacía falta)

Después de montar la barra de abajo, los botones pequeños y la hoja de la
ficha, todo pasaba las pruebas que había. Se lanzó igualmente una revisión
adversarial —cinco miradas distintas sobre el archivo, y cada hallazgo
verificado por otro que intentaba tumbarlo— y salieron **quince fallos reales**,
tres de ellos graves. Los tres los había metido yo al hacer pequeños los
botones. Vale la pena dejarlos escritos, porque el patrón se repite:

**1. Al tocar «Volver arriba» en el móvil se abría WhatsApp.** El botón de
volver arriba estaba colocado «por encima de la barra de acciones, que ocupa
todo el ancho de abajo» — una barra que ya no existe. Al encoger los dos
flotantes y subirlos a esa esquina, los círculos se solapaban en 40×37 px, y
como `#acciones` tiene más `z-index`, el toque se lo quedaba WhatsApp. Ahora
en el móvil **no sale**: la pestaña «Inicio» de la barra hace exactamente eso
y está siempre a la vista. En el escritorio sube a 8,6 rem y libra los dos.

La lección: al mover algo, releer el comentario que explica dónde está. El
comentario se había quedado viejo dos commits antes que el fallo.

**2. Botones invisibles pero vivos.** La regla que aparta los dos botones
mientras el aviso de cookies está delante ponía `opacity:0` y
`pointer-events:none` **en el contenedor**. Pero `.accion` vuelve a declarar
`pointer-events:auto`, y el hijo gana: quedaban dos botones invisibles que
seguían cazando el toque. Se tocaba el hueco al lado del aviso y se abría
WhatsApp sin haber visto nada. Y con el tabulador se llegaba a un foco puesto
donde no se dibujaba nada. Ahora va con `visibility:hidden`, que sí baja a los
hijos y además los saca del recorrido del teclado.

**3. El botón de dentro de la hoja salía cortado.** El alto estaba escrito en
tres reglas, y el `88vh` del móvil lo pisaba el `92vh` de la regla base de
`.ficha-marco`, que está más abajo en el archivo y pesa lo mismo. El marco
salía 4vh más alto que su propia caja y lo que se recortaba era justo el botón
de «Preguntar por este dulce». Ahora es **un número, una vez**, en una variable
(`--alto-hoja`).

Es el mismo fallo que ya había pasado con `.ficha-agarre`: dos reglas de igual
peso y gana la de abajo. En un archivo de 5.400 líneas eso no se ve leyendo.

Los otros doce, más breves: la página de detrás seguía corriendo con el dedo
mientras la hoja estaba abierta (ahora se cierra el grifo y se devuelve al
sitio exacto al cerrar); hacer pinza para ampliar la foto cerraba la hoja una
de cada dos veces (el segundo dedo llega en su propio `touchstart`, cuando ya
estábamos arrastrando); un gesto que interrumpe el sistema se interpretaba
como «cerrar confirmado» en vez de devolver la hoja a su sitio; cinco textos
nuevos no llegaban al contraste mínimo (los rótulos de las pestañas se
quedaban en 3,6:1 con letra de 10 px); en contraste alto los tres botones de
tipo de tarta se veían idénticos, porque lo único que los distinguía era el
relleno de color; el campo de fecha no tenía tope y una errata de un dígito en
el año daba «quedan 13.156 días» y mandaba ese año por WhatsApp; y cuando la
respuesta era «no llegamos», el botón seguía invitando a «reservar este día»
—el día que la propia caja acababa de descartar— y el mensaje decía «voy justo
de plazo», que es la frase del veredicto de al lado.

Los quince tienen ahora su prueba en `arreglos.mjs`.

## La cinta del mostrador y por qué ponía «tas»

Brian mandó una captura del teléfono con la franja frambuesa donde se leía
**«tas»**. No era una palabra: era el final de «Piñitas», cortada a hachazo por
el borde de la pantalla. Dos cosas mal, las dos de verdad:

**El desvanecido de los lados iba en porcentaje.** Era `6%`, que en un teléfono
de 390 px son 23 px: no da para desvanecer una palabra, así que la palabra no
se apagaba, se partía. Ahora el degradado mide lo que mide una palabra y no una
fracción de la caja — `clamp(2.5rem, 14%, 5rem)`, o sea unos 55 px en el móvil
y como mucho 80 en el escritorio — y lo que entra o sale se apaga.

**El degradado estaba en la capa equivocada.** Iba en `.cinta-caja`, que es
quien pinta la franja, así que al ensancharlo se despintaba también el color y
la franja parecía no llegar al borde de la pantalla. Ahora hay una capa dentro
(`.cinta-vista`) que es la que recorta y desvanece; la de fuera sólo pinta. El
color llega a los dos bordes y lo único que se apaga es lo que pasa por delante.

**Y el punto separador estaba descentrado.** El `<li>` metía 1,5 rem de relleno
a cada lado *además* del margen del punto, así que el punto salía a 24 px de la
palabra anterior y a 48 px de la siguiente. Se quitó el relleno lateral del
`<li>` y el aire lo pone sólo el punto: 1,6 rem por cada lado. Hay una prueba
que lo mide (`cinta.mjs`) leyendo los márgenes del `::after`.

## La foto del local

Llegó el 28/9 y sustituye el recuadro de rayas de «Quiénes somos». Va en
`assets/pastelera.jpg` + `.webp`, con su miniatura incrustada como las demás
(`.lqip-pastelera`) para que no haya salto de gris a foto. El fundido al cargar
funcionaba sólo para las dos clases del carrusel (`.carta-cara`, `.cf-carta`);
ahora la lista incluye `.foto-real`, que es la clase de esta.

Dos cosas pendientes de verdad, las dos para Brian:

- **Los derechos.** Tiene pinta de foto de prensa o de fotógrafo. Antes de que
  la web salga a producción hay que confirmar que se puede usar, o pedirle a
  Luisa una suya.
- **La resolución.** Llegó a 768×432. Da de sobra para la caja en el escritorio
  (584 px de ancho) pero se queda corta en un móvil de pantalla fina, que a 3×
  pediría unos 1100 px. Si aparece el original, se cambia el archivo y ya.

Va en 16:9 y se ve entera. Recortada a 4:3 se perdían los globos de un lado y
la vitrina del otro, que son justo lo que cuenta de qué va la tienda.

## El tono lo ponen ellas, no nosotros

Brian pasó su Instagram (@bin_camicakes) para que la web suene "como si fuera
la propia jefa la que la hace". De ahí sale, **literal y entrecomillada**, la
frase que ahora abre "Quiénes somos":

> «Sabores que cruzan fronteras, recuerdos que se quedan para siempre.»

No está escrita para la web: es la que ellas tienen en su perfil. Va firmada
("Bin & Cami Cakes, en su Instagram") precisamente porque es suya. Igual que
"lo hacemos todo a mano, desde el primer batido hasta el último detalle", que
es su manera de decirlo, no la nuestra.

La regla de siempre sigue en pie: del Instagram se coge **cómo hablan**, no
datos. Nada de inventarse años de apertura, premios ni número de tartas.

## Dos ideas que se probaron y se quitaron

**El rotulador** ("¿Qué quieres que ponga escrito?", con una tarta dibujada en
SVG y el texto encima) y **el tamaño de letra** en el pie se implementaron,
funcionaban, y Brian decidió quitarlos al verlos en la página de verdad: el
rotulador "no queda muy bien" y el segundo "no lo veo necesario". Los dos
salieron enteros — HTML, CSS, JS y las traducciones — no se dejaron ocultos
con `display:none`. Una función que nadie llama pero que sigue en el archivo
es la primera candidata a romperse sin que nadie se entere seis meses después.

Aviso de lo que costó: al quitar el rotulador se fue con él la clase `.rot-btn`
que **otra sección estaba usando prestada**. Si una clase se llama como una
función, que la use sólo esa función; y al borrar algo, buscar la clase por
todo el archivo antes, no después.

## Lista de 30 «esto delata que lo hizo una IA», repasada

Brian pasó un reel con treinta cosas que delatan una web hecha con IA
("vibecoded") y pidió repasar cuáles tocaban. De las treinta, **una** era un
acierto real: los dos círculos de color desenfocados detrás del texto de la
sección venezolana (`blur-3xl` + `opacity-40/50`) son exactamente el "radial
orb" de fondo tan típico de una landing de SaaS genérica, y no aportaban nada
de marca. Fuera.

El resto de la lista **ya se evitaba desde antes**, no por casualidad sino
porque son cosas contra las que se ha ido trabajando explícitamente en este
proyecto: sin iconos de Lucide (los de aquí están dibujados a mano), sin
fuente por defecto de IA (Fraunces/Caveat/Plus Jakarta, elegidas por Brian),
sin reseñas inventadas (son citas reales de Google, con enlace a la ficha),
sin "3 tarjetas de precio" ni demos falsas (no hay tarifas SaaS que mostrar),
con aviso legal y política de privacidad de verdad (no ausentes, que es lo
que señala la lista). No se ha tocado nada de eso: sacarlo habría sido peor,
no mejor.

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

## Las fotos van en WebP

Cada foto tiene su `.webp` y su `.jpg` al lado. El HTML apunta al WebP, que pesa
la mitad con la misma pinta (864 KB → 458 KB en total). El JPG es la red de
seguridad: un escuchador de errores **en la cabecera** cambia la extensión si el
navegador no entiende WebP.

Tiene que estar en la cabecera y no con el resto del JavaScript al final: la
primera versión iba abajo y para entonces las fotos ya habían fallado. El evento
`error` ya había pasado y no lo recogía nadie — de doce fotos rotas se
recuperaba una. Va en fase de captura porque `error`, como `load`, no burbujea.

Se regeneran recorriendo `assets/*.jpg` con Pillow a calidad 80.

## Que no vaya lento el día de la presentación

Tres puertas al **modo ligero**, que apaga los efectos que pintan en cada
fotograma (inclinación de las tarjetas, confeti, arrastre automático del
comparador) y deja los que no cuestan nada:

1. **A mano**: `?ligero=1` en la dirección. Es la red de seguridad para enseñar
   la web en un ordenador que no conoces.
2. **Por lo que declara el aparato**, sólo en lo evidente: dos hilos o menos,
   menos de un giga, o el ahorro de datos encendido. El primer intento fue
   «cuatro hilos o menos» y apagaba los efectos en medio portátil normal, que
   es lo contrario de lo que se busca.
3. **Midiendo**: un vigilante cuenta cuánto tarda cada fotograma durante el
   scroll y, si la mediana pasa de 26 ms (menos de 38 img/s), aligera. Adivinar
   por el número de núcleos es una apuesta; medir el fotograma es el dato.

Medido con `rendimiento.mjs` sobre el `dist/` servido por HTTP:

| | normal | procesador a 1/4 | a 1/4 con `?ligero=1` | móvil a 1/6 |
|---|---|---|---|---|
| descarga | 1043 KB en 13 peticiones | igual | igual | igual |
| primer contenido | 264 ms | 408 ms | 256 ms | 364 ms |
| contenido principal (LCP) | 864 ms | 1104 ms | 1032 ms | 1232 ms |
| salto de diseño (CLS) | 0,000 | 0,000 | 0,000 | 0,000 |
| scroll | 60 img/s | 60 img/s | 60 img/s | 60 img/s |

El documento son 388 KB que Vercel sirve en **105 comprimidos**, así que lo que
viaja de verdad ronda los 760 KB.

## Dos páginas, un solo archivo que se edita

Hasta ahora la web era un único `index.html`. Desde que hay catálogo son dos
direcciones:

| Dirección | Archivo | Qué es |
|---|---|---|
| `/` | `index.html` | La portada. **Es el archivo que se edita.** |
| `/mostrador` | `mostrador.html` | El catálogo del mostrador. **Se genera, no se edita.** |

`mostrador.html` lleva dentro una copia de la cabecera, el pie, los estilos,
las fichas de producto, el aviso de cookies y todo el JavaScript. Escribirlo a
mano habría significado tener dos archivos de seis mil líneas con el mismo
teléfono dentro: cambiarlo en uno y olvidarse del otro es cuestión de tiempo,
y el validador ya avisa de que el teléfono tiene que aparecer una sola vez.

Así que se genera. `construye_mostrador.py` (en el cuaderno de la sesión) coge
`index.html`, le cambia el `<main>` por el del catálogo (que vive aparte, en
`catalogo-cuerpo.html`), le pone su propio título y sus etiquetas de compartir,
y convierte los enlaces del menú que apuntaban a secciones de la portada
(`#nosotras`) en enlaces a la portada (`index.html#nosotras`). El resultado es
`mostrador.html`, con un aviso arriba de que no se toca a mano.

**Hay que volver a pasarlo cada vez que se toca `index.html`.** `build.sh` lo
hace, y `construye_dist.py` mete las dos páginas en `dist/` y en el zip.

### Lo que hubo que tocar para que un mismo JS sirva en las dos páginas

Tres cosas, y las tres son mejoras también para la portada:

1. **El vigía del menú** hacía `querySelector(href)` con todos los enlaces.
   `querySelector('mostrador.html')` no es un selector válido: lanza una
   excepción y se llevaba por delante el bloque entero de JavaScript. Ahora
   sólo mira los que empiezan por `#` y descarta los que no resuelven, en vez
   de apagarse si falta uno.
2. **El título por idioma.** `document.title = t('titulo')` daba el título de
   la portada en cualquier página. Ahora cada página dice cuál es su clave con
   `data-titulo` en el `<html>`, y el castellano sale de su propio `<title>`.
3. **El nombre del dulce** va dentro de un `<button>`, y un botón no parte la
   línea solo: en el móvil «Cookies estilo NY» se salía de la tarjeta.

Lo que **no** hizo falta tocar: ninguno de los ocho bloques de JavaScript
protesta al no encontrar el carrusel, el mapa, el calendario o la portada. Ya
estaban escritos a la defensiva (`if (!x) return;`), y se nota: la página del
catálogo carga sin un solo error de consola sin haber tenido que partir el JS.

### Lo que queda pendiente de esto

Las dos páginas llevan dentro el mismo CSS y el mismo JavaScript, cada una su
copia. Quien entre por la portada y pase al mostrador se descarga todo dos
veces. Se arregla sacando el `<style>` grande y los `<script>` a un
`estilos.css` y un `guion.js` que compartan las dos, y eso lo puede hacer
`construye_dist.py` al compilar, dejando el `index.html` de trabajo como está.
No se hizo ahora por no meter dos cambios gordos a la vez.

## Nuestro mostrador: el catálogo

La página `/mostrador`: una tarjeta por dulce con su foto, su lema, su precio y
un enlace a la ficha de siempre (ingredientes y alérgenos). **No es una tienda:
no hay carrito ni se cobra nada.** Los encargos siguen yendo por WhatsApp, por
teléfono o en el local, que es lo que dice el aviso legal.

Las tarjetas están escritas en el HTML, no las pinta el JavaScript: así las lee
Google y se leen aunque el JavaScript falle. **Lo único que pone el JavaScript
es el precio**, y lo saca de `DULCES`, que es donde vive el dato. Un precio
escrito en dos sitios acaba siendo dos precios distintos, y eso en una
pastelería se paga en el mostrador.

### Mientras no haya precios

`precio: null` en `DULCES` significa que el obrador todavía no lo ha pasado. La
tarjeta dice «Pregúntanos» y la ficha remite a WhatsApp, que es exactamente lo
que pasa hoy en la tienda. **No se inventan precios.** Para ponerlo:

```js
precio: '3,50 €', unidad: 'porcion'
```

Tal cual va a leerse: coma decimal y el símbolo detrás, como en España.
`unidad` puede ser `'porcion'` o `'unidad'`, y va traducida a los tres idiomas.

**Ojo, hay una cosa que hacer en el código al poner el primer precio:** la fila
«Precio» de la ficha sigue diciendo «Te lo confirmamos por WhatsApp según el
tamaño y la fecha» aunque la tarjeta ya enseñe uno, y las dos se contradicen.
Hay que hacer que la ficha de un dulce del mostrador enseñe el precio de
`DULCES` cuando lo tiene. Ahora no se nota porque los cuatro están en `null`.

**Qué lleva precio publicado y qué no** (decidido el 30/9): sólo las porciones
del mostrador, que se compran en el momento. Las tartas y los dulces por
encargo no llevan precio en la web: se presupuestan por WhatsApp, como hasta
ahora.

### Para añadir un dulce

Dos sitios, y están señalados con un comentario en cada uno:

1. Su entrada en `DULCES` (en el JavaScript de `index.html`): nombre, lema,
   foto, emoji, ingredientes, alérgenos, precio.
2. Su tarjeta en `catalogo-cuerpo.html`, copiando cualquiera de las que hay y
   cambiando el `data-dulce`, el `data-i18n` y la foto.

Si falta la 1, la ficha sale vacía. Si falta la 2, el dulce no se ve. Después,
`build.sh`.

Las tarjetas sin foto todavía no enseñan un rectángulo de rayas: llevan el
degradado de la casa con el emoji del dulce, el mismo recurso que ya usaba la
ficha. Una foto de rayas se lee como un error; esto no.

## El remate antes de enseñarla

La víspera de la presentación se hizo un recorrido entero por la web, en
ordenador y en móvil, apuntando lo que aún «cantaba» a obra en marcha. No
era cerrarla al cien por cien, era que lo que Luisa viese estuviera bonito.
Lo que salió y lo que se hizo:

- **Tres tarjetas de rayas en la portada** (cookies, mesa de dulces,
  piñitas) al lado de cinco fotos de verdad. Se esconden con una regla de CSS
  (`.carta:has(.foto-pendiente){ display:none }`) en vez de borrarlas: cuando
  llegue la foto, se le quita la clase y la tarjeta vuelve sola. La portada
  queda con 5 tarjetas, que cabe mejor que 8.
- **Tres diapositivas de rayas en el carrusel** (cookies, mesa, el obrador).
  Ahí no vale esconderlas con CSS porque el carrusel cuenta hijos para saber
  cuántas tiene: están en un comentario HTML justo después de los golfeados,
  con sus puntos quitados y las etiquetas «de 8» pasadas a «de 5».
- **La caja del vídeo** era un rectángulo de rayas con un icono; ahora es un
  adelanto con la foto de la pastelera, un play y «Vídeo del obrador · en
  camino» (ver «El vídeo»).
- **El recuadro de la historia hablaba en plural** («este trozo lo escribís
  vosotras»). Brian sólo trata con Luisa, así que ahora le habla a ella:
  «Este trozo lo escribes tú · Tu historia», en los tres idiomas.
- **Viudas en los titulares**: `text-wrap:balance` en `h1`, `h2`, `h3`, las
  citas y las frases destacadas. Un titular de dos líneas ya no deja una
  palabra sola en la segunda. Chromium y Safari lo hacen; donde no, no pasa
  nada.
- **El icono de la pestaña** era el logo de 191×222 achatado a un cuadrado.
  Ahora hay `assets/favicon.png` (192×192, 9 KB) y `assets/icono-180.png`
  para cuando alguien se la guarde en la pantalla de inicio del iPhone (fondo
  crema, que iOS no admite transparencias ahí).
- **La imagen de compartir** no existía: `og:image` apuntaba a un archivo
  que no estaba. Ahora es `assets/og-image.jpg` (1200×630, 105 KB): la foto de
  la pastelera a la derecha, el logo, «Tartas personalizadas en Ourense» y el
  lema. Es lo que enseña WhatsApp al pegar el enlace. Se genera desde
  `og/og.html` en el cuaderno de la sesión. Las tres direcciones (`og:url`,
  `og:image`, `twitter:image`) apuntan a `bincamicakess.vercel.app` (con dos
  «s»), que es donde está subida esta versión: si apuntasen a otro proyecto o
  al dominio de `bincamicakes.es` que aún no responde, WhatsApp no enseñaría
  foto. Al cambiar de dirección (o tener dominio propio), cambiar las tres (hay
  un comentario al lado).

Lo que se miró y se dejó como estaba: el peso. El documento son 437 KB que
viajan en 120 comprimidos; minificar el CSS y el JS o quitar los comentarios
habría ahorrado unos 30 KB comprimidos a cambio de tocar mucho la víspera.
No compensaba.

Y una cosa que no se tocó a propósito: el lema de la portada dice «Tú
imaginas, nosotros lo hacemos» (masculino) mientras el resto de la web habla
de «nosotras». **Decidido el 30/9: se queda como está y no se pregunta.**

## Qué pedirle a Luisa

En la carpeta `para-luisa/`:

| Archivo | Para qué |
|---|---|
| `Bin-y-Cami-Cakes-lo-que-falta.png` | **La lista, para mandarle por WhatsApp.** 10 casillas agrupadas, sin mensajes |
| `Bin-y-Cami-Cakes-lo-que-falta.pdf` | Lo mismo en PDF (una sola página), para imprimir y llevárselo en mano |
| `lista.html` + `pinta-lista.mjs` | La fuente: se editan las casillas en el HTML y `node pinta-lista.mjs` saca el PNG y el PDF. Antes de pintar comprueba que los contadores sumen, que nada se salga de su columna y que el PDF salga en una sola página |
| `MENSAJE-PARA-LUISA.md` | El mensaje escrito, por si se prefiere pedirlo hablando |

La lista salió de barrer el proyecto con tres auditorías independientes (código,
documentación y contenido) más una cuarta pasada buscando lo que las tres se
habían dejado: 63 hallazgos en bruto, 32 después de fundir duplicados y quitar
lo que es trabajo de Brian y no de ella. **Brian la dejó en 21** el 30/9 y, ese
mismo día, en **10**, al quitar todo lo de las fotos. Lo que quitó, y por qué,
para que no vuelva a proponerse:

| Se quitó | Motivo |
|---|---|
| Precio de una tarta entera · Señal y cancelaciones | Las tartas se presupuestan por WhatsApp, como hasta ahora |
| Precio «de cada dulce» | Idem. Sólo se piden los precios de las **porciones del mostrador**, que se compran en el momento y sin plazo |
| Quién es Bin y quién es Cami · El lema | No se pregunta. El lema se queda como está |
| ¿Croissants y barras de pan? · ¿Memory Cakes, Crumbl, tartas con luces? | No van |
| Formas de pago · ¿Sin gluten o veganas? · ¿Llevan la tarta al sitio? | No se piden |
| Plazos de encargo | Se queda en 72 h, como está en la web |
| Dominio propio | Lo gestiona Brian |
| Todas las fotos (el bloque de 11 casillas, incluidos obrador, vídeo y logo) y el pie que decía que las de la web son de muestra | Las pasa Luisa cuando quiere y las que quiere. No se le piden |
| Registro sanitario (lo propuso la auditoría) | En España se exige en el etiquetado, no en una web: no se le pide un dato a una clienta inventándose una obligación legal |

Se dejó **«La foto del local»**, que está en el recuadro de lo que bloquea la
publicación: no es una petición de foto nueva sino una duda de derechos sobre
una que ya está en la web (parece de un fotógrafo). La sub-línea de los
alérgenos se dejó en «Confírmalos uno por uno», sin la frase de que están
puestos a ojo. La hoja está escrita en singular, para Luisa sola.

**Ojo con el PDF:** la hoja mide con decimales (1224,34 px). La primera versión
sin fotos redondeaba el alto hacia abajo y esos 0,34 px caían a una segunda
página, con el pie dentro. Antes había holgura porque la hoja se estiraba a un
A4; al quitarla apareció. `pinta-lista.mjs` redondea hacia arriba y se niega a
terminar si el PDF no sale en una página.

En `MENSAJE-PARA-LUISA.md` está además escrito para copiar y pegar: el
mensaje corto de WhatsApp, los cuatro trucos para hacer las fotos con el móvil
y la lista completa de lo que falta, ordenada por lo que más bloquea.

Lo que de verdad frena la publicación son tres datos (**nombre fiscal, NIF y
correo**), que los exige la ley. Lo demás se puede ir metiendo después.

Y aparte, con calma y por escrito: **que repase los alérgenos**. Los de las
cuatro fichas están deducidos, no confirmados. Eso no es un trámite.

## Lo que contestó Luisa (30/9)

Lo mandó por WhatsApp de golpe. Está aplicado:

| Lo que dijo | Dónde ha ido |
|---|---|
| Titular **Luisa Rosa Chourio Aristizabal**, NIE **Y8990764D**, correo **binycamicakes2023@gmail.com** | Los seis huecos del aviso legal y la privacidad. Es autónoma, así que pone «Titular» y no «Denominación social». El NIE se comprobó: la letra de control cuadra |
| «Alérgenos todos» + foto del cartel que tienen en la tienda | Ninguna ficha dice ya «no contiene». Ver abajo |
| «Porción 6 €» | `precio: '6 €'` en el tres leches. Sale en la tarjeta del mostrador y en la ficha |
| «Todos los días de 11 am a 9 pm» | La tabla del horario, el `openingHoursSpecification` del schema y el array `H` del cartel «abierto ahora». Antes eran tres horarios distintos sacados de Google |
| Dirección y teléfono | Confirmados tal cual estaban |
| 18 productos | La sección «Todo lo que hay» de la página del mostrador, separando lo que se compra al momento de lo que va por encargo |
| Foto del local, suya | Sustituye a la que había, que tenía pinta de ser de un fotógrafo. La vieja (`pastelera.*`) se borró |

Sigue sin contestar: **su historia** y **qué día libran** (dijo que estaban por
confirmar un día de descanso).

### Lo de «alérgenos todos», que hay que entender bien

Preguntada por los alérgenos uno por uno, contestó «Alérgenos todos» y mandó la
foto del cartel que tienen colgado en la tienda: el de Reglamento (UE) 1169/2011
y Real Decreto 126/2015, con los catorce iconos. O sea: **el obrador no descarta
ninguno de los catorce.**

Eso se ha traducido así, y conviene no cambiarlo sin pensarlo:

- **Ninguna ficha dice ya «no contiene».** Lo que la receta lleva va como
  «contiene» y **todo lo demás como «puede contener trazas»**. Declarar de más
  es seguro; declarar de menos es lo que hace daño.
- El aviso de debajo de la lista dice ahora que en el obrador se manipulan los
  catorce y que lo de arriba es lo que lleva la receta, y remite al mostrador,
  que es lo que hace su propio cartel.
- `ALERGENOS_VALIDADOS` pasa a `true`: ella ya lo ha declarado. Pero los
  **ingredientes** de cada dulce siguen siendo deducidos, así que hay una
  bandera nueva, `INGREDIENTES_VALIDADOS`, todavía en `false`, y es la que
  enciende el recuadro amarillo. Cuando Luisa repase los ingredientes producto
  a producto, se pone en `true`.

Merece la pena que Brian le confirme esta lectura: es lo único de todo lo que
mandó donde equivocarse tiene consecuencias de verdad.

## El portugués

Ourense está a 40 minutos de Portugal, así que el cuarto idioma tiene sentido
comercial. Son las mismas 393 claves de `TRAD`, traducidas desde el gallego
(que es la lengua más próxima) y contrastadas con el inglés.

Lo que hubo que vigilar:

- **«Obrador» no se traduce por «oficina».** En portugués de Portugal una
  «oficina» es un taller mecánico. Va como **«pastelaria»**. Salió en 10 cadenas
  y en todas estaba mal.
- **Portugués de Portugal, no de Brasil**: «pequeno-almoço» y no «café da
  manhã», «telemóvel» y no «celular».
- La cabecera **se desbordaba en un portátil de 1280** con el cuarto botón de
  idioma. Se apretó el selector y «Opiniones» pasó a salir sólo a partir de
  1536, como ya hacían «Vídeo» y «Encargar».

Al fusionar se comprueba, clave a clave, que el HTML de dentro es idéntico, que
los marcadores (`{n}`, `{h}`, `{d}`) siguen ahí y que las listas separadas por
`|` tienen el mismo número de elementos. `chat.pasos` no es texto sino una lista
de objetos, y se valida aparte.

### El susto de los alérgenos en cuatro idiomas

Al traducir salió a la luz un fallo que llevaba horas puesto: cuando se cambió
el aviso de alérgenos a «los catorce», **sólo se cambió el castellano**. En
gallego e inglés seguía diciendo «se manipulan gluten, huevo, lácteos y frutos
secos», que es una declaración MÁS DÉBIL que la que hace el obrador. Quien
leyera la web en inglés se llevaba peor información que quien la leyera en
castellano, y en alérgenos eso no es una errata.

Estaba en tres sitios por idioma: `fic.obrador`, `fic.obrador.e` y la pregunta
frecuente `faq.3.r` (ésta además en el schema de Google y en el HTML visible). Y
en castellano también se había quedado sin cambiar `fic.obrador.e`, la de las
tartas de encargo.

**Lección: un texto con consecuencias legales o de seguridad no se cambia sólo
en un idioma.** El script de fusión termina buscando la lista vieja de cuatro
alérgenos en los cuatro idiomas y en el HTML, y no deja seguir si la encuentra.

## Falta todavía

- [x] **Datos del aviso legal**: puestos el 30/9
- [x] **Alérgenos**: declarados el 30/9 («todos»). Lo que queda es que repase los
      **ingredientes** producto a producto, que siguen deducidos
      (`INGREDIENTES_VALIDADOS` en `false`)
- [ ] **Precios del mostrador**: sólo está el de la porción (6 €). Golfeados,
      piñitas y cookies siguen en `precio: null` y dicen «Pregúntanos»
- [ ] **Qué día libran**: dijo que estaban por confirmar un día de descanso.
      Mientras, el horario es de 11:00 a 21:00 los siete días. Cuando lo diga,
      a ese día se le pone `[0,0]` en el array `H`
- [ ] **La historia de Bin y Cami**: el recuadro de «Quiénes somos» está a
      propósito sin rellenar — año de apertura, de dónde vienen, quién es quién
- [x] ¿Croissants y barras de pan? Decidido el 30/9: no van, no se pregunta
- [x] **La foto del local**: resuelto el 30/9. Mandó una suya (1200×1600), que
      va recortada a 4:3 en `assets/local.webp`. La anterior, con dudas de
      derechos, se borró
- [ ] Las 4 fotos que siguen faltando (cookies, mesa de dulces, piñitas, el
      obrador) + regenerar la de "tarta temática" sin texto horneado. Mientras,
      sus tarjetas y diapositivas están escondidas (ver «Añadir las fotos»).
      No se le piden en la hoja: las pasa Luisa cuando quiere y las que quiere
      (decidido el 30/9)
- [ ] El vídeo del obrador: hasta que llegue, la sección enseña un adelanto
      con la foto de la pastelera (ver «El vídeo»)
- [ ] Conectar el alta de novedades a un servicio de listas: hay una constante
      `ENDPOINT` vacía en el JS. Mientras esté vacía, el formulario prepara el
      alta por WhatsApp con el consentimiento escrito, que funciona de verdad
- [x] Horario: confirmado el 30/9, de 11:00 a 21:00 todos los días
- [ ] Dominio: ahora el canonical apunta a `bincamicakes.es`, que hay que ajustar
      al dominio real antes de publicar (lo gestiona Brian, no se le pregunta a Luisa)

## Despliegue

Equipo de Vercel **BRIAN** (`centropersonalfit`, `team_NO14SkEOGredEikP1xjacWZu`).
Las webs se publican **arrastrando la carpeta** a Vercel (despliegues de tipo
*drop*), no desde git: `git push` sube el código pero **no** publica nada. Por
eso la web en vivo se puede quedar por detrás del repositorio sin que se note.

Estado a 29/9, comprobado por la API de Vercel comparando el `index.html`
publicado (su SHA-1) con el de cada commit:

| Dirección | Proyecto | Subida | Es exactamente el commit | Para qué sirve |
|---|---|---|---|---|
| **https://bincamicakess.vercel.app** (dos «s») | `bincamicakess` (`prj_lcXMu786r0f8zlwey4dtl3lXoYHQ`) | 29/9 20:39 UTC | `8082a3a` (`index.html` con SHA-1 `441d04af…`; las etiquetas de compartir se ajustaron después, ver abajo) | **La que se enseña.** La de hoy: portada de 5 tarjetas, carrusel de 5, adelanto del vídeo, iconos y imagen de compartir |
| https://bincamicakes.vercel.app | `bincamicakes` (`prj_RbIyZwyhqWXDA96W9eVAztDEDtiz`) | 28/9 22:46 UTC | `b937d63` | Desfasada: la de anoche, sin el remate de hoy ni la imagen de compartir |
| https://bincami.vercel.app | `bincami` (`prj_zM8H0KwGKorjA9SB3UZgrh7MMJEd`) | 28/9 09:41 UTC | `364da56` | **Desfasada.** Es la de la mañana: con el «tas» en la cinta y con los fallos que luego salieron en la revisión (entre ellos, tocar «volver arriba» en el móvil abría WhatsApp) |
| bin-cami-cakes(-web).vercel.app | `bin-cami-cakes`, `bin-cami-cakes-web` | 23/9 | — | Intentos del principio; obsoletos |

**Riesgo real: enseñar la dirección equivocada.** Hay tres que se parecen
(`bincami`, `bincamicakes` y `bincamicakess`) y sólo una está al día. Conviene
borrar en Vercel los proyectos que no valen (`bincami`, `bincamicakes`,
`bin-cami-cakes`, `bin-cami-cakes-web`) para que el enlace de la reunión sólo
pueda ser uno. Es decisión de Brian: nada se borra desde aquí.

Ojo con las etiquetas de compartir: `og:url`, `og:image` y `twitter:image`
llevan una dirección fija (`bincamicakess.vercel.app`). Si un día la web se
publica en otro proyecto o dominio, hay que cambiarlas o WhatsApp enseñará el
enlace sin imagen.

### Cómo saber si lo que hay en vivo es lo último

Cada archivo de un despliegue lleva su SHA-1. Se compara el del `index.html`
publicado con el del `dist/index.html` de este repositorio:

```
sha1sum bin-cami-cakes/dist/index.html
```

y se pide a la API de Vercel la lista de archivos del despliegue en producción
(`list_deployment_files`). Si coinciden, en vivo está exactamente lo que hay
aquí; si no, falta arrastrar el zip. Es lo que se hizo para escribir la tabla
de arriba, y lleva diez segundos.

### Lo que sí y lo que no se puede hacer desde aquí

- `git push` funciona; sube a la rama de trabajo.
- La API de Vercel se puede **leer** (proyectos, despliegues, archivos), que es
  lo que permite la comprobación de arriba.
- Publicar sigue siendo un gesto de Brian: arrastrar la carpeta o el zip. Y
  abrir la web en vivo desde el sandbox no se puede (el proxy bloquea
  `*.vercel.app`), así que lo que se afirma de ella sale de la API, no de haberla
  visto cargar.

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
