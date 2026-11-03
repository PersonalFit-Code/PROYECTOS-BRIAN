# neuro·node · briefings y propuestas

Plantillas de documentos con la marca de neuro·node. La base sale de «Presentación para
identidad visual de neuro·node» y «Plantilla Doc» (Drive › Marca Brian):

- **Letras.** Montserrat para titulares (Bold, en MAYÚSCULAS) y etiquetas (Medium, mayúsculas
  espaciadas). Quicksand para el texto.
- **Color.** Fondo blanco, texto y tablas en negro, índigo `#6447FA` como acento. Para los nodos:
  azul salud `#36ADFB` → índigo → morado `#7F1EED`.
- **Gráficos.** Nodos y conexiones. Nada de cerebros, circuitos ni robots.
- **Tono.** Premium, experto, sereno, preciso y humano. Español impecable, sin jerga hueca de IA.

## Estructura

- `recursos/`: `marca.css`, las fuentes y los logos recortados (isotipo y logotipo, en negro, color y blanco).
- `plantillas/`: `briefing.src.html` y `propuesta.src.html`, los esqueletos para un cliente nuevo.
- `clientes/<cliente>/`: los documentos de cada cliente.
- `generar.py`: convierte cada `.src.html` en `.html` + `.pdf`. Pone la cabecera y el pie de la
  marca en todas las páginas.

## Uso

    python3 generar.py                                   # todo
    python3 generar.py clientes/hungceed/*.src.html

Cada fuente empieza con sus datos (`titulo`, `tipo`, `cliente`, `fecha`) entre `---`. Lo marcado
con la clase `pendiente` sale en amarillo: hay que rellenarlo antes de enviar.

## Hungceed (Jose P.): recordatorios por Twilio y asistente

- `propuesta-recordatorios.pdf`: la arquitectura de recordatorios y respuestas por WhatsApp con
  su número de Twilio, conectado a Virtuagym. Centrada solo en Hungceed GYM. Explica el dolor, las piezas, el recorrido de una sesión, las reglas de
  Meta, las fases y los costes de uso. **Faltan**: inversión, cuota mensual y condiciones de pago.
- `briefing-chatbot.pdf`: el cuestionario para el asistente. Recoge el canal (web, WhatsApp,
  Instagram), las preguntas repetidas del gym, qué responde solo y qué deriva, si
  tiene una base de datos de preguntas y respuestas para entrenarlo, el tono, cuándo pasa a una
  persona y los límites.
