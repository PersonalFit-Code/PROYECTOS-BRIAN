# Web neuro·node: sección «Proyectos en acción» y franja de clientes

## 1. Material que hay que reunir (en tu ordenador)
Crea en el proyecto de la web la carpeta `web/public/proyectos/`, con una subcarpeta por cliente:

```
web/public/proyectos/
  personalfit/  logo.png  video-portatil.mp4  video-movil.mp4
  tixola/       logo.png  video-movil.mp4
  bincami/      logo.png  video-movil.mp4
```

| Cliente | Logo | Vídeos |
|---|---|---|
| Personal Fit | Pendiente: pedírselo o sacarlo de su Instagram | **Hay que grabarlos** (ver punto 2) |
| Tixola | Ya lo tenemos: `tixola-taperia/public/brand/tixola-logo.png` (repositorio PROYECTOS-BRIAN) | Grabación limpia de la carta, la vinoteca y el camarero |
| Bin & Cami | Pendiente: pedírselo o sacarlo de su Instagram | Grabación limpia de encargos, fechas y mostrador |

**Formato de los logos:** PNG con fondo transparente y al menos 400 px de ancho.

**Formato de los vídeos:**
- de 8 a 15 segundos y sin sonido;
- que el final enlace con el principio, porque se repiten en bucle;
- sin textos encima: los vídeos de las historias llevan texto de Instagram y no sirven tal cual;
- móvil en vertical y portátil en horizontal.

## 2. Cómo grabar Personal Fit (con datos inventados)
1. Crea en el CRM una cuenta o un centro **de prueba**, con clientes inventados («Laura Martín», «Carlos Pérez»…). **Nunca datos reales.**
2. En Windows, abre el navegador a pantalla completa y pulsa **Win + Alt + R**. Así empieza a grabar la Xbox Game Bar. Para parar, otra vez Win + Alt + R.
3. Graba 4 tomas cortas, moviéndote despacio:
   - **Panel de dirección:** resumen del centro, clientes y monitores.
   - **Panel de monitor:** su agenda del día y sus clientes.
   - **Reservas y calendario:** crear una reserva y verla aparecer en el calendario.
   - **App de entrenamiento (en el móvil):** la ficha de un cliente con su progreso, sus RM y una gráfica de evolución. En el móvil, graba la pantalla desde el centro de control.
4. Pásale las tomas a Claude en VS Code. Él las recorta, las une y las comprime.

## 3. Textos de cada proyecto (sin cifras inventadas)
**Personal Fit · Centro de entrenamiento personal** (enfoque: gestión pura y rendimiento del cliente)
Toda la gestión del centro en un solo sistema: un panel para la dirección y otro para los monitores, con reservas, calendario y clientes al día. Y una app centrada en el rendimiento de cada cliente: sus marcas, sus RM y su evolución, sesión a sesión.
- Panel de dirección y panel de monitores
- Reservas y calendario compartidos
- App de rendimiento: progreso, RM y métricas

**Tixola · Tapería y vinoteca (Ourense)**
Carta digital siempre al día, vinoteca con sus vinos y un camarero virtual que responde a los clientes desde el móvil.
- Carta digital que se cambia en un momento
- Vinoteca
- Camarero virtual con IA

**Bin & Cami Cakes · Pastelería** (enfoque: visibilidad y marketing)
Antes, sus tartas solo se veían en WhatsApp e Instagram. Ahora tienen un escaparate online cuidado, que se encuentra en Google, enseña cada creación y recoge encargos con fecha.
- Escaparate online de sus tartas
- Reseñas y confianza a la vista
- Encargos con fecha de entrega

**Agente de voz con IA** (servicio de neuro·node)
Atiende llamadas 24/7: responde dudas, filtra y agenda citas por teléfono, con voz natural.
- Base técnica ya hecha: `vapi-voice-agent/` en el repositorio PROYECTOS-BRIAN.
- Para la demo en la web hace falta **una llamada de prueba grabada** (1–2 minutos) y su transcripción.
- **Pendiente:** hablarlo con Nico, que lleva las demos.

## 4. Orden de trabajo
1. Franja de clientes debajo de la portada (con los 3 logos).
2. Sección «Proyectos en acción»: primero con un hueco donde irá cada vídeo, luego con los vídeos reales.
3. Bloque del agente de voz, cuando tengamos la grabación.
4. Enseñárselo a Nico en un PR y seguir mejorándolo juntos.
