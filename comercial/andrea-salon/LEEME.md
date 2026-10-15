# Propuesta para Andrea Salón

Lo que se le manda a Andrea: `andrea-salon.pdf`, **9 hojas**.

- `andrea.html` es la fuente. **Se edita esto, nunca el PDF.**
- `logo.png` es su logo (portada y cierre). Lo mandó Brian por la app.
- El alcance y el precio salen de `andrea-salon/PLAN.md` y `andrea-salon/OFERTA.md`
  (en la raíz del repo). Si cambia el precio ahí, cambiarlo también en la hoja 9.

Para volver a generarlo:

    /opt/pw-browsers/chromium-1194/chrome-linux/chrome --headless --disable-gpu \
      --no-sandbox --no-pdf-header-footer \
      --print-to-pdf=andrea-salon.pdf andrea.html

Para revisarlo como imágenes antes de mandarlo:

    pdftoppm -png -r 70 andrea-salon.pdf pg

Tienen que salir **9 hojas**: portada · punto de partida · el mapa de las cinco piezas ·
el recorrido de la clienta · el WhatsApp · los bonos · el panel · cómo trabajamos ·
lo que es tuyo y el precio.

## Las hojas

| Hoja | Qué cuenta |
| --- | --- |
| 1 | Portada con su logo: «Que el salón trabaje por ti» |
| 2 | Lo que nos contó (mes y medio, confirmar a mano, la silla vacía) y el antes/después |
| 3 | Mapa de nodos: las cinco piezas y cómo se conectan entre sí |
| 4 | Los seis pasos de su clienta, con el móvil de la reserva dibujado |
| 5 | La conversación de WhatsApp y el árbol de qué pasa según responda |
| 6 | Los bonos: los cuatro pasos de la compra y el QR, con la rueda de consumido |
| 7 | El panel completo dibujado: KPIs, barras, mapa de calor y ranking del equipo |
| 8 | Los plazos de respuesta comprometidos y la línea de tiempo de las 9 semanas |
| 9 | Lo que es suyo, el precio y el siguiente paso |

## Paleta (la pidió Brian)

| | |
| --- | --- |
| Blanco / crema | `#FFFFFF` · `#FDF7F9` |
| Rosa pastel | `#FAEAF0` · `#F3D3DE` · `#E7A6BD` |
| Carmín | `#8E0E33` (y `#B8365A` para apoyos) |

Tipografías: **Bitstream Charter** para los títulos, **Inter** para el texto. Las dos están
instaladas en el contenedor; no se cargan de internet.

## Dos trampas que ya mordieron

**Un SVG con `width` en milímetros y `height` en píxeles se encoge.** El navegador respeta
los dos valores, mete el dibujo dentro con barras blancas arriba y abajo, y el gráfico sale
a la mitad de tamaño sin avisar. Por eso `.svg-ancho` lleva `height: auto`: así la altura
se calcula sola a partir del `viewBox` y el dibujo ocupa lo que tiene que ocupar.

**Lo que se sale del `viewBox` no se recorta con aviso, simplemente desaparece.** Pasó con
la leyenda de la rueda de los bonos y con el menú del panel: el texto estaba fuera del ancho
declarado y se cortaba a media palabra. Si se añade texto a la derecha de un dibujo, hay
que mirar que la `x` más el ancho del texto quepan dentro del `viewBox`.

Por las dos razones: **después de cada cambio, generar las imágenes y mirarlas.** En el PDF
no se ve que algo falta.

## Pendiente

- [ ] Decidir si el precio se queda en la hoja 9 o se quita del PDF y se habla en persona
      (en los otros dossieres de `comercial/` el criterio fue no ponerlo).
- [ ] Confirmar cómo se escribe el nombre del salón.
- [ ] Cambiar las fotos de ejemplo del panel por capturas reales cuando exista la demo.
