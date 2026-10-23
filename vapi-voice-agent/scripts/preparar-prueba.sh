#!/usr/bin/env bash
#
# Deja el .env listo para probar un negocio por telefono y dice que poner en Vapi.
#
#   bash scripts/preparar-prueba.sh                   # La Vita Buona, mismo secreto
#   bash scripts/preparar-prueba.sh --secreto-nuevo   # genera uno nuevo
#
# Con ngrok ya corriendo (ngrok http 3000) lee su URL y la pone en el .env.
#
# El secreto NO se imprime: va al portapapeles. Asi no se queda en una captura
# de pantalla que luego se pegue en un chat.

set -uo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$AQUI/.env"
NEGOCIO="lavitabuona"
NUEVO=0
[ "${1:-}" = "--secreto-nuevo" ] && NUEVO=1

ok()    { echo "  [ OK ] $1"; }
aviso() { echo "  [ OJO ] $1"; }

[ -f "$ENV_FILE" ] || { cp "$AQUI/.env.example" "$ENV_FILE"; ok ".env creado desde .env.example"; }

leer() { sed -n "s|^$1=||p" "$ENV_FILE" | head -1 | tr -d '\r'; }

# poner CLAVE VALOR: cambia la linea si existe, la anade si no.
poner() {
  local clave="$1" valor="$2" tmp
  tmp="$(mktemp)"
  if grep -q "^$clave=" "$ENV_FILE"; then
    awk -v k="$clave" -v v="$valor" 'BEGIN{FS=OFS="="} $1==k{print k"="v; next} {print}' "$ENV_FILE" > "$tmp"
  else
    cat "$ENV_FILE" > "$tmp"
    printf '\n%s=%s\n' "$clave" "$valor" >> "$tmp"
  fi
  cat "$tmp" > "$ENV_FILE"
  rm -f "$tmp"
}

# Portapapeles: clip en Windows, pbcopy en Mac, xclip en Linux.
copiar() {
  if command -v clip >/dev/null 2>&1; then printf '%s' "$1" | clip; return $?; fi
  if command -v clip.exe >/dev/null 2>&1; then printf '%s' "$1" | clip.exe; return $?; fi
  if command -v pbcopy >/dev/null 2>&1; then printf '%s' "$1" | pbcopy; return $?; fi
  if command -v xclip >/dev/null 2>&1; then printf '%s' "$1" | xclip -selection clipboard; return $?; fi
  return 1
}

echo
echo "PREPARAR LA PRUEBA: $NEGOCIO"
echo "============================"
echo

# 1. Negocio por defecto: asi el panel y las comprobaciones usan este.
poner DEFAULT_BUSINESS_ID "$NEGOCIO"
ok "DEFAULT_BUSINESS_ID=$NEGOCIO"

# 2. Secreto del webhook.
SECRETO="$(leer VAPI_SERVER_SECRET)"
if [ -z "$SECRETO" ] || [ "$NUEVO" = 1 ]; then
  SECRETO="$(node -e 'process.stdout.write(require("crypto").randomBytes(32).toString("base64url"))')"
  poner VAPI_SERVER_SECRET "$SECRETO"
  if copiar "$SECRETO"; then
    ok "secreto nuevo en el .env y copiado al portapapeles: pegalo en Vapi"
  else
    aviso "secreto nuevo en el .env, pero no pude copiarlo: abre el .env con 'notepad .env' y copialo de ahi"
  fi
else
  ok "se mantiene el secreto del .env (con --secreto-nuevo se cambia)"
fi

# 3. La URL de ngrok, si esta corriendo.
URL="$(curl -fsS --max-time 4 http://localhost:4040/api/tunnels 2>/dev/null \
  | node -e 'let d="";process.stdin.on("data",c=>d+=c).on("end",()=>{try{
      const t=(JSON.parse(d).tunnels||[]).find(x=>x.public_url&&x.public_url.startsWith("https"));
      console.log(t?t.public_url:"")}catch(e){console.log("")}})' 2>/dev/null)"
if [ -n "$URL" ]; then
  poner PUBLIC_SERVER_URL "$URL"
  ok "PUBLIC_SERVER_URL=$URL"
else
  aviso "ngrok no esta corriendo: abre otra ventana, ejecuta 'ngrok http 3000' y vuelve a lanzar este script"
fi

# 4. Lo que hay que tener en el .env (solo se dice si esta, nunca el valor).
[ -n "$(leer FIREBASE_SERVICE_ACCOUNT)" ] \
  && ok "hay cuenta de Firebase: los pedidos se guardaran" \
  || aviso "sin FIREBASE_SERVICE_ACCOUNT el pedido NO se guarda y Noah lo dira"
[ -n "$(leer PANEL_PASSWORD)" ] \
  && ok "hay contrasena del panel" \
  || aviso "sin PANEL_PASSWORD el panel solo abre desde este ordenador"

echo
echo "AHORA, EN VAPI (Phone Numbers > tu numero):"
echo "  Assistant ...... vacio, sin asistente"
if [ -n "$URL" ]; then
  echo "  Server URL ..... $URL/voice-webhook?business=$NEGOCIO"
else
  echo "  Server URL ..... https://TU-URL.ngrok-free.app/voice-webhook?business=$NEGOCIO"
fi
echo "  Secreto ........ el de tu .env (si lo acabas de generar, esta en el portapapeles)"
echo
echo "Despues reinicia el servidor (Ctrl+C y npm run dev): lee el .env al arrancar."
echo
