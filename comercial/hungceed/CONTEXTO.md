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

## Decisión técnica importante (decidir antes de construir)
Su tienda vive en **WooCommerce** y vende a diario. Mi plantilla de Andrea Salón es **Next.js + Supabase + Stripe**. Hay tres caminos:
1. **Maqueta en Next.js solo para enseñar.** Le enseñamos cómo quedaría portada, categorías, ficha de producto y página del gimnasio. Luego aplicamos ese diseño en su WordPress/WooCommerce y su tema. Es el más seguro: no toca pedidos, pagos ni Google.
2. **Next.js como escaparate conectado a WooCommerce** (se llama «headless»). Más bonito y rápido, pero mucho más trabajo: carrito, pago, cuentas de cliente y redirecciones para Google.
3. **Migrarlo todo fuera de WooCommerce.** No lo recomiendo: hay riesgo de perder pedidos, clientes y posicionamiento.

**Propuesta**: empezar por la opción 1 para cerrar la venta, y decidir la ejecución cuando Jose elija los servicios.

## Qué quiero hacer en este chat
1. Revisar la plantilla `andrea-salon/` y adaptarla a una **maqueta para Hungceed**:
   - portada con un solo mensaje claro;
   - menú por categorías y series;
   - una categoría con filtros y una ficha de producto limpia;
   - página del gimnasio con tarifas en tarjetas y botones «Apúntate» que lleven a Virtuagym;
   - botón de WhatsApp;
   - envíos y opiniones.
2. Usar su estética: negro, rojo, Poppins y fotos de su web.
3. Dejarla publicada en una URL de prueba para enseñársela a Jose en la llamada.
4. Después, preparar la propuesta final en PDF con los precios cerrados.

Reglas:
- No me pidas permiso para cada paso.
- No subas contraseñas ni claves al repositorio.
- Trabaja en la rama que te indique la sesión.
