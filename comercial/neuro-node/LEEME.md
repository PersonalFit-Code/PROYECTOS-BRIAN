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

Cada fuente empieza con sus datos (`titulo`, `tipo`, `cliente`, `fecha` y, opcional, `formato: horizontal`) entre `---`. En horizontal, cada `<h2>` abre una lámina: título y entradilla a la izquierda, contenido a la derecha. Lo marcado
con la clase `pendiente` sale en amarillo: hay que rellenarlo antes de enviar.

## Hungceed (Jose P.): recordatorios por Twilio y asistente

- `propuesta-recordatorios.pdf`: la arquitectura de recordatorios y respuestas por WhatsApp con
  su número de Twilio, conectado a Virtuagym. Centrada solo en Hungceed GYM. Explica el dolor, las piezas, el recorrido de una sesión, las reglas de
  Meta, las fases y los costes de uso. **Faltan**: inversión, cuota mensual y condiciones de pago.
- `briefing-chatbot.pdf`: el cuestionario para el asistente. Recoge el canal (web, WhatsApp,
  Instagram), las preguntas repetidas del gym, qué responde solo y qué deriva, si
  tiene una base de datos de preguntas y respuestas para entrenarlo, el tono, cuándo pasa a una
  persona y los límites.

## 720 GYM CLUB (Ourense): web, venta online y gestión

- `clientes/720gym/propuesta-web.pdf`: tres planes sobre el mismo diseño. Básico (500 € + 35 €/mes),
  Clientes (700 €) y Pro (1.200 €, lo que se ve en la demo: alta y pago online, reservas con plazas,
  asistente y panel de gestión). Capturas de la demo en `img/` (se rehacen con la demo en marcha).
  Demo: 720gym-club.vercel.app. **Faltan**: cuotas mensuales de Clientes y Pro, horas de cambios incluidas,
  uso de IA incluido y plazo de entrega.
- `clientes/720gym/presentacion-demo.pdf` (15 láminas, horizontal): la presentación para Brais. Fortalezas
  (5,0 en Google, reseñas), dónde se escapan clientes, la solución en un recorrido, la web (intro, conceptos,
  horario, reseñas), la máquina de inscripciones (test y alta con pago), el asistente con IA, el CRM, las fichas
  y la IA para la gerencia, cada problema con su solución, planes y próximos pasos. Capturas `img/p-*.jpg`
  hechas con la versión compilada de la demo. **Faltan** (en amarillo): cuotas de Clientes y Pro y el uso de IA incluido.
