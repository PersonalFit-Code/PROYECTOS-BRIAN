# Asistente de WhatsApp y automatizaciones de Hungceed: se hacen en Make

Lo que decidió Brian el 3/11/2026. Todo el asistente de IA y las automatizaciones se montan en
Make (make.com), que Brian ya tiene conectado. Nada de código propio en servidor.

## Módulos de Make

| Módulo | Para qué |
| --- | --- |
| WhatsApp Business Cloud | Recibe los mensajes y envía las respuestas, con la API oficial de Meta |
| Claude (o OpenAI) | Genera la respuesta con la información del negocio |
| WooCommerce | Consulta pedidos por número o email |
| Virtuagym | Socios nuevos, visitas y membresías del gimnasio |
| Data store de Make | Guarda la conversación de cada número para que la IA tenga memoria |

## Escenario 1 · Asistente de WhatsApp (tienda + gimnasio)

1. Llega un mensaje a su WhatsApp (módulo «Watch events» de WhatsApp Business Cloud).
2. Make recupera del data store los últimos mensajes de ese número.
3. La IA responde con su base de conocimiento:
   - preguntas frecuentes sacadas de sus conversaciones exportadas (15–20 chats típicos);
   - catálogo y series;
   - envíos, garantías y devoluciones;
   - tarifas y horarios del gimnasio, con el enlace a cada tarifa de Virtuagym.
4. Si pregunta por un pedido, Make lo busca en WooCommerce por número de pedido o email y
   le da el estado.
5. Si es una queja, un pedido especial, un presupuesto para equipar un centro o la IA no
   sabe responder: avisa a Jose (WhatsApp o email), marca la conversación como «humano» en
   el data store y deja de responder ahí hasta que Jose la libere.
6. Se guarda la conversación actualizada en el data store.

## Escenarios de automatización (servicio D)

- **Pedir opinión:** X días después de un pedido completado en WooCommerce, WhatsApp o
  email pidiendo la reseña de Google.
- **Bienvenida a socios:** socio nuevo en Virtuagym → WhatsApp de bienvenida.
- **Socios que dejan de venir:** con las visitas de Virtuagym, aviso a quien lleva X días
  sin ir.
- **Carritos abandonados:** más limitado. WooCommerce no lo avisa de serie; suele hacer
  falta un plugin que mande el aviso a Make por webhook.

## Lo que cuesta cada mes (para fijar la cuota)

### Operaciones de Make

Cada mensaje gasta **5–8 operaciones** (recibir, leer memoria, IA, responder, guardar).
Planes de Make a 3/11/2026 (make.com/pricing, pago mensual, en dólares):

| Plan | Al mes | Operaciones | Extra |
| --- | --- | --- | --- |
| Free | 0 $ | 1.000 | — |
| Core | 12 $ | 10.000 | 12 $ por cada 10.000 más |
| Pro | 21 $ | 10.000 | 21 $ por cada 10.000 más |

Para el asistente basta **Core**. Con pago anual sale algo más barato.

| Mensajes al día | Mensajes al mes | Operaciones (×6,5) | Plan |
| --- | --- | --- | --- |
| 10 | 300 | ~2.000 | Core (10.000) |
| 30 | 900 | ~6.000 | Core (10.000) |
| 50 | 1.500 | ~10.000 | Core, justo; 20.000 a 24 $ |
| 100 | 3.000 | ~20.000 | Core con 20.000 (24 $) |

Las automatizaciones (opinión, bienvenida, inactivos) gastan 2–4 operaciones por envío:
con 100 envíos al mes, 400 operaciones. Despreciable al lado del asistente.

**PENDIENTE:** preguntar a Jose cuántos mensajes recibe al día y revisar el plan antes de
fijar la cuota. Make más la IA tiene que caber en los 59 €/mes del asistente y dejar margen.

### La IA

Con un modelo rápido (Claude Haiku o equivalente) y unos 2.000 tokens por respuesta (base
de conocimiento + memoria + respuesta), un mensaje cuesta décimas de céntimo. 1.500 mensajes
al mes: del orden de 2–5 €. La estimación de Brian de 20–40 €/mes para IA y conexión queda
holgada.

### Lo que cobra Meta por mensaje (España, sin IVA)

**OJO, esto cambió el 1 de octubre de 2026.** Antes, responder dentro de las 24 h desde el
último mensaje del cliente era gratis. Ahora:

| Tipo | Qué es | Precio por mensaje entregado |
| --- | --- | --- |
| Servicio | Respuesta dentro de las 24 h (lo que hace el asistente) | **1.000 gratis al mes por número**; después 0,0166 € |
| Utilidad | Pedido, envío, cita (plantilla aprobada) | 0,0166 € |
| Marketing | Promoción, pedir opinión, reenganche (plantilla aprobada) | 0,0585 € |

Fuente: Meta, «Pricing on the WhatsApp Business Platform», y el resumen de ManyContacts del
15/9/2026 con las tarifas de España. Verificar en developers.facebook.com antes de fijar nada.

Qué significa para Jose:

- Asistente: si contesta menos de 1.000 mensajes al mes, Meta no cobra nada. Con 1.500
  respuestas, unos 8 € al mes. Es poco, pero ya no es cero.
- Bienvenida y recordatorios a socios: plantillas de **utilidad**, 0,0166 € cada una
  (100 socios nuevos = 1,66 €).
- Pedir opinión y carrito abandonado: Meta las clasifica como **marketing**, 0,0585 €
  cada una (200 al mes = 11,70 €).

### Cuenta orientativa del asistente (1.500 mensajes al mes)

| Concepto | Al mes |
| --- | --- |
| Make Core | ~11 € |
| IA | ~3–5 € |
| Meta (500 respuestas de pago) | ~8 € |
| **Total** | **~22–25 €** |

Cabe en los 59 €/mes con margen. Con 3.000 mensajes al mes sube a ~45 €, y entonces hay que
revisar la cuota.

## A tener en cuenta antes de prometer nada

- **Coexistencia del número:** comprobar que puede usar a la vez la app de WhatsApp Business
  en el móvil y la API. Jose cree que tiene el negocio verificado en Meta Business.
- **Plantillas:** todo mensaje que inicia el negocio (bienvenida, recordatorio, pedir opinión)
  necesita una plantilla aprobada por Meta. Se piden en la primera semana.
- **Cuentas a nombre de Jose:** Make, Meta Business y la clave de la IA, con acceso para
  Brian. Si deja de trabajar con Brian, no pierde su WhatsApp.
- **Claves y tokens solo en las conexiones de Make.** Nunca en el repositorio ni en el chat.
