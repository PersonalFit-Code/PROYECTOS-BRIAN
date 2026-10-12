/**
 * La cuenta de servicio de Google, leida una sola vez y compartida.
 *
 * Es la misma credencial que ya usa Firestore. No hace falta una segunda:
 * el JSON de la cuenta de servicio lleva dentro el correo y la clave privada,
 * que es exactamente lo que necesita el cliente de Calendar. Una clave menos
 * que guardar, rotar y perder.
 */

/** Lee el JSON, venga en claro o en base64. */
export function parsearCuentaDeServicio(bruto: string): Record<string, unknown> {
  const texto = bruto.trim();
  if (!texto) throw new Error("la cuenta de servicio esta vacia");

  // Un JSON empieza por "{"; cualquier otra cosa se intenta como base64, que
  // es lo comodo cuando la plataforma no admite saltos de linea.
  const json = texto.startsWith("{")
    ? texto
    : Buffer.from(texto, "base64").toString("utf8");

  const datos: unknown = JSON.parse(json);
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    throw new Error("la cuenta de servicio no es un objeto JSON");
  }
  return datos as Record<string, unknown>;
}

/** Lo que hace falta para firmar un token: correo y clave privada. */
export interface AccesoGoogle {
  clientEmail: string;
  privateKey: string;
}

/**
 * Saca correo y clave del JSON, venga en snake_case (como lo descarga Google)
 * o en camelCase (como lo escriben algunos ejemplos).
 */
export function datosDeAcceso(cuenta: Record<string, unknown>): AccesoGoogle | null {
  const texto = (...claves: string[]): string => {
    for (const clave of claves) {
      const valor = cuenta[clave];
      if (typeof valor === "string" && valor.trim()) return valor;
    }
    return "";
  };

  const clientEmail = texto("client_email", "clientEmail");
  // Las claves pegadas en una variable de entorno suelen traer los saltos de
  // linea escapados: sin deshacerlos, la firma no valida y el error que da
  // Google no dice por que.
  const privateKey = texto("private_key", "privateKey").replace(/\\n/g, "\n");

  if (!clientEmail || !privateKey) return null;
  return { clientEmail, privateKey };
}
