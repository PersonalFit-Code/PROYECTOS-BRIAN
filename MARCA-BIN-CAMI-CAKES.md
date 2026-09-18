# Bin & Cami Cakes · Brief de marca

Extraído del flyer impreso (foto) y contrastado con el `index.html` recibido.
Base para construir la web. Ourense.

---

## 1. Datos del negocio (NAP)

| Campo | Valor | Fuente |
|---|---|---|
| Nombre | Bin & Cami Cakes | flyer |
| Dirección | Rúa do Progreso 27, bajo 3 · Jardín do Posío, Ourense | flyer |
| Código postal | **32005 — por confirmar** | solo en el HTML, no aparece en el flyer |
| WhatsApp / teléfono | 656 584 027 → `+34656584027` | flyer |
| Instagram | @bin_camicakes | flyer |
| Horario | **por confirmar** | el flyer no lo indica |

El HTML declara martes a sábado, 10:00–20:00. No está en el flyer: hay que
confirmarlo con ellas antes de publicarlo, porque un horario erróneo en el
Schema y en Google Business genera llamadas a puerta cerrada.

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

- **Logo**: cupcake kawaii con cara, guinda arriba, en pegatina con borde blanco.
  Lettering «Bin & Cami» en script rosa oscuro y «Cakes» en dorado.
- **Estilo**: pegatina — cada elemento lleva contorno blanco grueso y sombra
  suave. Es el rasgo más reconocible del flyer y conviene llevarlo a la web en
  las tarjetas y el logo.
- **Tipografía del flyer**: manuscrita redondeada para los textos y una display
  muy gruesa con relieve para «TARTAS». El `index.html` usa Playfair Display,
  que es elegante pero **no se parece**: Playfair es una serif de revista, el
  flyer es dulce y manuscrito. Alternativas más fieles en Google Fonts:
  *Baloo 2*, *Fredoka* o *Quicksand* para titulares, con *Plus Jakarta Sans*
  para el texto corrido.
- **Corazones** como elemento decorativo recurrente, en contorno.

## 5. Fiabilidad del color

La segunda foto resuelve el problema: bien expuesta y sin dominante, la paleta
de §3 es utilizable tal cual.

Queda un límite inevitable: es una foto de un **impreso**, y el papel siempre
desvía algo respecto al archivo digital. Si aparece el original (Canva, PDF o
PNG) se puede afinar, pero ya no es bloqueante para empezar.

Lo que sí sigue haciendo falta es el **logo en PNG con transparencia o SVG**:
recortarlo de la foto daría un logo con textura de papel y bordes sucios.

## 6. Pendiente antes de construir

- [ ] Fotos reales de sus tartas **(bloqueante: las del HTML actual son de banco de imágenes)**
- [ ] Logo en PNG con transparencia o SVG **(bloqueante: no vale recortarlo de la foto)**
- [ ] Horario confirmado
- [ ] Código postal confirmado
- [ ] Reseñas reales copiadas de su perfil de Google
- [ ] Confirmar qué especialidades siguen ofreciendo
- [ ] ¿Tienen dominio contratado? El HTML apunta a bincamicakesourense.com
