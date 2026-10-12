#!/usr/bin/env bash
#
# Comprobacion antes de ir a una visita.
#
#   bash scripts/antes-de-salir.sh
#
# Recorre la cadena entera igual que la recorre una llamada de verdad:
# ngrok, el tunel desde fuera, el webhook con el secreto, y el panel desde
# el movil. Dice SAL o NO SALGAS, sin medias tintas.
#
# No sustituye a llamar tu al numero antes de entrar al local, pero te dice
# en treinta segundos si falta algo, cuando todavia estas a tiempo.

set -uo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$AQUI/.env"
FALLOS=0

ok()    { echo "  [ OK ] $1"; }
fallo() { echo "  [FALLA] $1"; [ $# -gt 1 ] && echo "         $2"; FALLOS=$((FALLOS+1)); }
aviso() { echo "  [ OJO ] $1"; }

leer() {
  [ -f "$ENV_FILE" ] || return 1
  sed -n "s|^$1=||p" "$ENV_FILE" | head -1 | tr -d '\r'
}

echo
echo "COMPROBACION ANTES DE SALIR"
echo "==========================="
echo

# ---------------------------------------------------------------- 1. .env
echo "1. Configuracion"
if [ ! -f "$ENV_FILE" ]; then
  fallo "no hay .env" "copia .env.example a .env y rellenalo"
  echo; echo "NO SALGAS."; exit 1
fi
SECRETO="$(leer VAPI_SERVER_SECRET)"
URL_ENV="$(leer PUBLIC_SERVER_URL)"
PANEL_PASS="$(leer PANEL_PASSWORD)"
PUERTO="$(leer PORT)"; PUERTO="${PUERTO:-3000}"

[ -n "$SECRETO" ] && ok "hay secreto del webhook" \
  || fallo "VAPI_SERVER_SECRET vacio" "el webhook aceptaria peticiones de cualquiera"
[ -n "$PANEL_PASS" ] && ok "hay contrasena del panel" \
  || fallo "PANEL_PASSWORD vacia" "no podras abrir el panel en el movil durante la visita"

# ------------------------------------------------------------- 2. servidor
echo
echo "2. Servidor en tu ordenador"
if curl -fsS --max-time 5 "http://localhost:$PUERTO/health" >/dev/null 2>&1; then
  ok "responde en el puerto $PUERTO"
else
  fallo "no responde en localhost:$PUERTO" "arrancalo con: npm run dev"
fi

# ---------------------------------------------------------------- 3. ngrok
echo
echo "3. Tunel de ngrok"
URL_NGROK="$(curl -fsS --max-time 5 http://localhost:4040/api/tunnels 2>/dev/null \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{
      const t=(JSON.parse(d).tunnels||[]).find(x=>x.public_url&&x.public_url.startsWith("https"));
      console.log(t?t.public_url:"")}catch(e){console.log("")}})' 2>/dev/null)"

if [ -z "$URL_NGROK" ]; then
  fallo "ngrok no esta corriendo" "abre otra ventana y ejecuta: ngrok http $PUERTO"
else
  ok "tunel levantado: $URL_NGROK"
  if [ "$URL_NGROK" = "$URL_ENV" ]; then
    ok "coincide con PUBLIC_SERVER_URL del .env"
  else
    fallo "el .env apunta a otra direccion" \
      "tiene: ${URL_ENV:-(vacio)} / deberia: $URL_NGROK  -> corrigelo y reinicia el servidor"
  fi
fi

# --------------------------------------------- 4. la cadena entera, de fuera
echo
echo "4. La cadena entera, como la ve Vapi"
if [ -n "$URL_NGROK" ]; then
  if curl -fsS --max-time 15 -H 'ngrok-skip-browser-warning: 1' "$URL_NGROK/health" >/dev/null 2>&1; then
    ok "el servidor se alcanza desde internet"
  else
    fallo "no se alcanza desde internet" "mira la ventana de ngrok"
  fi

  # Lo que de verdad importa: que el webhook conteste un assistant-request
  # firmado y devuelva un asistente con sus herramientas.
  RESP="$(curl -fsS --max-time 20 -X POST "$URL_NGROK/voice-webhook" \
    -H 'content-type: application/json' \
    -H "x-vapi-secret: $SECRETO" \
    -H 'ngrok-skip-browser-warning: 1' \
    -d '{"message":{"type":"assistant-request","call":{"id":"comprobacion-previa"}}}' 2>/dev/null)"

  if [ -z "$RESP" ]; then
    fallo "el webhook no contesta" "sin esto la llamada no arranca siquiera"
  else
    RESUMEN="$(printf '%s' "$RESP" | node -e '
      let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{
        try{
          const a=JSON.parse(d).assistant;
          if(!a){console.log("SIN_ASISTENTE");return}
          const h=(a.model?.tools||[]).map(t=>t.type==="endCall"?"colgar":t.function?.name);
          console.log([a.name, a.voice?.voiceId, h.join("+")].join("|"));
        }catch(e){console.log("NO_ES_JSON")}
      })' 2>/dev/null)"
    case "$RESUMEN" in
      SIN_ASISTENTE|NO_ES_JSON|"")
        fallo "el webhook contesta algo raro" "respuesta: $(printf '%s' "$RESP" | head -c 120)" ;;
      *)
        ok "el webhook devuelve el asistente"
        echo "         $(printf '%s' "$RESUMEN" | tr '|' ' ')" ;;
    esac
  fi

  # El secreto tiene que rechazar a quien no lo trae.
  CODIGO="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 -X POST "$URL_NGROK/voice-webhook" \
    -H 'content-type: application/json' -H 'ngrok-skip-browser-warning: 1' \
    -d '{"message":{"type":"assistant-request"}}' 2>/dev/null)"
  if [ -n "$SECRETO" ]; then
    [ "$CODIGO" = "401" ] && ok "sin el secreto, rechaza (401)" \
      || fallo "sin el secreto contesta $CODIGO" "deberia ser 401: cualquiera podria usar tu agente"
  fi

  # ------------------------------------------------------- 5. panel al movil
  echo
  echo "5. El panel desde el movil"
  if [ -n "$PANEL_PASS" ]; then
    CODIGO_PANEL="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 \
      -u "cocina:$PANEL_PASS" -H 'ngrok-skip-browser-warning: 1' "$URL_NGROK/pedidos" 2>/dev/null)"
    [ "$CODIGO_PANEL" = "200" ] && ok "abre con usuario cocina: $URL_NGROK/pedidos" \
      || fallo "el panel devuelve $CODIGO_PANEL" "revisa PANEL_PASSWORD y reinicia el servidor"
  else
    fallo "sin contrasena, el panel no abre desde fuera" "pon PANEL_PASSWORD en el .env y reinicia"
  fi
fi

# ------------------------------------------------------------ recordatorios
echo
echo "6. Lo que no puedo comprobar yo"
aviso "la suspension de Windows: Configuracion > Sistema > Inicio/apagado, todo en Nunca"
aviso "el portatil enchufado y con la tapa abierta"
aviso "en Vapi, Server URL = ${URL_NGROK:-<tu tunel>}/voice-webhook y la cabecera x-vapi-secret puesta"
aviso "llama tu al numero desde la calle, justo antes de entrar"

echo
echo "==========================="
if [ "$FALLOS" -eq 0 ]; then
  echo "SAL TRANQUILO. La cadena entera responde."
else
  echo "NO SALGAS. Hay $FALLOS cosa(s) sin resolver, arriba pone cuales."
fi
echo
exit "$FALLOS"
