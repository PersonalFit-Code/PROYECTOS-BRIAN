#!/usr/bin/env bash
#
# Despliega el agente en Google Cloud Run.
#
#   bash scripts/desplegar.sh
#
# Lee las claves del .env de esta carpeta y las sube como variables del
# servicio. El .env nunca sale de tu ordenador: lo que viaja es el valor,
# directamente a Google.
#
# La region es europe-west1 (Belgica) a proposito: es de las que Google
# cuenta dentro del nivel gratuito, y esta en Europa como la base de datos.
#
# Se puede ejecutar las veces que haga falta: la primera crea el servicio y
# las siguientes publican la version nueva.

set -euo pipefail

REGION="europe-west1"
SERVICIO="noah"
AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$AQUI/.env"
VARS="$AQUI/.cloudrun-env.json"

# El fichero de variables lleva las claves dentro: que no quede nunca.
limpiar() { rm -f "$VARS"; }
trap limpiar EXIT

echo "==> Comprobaciones previas"

if ! command -v gcloud >/dev/null 2>&1; then
  echo "ERROR: no encuentro gcloud."
  echo "Instalalo desde https://cloud.google.com/sdk/docs/install y vuelve a ejecutar esto."
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "ERROR: no hay .env en $AQUI"
  echo "Copia .env.example a .env y rellenalo antes de desplegar."
  exit 1
fi

CUENTA="$(gcloud config get-value account 2>/dev/null || true)"
if [ -z "$CUENTA" ] || [ "$CUENTA" = "(unset)" ]; then
  echo "No has entrado con tu cuenta de Google. Abro el navegador."
  gcloud auth login
fi

PROYECTO="$(gcloud config get-value project 2>/dev/null || true)"
if [ -z "$PROYECTO" ] || [ "$PROYECTO" = "(unset)" ]; then
  echo
  echo "No hay proyecto elegido. Estos son los tuyos:"
  gcloud projects list --format="table(projectId, name)"
  echo
  read -r -p "Escribe el ID del proyecto que quieres usar: " PROYECTO
  gcloud config set project "$PROYECTO"
fi

echo "    Cuenta:   $(gcloud config get-value account)"
echo "    Proyecto: $PROYECTO"
echo "    Region:   $REGION"

echo
echo "==> Activando los servicios de Google que hacen falta (solo la primera vez tarda)"
gcloud services enable run.googleapis.com cloudbuild.googleapis.com \
  artifactregistry.googleapis.com --quiet

echo
echo "==> Preparando las variables a partir de tu .env"

# Se genera con node para que el escapado sea correcto: hay valores con
# barras, signos de igual y JSON dentro. JSON es YAML valido, que es lo que
# gcloud espera en --env-vars-file.
node -e '
const fs = require("fs");
const texto = fs.readFileSync(process.argv[1], "utf8");
const vars = {};
for (const linea of texto.split(/\r?\n/)) {
  const limpia = linea.trim();
  if (!limpia || limpia.startsWith("#")) continue;
  const corte = limpia.indexOf("=");
  if (corte < 1) continue;
  const clave = limpia.slice(0, corte).trim();
  let valor = limpia.slice(corte + 1).trim();
  if (
    (valor.startsWith("\"") && valor.endsWith("\"")) ||
    (valor.startsWith("'"'"'") && valor.endsWith("'"'"'"))
  ) {
    valor = valor.slice(1, -1);
  }
  // PORT lo pone Cloud Run y rechaza que se lo mandes.
  // PUBLIC_SERVER_URL se rellena despues, con la direccion que asigne.
  if (clave === "PORT" || clave === "PUBLIC_SERVER_URL") continue;
  if (valor === "") continue;
  vars[clave] = valor;
}
vars.NODE_ENV = "production";
fs.writeFileSync(process.argv[2], JSON.stringify(vars, null, 2));
const ocultar = new Set(["VAPI_SERVER_SECRET", "FIREBASE_SERVICE_ACCOUNT", "PANEL_PASSWORD"]);
for (const k of Object.keys(vars)) {
  console.log("    " + k + " = " + (ocultar.has(k) ? "(oculto)" : vars[k]));
}
' "$ENV_FILE" "$VARS"

for obligatoria in VAPI_SERVER_SECRET PANEL_PASSWORD; do
  if ! grep -q "\"$obligatoria\"" "$VARS"; then
    echo
    echo "AVISO: $obligatoria esta vacia en tu .env."
    if [ "$obligatoria" = "PANEL_PASSWORD" ]; then
      echo "       Sin ella no podras abrir el panel desde el movil."
    else
      echo "       Sin el, el webhook acepta peticiones de cualquiera."
    fi
  fi
done

echo
echo "==> Desplegando (la primera vez tarda unos minutos, construye la imagen)"
gcloud run deploy "$SERVICIO" \
  --source "$AQUI" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 3 \
  --timeout 60s \
  --env-vars-file "$VARS" \
  --quiet

URL="$(gcloud run services describe "$SERVICIO" --region "$REGION" --format='value(status.url)')"

echo
echo "==> Diciendole al servidor cual es su propia direccion"
gcloud run services update "$SERVICIO" --region "$REGION" \
  --update-env-vars "PUBLIC_SERVER_URL=$URL" --quiet >/dev/null

echo
echo "==> Comprobando que responde"
sleep 3
if curl -fsS --max-time 20 "$URL/health" >/dev/null; then
  echo "    /health responde. El servidor esta vivo."
else
  echo "    /health NO responde todavia. Mira los registros con:"
  echo "    gcloud run services logs read $SERVICIO --region $REGION --limit 50"
fi

cat <<FIN

========================================================================
  LISTO

  Tu servidor: $URL

  En Vapi, en tu numero de telefono:
    Server URL   $URL/voice-webhook
    Cabecera     x-vapi-secret  (el mismo valor que tu VAPI_SERVER_SECRET)

  El panel de pedidos:
    $URL/pedidos      usuario: cocina

  Ya no hacen falta ngrok ni el portatil encendido.

  Para publicar cambios mas adelante: git pull y vuelve a ejecutar esto.
========================================================================
FIN
