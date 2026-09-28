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

El hueco lleva de momento un marcador con el mismo lenguaje visual que las
fotos pendientes. **Cuando llegue el clip**, `prepara_video.py` (en el cuaderno
de la sesión) hace todo el trabajo:

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

## Falta todavía

- [ ] **Alérgenos**: los de las cuatro fichas están DEDUCIDOS de lo que la propia
      web dice de cada producto, no confirmados por el obrador. Mientras
      `ALERGENOS_VALIDADOS` siga en `false` cada ficha lo avisa en amarillo.
      Cuando Luisa repase los cuatro, se corrigen y se pone en `true`.
- [ ] **Denominación social, NIF y correo** para el aviso legal y la política de
      privacidad: seis huecos marcados en amarillo (`.pendiente`)
- [ ] **La historia de Bin y Cami**: el recuadro de «Quiénes somos» está a
      propósito sin rellenar — año de apertura, de dónde vienen, quién es quién
- [ ] ¿Hacen croissants y barras de pan? Si sí, van a la cinta del mostrador
- [ ] Las 4 fotos que faltan (cookies, mesa de dulces, piñitas, obrador) + regenerar la de "tarta temática" sin texto horneado
- [ ] Imagen de compartir `assets/og-image.png` (1200×630)
- [ ] Conectar el alta de novedades a un servicio de listas: hay una constante
      `ENDPOINT` vacía en el JS. Mientras esté vacía, el formulario prepara el
      alta por WhatsApp con el consentimiento escrito, que funciona de verdad
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
