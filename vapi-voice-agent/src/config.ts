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

/**
 * Lee un interruptor de texto. Acepta las formas en que una persona escribe
 * "si" de verdad, con tilde o en ingles: callar un "si" mal escrito y no
 * activar nada seria una sorpresa desagradable.
 */
function esAfirmativo(raw: string | undefined): boolean {
  const valor = (raw ?? "").trim().toLowerCase();
  return ["si", "sí", "yes", "true", "1"].includes(valor);
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
  /**
   * Contrasena del panel de pedidos. Si esta vacia, el panel solo responde a
   * peticiones desde el propio ordenador: mejor eso que dejar direcciones y
   * telefonos de clientes abiertos en internet por despiste.
   */
  panelPassword: process.env.PANEL_PASSWORD ?? "",
  /**
   * Si se graba el audio de las llamadas. Vapi lo trae activado por defecto;
   * aqui se apaga salvo que se pida expresamente, porque grabar a un cliente
   * obliga a avisarle (ver README). Con GRABAR_LLAMADAS=si, el agente lo
   * anuncia al descolgar.
   */
  grabarLlamadas: esAfirmativo(process.env.GRABAR_LLAMADAS),
  /**
   * Voz del agente. Se eligen en el panel de Vapi (Voice Library), donde se
   * pueden escuchar antes: se copia el proveedor y el identificador aqui. Una
   * voz que Vapi no reconozca hace fallar la llamada entera, asi que por
   * defecto se deja una que ya se ha probado en una llamada real.
   */
  vozProveedor: process.env.VOZ_PROVEEDOR?.trim() || "azure",
  vozId: process.env.VOZ_ID?.trim() || "es-ES-ElviraNeural",
  /**
   * Sonido de fondo de la llamada: "office" (murmullo de oficina, el de Vapi
   * por defecto en telefono), "off" para silencio, o la URL de un audio propio
   * (por ejemplo, ambiente de cocina o de bar).
   */
  sonidoFondo: process.env.SONIDO_FONDO?.trim() || "office",
  nodeEnv: process.env.NODE_ENV ?? "development",
} as const;
