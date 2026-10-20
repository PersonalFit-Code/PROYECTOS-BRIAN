# Setter por Instagram para infoproductores — plan

Estado: **plan**, sin código todavía. Fecha: 20-10-2026.

## Qué es

Un asistente que contesta los DMs de Instagram de un infoproductor (cursos,
mentorías, coaching, consultoría) al momento y a cualquier hora:

1. **Atiende**: responde con la información que el cliente ha aprobado (qué
   vende, cuánto cuesta, cómo funciona, si quedan plazas).
2. **Cualifica**: hace las preguntas que decide el cliente (qué busca, en qué
   momento está, si puede invertir) y decide si encaja.
3. **Agenda**: a quien encaja le ofrece huecos reales de la agenda del cliente
   y deja la llamada de venta cerrada en la misma conversación.
4. **Pasa a una persona** lo que no sabe resolver, con el contexto, y el
   cliente puede entrar en cualquier conversación y quedarse con ella.

Para quién: infoproductores de Ourense y alrededores, para empezar. Se vende
como servicio (puesta en marcha + cuota mensual), igual que Noah.

El modelo de negocio es el de neuro·node. La web, los textos, el nombre y el
diseño son nuestros: no se copia nada de su sitio.

## Dónde vive el código

Como **tercer modo del servidor de Noah** (`vapi-voice-agent/`), junto a
"pedido" y "cita", y no como proyecto nuevo:

| Ya existe en Noah | Lo que aporta al setter |
|---|---|
| `src/citas/huecos.ts` | Huecos libres a partir del horario y lo ocupado. Puro y probado. |
| `src/google/calendario.ts` | freeBusy + crear evento idempotente en Google Calendar. |
| `src/db/` (Firestore) | Negocios multi-cliente, con alta por script. |
| `src/routes/panel.ts` | Panel con contraseña, ya desplegado. |
| `render.yaml` | Servidor siempre encendido en Frankfurt. |

Un servidor siempre encendido es justo lo que pide Meta: hay que contestar
`200` al webhook en el acto y procesar el mensaje después. En Vercel eso
obliga a trucos; en Render es un `res.sendStatus(200)` y seguir trabajando.

Lo que cambia respecto a Noah: hay **conversación con memoria** (días, no una
llamada de 3 minutos), así que cada conversación se guarda en Firestore.

## Las reglas de Meta que mandan en el diseño

- **API de Instagram con inicio de sesión de Instagram.** La cuenta del cliente
  tiene que ser profesional (empresa o creador). Permisos:
  `instagram_business_basic` + `instagram_business_manage_messages`.
- **Piloto sin revisión de Meta.** Con acceso estándar, la app funciona con las
  cuentas que tienen un rol en ella. Se añade la cuenta del cliente como
  tester y sus leads le escriben con normalidad.
- **Para tener varios clientes, revisión de Meta.** Acceso avanzado + verificación del negocio
  (de Brian). Se pide en cuanto el piloto funcione: tarda semanas y exige un
  vídeo del flujo funcionando.
- **Ventana de 24 horas.** El bot solo puede escribir en las 24 h siguientes al
  último mensaje del lead. El "me lo pienso" se sigue **dentro** de esa
  ventana (un recordatorio a las ~20 h). Pasado ese tiempo, solo una persona
  puede escribir, hasta 7 días, con la etiqueta `HUMAN_AGENT` (permiso aparte,
  con su propia justificación en la revisión).

## Lo que no es negociable

- **Avisa de que es un asistente.** La ley europea de IA (artículo 50, en vigor
  desde agosto de 2026) obliga a decir que quien contesta es una IA. Va en el
  primer mensaje de cada conversación.
- **Solo dice lo que el cliente ha aprobado.** Precio, condiciones, garantías:
  salen de la ficha del cliente. Si no está en la ficha, no lo inventa: pasa
  la conversación a una persona.
- **Nunca promete resultados** ("vas a facturar X") aunque el lead lo pida.
- **El hueco lo calcula el servidor**, como en Noah. El modelo solo lo ofrece.
- **Cualquier persona puede pararlo**: el cliente escribe desde la app de
  Instagram y el bot se calla en esa conversación hasta que lo reactive.
- **Datos**: los DMs son datos personales. Se guarda lo justo, en la UE
  (Firestore `eur3`), con encargo de tratamiento firmado con cada cliente.

## El flujo de una conversación

```
DM del lead ──► webhook /instagram ──► 200 al momento
                     │
                     ▼
     ¿El cliente ha tomado el control?  ── sí ──► no hace nada
                     │ no
                     ▼
     Claude con: ficha del cliente + criterios + historial
     y herramientas: buscar_huecos, reservar_cita, pasar_a_persona,
                     marcar_cualificado / marcar_descartado
                     │
                     ▼
     Respuesta por la API de Instagram ──► se guarda en la conversación
```

Estados de un lead: `nuevo → en_conversacion → cualificado → cita_cerrada`,
o `descartado`, o `con_persona`.

## La ficha de cada cliente

Lo que se rellena en la llamada de puesta en marcha:

- Quién es y qué vende: producto, precio, formato, duración, garantía.
- Preguntas frecuentes con su respuesta.
- **Criterios de cualificación**: qué tiene que cumplir alguien para que se le
  ofrezca llamada (ej.: "tiene un negocio en marcha", "puede invertir
  1.500 €"), y qué hace que se descarte.
- Qué se hace con quien no encaja (recurso gratuito, lista de espera...).
- Tono: tú o usted, emojis sí o no, cómo se presenta.
- Agenda: calendario de Google, franjas, duración de la llamada de venta.
- Qué temas pasan siempre a una persona.

## Fases

1. **Simulador sin red** (como `npm run probar:citas`). Ficha de un cliente de
   ejemplo, conversación escrita en la terminal, cualificación y cita contra
   una agenda falsa. Sirve para afinar el prompt **y para enseñarlo en las
   llamadas comerciales** antes de que haya ningún cliente.
2. **Instagram real con la cuenta de Brian.** App de Meta, webhook,
   envío de respuestas, ventana de 24 h, el cliente toma el control.
3. **Panel**: conversaciones, estado de cada lead, botón "tomar el control",
   y lo que cuesta cada cliente al mes en Claude.
4. **Revisión de Meta** para acceso avanzado, con el vídeo del flujo.
5. **Comercial**: lista de infoproductores de Ourense (como
   `comercial/clinicas/`), guion de llamada y dossier.

Después, si hace falta: WhatsApp (API Cloud), Calendly, Stripe.

## Lo que hace falta de Brian

- Una **cuenta de Instagram profesional** para probar (puede ser la suya).
- Una **cuenta de desarrollador de Meta** y, para la fase 4, el negocio
  verificado en Meta (NIF o alta de autónomo).
- Un **infoproductor de ejemplo** creíble para el simulador: si no hay uno
  real, se inventa uno con su ficha completa y se marca como ejemplo.
