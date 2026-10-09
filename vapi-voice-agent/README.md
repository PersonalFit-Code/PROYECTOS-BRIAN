# vapi-voice-agent

Servidor Express + TypeScript que atiende los webhooks del agente de voz de
[Vapi](https://docs.vapi.ai). Escucha en el puerto `3000`, responde siempre en
JSON y devuelve la configuracion de un asistente telefonico para una pizzeria
que toma pedidos, confirma la direccion de entrega y calcula el total.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # opcional: PORT, VAPI_SERVER_SECRET, PUBLIC_SERVER_URL, VAPI_MODEL
npm run dev            # desarrollo con recarga automatica (tsx watch)
```

Para produccion:

```bash
npm run build          # compila TypeScript a dist/
npm start              # arranca dist/index.js
```

## Scripts

| Script | Que hace |
| --- | --- |
| `npm run dev` | Servidor en desarrollo con recarga al guardar. |
| `npm run build` | Compila `src/` a `dist/`. |
| `npm start` | Arranca la version compilada. |
| `npm run typecheck` | Comprueba los tipos sin generar ficheros (tests incluidos). |
| `npm test` | Ejecuta los tests. |
| `npm run prueba:pedido [negocio]` | Manda un pedido de prueba al servidor local. |
| `npm run crear:negocio <id>` | Da de alta un negocio de ejemplo en Firestore. |

## El modelo: Claude Haiku 4.5, no 3.5

El asistente usa **`claude-haiku-4-5-20251001`**.

Claude 3.5 Haiku (`claude-3-5-haiku-20241022`) se retiro el **19 de febrero de
2026** y el proveedor `anthropic` de Vapi no ofrece ningun modelo 3.5, asi que
configurarlo haria fallar la llamada. Claude Haiku 4.5 es el equivalente actual
de esa gama: rapido y economico, que es lo que interesa cuando el cliente espera
al telefono. Los modelos que Vapi acepta estan en
[su pagina del proveedor Anthropic](https://docs.vapi.ai/providers/model/anthropic).

Para cambiarlo no hace falta tocar codigo: `VAPI_MODEL=<id>` en el `.env`.

## Rutas

### `POST /voice-webhook`

Punto de entrada del agente de voz. Espera un cuerpo JSON con la forma que
envia Vapi: `{ "message": { "type": "...", ... } }`.

Comportamiento segun `message.type`:

- **`assistant-request`** — devuelve `{ "assistant": { ... } }`: un asistente
  transitorio (Vapi lo usa para esa llamada y no lo guarda) con el modelo, el
  System Prompt, la voz, el transcriptor y la herramienta de calculo.
  Vapi corta esta peticion a los **7,5 segundos**, asi que la respuesta se
  construye en memoria, sin consultas a disco, red ni base de datos: tarda unos
  pocos milisegundos.
- **`tool-calls`** — ejecuta las herramientas pedidas y responde
  `{ "results": [{ "toolCallId", "name", "result" }] }`. Acepta los dos formatos
  que manda Vapi: el plano (`toolCallList`) y el estilo OpenAI (`toolCalls`, con
  los argumentos como objeto o como JSON en texto).
- **`function-call`** — formato antiguo de una sola funcion; responde
  `{ "result": "..." }`.
- **Eventos informativos** (`status-update`, `end-of-call-report`, `transcript`,
  `speech-update`, `conversation-update`, `user-interrupted`, `hang`) — responde
  `{ "received": true, "type": "..." }`.
- **Cualquier otro tipo** — responde `200` con `"handled": false` y lo registra
  en consola, para no cortar la llamada por un evento nuevo.

Errores: `400` si falta `message.type`, `401` si `VAPI_SERVER_SECRET` esta
definido y la cabecera `x-vapi-secret` no coincide.

### `GET /health`

Devuelve `{ "status": "ok", "uptime": <segundos> }`. Util para comprobaciones de
despliegue.

## El asistente

### Como toma el pedido

El System Prompt lleva un guion numerado que el agente sigue en orden: saluda,
toma el pedido plato a plato, **repite el pedido completo** y pide confirmacion,
pregunta si es reparto o recogida y, si es reparto, pide calle y numero, piso o
puerta y un telefono, **repite la direccion entera** y no sigue hasta que el
cliente la confirma. Despues llama a la herramienta del total, lee el desglose,
da el tiempo estimado y se despide.

### El total lo calcula el servidor

La herramienta **`calcular_total`** recibe los platos, las cantidades y el tipo
de entrega, y devuelve el desglose, el subtotal, los gastos de envio y el total:

```
Pedido: 2 x Pizza Margarita = 19,00 €; 1 x Pizza Cuatro Quesos = 12,50 €.
Subtotal: 31,50 €. Envio gratis por superar 20,00 €. Total a pagar: 31,50 €.
```

Esta en el servidor a proposito. Un modelo de lenguaje sumando precios de viva
voz se equivoca, y aqui el importe sale de la misma carta que el agente acaba de
leer. Los importes se guardan en centimos (`src/restaurant.ts`) para no
arrastrar errores de coma flotante, y el System Prompt le prohibe al agente
sumar por su cuenta. Si la herramienta falla, el agente no inventa un total: dice
que el importe exacto se confirma en la entrega.

### Datos del restaurante

`src/restaurant.ts` es la unica fuente de verdad: nombre, direccion, horarios,
carta con precios y gastos de envio. El System Prompt y el calculo del total se
generan de ahi, asi que **los precios no pueden descuadrarse** entre lo que el
agente dice y lo que se cobra. Para cambiar la carta se edita ese fichero y nada
mas.

> **Son datos de ejemplo.** La pizzeria, la direccion y las tres pizzas son de
> muestra; hay que sustituirlos por los reales antes de usar esto de verdad.

Carta de ejemplo: Pizza Margarita (9,50 €), Pizza Prosciutto e Funghi (11,90 €)
y Pizza Cuatro Quesos (12,50 €). Horario de martes a domingo, de 13:00 a 15:30 y
de 20:00 a 23:30. Envio 2,50 €, gratis a partir de 20,00 €.

El prompt incluye la fecha y hora actuales en la zona del restaurante, para que
el agente sepa si esta abierto y no tome pedidos fuera de horario.

### Voz y transcriptor

La configuracion trae Deepgram (`nova-3`, `es`) para transcribir y Azure
(`es-ES-ElviraNeural`) para la voz. La voz se cambia sin tocar codigo con
`VOZ_PROVEEDOR` y `VOZ_ID`: en el panel de Vapi, **Resources > Voice Library**,
se filtran las voces en espanol, se escuchan y se copia el identificador. Una
voz que Vapi no reconozca hace fallar la llamada entera; si deja de conectar
tras cambiarla, se vacian las dos variables.

`SONIDO_FONDO` pone ambiente detras de la voz: `office` (el de Vapi por
defecto), `off`, o la URL de un audio propio.

**`endCallPhrases` cuelga la llamada en cuanto el agente dice una de esas
frases, buscandolas como texto suelto.** Una llamada real se corto en mitad de
un pedido porque la lista llevaba `"adios"` y `"hasta luego"`. Por eso ahora
hay una sola frase larga (`FRASE_DE_DESPEDIDA` en `src/assistant.ts`), el
prompt le pide al agente que la diga tal cual para despedirse, y hay tests que
rechazan cualquier frase corta o corriente.

Los turnos de palabra (`stopSpeakingPlan` y `startSpeakingPlan` en
`src/assistant.ts`) estan ajustados para una conversacion fluida: el agente se
calla en cuanto el cliente habla (como una persona), pero un ruido corto no
basta para cortarlo, y contesta en cuanto el cliente termina la frase.

## Variables de entorno

| Variable | Por defecto | Para que sirve |
| --- | --- | --- |
| `PORT` | `3000` | Puerto HTTP. |
| `VAPI_SERVER_SECRET` | *(vacio)* | Secreto compartido con Vapi. Si esta vacio, el webhook **no** valida la cabecera `x-vapi-secret`; conviene definirlo antes de exponer el servidor a internet. Cuando esta definido, se incluye en `assistant.server.secret` para que Vapi lo mande en los tool-calls. |
| `PUBLIC_SERVER_URL` | *(vacio)* | URL publica del servidor, sin barra final. Si se define, el asistente le dice a Vapi que envie los tool-calls a `<url>/voice-webhook`. |
| `VAPI_MODEL` | `claude-haiku-4-5-20251001` | Modelo del asistente, entre los que acepta el proveedor `anthropic` de Vapi. |
| `VOZ_PROVEEDOR` | `azure` | Proveedor de la voz (`azure`, `11labs`, `cartesia`...), tal como aparece en la Voice Library de Vapi. |
| `VOZ_ID` | `es-ES-ElviraNeural` | Identificador de la voz dentro de ese proveedor. |
| `VOZ_MODELO` | `eleven_flash_v2_5` | Solo ElevenLabs. El flash es el rapido y el unico al que se le fuerza el espanol. |
| `VOZ_VELOCIDAD` | `1.05` | Solo ElevenLabs. De `0.7` a `1.2`; acepta coma decimal. Fuera de rango, el servidor no arranca. |
| `SONIDO_FONDO` | `office` | Ambiente detras de la voz: `office`, `off` o la URL de un audio. |
| `INTERRUPCION_PALABRAS` | `1` | Palabras del cliente para que el agente se calle. `0` es lo mas natural, pero con manos libres el agente se corta a si mismo. |
| `INTERRUPCION_SEGUNDOS` | `0.4` | Segundos de voz seguidos antes de callarse. Subelo si se entrecorta con ruido. |

## Probar en local

```bash
# Configuracion del asistente
curl -X POST http://localhost:3000/voice-webhook \
  -H 'Content-Type: application/json' \
  -d '{"message":{"type":"assistant-request","call":{"id":"call_123"}}}'

# Calculo del total
curl -X POST http://localhost:3000/voice-webhook \
  -H 'Content-Type: application/json' \
  -d '{"message":{"type":"tool-calls","toolCallList":[{"id":"t1",
       "name":"calcular_total","parameters":{"articulos":[
       {"plato":"margarita","cantidad":2}],"entrega":"reparto"}}]}}'
```

## Siguiente paso

Vapi necesita una URL publica, asi que durante el desarrollo hay que exponer el
puerto con un tunel (ngrok, Cloudflare Tunnel), ponerla en `PUBLIC_SERVER_URL` y
pegarla en el apartado *Server URL* del numero de telefono o de la organizacion
en Vapi. Para que llegue el `assistant-request`, el numero **no** debe tener un
`assistantId` fijo asignado.

Lo que todavia no hace: el pedido no se guarda en ningun sitio. El agente lo
toma, lo confirma y dice el total, pero al colgar no queda registrado. Para eso
hace falta decidir donde va (una base de datos, el TPV del restaurante, un aviso
por correo o Whatsapp) y añadir una herramienta `registrar_pedido` junto a
`calcular_total` en `src/routes/voiceWebhook.ts`.

## Desplegar en un servidor siempre encendido

Mientras el servidor corra en un portatil, el agente deja de atender al
cerrarlo. Para usarlo de verdad hay que ponerlo en algun sitio que no se
apague.

El repositorio trae un `Dockerfile` (dos etapas: compila con las dependencias
de desarrollo y publica solo lo necesario, sin correr como root) y un
`render.yaml`, asi que vale para Render, Railway, Fly o Cloud Run.

### Con Render, paso a paso

1. En https://dashboard.render.com, **New** -> **Blueprint**, y conecta este
   repositorio. Render lee `render.yaml` y crea el servicio.
2. Cuando termine, copia la URL que te asigna (algo como
   `https://vapi-voice-agent.onrender.com`).
3. En **Environment**, añade las cuatro variables, que no estan en el
   repositorio a proposito:

   | Variable | Que poner |
   | --- | --- |
   | `VAPI_SERVER_SECRET` | el mismo secreto que en Vapi |
   | `FIREBASE_SERVICE_ACCOUNT` | la cuenta de servicio en base64 (la misma del `.env`) |
   | `PUBLIC_SERVER_URL` | la URL de Render, **sin barra final** |
   | `PANEL_PASSWORD` | una contrasena para el panel |

4. Render reinicia solo. Comprueba `https://<tu-url>/health`.
5. En Vapi, pon como **Server URL** `https://<tu-url>/voice-webhook` y el
   mismo secreto.

`PUBLIC_SERVER_URL` es lo del huevo y la gallina: no la sabes hasta que
despliegas. Por eso se rellena despues, en el paso 3.

**No te saltes `PANEL_PASSWORD`.** Sin ella el panel se cierra a cualquiera
que no sea el propio servidor, asi que no lo podrias abrir; y lo peor seria
abrirlo sin contrasena, porque enseña direcciones y telefonos de clientes.

Los comandos `crear:negocio` y `prueba:pedido` no viajan en la imagen: son
herramientas de desarrollo. Se lanzan desde tu ordenador, que apunta a la
misma base de datos.

## Tests

```bash
npm test
```

Usan el ejecutor que trae Node, sin librerias de testing. Cubren lo que, si se
rompe, cuesta dinero o confianza:

- **El calculo del total**: umbrales de envio gratis (y el centimo justo por
  encima y por debajo), recogida, cantidades invalidas, platos fuera de carta
  y que los importes en centimos no acumulen errores de coma flotante.
- **La validacion de negocios** que llegan de Firestore, campo a campo.
- **El comienzo del dia** en la zona del negocio, con horario de verano e
  invierno, cruce de medianoche y varios husos.
- **El pedido que se guarda**: codigo sin caracteres que se confundan al
  telefono, direccion obligatoria en reparto, limpieza de los datos.
- **El resumen de la llamada**: duracion, que se guarde la URL duradera de la
  grabacion y no la que caduca, y que aguante eventos incompletos.

Los tests se comprobaron rompiendo el codigo a proposito (el umbral del envio,
el limite de cantidades y el alfabeto del codigo): los tres fallos los detecta.
No entran en `dist/`: el build usa `tsconfig.build.json`, que los excluye.

Lo que **no** cubren todavia: el webhook de punta a punta y el panel. Eso se
comprueba a mano contra un Firestore simulado.

## Grabacion de llamadas: apagada a proposito

Vapi graba las llamadas **por defecto**. Aqui se envia siempre el valor de
forma explicita y viene **desactivado**, porque grabar la voz de un cliente no
es una decision tecnica:

- En España, grabar una llamada con un cliente obliga a **informarle antes**
  de que empiece (RGPD y LOPDGDD), a guardar la grabacion solo el tiempo
  necesario y a poder borrarla si la pide.
- Esto no es asesoramiento legal. Antes de activarlo conviene mirarlo con
  quien lleve la proteccion de datos del restaurante.

Si decides activarlo, `GRABAR_LLAMADAS=si` en el `.env`. Entonces:

- Vapi graba y se guarda la URL de la grabacion junto al resumen de la llamada.
- El guion del agente incluye el aviso y lo dice **nada mas descolgar**, antes
  de tomar ningun dato.
- El servidor lo escribe al arrancar: `Grabacion de llamadas: ACTIVADA`.

Con la grabacion apagada **si se guarda la transcripcion** de la conversacion,
que es lo que sirve para resolver un "yo no pedi eso". Tambien es un dato
personal: se guarda en Firestore, en `/businesses/{id}/llamadas`.

La URL de la grabacion no es publica: para descargarla hace falta la clave de
la API de Vapi. Las URL firmadas que Vapi incluye en el evento no se guardan,
porque caducan.

## Sobre los avisos de `npm audit`

`npm install` avisa de **2 vulnerabilidades moderadas** en `uuid`, que llegan
por esta cadena:

```
firebase-admin -> @google-cloud/storage -> gaxios -> uuid@9
```

No nos afectan, y por eso no se fuerza la version:

- El fallo (GHSA-w5hq-g745-h8pq) esta en `uuid` v3, v5 y v6 cuando se les pasa
  un bufer. `gaxios` solo llama a `uuid.v4()`, y sin bufer.
- La cadena viene de Cloud Storage, que este proyecto no usa.
- Forzar una version distinta tocaria una dependencia interna de
  `firebase-admin`, lo que arriesga mas de lo que arregla.

Se resolvera solo cuando `firebase-admin` actualice `gaxios`. `npm audit fix`
no lo corrige (lo deja igual), y `--force` no se usa.

## Estructura

```
src/
  index.ts              arranque del servidor y cierre ordenado
  app.ts                creacion de la app Express y middlewares
  config.ts             variables de entorno y modelo por defecto
  restaurant.ts         datos del restaurante: carta, precios, horarios
  pedido.ts             calculo del total y texto que lee el agente
  assistant.ts          configuracion del asistente de Vapi y System Prompt
  routes/
    voiceWebhook.ts     POST /voice-webhook y resolucion de herramientas
  types/
    vapi.ts             tipos minimos del payload de Vapi
```
