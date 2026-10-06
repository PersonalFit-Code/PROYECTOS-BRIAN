import "dotenv/config";

/**
 * Modelo del asistente de voz.
 *
 * Claude 3.5 Haiku (claude-3-5-haiku-20241022) se retiro el 19 de febrero de
 * 2026 y Vapi ya no lo acepta: su proveedor "anthropic" no ofrece ningun modelo
 * 3.5. El equivalente actual de la gama Haiku —rapido y barato, que es lo que
 * interesa en una llamada de voz— es Claude Haiku 4.5. Se puede cambiar con
 * VAPI_MODEL sin tocar codigo.
 */
const MODELO_POR_DEFECTO = "claude-haiku-4-5-20251001";

function readPort(raw: string | undefined): number {
  if (!raw) return 3000;
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`PORT no es un puerto valido: "${raw}"`);
  }
  return port;
}

/** Quita la barra final para poder concatenar rutas sin duplicarla. */
function readPublicUrl(raw: string | undefined): string {
  return (raw ?? "").trim().replace(/\/+$/, "");
}

export const config = {
  port: readPort(process.env.PORT),
  /** Si esta vacio, el servidor no comprueba la cabecera x-vapi-secret. */
  vapiServerSecret: process.env.VAPI_SERVER_SECRET ?? "",
  /** URL publica del servidor (tunel o despliegue). Vacio en local. */
  publicServerUrl: readPublicUrl(process.env.PUBLIC_SERVER_URL),
  vapiModel: process.env.VAPI_MODEL?.trim() || MODELO_POR_DEFECTO,
  /** Cuenta de servicio de Firebase, en JSON o en base64. Vacio = sin Firestore. */
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT ?? "",
  /** Negocio que se usa cuando la peticion no trae ?business=. */
  defaultBusinessId: process.env.DEFAULT_BUSINESS_ID ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;
