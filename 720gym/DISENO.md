# Sistema de diseño · 720GYM CLUB

Guía corta para tocar la web sin romper su aspecto. Todo vive en `src/app/globals.css` (colores,
letra, clases propias) y en `src/components/ui/`.

## Colores

| Nombre | Valor | Dónde se usa |
|---|---|---|
| `negro` | `#0e0e0f` | Fondo de los apartados oscuros y texto sobre claro |
| `suelo`, `pizarra` | `#1a1a1c`, `#26272b` | Variantes de fondo oscuro |
| `blanco`, `pared`, `niebla` | `#ffffff`, `#f3f3f4`, `#e9e9eb` | Fondos de los apartados claros |
| `naranja` | `#d77455` | El naranja de 720 (elegido por Brais). No se cambia por otro |
| `whatsapp` | `#25d366` | Solo botones e iconos de WhatsApp |
| Color de cada ficha | ver `src/data/conceptos.ts` | Pilates ámbar, Hipopresivos coral, Yoga morado, BJJ azul marino, Krav Maga verde oliva, Capoeira azul cielo, Gimnasia amarillo, CrossGym rojo |

### La regla del naranja

- **Solo en apartados claros.** Sobre negro rompe: allí los detalles quedan en gris claro.
- Es automático: el color se pinta con `var(--marca)` (clases `text-marca`, `bg-marca`,
  `border-marca`). En un apartado claro vale naranja o el color de la ficha; en uno oscuro, gris.
- Para una palabra destacada en un titular: `<span className="resalte">`.
- Nunca fondos grandes ni párrafos en naranja. Texto en naranja solo en titulares (letra grande).

## Apartados

La portada alterna **claro → oscuro → claro**. No poner dos oscuros seguidos.

- Claro: `bg-white`, `bg-pared` o `bg-niebla` con `text-negro`.
- Oscuro: `bg-negro` con texto blanco.
- Cada apartado empieza con una etiqueta (`className="etiqueta"`, lleva su punto de color) y un
  titular.

## Letra

- Titulares: Barlow Condensed, clase `titular`. Tamaños: `text-titulo-1` (grande),
  `text-titulo-2` (apartado) y `text-titulo-3` (apartado pequeño).
- Subtítulos y botones: clase `subtitular`.
- Texto: Inter. Párrafo de apartado 16–17 px; texto de tarjeta 14–15 px; notas 13 px.
- La letra «stencil» (clase `marca`) es solo para el logo.

## Piezas

| Pieza | Clase o componente | Uso |
|---|---|---|
| Botón principal | `boton-venta` | Una acción principal por apartado. Píldora. Blanco sobre oscuro, negro sobre claro |
| Botón secundario | `boton-info` | Acción de apoyo, con contorno |
| Botón de WhatsApp | `boton-venta sin-flecha` + `<IconoWhatsApp className="text-marca" />` | «Quiero conocer…» |
| Ficha clara | `ficha-clara` + `rounded-3xl border border-negro/10 bg-white` | Tarjetas sobre fondo claro. Se destacan en naranja al pasar |
| Tarjeta de vidrio | `tarjeta-vidrio` + `rounded-3xl` | Tarjetas sobre fondo oscuro |
| Disco | `disco` (dentro de una `ficha-clara`) | Icono dentro de un disco de pesas; gira y se pone naranja al pasar |
| Logo de disciplina | `<SelloConcepto logo nombre />` | Todos los logos con la misma proporción en su recuadro negro |
| Chip | `rounded-full px-3 py-1.5 text-[13px] font-semibold` | Datos cortos: «Aforo limitado», «Máximo 6 personas» |
| Desplegable | `Desplegable` en la plantilla de fichas | Profesional, horarios y cuotas |

Radios: tarjetas `rounded-3xl`, piezas pequeñas `rounded-2xl`, botones y chips `rounded-full`.

## Fichas de las disciplinas

Todas salen de `src/data/conceptos.ts` con una sola plantilla
(`src/app/(conceptos)/[concepto]/page.tsx`). Para cambiar un horario, una cuota o un texto, se toca
solo ese archivo. Orden fijo, pedido por Brais: **qué es → modalidades → profesional → horarios →
cuotas (lo último)**. El precio no aparece en la portada, en botones ni en tarjetas.

## Tono de los textos

Tranquilo y cercano, de tú, frases cortas. Se invita a conocer, no a pagar: «escríbenos y
concertamos una visita», «ven a conocer 720». Sin urgencias («plazas limitadas», «hoy»).

## Pendiente de ordenar

- Tamaños de texto: hay 43 tamaños distintos escritos a mano (`text-[14.5px]`…). Conviene dejarlos
  en cinco.
- Páginas antiguas `/horario` y `/tarifas`: datos de la demo; ya no se enlazan.
