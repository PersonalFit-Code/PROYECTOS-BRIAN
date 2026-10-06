# vapi-voice-agent

Servidor Express + TypeScript que atiende los webhooks del agente de voz de
[Vapi](https://docs.vapi.ai). Escucha en el puerto `3000` y responde siempre en
JSON.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # opcional: ajustar PORT y VAPI_SERVER_SECRET
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
| `npm run typecheck` | Comprueba los tipos sin generar ficheros. |

## Rutas

### `POST /voice-webhook`

Punto de entrada del agente de voz. Espera un cuerpo JSON con la forma que
envia Vapi:

```json
{ "message": { "type": "tool-calls", "call": { "id": "..." }, "toolCalls": [] } }
```

Comportamiento segun `message.type`:

- **`tool-calls`** — ejecuta cada herramienta pedida y responde con
  `{ "results": [{ "toolCallId": "...", "result": "..." }] }`, que es el formato
  que Vapi lee para devolver el resultado al modelo.
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

## Variables de entorno

| Variable | Por defecto | Para que sirve |
| --- | --- | --- |
| `PORT` | `3000` | Puerto HTTP. |
| `VAPI_SERVER_SECRET` | *(vacio)* | Secreto compartido con Vapi. Si esta vacio, el webhook **no** valida la cabecera `x-vapi-secret`; conviene definirlo antes de exponer el servidor a internet. |

## Probar en local

```bash
curl -X POST http://localhost:3000/voice-webhook \
  -H 'Content-Type: application/json' \
  -d '{"message":{"type":"tool-calls","call":{"id":"call_123"},
       "toolCalls":[{"id":"tc_1","type":"function",
       "function":{"name":"consultarHorario","arguments":"{\"dia\":\"viernes\"}"}}]}}'
```

## Siguiente paso

Las herramientas del agente se resuelven en la funcion `runTool` de
`src/routes/voiceWebhook.ts`. Ahora mismo devuelve un texto de marcador para
cualquier nombre; ahi es donde va la logica real (horarios, reservas,
disponibilidad...). Vapi necesita una URL publica, asi que durante el desarrollo
hay que exponer el puerto con un tunel (ngrok, Cloudflare Tunnel) y pegar esa
URL en el apartado *Server URL* del asistente.

## Estructura

```
src/
  index.ts              arranque del servidor y cierre ordenado
  app.ts                creacion de la app Express y middlewares
  config.ts             lectura y validacion de variables de entorno
  routes/
    voiceWebhook.ts     POST /voice-webhook y resolucion de herramientas
  types/
    vapi.ts             tipos minimos del payload de Vapi
```
