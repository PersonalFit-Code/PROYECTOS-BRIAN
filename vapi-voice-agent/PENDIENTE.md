# Lo que queda para Noah (La Vita Buona)

Apuntado el 24 de octubre de 2026. Por orden de prioridad dentro de cada bloque.

## 1. Probar lo de ayer (lo primero mañana)
- [ ] Pedido grande (7-8 cosas, a domicilio): comprobar que calcula el total y registra.
      Arreglado: el tope de 250 tokens de Vapi cortaba la lista de platos.
- [ ] "Una 4 quesos": tiene que preguntar si es la pizza 5 formaggio o los gnocchi.
- [ ] Telefono "este mismo": tiene que decir "el que acaba en ...".
- [ ] Fondo nuevo: `SONIDO_FONDO=pizzeria`. Si no se oye, puede ser ngrok gratis.
- [ ] Voz: ¿suena mas natural? Si no, elegir otra voz en la Voice Library de ElevenLabs.
- [ ] Fin de turno mas rapido (`FIN_DE_TURNO=texto`): si pisa al cliente, volver a `vapi`.
- [ ] `npm run costes`: coste real por minuto, para confirmar el margen de los planes.

## 2. Para ponerlo a funcionar de verdad
- [ ] Pedir YA el numero espanol en Twilio (pide DNI y direccion en Espana; tarda dias). Luego en Vapi: Phone Numbers > Import > Twilio.
- [ ] Cuenta en Render, plan Starter (~7 €/mes). NO el gratis: se duerme y la primera llamada falla.
- [ ] Vapi: meter saldo y activar la recarga automatica.
- [ ] Mirar en Vapi si la voz de ElevenLabs va con clave propia (se paga en ElevenLabs) o por Vapi.
- [ ] Servidor siempre encendido (Render o Railway). Desbloquea tablet, panel desde fuera y el fondo sin ngrok.
- [ ] Numero espanol +34 (Twilio o Telnyx) y conectarlo a Vapi.
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
- [ ] Hoja de planes del dossier: ajustar si `npm run costes` dice que no hay margen.
- [ ] Dossier dental: repasar las afirmaciones que no se pueden comprobar.
