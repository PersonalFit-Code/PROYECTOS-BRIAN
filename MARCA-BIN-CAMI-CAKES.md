# Bin & Cami Cakes · Brief de marca

Extraído del flyer impreso (foto) y contrastado con el `index.html` recibido.
Base para construir la web. Ourense.

---

## 1. Datos del negocio (NAP)

| Campo | Valor | Fuente |
|---|---|---|
| Nombre | Bin & Cami Cakes | flyer |
| Dirección | Rúa do Progreso 27, bajo 3 · Jardín do Posío, Ourense | flyer |
| Código postal | 32005 | confirmado por el cliente |
| WhatsApp / teléfono | 656 584 027 → `+34656584027` | flyer |
| Instagram | @bin_camicakes | flyer |
| Horario | Abierto los 7 días (ver §1.1) | confirmado por el cliente |

### 1.1 Horario real

| Día | Horario |
|---|---|
| Lunes | 10:00 – 20:00 |
| Martes | 10:00 – 20:00 **(por confirmar, ver nota)** |
| Miércoles | 11:00 – 22:00 |
| Jueves | 11:00 – 22:00 |
| Viernes | 11:00 – 22:00 |
| Sábado | 11:00 – 22:00 |
| Domingo | 10:00 – 22:00 |

**Abren los siete días**, sin día de cierre. Esto invalida lo que declaraba el
`index.html` recibido (martes a sábado, 10:00–20:00), que habría dejado fuera
domingo y lunes: dos de los días fuertes para encargar tarta.

Nota sobre el martes: la captura del cliente muestra «10:00–2:00». Es casi seguro
un error de su ficha de Google —cerrar a las 2 de la madrugada no encaja con el
resto— pero conviene confirmarlo antes de publicarlo en el Schema, y de paso
corregirlo en Google, porque ese dato es el que ve la gente al buscarlas.

### 1.2 Inventario de fotos recibidas

| Archivo | Tamaño | Sirve para |
|---|---|---|
| 1.png · tarta azul y oro | 108×108 | nada |
| 2.jpg · porciones de chocolate | 108×108 | nada |
| 3.webp · tarta «Valentina» baloncesto | 382×510 | tarjeta pequeña como mucho |
| 4.png · tarta Call of Duty | 108×108 | nada |
| 5.png · tarta de granja | 108×108 | nada |
| 6.jpg · fachada con globos | 196×258 | nada |
| 7.jpg · mostrador con rótulo iluminado | 335×597 | tarjeta pequeña como mucho |

Cinco de las siete son miniaturas de 108×108 px (tamaño de resultado de búsqueda
de Google). Una cabecera necesita del orden de 1600–2400 px de ancho: son unas
quince veces más pequeñas de lo necesario, y ampliarlas no recupera detalle, solo
emborrona. **Hacen falta los originales del móvil.**

Aparte llegó una foto buena de una de las pasteleras en la puerta del local
(1280×720), con el rótulo iluminado y el vinilo de la pared bien visibles. Es
justo el tipo de imagen humana que mejor funciona en un negocio artesanal, pero
llegó pegada en el chat y no como archivo, así que hay que reenviarla. Parece
una foto de prensa profesional: antes de usarla hay que confirmar que tienen los
derechos o el permiso del fotógrafo.

---

## 2. Textos literales del flyer

Sirven tal cual para la web: son la voz real de la marca, mejor que cualquier
copy inventado.

- **Se realizan TARTAS Personalizadas** (titular)
- **Tú imaginas, nosotros lo hacemos** ← el mejor candidato a subtítulo del hero
- **La vida es más dulce con tartas**
- **Diseños únicos para momentos inolvidables**
- **Cuéntanos tu idea** ← CTA natural, ya es su forma de pedir contacto
- **Te esperamos**
- «Feliz Cumpleaños» (rótulo decorativo sobre una tarta)

- **TARTAS • POSTRES • DULCES • MOMENTOS FELICES ♡** (franja del pie)

### Categorías de servicio (iconos del flyer)

Cumpleaños · Bodas · Eventos especiales · Temáticas

### Especialidades (del HTML recibido, origen Instagram/Threads)

Memory Cakes · Cookies estilo NY y Crumbl · Postres tradicionales y venezolanos
· Mesas de dulces · Tartas con figuras en movimiento y luces

**Por confirmar con el negocio.** No están en el flyer y proceden de fuentes de
terceros; si alguna ya no se ofrece, sobra en la web.

---

## 2.1 Reseñas reales de Google

**4,9 / 5 · 18 reseñas** (verificado en su ficha). 17 de cinco estrellas y una de tres.

Esto desbloquea el `aggregateRating` del Schema, que hasta ahora estaba desactivado
por no tener datos reales:

```json
"aggregateRating": { "@type": "AggregateRating",
                     "ratingValue": "4.9", "reviewCount": "18", "bestRating": "5" }
```

Hay que revisar la cifra antes de publicar y cada pocos meses: si suben reseñas y
el número se queda viejo, el marcado deja de coincidir con la ficha.

### Seleccionadas para la web

Se descartan seis que Google corta con «… Más»: no se puede publicar media frase
como si fuera la reseña entera. Estas seis están completas y cubren ángulos
distintos:

> «Muy buen sitio, la atención increíble y **la tarta que encargué tal cual la
> pedí** 10 de 10» — *ibrahin eduardo*

> «Ayer fuimos a probar la **tarta 3 leches**, porque queríamos una de verdad,
> tipo venezolano y hemos encontrado el lugar 😍 Gracias **Luisa** por tu
> amabilidad, dedicación y por hacer honor a la calidad de nuestros productos
> venezolanos.» — *Andreína Gómez*

> «Suelo comprar aquí cada vez que quiero algo dulcecito. Esta vez fue un momento
> especial y los elegí para la tartita de mi marido. Él salió muy feliz! Estaba
> sabrosa y muy bonita!! Fueron **super amables y puntuales**, no elegiría ningún
> otro sitio 🩷» — *Onee-ChanOfEveryone :3*

> «Si pruebas **las cookies** de este sitio ya no querrás otras, os lo aseguro!!!!!
> Y el trato que ofrecen al cliente es maravilloso ❤️» — *Remedios Antonia Pérez Baltar*

> «Muy rico todo con **sabor venezolano**, **llevo años** probando sus dulces 💛
> atención de 10 🫶» — *Luis Silveira*

> «El mejor **tres leches** que me he comido en mi vida!!!. Los recomiendo!!!»
> — *Qart Cards*

La de *ibrahin* es la más valiosa para vender: «la tarta que encargué tal cual la
pedí» responde al miedo exacto de quien encarga una tarta personalizada y teme
que no se parezca a lo que pidió.

### Lo que repiten los clientes

| Veces | Tema |
|---|---|
| 7 | Trato y amabilidad |
| 4 | **Tres leches**, citada por su nombre sin que nadie pregunte |
| 3 | **Identidad venezolana** (tres leches, golfeado, piñitas) |
| 3 | Clientes que repiten, uno «lleva años» |
| 1 | Cookies, puntualidad, fidelidad al encargo |

### Dos avisos

**Hay una reseña del propio negocio.** La firmada por «Binycamicakes» («La mejor
pastelería de la ciudad») está puesta desde su propia cuenta. Google prohíbe
autorreseñarse y puede retirar la ficha o filtrar valoraciones. Conviene
borrarla: además, con 17 reseñas ajenas de cinco estrellas no la necesitan.

**La única negativa** (3/5) se queja de 6 € por un vaso de fruta congelada, no de
la repostería. Responderla en Google con educación suma más que ignorarla: quien
lee reseñas mira cómo responde el negocio a las malas.

## 2.2 Posicionamiento: lo que revelan las reseñas

El flyer vende «tartas personalizadas», que es lo que vende toda pastelería de
Ourense. Las reseñas apuntan a algo que el flyer no dice y que sí las distingue:

**son la pastelería venezolana de Ourense, y su tres leches es el producto
estrella.** Cuatro clientes lo citan por su nombre sin que nadie se lo sugiera, y
uno explica que buscaba «una de verdad, tipo venezolano». Aparecen también
golfeado y piñitas.

En SEO local esto importa mucho: «tartas personalizadas Ourense» compite con
todas; «tres leches Ourense», «repostería venezolana Ourense» o «golfeado
Ourense» casi no tienen competencia y quien las busca ya sabe lo que quiere.

Propuesta: mantener «Tartas Personalizadas en Ourense» como H1, que es su negocio
principal y lo que anuncia el flyer, y darle un bloque propio y visible a la
repostería venezolana con el tres leches por delante. Es su foso, y ahora mismo
no está en ninguna parte.

Aparece además un nombre propio: **Luisa**, citada en dos reseñas como quien hace
las tartas. Conviene confirmar quiénes son Bin y Cami y cómo quieren aparecer.

---

## 3. Paleta

Medida sobre la segunda foto del flyer (nítida y bien expuesta: blanco del papel
a 245 con solo 8 puntos de desviación entre canales, así que la corrección de
balance de blancos es mínima y el color es fiable).

El **tono** sale directo del impreso. La **saturación** va subida a valores de
pantalla: la impresión en papel y el tramado la bajan, y el diseño original se
hizo en pantalla, donde era más vivo.

```css
:root{
  --frambuesa: #B53058;  /* titular y CTA        · blanco encima 5,95:1   */
  --rosa:      #D6718C;  /* corazones, hover                              */
  --rosa-palo: #EBCBD8;  /* pastillas y tarjetas · tinta encima 8,41:1    */
  --rosa-nube: #F9EBF1;  /* fondos de sección    · tinta encima 10,87:1   */
  --lila:      #E7CADC;  /* badge festoneado     · tinta encima 8,30:1    */
  --violeta:   #BA9BD4;  /* acento secundario (tarta de mariposas)        */
  --oro:       #A16936;  /* oro con texto encima · blanco encima 4,58:1   */
  --oro-claro: #CFA459;  /* oro decorativo: filetes, adornos, no texto    */
  --tinta:     #3A3136;  /* texto corrido        · sobre crema 12,07:1    */
  --crema:     #FDFAF7;  /* fondo de página                               */
}
```

Todas las combinaciones de texto previstas pasan AA. El `--oro-claro` se queda
en 2,22:1 sobre crema: es decorativo, nunca para texto.

### Medido vs. propuesto

| Elemento | Medido en el impreso | Propuesto para pantalla |
|---|---|---|
| Titular TARTAS | `#A24D66` · tono 342° · sat 36% | `#B53058` · tono 342° · sat 58% |
| Pastilla de servicio | `#E0B9C8` · tono 337° · sat 39% | `#EBCBD8` · tono 337° · sat 45% |
| Badge festoneado | `#DDB8CF` · tono 323° | `#E7CADC` · tono 323° |
| Tarta de mariposas | `#B599CE` · tono 272° | `#BA9BD4` · tono 272° |
| Scripts oscuros | `#3B3335` · luz 21-25% | `#3A3136` |

El oro se midió en `#9B7654` (tono 29°), oscuro porque la tinta metalizada
fotografía apagada. De ahí las dos variantes: una que aguanta texto y otra
decorativa más luminosa.

## 4. Identidad visual

### 4.1 Logo recibido

Archivo: **225×225 px, PNG con transparencia real** (47% del lienzo). Es la
mascota: el cupcake kawaii con guinda. Guardado en
`assets/bin-cami-cakes/logo-mascota.png`.

Venía con dos defectos de recorte:

1. **Fragmentos sueltos de las letras.** El recorte partió el logotipo completo y
   dejó flotando trozos de la «B» rosa y la «C» dorada junto al cupcake. A 32 px
   no se aprecian; a partir de 96 px se ven claramente. Eran 18 componentes
   sueltos pegados al borde derecho, así que se han podido eliminar sin tocar el
   dibujo. Versión corregida en `logo-mascota-limpio.png` (191×222 px), con los
   destellos decorativos conservados.
2. **El rabito de la guinda queda cortado** por arriba. Viene del recorte de
   origen y no se puede reconstruir sin inventar.

**Límites de uso.** A 225 px sirve para favicon, cabecera (44–56 px) y pie
(96 px), incluso en pantallas retina. No da para la imagen de compartir en
WhatsApp y redes (1200×630) ni para nada grande: ampliado se ve blando.

**Nunca sobre fondo frambuesa ni tinta**: el contorno del logo es casi negro y se
queda en 2,39:1 sobre `--frambuesa`, o sea que se apaga. Sobre `--crema`,
`--rosa-nube` o `--rosa-palo` va perfecto (9,5:1 o mejor).

**En la cabecera, el nombre irá como texto, no como imagen**: se ve nítido a
cualquier tamaño, lo lee Google y se adapta solo en móvil. La mascota acompaña.

### 4.2 Colores exactos del logo

Primera fuente digital de la marca, sin papel ni fotografía de por medio:

| Hex | Elemento | Tono |
|---|---|---|
| `#D74673` | Guinda y rosa de acento | 341° |
| `#E8A9AA` | Crema rosa, tono medio | 359° |
| `#FADDD7` | Crema rosa, tono claro | 10° |
| `#FCE599` | Magdalena, base amarilla | 46° |
| `#E0A359` | Barquillo dorado | 33° |
| `#120503` | Contorno y ojos | — |

**Esto valida la paleta de §3.** El rosa del logo cae en 341° y el que se midió
sobre el flyer impreso, en 342°: un grado de diferencia. La medición a través del
papel era correcta, así que los tokens se quedan como están.

El `#FCE599` de la magdalena no estaba en la paleta y merece entrar como acento
cálido puntual: es lo que da el aire goloso al logo.

### 4.3 Resto de la identidad

- **Estilo pegatina**: cada elemento lleva contorno blanco grueso y sombra suave.
  Es el rasgo más reconocible de la marca y conviene llevarlo a las tarjetas.
- **Tipografía del flyer**: manuscrita redondeada, y una display muy gruesa con
  relieve para «TARTAS». El `index.html` recibido usa Playfair Display, que es
  una serif de revista y no se parece. Más fieles en Google Fonts: *Baloo 2*,
  *Fredoka* o *Quicksand* para titulares, con *Plus Jakarta Sans* para el texto.
- **Corazones** de contorno como elemento decorativo recurrente.

## 5. Fiabilidad del color

La segunda foto resuelve el problema: bien expuesta y sin dominante, la paleta
de §3 es utilizable tal cual.

Queda un límite inevitable: es una foto de un **impreso**, y el papel siempre
desvía algo respecto al archivo digital. Si aparece el original (Canva, PDF o
PNG) se puede afinar, pero ya no es bloqueante para empezar.

Lo que sí sigue haciendo falta es el **logo en PNG con transparencia o SVG**:
recortarlo de la foto daría un logo con textura de papel y bordes sucios.

## 6. Pendiente antes de construir

- [ ] Fotos de producto **en resolución original** (bloqueante: las recibidas son miniaturas)
- [ ] Reenviar como archivo la foto de la pastelera en el local, y confirmar derechos
- [x] Logo en PNG con transparencia (225 px, limpiado)
- [ ] Ideal: logotipo completo en vectorial o a 1000 px, para la imagen de compartir
- [ ] Confirmar qué especialidades siguen ofreciendo
- [ ] ¿Tienen dominio contratado? El HTML apunta a bincamicakesourense.com
