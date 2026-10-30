# Lo que queda para Noah (La Vita Buona)

Apuntado el 24 de octubre de 2026. Por orden de prioridad dentro de cada bloque.

## 1. Probar lo de ayer (lo primero mañana)
- [ ] Pedido grande (7-8 cosas, a domicilio): comprobar que calcula el total y registra.
      Arreglado: el tope de 250 tokens de Vapi cortaba la lista de platos.
- [ ] "Una 4 quesos": tiene que preguntar si es la pizza 5 formaggio o los gnocchi.
- [ ] Telefono "este mismo": tiene que decir "el que acaba en ...".
- [x] Petardeo en la llamada: era stability 0,4 en la voz. Vuelta a 0,5 y suena limpia (25-10).
- [ ] Fondo: de momento `SONIDO_FONDO=off`. El de pizzeria (murmullo sin tecleo) queda para probar con calma.
- [ ] Voz mas natural: probar otra voz de la Voice Library (espanol de Espana), sin tocar stability.
- [ ] Fin de turno mas rapido (`FIN_DE_TURNO=texto`): si pisa al cliente, volver a `vapi`.
- [ ] `npm run costes`: coste real por minuto, para confirmar el margen de los planes.

## 2. Para ponerlo a funcionar de verdad
SOLO SI OUMAR DICE QUE SI (antes no se gasta nada):
- [ ] Numero espanol en Twilio. Comprobado en twilio.com el 30-10-2026:
      - Fijo local 988 (Ourense): 5,50 $/mes. Pide NIF/CIF + justificante de una direccion
        DENTRO de la provincia del prefijo (DNI con domicilio, factura de luz, recibo de alquiler,
        escritura o, si es empresa, la escritura/registro). Direccion completa: calle, numero,
        portal, piso, puerta, CP, pueblo y provincia.
      - Mejor a nombre del LOCAL (su CIF o NIF de autonomo y la direccion del local): cuadra con
        "cuentas a su nombre" de la opcion B y la direccion ya esta en Ourense.
      - Hay que pasar la cuenta de Twilio de prueba a de pago (meter saldo) antes de comprar.
      - Los +34 400 son solo para llamadas comerciales salientes: no nos afectan (Noah solo recibe).
      - Precio por minuto de recibir en un fijo espanol: no sale en la web, mirarlo en la consola.
      Luego en Vapi: Phone Numbers > Import > Twilio (el SID y el token los pega Brian, nunca en el chat).
- [ ] Cuenta en Render, plan Starter (~7 €/mes). NO el gratis: se duerme y la primera llamada falla.
- [ ] Vapi: meter saldo y activar la recarga automatica.
Para la demo basta lo de ahora: tu ordenador, ngrok y el numero gratis de Vapi.
- [ ] Mirar en Vapi si la voz de ElevenLabs va con clave propia (se paga en ElevenLabs) o por Vapi.
- [ ] Servidor siempre encendido (Render o Railway). Desbloquea tablet, panel desde fuera y el fondo sin ngrok.
- [ ] El local desvia su telefono a Noah ("si no contestas o comunica").
- [ ] `PANEL_PASSWORD` puesta.
- [ ] Pasar de `lavitabuona-prueba` a `lavitabuona` (horario real).
- [ ] Aviso si el servidor se cae.
- [ ] Contrato de encargado del tratamiento (RGPD) para el local.

## 3. Datos que hay que confirmar con Oumar
- [ ] Horario real (la web y el Faro de Vigo no coinciden).
- [ ] Gastos de envio, minimo para envio gratis y zona de reparto.
- [ ] Precio de las bebidas en el local (ahora son los de Glovo) y si hay mas (cerveza, vino).
- [ ] Que postre quiere que ofrezca Noah.
- [ ] Cuantas personas come cada pizza (para recomendar cuanto pedir).
- [ ] Cuantas pizzas caben a la vez en el horno y cuanto tarda una hornada. Ahora se calcula: hasta 4 platos, el tiempo de la ficha; cada 3 mas, +5 min (src/pedido.ts).
- [ ] Preguntas frecuentes: aparcamiento, sin gluten, grupos grandes.

## 4. Mejoras del bot
- [ ] Recomendar acompanamiento segun lo que pide (entrante si pide pizzas, bebida si no pide, postre tras pasta). Una sola por pedido.
- [ ] Pedidos para una hora concreta ("para las 21:30"), destacado en el panel.
- [ ] Cuanto pedir segun cuantos son (necesita el dato de Oumar).
- [ ] Respuestas a preguntas del local (necesita el dato de Oumar).
- [ ] Pantalla de historial de llamadas en el panel (las llamadas ya se guardan con su transcripcion).
- [ ] Bajar el coste por minuto: la carta entera va en cada turno; probar a acortarla o cachearla.
- [ ] El asistente de clinicas tiene el mismo fallo de fin de turno (smartEndpointingPlan anula los tiempos).

## 5. Comercial
- [ ] Modelo elegido: opcion B (implantacion 1.200 €, pago unico + mantenimiento 100 €/mes con servidor y numero; las llamadas las paga el local a precio de coste, cuentas a su nombre). Tablet descartada.
- [ ] El mantenimiento promete "si algo falla, me entero yo antes": hay que tener el aviso de caida del servidor antes de cobrarlo.
- [ ] Hoja de planes del dossier: ajustar si `npm run costes` dice que no hay margen.
- [ ] Dossier dental: repasar las afirmaciones que no se pueden comprobar.
