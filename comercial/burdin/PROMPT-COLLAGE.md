# Superprompt: la web de Burdin Gym entera en collage (estética Blvckout + piezas TDM)

Pega todo lo que hay debajo de la línea en una sesión nueva. Antes, sube las fotos reales de
Ander (máquinas y local) **como archivo**, con @ o al repositorio. Si solo las pegas en el chat,
no llegan como archivo.

---

Habla siempre en español. Soy Brian Carbajal (webs, IA y automatizaciones, Ourense). Esto es para
mi cliente Ander, que va a abrir **Burdin Gym**, un gimnasio de musculación old school en Euskadi.
Burdin significa «hierro» en euskera. No me pidas permiso para cada paso y no subas contraseñas
ni claves al repositorio.

## Dónde está

- Repositorio `PersonalFit-Code/PROYECTOS-BRIAN`. Trabaja en la rama que te dé la sesión. Si no te
  da ninguna, créala desde `claude/new-session-rnfm09`.
- La web es **un solo archivo**: `comercial/burdin/boceto/index.html`. Es HTML, CSS y JS sin build:
  sin React, sin Tailwind y sin npm. Sigue así.
- Lee primero:
  - `comercial/burdin/CONTEXTO.md`: el cliente y lo que pide;
  - `comercial/burdin/boceto/LEEME.md`: qué tiene la página, el objeto `CONFIG` y lo pendiente;
  - `comercial/burdin/PREGUNTAS-ANDER.md`;
  - `comercial/burdin/boceto/img/marcas/LEEME.md`.
- Publicado en Vercel: proyecto `burdin-gym-boceto` (equipo `team_NO14SkEOGredEikP1xjacWZu`),
  https://burdin-gym-boceto.vercel.app. Ya es público: no toques la protección.

## El objetivo

Rediseñar **la página entera como un collage**. La referencia de la que nace es la sección
«La era dorada», que ya existe (`#era`): úsala de muestra del lenguaje. Hasta ahora la página es
una sucesión de bloques en rejilla; tiene que pasar a ser una pared de piezas sueltas que se
solapan, como un tablón de taller o un fanzine de culturismo de los 90.

- **Estética de Blvckout:** negro, gris y blanco; mucho contraste; fotos a sangre en blanco y
  negro; titulares enormes; sensación de club clandestino. Sin naranja ni colores de acento
  (Brian lo quitó a propósito). El único color que queda es el crema `--tbd` de los puntos de
  «dato por confirmar».
- **Piezas de TDM:**
  - placas sólidas para los titulares de bloque, tipo «LA ERA DORADA»;
  - pies de foto en pletina gris pegados a la esquina de la foto;
  - sellos hexagonales con el origen («Suecia», «Francia, años 80»);
  - fichas pequeñas «logo + modelo + EN BURDIN»;
  - numeración de página («Página 03»);
  - marcos discontinuos en las llamadas importantes;
  - el deslizador «Desliza para reservar».
- Todo esto se toma como **inspiración**: no copies textos, imágenes ni maquetas concretas de
  esas webs, y no uses fotos de culturistas famosos.

## Lo que NO se toca

- El logo de Ander:
  - la B de piedra en SVG (`#b` y `#bdark`);
  - «BURDIN» en Syncopate y «GYM» en Michroma.
- La letra:
  - **Barlow Condensed** en titulares (800, mayúsculas, `line-height .92`);
  - **Poppins** en el texto (14 px, `line-height 1.6`) y en las etiquetas (500, 11–12 px);
  - Space Mono solo en datos técnicos y Playfair Display solo en el manifiesto.
- El **sistema de botones** del prompt de estilo:
  - rectángulos sin redondeo;
  - barrido de relleno con `::before` en 500 ms y la curva `cubic-bezier(.16,1,.3,1)`;
  - variantes claro, contorno y fantasma;
  - `:active` a `scale(.98)`.
- El **deslizador** `[data-slide]`, con `initSlides()`. Está en portada, colección, fundador y pie.
- La lógica, sin cambiar su comportamiento:
  - `CONFIG`, cuenta atrás, plazas y lista de espera a WhatsApp;
  - botones a Virtuagym, pestañas de tarifas, galería, preguntas y mapa;
  - selector EU/ES: todo texto nuevo va en castellano **y** en euskera, con `data-es` y `data-eu`
    o en los objetos de datos (`MACHINES`, `ZONES`, `PLANS`, `FAQ`);
  - barra «BOCETO» y puntos `.tbd`.
- Lo que ya funciona:
  - shader de tele antigua del manifiesto (`#tv`);
  - revelado por scroll con `data-reveal` y su red de seguridad `data-reveal-armed`;
  - menú hamburguesa;
  - `prefers-reduced-motion`.

## Las fotos (lo primero)

1. Guarda cada foto de máquina de Ander en `comercial/burdin/boceto/img/maquinas/` con un nombre
   claro, como `nautilus-nitro-leg.webp`, `flex-pa560-biceps.webp` o `paramount-row.webp`.
2. **Quita el fondo** del almacén (palés, escaleras, paredes y cajas):
   - usa `rembg` si se puede instalar; si no, recorta a mano con PIL y una máscara;
   - guarda WebP con transparencia, de 1200 px de alto como máximo y menos de 250 KB cada una.
3. Trátalas para que no se note que están sin tapizar ni montar:
   - blanco y negro con contraste alto;
   - viñeta oscura;
   - sombra en el suelo;
   - nada de mostrar el palé.

   En la web recuperan algo de color al pasar el ratón, como ahora.
4. Las fotos del local, cuando lleguen, van a `img/zona-*.jpg` (mira `ZONES`). Mientras no haya,
   la pared de recepción y las máquinas recortadas hacen de foto a sangre.
5. Los logos que falten (Cybex, Freemotion, Flex Fitness, David y Paramount) pásalos a blanco
   sobre transparente, igual que los que ya hay en `img/marcas/`:
   - escala de grises;
   - la inversa del gris como transparencia.
6. Con las máquinas reales, **sustituye** las fichas de ejemplo de `MACHINES`. Las Gymleco se
   quedan, con su foto si llega.
   - Identifica la marca y el modelo por lo que se lee en cada foto. Por ejemplo, en las que
     mandó Ander se distinguen el Nautilus G3/4/5, el Nautilus Nitro, el Flex PA-560, el Cybex de
     pierna de carga, el remo Paramount, el David 800, el Hammer Strength de carga y el Eagle de
     Cybex.
   - Escribe su historia en castellano y euskera: año aproximado o época, procedencia, kilómetros
     y por qué es especial.
   - Todo lo que no sepas con certeza márcalo como «Historia de ejemplo» con `.tbd`, y no
     inventes datos técnicos que se puedan comprobar.

## El collage, sección por sección

La rejilla es de 12 columnas. Rómpela con solapes de 20 a 60 px, giros pequeños (de −2° a 2°, nunca
más) y piezas que se salen del contenedor. Cada sección es una «hoja» con su número de página.

1. **Portada.**
   - La pared de recepción con el logo iluminado, a sangre.
   - Encima, recortadas, 2 o 3 piezas: una máquina real recortada saliendo por abajo, una placa
     «PREAPERTURA · EUSKADI · 2027» y un sello hexagonal «100 plazas de fundador».
   - Titular «HIERRO DE VERDAD» abajo a la izquierda, a `clamp(3rem,9vw,6.5rem)`.
   - Deslizador como llamada principal y «Descubre las máquinas» como botón fantasma.
   - Plazas libres y cuenta atrás en una ficha pequeña pegada en la esquina inferior derecha.
2. **Cifras.** Cuatro recortes de papel con un número enorme cada uno, ligeramente girados y
   solapados, en vez de cuatro columnas iguales.
3. **La colección.** Fuera las fichas alternas. Cada máquina es un grupo de collage:
   - foto recortada grande con viñeta;
   - pletina con el nombre;
   - hexágono con el origen;
   - ficha técnica pequeña en Space Mono (año, procedencia, recorrido, grupo y tipo);
   - la historia en Playfair, sobre un recorte que se despliega al pasar el ratón o al pulsar
     «Ver historia».

   Alterna los tamaños (una grande, dos medianas, una pequeña) para que no se repita el mismo
   patrón. Al final va el deslizador.
4. **La era dorada.** Se queda, pero intégrala en el ritmo: que no parezca la única sección
   collage.
5. **El gimnasio.**
   - Mantén la hoja tipo «Environment»: título gigante con subrayado de brocha, instalaciones,
     galería, reparto por marcas y horario.
   - Pasa las tres columnas a piezas solapadas.
   - La cuadrícula de logos se convierte en un tablón de pegatinas: cada logo en su placa,
     ligeramente girada.
6. **Socio fundador.**
   - El anillo 37/100 dentro de un sello grande.
   - Las ventajas son recortes con icono de línea.
   - El formulario va en una ficha con marco discontinuo, «clavada» encima del collage.
   - Deslizador, que lleva al campo del nombre.
7. **Manifiesto.** El shader de tele de fondo, con el texto en Playfair sobre un recorte de papel
   oscuro y la firma «El equipo de Burdin» en una placa.
8. **Tarifas.**
   - Las tres tarjetas pasan a etiquetas de precio de taller: grandes, con agujero de colgar,
     ligeramente giradas y solapadas.
   - La de socio fundador va delante.
   - Debajo, «O pruébanos primero» como tres tickets pequeños.
   - Las pestañas «Preapertura / Tras la apertura» se mantienen.
9. **Preguntas.** Una columna de notas pegadas, con el desplegable de siempre.
10. **Contacto y pie.** El mapa como foto pegada con cinta; los datos en una ficha. La llamada
    final «Quedan N plazas de fundador» en una placa enorme, con el deslizador.

## Textura y movimiento

- Mantén el grano de película global. Añade textura de cinta adhesiva (un rectángulo
  semitransparente con bordes rotos) en 3 o 4 piezas, no en todas.
- Animación de entrada de las piezas, en la línea de Emil Kowalski:
  - cada pieza llega desde 12–20 px con un giro de ±1°, y opacidad de 0 a 1;
  - 600–700 ms con `cubic-bezier(.16,1,.3,1)`, escalonado de 60–90 ms dentro de cada hoja;
  - sin rebotes.

  Usa el `data-reveal` que ya existe, añadiendo `--r` para el giro final y `--d` para el retraso.
- Al pasar el ratón por una pieza: `translateY(-3px) rotate(0)` y la sombra un poco más larga, en
  300 ms. No lo apliques a todo: solo a fotos, fichas y etiquetas de precio.
- El parallax suave de las máquinas se queda (GSAP ScrollTrigger), pero con menos recorrido.
- Con `prefers-reduced-motion` no hay giros ni desplazamientos: solo opacidad, y nada de shader.

## Móvil (390 px)

- El collage se apila en una sola columna, con solapes pequeños (12–20 px) y giros de ±1°.
- Nada puede provocar desplazamiento lateral: `overflow-x: clip` en cada hoja.
- Los textos no se tapan.
- Los objetivos táctiles miden 44 px como mínimo, y el deslizador funciona con el dedo.

## Cómo comprobarlo

- Playwright ya está instalado (`require('playwright')`; no lo reinstales). Haz capturas de página
  completa:
  - a 1366 px y a 390 px;
  - en ES y en EU;
  - antes de capturar, quita `data-reveal-armed` del `<html>` y el `loading="lazy"`.
- Míralas tú, sección por sección, y comprueba que:
  - nada se monta encima de un texto;
  - ningún solape tapa un botón;
  - `document.documentElement.scrollWidth === innerWidth`;
  - no hay errores en la consola;
  - el deslizador lleva a `#fundador` o al campo del nombre.
- Pasa la página por la skill de revisión de diseño que tengas disponible (`web-review`,
  `design-critique` o `review-page`). Arregla lo importante antes de publicar.

## Al acabar

1. Actualiza `comercial/burdin/boceto/LEEME.md`: estilo, estructura, dónde van las fotos y qué
   queda pendiente.
2. Haz commit con un mensaje claro en español y push.
3. Despliega en Vercel con `create_deployment`:
   - proyecto `burdin-gym-boceto`;
   - `gitSource` de GitHub: org `PersonalFit-Code`, repo `PROYECTOS-BRIAN`, la rama y el sha del
     commit;
   - target `production`.

   Espera a que esté READY.
4. Dime en pocas líneas qué cambiaste, qué fotos usaste, qué datos inventaste (marcados como de
   ejemplo) y el enlace.
