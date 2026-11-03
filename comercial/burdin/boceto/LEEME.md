# Boceto de la web de Burdin Gym (Ander)

Una sola página (`index.html`) con las fotos en `img/`, en castellano y euskera.
Parte del borrador de Ander (`../borrador-ander/`). Mantiene su logo, sus colores y sus letras,
sus tarjetas de máquina, las marcas y el selector EU/ES.

**URL de prueba:** https://burdin-gym-boceto.vercel.app. Es el proyecto `burdin-gym-boceto` en
Vercel, con la carpeta raíz `comercial/burdin/boceto`. Es pública, sin la protección de Vercel,
y lleva `noindex` para que Google no la indexe.

## Qué tiene

| Bloque | Qué hace |
| --- | --- |
| Barra «BOCETO» | Avisa de que los datos marcados con un punto ámbar están por confirmar. Se quita con `CONFIG.boceto = false`. |
| Menú | Fijo arriba. En móvil se convierte en menú hamburguesa a pantalla completa. |
| Portada | Sin el logo grande repetido. «Preapertura», titular, cuenta atrás hasta la apertura y el press a cadena como pieza estrella. |
| Cifras | Máquinas, marcas, m² y plazas de fundador (estilo Blvckout). |
| Socio fundador | Ventajas, barra de plazas ocupadas y **lista de espera** (nombre, teléfono e interés), que abre WhatsApp con el mensaje hecho para Ander. |
| Piezas con historia | Tarjetas al estilo TDM con año, procedencia, kilómetros recorridos y «por qué es especial». |
| Marcas | La cinta y la cuadrícula de las 10 marcas. |
| Zona por zona | Galería a pantalla completa, con un titular por zona. Usa la foto `img/zona-*.jpg` si existe. Si no, enseña la máquina o una versión dibujada del render (pared de recepción o fachada con el disco). |
| Tarifas | Pestañas «Preapertura» (fundador, trimestral, anual) y «Tras la apertura» (mensual, trimestral, anual), más «O pruébanos primero» (día, fin de semana, semana). Cada botón va a su enlace de Virtuagym. |
| Preguntas | Siete preguntas frecuentes. |
| Contacto | Dirección, horario, WhatsApp, email, Instagram y mapa. |
| Botón de WhatsApp | Flotante, en todas las pantallas. |

## Dónde se cambian los datos

Todo lo que cambia está en el objeto `CONFIG`, al principio del `<script>`:

- `apertura`: la fecha de la cuenta atrás;
- `plazasFundador` y `plazasOcupadas`;
- `whatsapp`: el número de Ander, solo cifras y con el 34 delante;
- `email`, `instagram`, `direccion` y `mapa`;
- `virtuagym`: el enlace de cada tarifa en su tienda online. Si un enlace está vacío, el botón abre WhatsApp;
- `precios`.

Las historias de las máquinas están en `MACHINES`, las zonas en `ZONES`, las tarifas en
`PLANS` y las preguntas en `FAQ`. Cada texto está en castellano (`es`) y en euskera (`eu`).

## Fotos de la galería

Hay que guardarlas en `img/` con estos nombres y salen solas. Mientras no estén, la galería
enseña la máquina o el dibujo.

- `zona-recepcion.jpg`: el render de la pared con el logo iluminado;
- `zona-pecho.jpg`, `zona-brazo.jpg` y `zona-oldschool.jpg`;
- `zona-fachada.jpg`: el render de la fachada con el disco de 20 kg.

## Pendiente de Ander antes de publicar

- **Fecha de apertura, plazas de fundador y precios.** Los del boceto son de ejemplo.
- **Ventajas de fundador:** sin matrícula, visita privada y camiseta numerada. Son propuestas.
- **Historias reales de cada máquina:** año, de dónde vino, kilómetros y por qué es especial.
  Las del boceto son de ejemplo y lo pone en cada tarjeta.
- **Cifras:** número de máquinas y metros cuadrados.
- **Datos de contacto:** dirección, WhatsApp, email, Instagram y horario.
- **Enlaces de Virtuagym** de cada tarifa (después de su curso del día 9).
- **Revisión del euskera.** Está traducido por nosotros y tiene que revisarlo un nativo.
- **Fotos propias** de las máquinas y del local. Las 4 actuales vienen de su borrador.
- **Aviso legal y privacidad.** El formulario solo abre WhatsApp y no guarda datos.
