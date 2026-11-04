# Boceto de la web de Burdin Gym (Ander)

Una sola página (`index.html`) con las fotos en `img/`, en castellano y euskera.
Parte del borrador de Ander (`../borrador-ander/`). Mantiene su logo (la B de piedra en SVG,
«BURDIN» en Syncopate y «GYM» en Michroma), el selector EU/ES y toda la lógica.

**URL de prueba:** https://burdin-gym-boceto.vercel.app. Es el proyecto `burdin-gym-boceto` en
Vercel, con la carpeta raíz `comercial/burdin/boceto`. Es pública, sin la protección de Vercel,
y lleva `noindex` para que Google no la indexe.

Para volver a desplegar: `create_deployment` en Vercel con el proyecto `burdin-gym-boceto`,
gitSource GitHub `PersonalFit-Code/PROYECTOS-BRIAN`, la rama y el sha del commit, target
`production`.

## Estilo

Dirección de arte: «un taller de fuerza, no un gimnasio de catálogo».

- **Color:** negro casi puro (`--bg`), blanco roto (`--fg`) y un solo acento **naranja óxido**
  (`--rust`) para los botones principales, el socio fundador y los datos clave. La marca de
  «dato por confirmar» va en crema (`--tbd`) para no confundirse con el acento.
- **Letras:** Anton para los titulares (la misma familia de gritos que usa TDM), Manrope para
  leer, Space Mono para las fichas técnicas y etiquetas, Playfair Display para el manifiesto.
  Syncopate y Michroma solo en el logo de Ander.
- **Atmósfera:** grano de película sobre toda la página, foto de detalle de la cadena en la
  portada (`img/hero-cadena.jpg`, recorte de la foto del press a cadena), viñetas oscuras
  alrededor de cada máquina, fotos en blanco y negro que recuperan el color al pasar el ratón.
- **Detalles TDM:** secciones numeradas tipo página («Página 01», «[02]»…), texto vertical en la
  portada, marcos discontinuos en las llamadas importantes, y la sección «El gimnasio» calcada
  en estructura a la hoja «Environment» de TDM: título gigante con subrayado a brocha, tres
  columnas (instalaciones en mono, galería en el centro, panel de datos a la derecha) y una
  máquina recortada que se sale del marco.
- **Movimiento (GSAP + ScrollTrigger desde cdnjs):** entrada del titular, parallax suave en la
  foto de portada y en las máquinas, fichas que aparecen escalonadas, cifras que cuentan, anillo
  de plazas que entra a escala y se rellena, y el manifiesto que se ilumina palabra a palabra al
  bajar. Si GSAP no carga o el usuario pide menos movimiento, la página se ve igual, quieta.
- **Efectos hechos a medida** (el conector de 21st.dev no conectaba, así que no son componentes
  suyos): un shader WebGL de «deriva de malla» en tonos óxido fundido sobre la foto de portada
  (se para cuando la portada no se ve y se quita con `prefers-reduced-motion`); inclinación 3D de
  cada ficha siguiendo el ratón (solo con puntero fino); y un patrón generativo tenue por ficha
  (rejilla técnica con remaches, sembrado por el número de pieza) dibujado en canvas.

Las preguntas para que Ander elija entre las dos referencias están en `../PREGUNTAS-ANDER.md`.

## Qué tiene, en orden

| Bloque | Qué hace |
| --- | --- |
| Barra «BOCETO» | Avisa de que los datos con punto crema están por confirmar. Se quita con `CONFIG.boceto = false`. |
| Menú | Transparente sobre la portada, sólido al bajar, logo que se encoge. En móvil, hamburguesa a pantalla completa. |
| Portada (pantalla completa) | Foto de detalle de la cadena, «Hierro de verdad», botón principal «Reserva tu plaza de fundador», enlace secundario «Descubre las máquinas», y las plazas libres con barra y cuenta atrás. |
| Cinta y cifras | Las 12 marcas en cinta, y máquinas, marcas, m² y plazas de fundador. |
| La colección | Cuatro fichas de museo, grandes, alternando lado: foto con viñeta, año en marca de agua, ficha técnica (año, procedencia, recorrido, grupo y tipo). Al pasar por encima se revela la historia; en móvil, va siempre visible y hay botón «Ver historia». |
| El gimnasio | La hoja estilo TDM: instalaciones, galería de zonas (fotos `img/zona-*.jpg` cuando existan), reparto de la sala por marcas, horario, y la cuadrícula de logos. |
| Socio fundador | Anillo con 37/100, ventajas con iconos de línea y la **lista de espera** (nombre, teléfono e interés) que abre WhatsApp con el mensaje hecho. |
| Manifiesto | Texto editorial en serif, firmado «El equipo de Burdin». |
| Tarifas | Pestañas «Preapertura» (fundador, trimestral, anual) y «Tras la apertura» (mensual, trimestral, anual), más «O pruébanos primero» (día, fin de semana, semana). Cada botón va a su enlace de Virtuagym. |
| Preguntas | Siete preguntas frecuentes. |
| Contacto | Dirección, horario, WhatsApp, email, Instagram y mapa. |
| Pie | Llamada final con las plazas que quedan, logo y enlaces legales. |
| Botón de WhatsApp | Flotante, en todas las pantallas. |

## Dónde se cambian los datos

Todo lo que cambia está en el objeto `CONFIG`, al principio del `<script>`:

- `apertura`: la fecha de la cuenta atrás;
- `plazasFundador` y `plazasOcupadas`;
- `whatsapp`: el número de Ander, solo cifras y con el 34 delante;
- `email`, `instagram`, `direccion` y `mapa`;
- `virtuagym`: el enlace de cada tarifa en su tienda online. Si un enlace está vacío, el botón abre WhatsApp;
- `precios`;
- `marcas`: el reparto de la sala por marcas (las barras de «El gimnasio»).

Debajo, `BRANDS` es la lista de marcas con el nombre de su logo. Las historias de las máquinas
están en `MACHINES`, las zonas en `ZONES`, las tarifas en `PLANS` y las preguntas en `FAQ`.
Cada texto está en castellano (`es`) y en euskera (`eu`).

## Logos de las marcas

Van en `img/marcas/`, un PNG por marca con el nombre que dice `img/marcas/LEEME.md`. La web los
pasa a blanco sobre negro. Mientras falten, sale el nombre en texto.

## Fotos de la galería

Hay que guardarlas en `img/` con estos nombres y salen solas. Mientras no estén, la galería
enseña la máquina o el dibujo.

- `zona-oldschool.jpg`, `zona-pecho.jpg` y `zona-brazo.jpg`;
- `zona-recepcion.jpg`: el render de la pared con el logo iluminado.

## Pendiente de Ander antes de publicar

- **Fecha de apertura, plazas de fundador y precios.** Los del boceto son de ejemplo.
- **Ventajas de fundador:** sin matrícula, visita privada y camiseta numerada. Son propuestas.
- **Historias reales de cada máquina:** año, de dónde vino, kilómetros y por qué es especial.
  Las del boceto son de ejemplo y lo pone en cada ficha.
- **Instalaciones y reparto por marcas:** los textos y porcentajes de «El gimnasio» son de ejemplo.
- **Manifiesto:** es una propuesta de texto; tiene que sonar a Ander.
- **Cifras:** número de máquinas y metros cuadrados.
- **Datos de contacto:** dirección, WhatsApp, email, Instagram y horario.
- **Enlaces de Virtuagym** de cada tarifa (después de su curso del día 9).
- **Revisión del euskera.** Está traducido por nosotros y tiene que revisarlo un nativo.
- **Fotos propias** de las máquinas y del local, y los logos de las marcas.
- **Aviso legal y privacidad.** El formulario solo abre WhatsApp y no guarda datos.


## Varias páginas (noviembre 2026)

La web ya no es una sola página larga. `index.html` sigue siendo el único archivo que se edita;
`build.py` genera las demás páginas como copias con `<body data-page="…">`, y el CSS muestra
solo el apartado de cada una:

| URL | Qué muestra |
|---|---|
| `/` | Portada, cifras, índice «¿Qué buscas?», tarifas y pie |
| `/tarifas/` | Tarifas y pases |
| `/fundador/` | Socio fundador (contador y ficha de reserva) |
| `/maquinas/` | Las máquinas y las marcas |
| `/gimnasio/` | El gimnasio |
| `/contacto/` | Dirección, horario, WhatsApp y mapa |

**Después de cada cambio en `index.html`, ejecutar `python3 build.py`** para regenerar las carpetas.
El manifiesto y las preguntas frecuentes están quitados (siguen en el historial de git).

## Carrusel de discos (zona de peso libre)

Es un port a JavaScript plano del «Disc Cascade Carousel» de 21st.dev (el original es un componente
React/TypeScript para proyectos con shadcn y Tailwind; esta web es un solo HTML sin build, así que se
reescribió con el mismo motor de dos muelles). Los discos están en `img/discos/rojo-25.webp` … `rojo-5.webp`,
recortados uno a uno de la foto. Para añadir los de hierro: guardar `hierro-5.webp` … `hierro-25.webp` y
ampliar la lista `ITEMS` del bloque «Discos: carrusel en cascada» en `index.html`.
