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
| `npm run crear:clinica <id> <calendario>` | Da de alta un negocio de **cita** (dental, estetica) en Firestore. |
| `npm run probar:citas [negocio]` | Simula una llamada de cita entera y la imprime. Sin red, sin Google. |

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

**Como se cuelga la llamada.** Lo hace el modelo, con la herramienta `endCall`
de Vapi, que va en `model.tools` junto a las dos propias. Cuando colgar se le
dice en el System Prompt, porque esa herramienta no admite descripcion propia:
sus unicos campos son `type`, `messages` y `rejectionPlan`, y mandarle
cualquier otro (`function`, `server`, `name`) arriesga que Vapi rechace el
asistente entero y la llamada no conecte.

**No volver a usar `endCallPhrases`.** Dio los dos fallos opuestos en llamadas
reales. Con `"adios"` y `"hasta luego"` en la lista, cortaba la llamada en
mitad de un pedido, porque Vapi busca esas frases como subcadena de lo que
transcribe del asistente. Con una frase larga paso lo contrario: al modelo le
basto con meter una coma para que no casara, y la linea se quedo abierta hasta
el corte por silencio. `endCallMessage` si se queda: es lo que se dice al
colgar, y sin el cuelga en silencio.

Los turnos de palabra (`stopSpeakingPlan` y `startSpeakingPlan` en
`src/assistant.ts`) estan ajustados para una conversacion fluida: el agente se
calla en cuanto el cliente habla (como una persona), pero un ruido corto no
basta para cortarlo, y contesta en cuanto el cliente termina la frase.

## El otro modo: dar cita en vez de tomar pedido

El mismo servidor atiende dos clases de negocio. Lo decide un campo del
documento de Firestore: **`modo: "citas"`**. Sin ese campo es un negocio de
pedidos, con la carta y el total de arriba; con el es un negocio que da hora, y
entonces el agente tiene otras dos herramientas y otras instrucciones.

Sirve para cualquiera que viva de la agenda: una clinica dental, un centro de
estetica, una fisioterapia, una peluqueria. Lo que cambia entre ellos no es el
motor, son tres campos:

| | Clinica dental | Centro de estetica |
| --- | --- | --- |
| `precioCentimos` en cada tratamiento | sin poner: el precio depende de lo que vea el dentista | puesto: es cerrado y es lo primero que preguntan |
| `urgencias` | puesto: alguien con dolor hay que derivarlo | sin poner: no hay nada que derivar |
| `comoLlamarAlCliente` | `"paciente"` | `"clienta"` |

Si `precioCentimos` esta vacio, el agente tiene prohibido dar precio y remite al
negocio. Si `urgencias` esta vacio, no se le pone ninguna frase: ante un dolor
no valora nada, recoge nombre y telefono y dice que le llaman. Las dos cosas por
el mismo motivo: el agente no puede improvisar nada que el negocio no haya
escrito.

### Las dos herramientas

**`buscar_huecos`** lee el calendario de Google del negocio, calcula los huecos
libres con la duracion de ese tratamiento y devuelve hasta tres, ya redactados
para leerlos en voz alta:

```
Huecos libres para una manicura: [1] hoy a las diez de la manana, [2] hoy a las
cuatro de la tarde o [3] manana a las diez de la manana.
```

El agente **no puede decir ninguna hora que no venga de aqui**. Los huecos los
calcula el servidor a partir de las franjas, el margen entre citas y la
antelacion minima que tenga puesto el negocio, igual que el total de un pedido
lo calcula el servidor y no el modelo.

**`reservar_cita`** escribe la cita. Antes de escribir **vuelve a leer el
calendario**: entre que se ofrecio el hueco y la persona se decidio han pasado
minutos, y en ese rato alguien del negocio ha podido dar esa misma hora en mano.
Si ya no esta libre, no escribe nada y el agente no confirma. Solo se le
confirma la cita a quien llama cuando esta herramienta dice que esta puesta.

### Probarlo sin tocar nada

```bash
npm run probar:citas            # centro de estetica
npm run probar:citas pontenova  # clinica dental
```

Imprime la llamada entera: lo que oye quien llama, lo que devuelve cada
herramienta, lo que quedaria escrito en el calendario, y que pasa cuando piden
algo que el negocio no hace, cuando llaman con dolor, cuando les pisan el hueco
y cuando Google no contesta. Al final imprime las instrucciones completas que
recibe el modelo: merece la pena leerlas una vez, porque todo lo que el agente
diga por telefono sale de ahi.

El calendario es de mentira. Eso quiere decir que esto **no** prueba que Google
acepte la cita, ni que el modelo elija bien la herramienta, ni como suena la
voz. Para eso hace falta una llamada de verdad contra un calendario de verdad.

Para probarlo tambien por HTTP, sin base de datos: `NEGOCIO_DE_EJEMPLO=airea` en
el `.env`, `npm run dev`, y el webhook sirve ese centro.

### Dar de alta uno de verdad

```bash
npm run crear:clinica                               # los lista
npm run crear:clinica airea negocio@gmail.com       # lo guarda en Firestore
```

Y hay tres pasos que no hace el script:

1. **El negocio comparte su calendario** con el correo de la cuenta de servicio,
   con permiso *Realizar cambios en los eventos*. El script lo imprime al
   acabar. Sin esto, Google devuelve 200 y una lista de ocupados vacia, que
   leido a la ligera parece "toda la semana libre": por eso el cliente de
   calendario falla a proposito cuando el calendario no aparece en la
   respuesta, en vez de dar hora a ciegas.
2. **La Google Calendar API habilitada** en el proyecto de Google Cloud.
3. **El `calendarId` de verdad**, nunca `"primary"`. Autenticados como la cuenta
   de servicio, `primary` es el calendario de la propia cuenta: las citas se
   crearian sin error en una agenda que no mira nadie, y no te enteras hasta que
   aparece alguien a deshora. El validador lo rechaza.

La cita se crea **sin invitados**. Una cuenta de servicio sin delegacion no
puede invitar a nadie (Google devuelve 403 `forbiddenForServiceAccounts`), y
tampoco interesa: el telefono y el nombre van en la descripcion del evento, que
es donde los mira quien atiende.

## Antes de una visita a un cliente

```
bash scripts/antes-de-salir.sh
```

Recorre la cadena entera igual que la recorre una llamada real: servidor,
tunel, el webhook con el secreto (y que lo rechace sin el) y el panel con la
contrasena. Dice SAL o NO SALGAS y, si falla algo, que hacer. Pensado para
mientras el servidor viva en el portatil con ngrok.

## Desplegar en Google Cloud Run

```
bash scripts/desplegar.sh
```

Lee las claves del `.env`, las sube como variables del servicio y devuelve la
direccion fija. Se puede repetir para publicar cambios. La region es
`europe-west1` porque Google la cuenta dentro del nivel gratuito y esta en
Europa, como la base de datos.

El fichero con las claves que se genera para pasarselas a `gcloud` se borra al
terminar, pase lo que pase.

Render tambien vale (`render.yaml` en la raiz), pero **su plan gratuito no
sirve**: duerme el servicio a los 15 minutos y tarda cerca de un minuto en
despertar, y una llamada entrante no espera tanto.

## Variables de entorno

| Variable | Por defecto | Para que sirve |
| --- | --- | --- |
| `PORT` | `3000` | Puerto HTTP. |
| `VAPI_SERVER_SECRET` | *(vacio)* | Secreto compartido con Vapi. Si esta vacio, el webhook **no** valida la cabecera `x-vapi-secret`; conviene definirlo antes de exponer el servidor a internet. Cuando esta definido, se incluye en `assistant.server.secret` para que Vapi lo mande en los tool-calls. |
| `PUBLIC_SERVER_URL` | *(vacio)* | URL publica del servidor, sin barra final. Si se define, el asistente le dice a Vapi que envie los tool-calls a `<url>/voice-webhook`. |
| `VAPI_MODEL` | `claude-haiku-4-5-20251001` | Modelo del asistente, entre los que acepta el proveedor `anthropic` de Vapi. |
| `NOMBRE_AGENTE` | `Noah` | Nombre con el que se presenta la asistente. Un negocio puede llevar el suyo con el campo `nombreAgente` en Firestore. |
| `VOZ_PROVEEDOR` | `azure` | Proveedor de la voz (`azure`, `11labs`, `cartesia`...), tal como aparece en la Voice Library de Vapi. |
| `VOZ_ID` | `es-ES-ElviraNeural` | Identificador de la voz dentro de ese proveedor. |
| `VOZ_MODELO` | `eleven_flash_v2_5` | Solo ElevenLabs. El flash es el rapido y el unico al que se le fuerza el espanol. |
| `VOZ_VELOCIDAD` | `1.05` | Solo ElevenLabs. De `0.7` a `1.2`; acepta coma decimal. Fuera de rango, el servidor no arranca. |
| `SONIDO_FONDO` | `office` | Ambiente detras de la voz: `office`, `off` o la URL de un audio. |
| `INTERRUPCION_PALABRAS` | `1` | Palabras del cliente para que el agente se calle. `0` es lo mas natural, pero con manos libres el agente se corta a si mismo. |
| `INTERRUPCION_SEGUNDOS` | `0.4` | Segundos de voz seguidos antes de callarse. Subelo si se entrecorta con ruido. |
| `NEGOCIO_DE_EJEMPLO` | *(vacio)* | Negocio de muestra que se sirve **si no hay Firestore**, para poder probar una llamada real sin base de datos: `lavitabuona` o `tixola` (pedidos), `pontenova` o `airea` (citas). Con `FIREBASE_SERVICE_ACCOUNT` puesto se ignora. |

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
   | `PANEL_PASSWORD` | una contrasena para el panel  **Obligatoria para abrir el panel desde el movil o desde fuera**: sin ella solo responde al propio ordenador, y una peticion reenviada por un tunel nunca cuenta como local. |

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
- **Los huecos de la agenda**: que el dia avance por fecha y no sumando 24
  horas (el cambio de hora lo moveria), el margen entre citas por los dos
  lados, la antelacion minima y que las tres opciones no salgan seguidas.
- **Las horas dichas en voz alta**: "las diez menos cuarto de la manana",
  hoy / manana / pasado manana / el jueves 29 de octubre, y los precios en
  palabras sin ningun simbolo.
- **El cliente de Google Calendar**: que **falle** cuando el calendario no
  viene en la respuesta (Google devuelve 200 y una lista vacia cuando no esta
  compartido, y leerlo como "todo libre" duplica citas), que no mande nunca
  invitados y que un reintento no cree la cita dos veces.
- **Las dos herramientas de cita**: que no se de hora si el calendario falla,
  que no se confirme una cita que no se ha escrito, y que una urgencia se
  derive con la frase literal del negocio y solo con esa.
- **Una llamada de cita de punta a punta por HTTP** (`citas-webhook.test.ts`):
  se levanta el servidor y se le mandan los mismos cuerpos que manda Vapi, con
  su forma de los tool-calls incluida, porque ahi es donde se rompio la primera
  llamada real del modo pedidos.

Los tests se comprobaron rompiendo el codigo a proposito (el umbral del envio,
el limite de cantidades y el alfabeto del codigo): los tres fallos los detecta.
No entran en `dist/`: el build usa `tsconfig.build.json`, que los excluye.

Lo que **no** cubren: nada que necesite la red de verdad. El calendario de los
tests es de mentira, asi que **que Google acepte lo que le mandamos solo lo
prueba una cita real en un calendario real**. El panel se comprueba a mano.

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
  pedido.ts             calculo del total y texto que lee el agente
  assistant.ts          asistente de Vapi y System Prompt, modo pedidos
  assistantCitas.ts     asistente de Vapi y System Prompt, modo citas
  citas/
    huecos.ts           de que esta ocupado a que huecos se pueden ofrecer
    decir.ts            horas, dias y precios dichos en castellano
    herramientas.ts     buscar_huecos y reservar_cita
  google/
    calendario.ts       cliente de Calendar, con las dependencias inyectadas
    cliente.ts          el mismo, montado con la credencial de verdad
    credencial.ts       lectura de la cuenta de servicio (JSON o base64)
  db/
    businesses.ts       unico sitio desde el que se lee Firestore
    types.ts            Business: negocio de pedidos
    clinica.ts          Clinica: negocio de cita
    validarClinica.ts   comprobacion de la ficha de un negocio de cita
    orders.ts           pedidos guardados
    calls.ts            resumen de cada llamada
  routes/
    voiceWebhook.ts     POST /voice-webhook y resolucion de herramientas
    panel.ts            panel de pedidos
  util/
    zona.ts             zonas horarias sin libreria, a prueba de cambio de hora
  types/
    vapi.ts             tipos minimos del payload de Vapi
scripts/
  crear-negocio.ts      alta de un negocio de pedidos
  crear-clinica.ts      alta de un negocio de cita
  probar-citas.ts       simulacion de una llamada de cita, para leerla
```
