# Contexto: cliente Hungceed (Jose)

Copia todo este archivo como primer mensaje del chat nuevo.

---

Hola. Soy Brian Carbajal, hago webs, IA y automatizaciones para negocios desde Ourense. Habla siempre en español.
En este chat vamos a trabajar en la propuesta y la web para un cliente nuevo, Jose, de **Hungceed**.
Quiero que me ayudes a crear una maqueta de su nueva web partiendo de mi plantilla de **Andrea Salón** (carpeta `andrea-salon/` del repositorio `PROYECTOS-BRIAN`).

## Quién es el cliente
- **Jose P.**, CEO de **Hungceed**. Llegó por un grupo de WhatsApp de dueños de gimnasio (Gymtrade), de parte de **Brandán**. Por eso tiene un **10 % de descuento** en el desarrollo.
- **Tienda online** de equipamiento de gimnasio de marca propia: racks, jaulas, máquinas, bancos, barras, discos, mancuernas, kettlebells y accesorios para rack.
- **Series propias**: Elite Series, Pro Series, Prelude Series y Attachment Series (accesorios para rack).
- **Web**: https://hungceed.es. Está hecha con WordPress, Elementor y WooCommerce sobre un tema de pago. Recibe **pedidos todos los días**.
- **Gimnasio propio: Hungceed GYM**, en La Pobla Llarga (Valencia). Tiene sala de musculación, entrenamiento funcional, grupos semipersonales y entrenador personal.
  - Usa **Virtuagym** para socios, altas y cobros.
  - La página https://hungceed.es/gym/ solo tiene la tienda (webshop) de Virtuagym incrustada.
  - Tarifas actuales:
    - Musculación: 40 €/mes, 112 € 3 meses, 210 € 6 meses, 390 € al año.
    - Pase de 1 día: 8 €. Bono fin de semana: 28 €. Bono 10 días: 40 €.
    - Entrenador personal 1:1: 30 € la sesión, 95 € 4 sesiones, 180 € 8 sesiones.
    - Funcional: 30 € al mes (4 sesiones), 55 € al mes (12 sesiones).
    - Semipersonal: 36 € al mes (4 sesiones), 64 € (8), 84 € (12).
- **Contacto público**: hungceed@gmail.com, Instagram @hungceed, teléfono del gimnasio 621 22 18 20.
- **Marca**: negro y rojo intenso, letra Poppins, fotos propias de producto y de atletas, y un logo con flecha.
  - Lema actual: «Una sola marca. Todo el equipamiento que necesitas.»
  - Frase del CEO: «En Hungceed desarrollamos lo que nos gustaría encontrar en el mercado y no encontramos.»
  - Ventajas que destaca: catálogo completo, compatibilidad garantizada, calidad sin sobreprecio, soporte técnico real, envío rápido, pago seguro, mecanizado CNC e ingeniería industrial.

## Qué pide Jose
1. **Profesionalizar la web.** Él mismo dice:
   - que está desorganizada y tiene muchos productos;
   - que no tiene la armonía de otras webs, que hacen que el usuario se quede más tiempo «husmeando»;
   - que sus clientes se quejan de cómo está organizada.

   Quiere que encaje con su marca, colores y estética.
2. **Asistente de IA para WhatsApp** que responda las preguntas repetidas de la tienda y del gimnasio.
   - El 80 % de sus clientes le escriben por WhatsApp.
   - Hoy usa la IA de WhatsApp Business: le parece limitada, que no contesta bien del todo y algo cara.
   - Cree que tiene el negocio verificado en Meta Business.
   - Le propusimos exportar sus conversaciones de WhatsApp para entrenar al asistente (15-20 chats típicos).
3. Preguntó si hay mantenimiento o es pago único, y si incluye dudas, gestiones y cambios «ilimitados». Se le respondió así:
   - Hay un pago único por el desarrollo y una cuota mensual.
   - Dudas y soporte, sin límite.
   - Cambios del día a día, incluidos.
   - Lo nuevo (secciones, campañas, funciones) se presupuesta aparte.

## Lo que vi revisando su web (desde fuera)
- **Organización**
  - El menú no refleja el catálogo: «Accesorios home gym» solo tiene «Barras», y la Attachment Series no tiene sección propia.
  - «Productos» es una lista larga en orden alfabético, sin filtros.
  - La portada tiene tres titulares compitiendo.
- **Fichas de producto**
  - Nombres muy largos, con el texto de Google dentro del nombre. Ejemplo: «Half Rack Musculación | Medio Rack con Barra Dominadas | Hungceed».
  - Productos sin precio visible, y uno que sale «desde 0,00 €».
- **Fallos**
  - El icono de «mi cuenta» enlaza a una demo de la plantilla (`staging.websitedemos.net/electric-scooter-02/...`).
  - Botones con enlaces vacíos.
  - El logo es una captura de pantalla.
- **Móvil**
  - El titular se corta: «EQUIPAMIENT/O».
  - El botón del catálogo queda muy abajo.
  - La página del gimnasio es un recuadro con su propio scroll y textos mezclados en castellano, catalán e inglés.
- **Confianza y legal**
  - No hay WhatsApp en la web.
  - No hay información de envíos ni opiniones.
  - Privacidad y cookies sin enlace, y sin aviso legal.

## Precios (pendientes de cerrar, los vamos a revisar)
- **Rediseño de la tienda**: 900 € + 49 €/mes.
- **Asistente IA en WhatsApp**: 600 € + 59 €/mes.
  - Usa la API oficial de Meta. Responder a clientes no tiene coste de Meta.
  - La IA y la conexión cuestan unos 20-40 €/mes.
- **Página del gimnasio**: 250 €.
- **Pack con todo**: 1.500 € + 99 €/mes.
- **Descuento**: -10 % en el desarrollo por venir de Brandán.
- **Condiciones**: 50 % al empezar y 50 % a la entrega. Los 30 primeros días de cuota, gratis. Mínimo 3 meses de cuota.
- **Ya existe un PDF** con la versión anterior del plan (precios antiguos): `comercial/hungceed/Plan-servicios-Hungceed-Brian-Carbajal.pdf`.

## Decisión técnica: se trabaja dentro de su WordPress, no en Next.js
Su tienda vive en **WooCommerce** y vende a diario. **No la migramos a Next.js**: el rediseño se hace dentro de su propio WordPress, con el tema de pago y Elementor que ya tiene. Así conserva pedidos, clientes, pagos y posicionamiento, sigue usando el panel que ya conoce y el trabajo cuadra con el precio (900 €).

**Cómo se hace:**
1. **Copia de prueba (staging).** Desde el hosting, si lo permite, o con un plugin tipo WP Staging. Se trabaja ahí mientras la tienda sigue vendiendo.
2. **Rediseño con su tema y Elementor:** portada nueva con un solo mensaje, menú, página de categoría, plantilla de ficha de producto y pie con los enlaces legales.
3. **Reorganizar WooCommerce:**
   - categorías y subcategorías bien hechas, incluida la Attachment Series;
   - nombres cortos, y el texto para Google en el campo de SEO, no en el nombre;
   - revisar precios y variantes (el «0,00 €»);
   - filtros por tipo, serie y precio con un plugin de filtros.
4. **Añadir lo que falta:** botón de WhatsApp, opiniones, información de envíos y páginas legales (aviso legal, privacidad, cookies). Arreglar el enlace de «mi cuenta» y subir el logo en buena calidad.
5. **Página del gimnasio** en Elementor: fotos, horarios, ubicación, tarifas en tarjetas y botones «Apúntate» a cada tarifa de Virtuagym, en lugar del recuadro incrustado.
6. **Pasar la copia a la web real** cuando Jose la apruebe, sin perder pedidos, clientes ni Google.

**Lo que necesito de Jose cuando cierre:** un usuario de administrador en su WordPress y, si se puede, acceso al hosting para crear la copia de prueba. Nunca se guardan contraseñas en el repositorio.

**La plantilla de Andrea Salón** (`andrea-salon/`, en Next.js) se usa solo como inspiración de diseño, o para una maqueta rápida que enseñarle antes de cerrar. No es la web final.

## Asistente de WhatsApp y automatizaciones: se hacen en Make
Todo el asistente de IA y las automatizaciones se montan en **Make** (make.com). Brian tiene Make conectado.

**Módulos de Make que se usan:**
- **WhatsApp Business Cloud**: recibe los mensajes y envía las respuestas, con la API oficial de Meta.
- **Claude** (o OpenAI): genera la respuesta con la información del negocio.
- **WooCommerce**: consulta pedidos.
- **Virtuagym**: socios nuevos, visitas y membresías.
- **Data store de Make**: guarda la conversación de cada cliente para que la IA tenga memoria.

**Escenario 1. Asistente de WhatsApp (tienda + gimnasio):**
1. Llega un mensaje a su WhatsApp (módulo «Watch events» de WhatsApp Business Cloud).
2. Make recupera del data store los últimos mensajes de ese número.
3. La IA responde con su base de conocimiento:
   - preguntas frecuentes sacadas de sus conversaciones exportadas;
   - catálogo y series;
   - envíos, garantías y devoluciones;
   - tarifas y horarios del gimnasio, con el enlace a cada tarifa de Virtuagym.
4. Si pregunta por un pedido, Make lo busca en WooCommerce por número de pedido o email y le da el estado.
5. Si es una queja, un pedido especial, un presupuesto para equipar un centro o la IA no sabe responder: avisa a Jose (WhatsApp o email), marca la conversación como «humano» en el data store y deja de responder ahí hasta que Jose la libere.
6. Se guarda la conversación actualizada en el data store.

**Escenarios de automatización (servicio D):**
- **Pedir opinión**: X días después de un pedido completado en WooCommerce, se envía un WhatsApp o email pidiendo la reseña de Google.
- **Bienvenida a socios**: cuando hay un socio nuevo en Virtuagym, se le manda un WhatsApp de bienvenida.
- **Socios que dejan de venir**: con las visitas de Virtuagym, aviso a quien lleva X días sin ir.
- **Carritos abandonados**: más limitado. WooCommerce no lo avisa de serie y suele necesitar un plugin que envíe el aviso a Make por webhook.

**A tener en cuenta:**
- **Operaciones de Make:** cada mensaje gasta unas 5-8 operaciones (recibir, leer memoria, IA, responder, guardar). Calcular el plan de Make con el volumen real de mensajes de Jose antes de fijar la cuota. Make más la IA tiene que caber en los 59 €/mes del asistente y dejar margen.
- **Ventana de 24 h de Meta:** responder dentro de las 24 h desde el último mensaje del cliente es gratis. Los mensajes que se inician desde el negocio (bienvenida, recordatorios, pedir opinión) necesitan **plantillas aprobadas por Meta** y tienen un pequeño coste por mensaje.
- **Su número de WhatsApp:** comprobar la «coexistencia» (usar a la vez la app de WhatsApp Business en el móvil y la API) antes de prometérsela. Jose cree que tiene el negocio verificado en Meta Business.
- **Cuentas a nombre de Jose:** Make, Meta Business y la clave de la IA, con acceso para Brian. Así el cliente no pierde su WhatsApp si deja de trabajar con Brian.
- **Claves y tokens** solo en las conexiones de Make, nunca en el repositorio ni en el chat.

## Qué quiero hacer en este chat
1. **Antes de cerrar:** una maqueta rápida (portada, categoría, ficha de producto y página del gimnasio) con su estética (negro, rojo, Poppins y sus fotos), inspirada en la plantilla de Andrea. Debe poder enseñarse en una URL de prueba durante la llamada con Jose.
2. **Preparar la propuesta final en PDF** con los precios cerrados.
3. **Cuando cierre:** el plan de trabajo paso a paso para hacerlo en su WordPress sobre la copia de prueba.

Reglas:
- No me pidas permiso para cada paso.
- No subas contraseñas ni claves al repositorio.
- Trabaja en la rama que te indique la sesión.
