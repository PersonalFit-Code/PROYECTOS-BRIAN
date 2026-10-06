/**
 * Inicializacion de firebase-admin.
 *
 * El servidor tiene que arrancar igual sin Firebase: en desarrollo se trabaja
 * con el negocio de ejemplo. Por eso aqui nada lanza hacia arriba: si la
 * cuenta de servicio no esta o no se puede leer, "firestore" queda en null y
 * se avisa una vez por consola.
 */

import {
  cert,
  getApps,
  initializeApp,
  type ServiceAccount,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

import { config } from "../config";

/**
 * FIREBASE_SERVICE_ACCOUNT puede venir de dos formas, segun donde se despliegue:
 * el JSON tal cual, o ese mismo JSON en base64 (que es lo comodo cuando la
 * plataforma no admite saltos de linea en las variables de entorno).
 */
function parsearCuentaDeServicio(bruto: string): ServiceAccount {
  const texto = bruto.trim();

  // Un JSON empieza por "{"; cualquier otra cosa se intenta como base64.
  const json = texto.startsWith("{")
    ? texto
    : Buffer.from(texto, "base64").toString("utf8");

  const datos: unknown = JSON.parse(json);
  if (!datos || typeof datos !== "object" || Array.isArray(datos)) {
    throw new Error("la cuenta de servicio no es un objeto JSON");
  }

  // cert() acepta tanto projectId/clientEmail/privateKey como el JSON de
  // Google en snake_case, asi que no hace falta convertir nada.
  return datos as ServiceAccount;
}

function inicializar(): Firestore | null {
  if (!config.firebaseServiceAccount) {
    console.warn(
      "Firebase no configurado, usando negocio de ejemplo. Define FIREBASE_SERVICE_ACCOUNT para leer de Firestore.",
    );
    return null;
  }

  try {
    const credencial = parsearCuentaDeServicio(config.firebaseServiceAccount);
    // Si el modulo se recarga (tsx watch), no se vuelve a inicializar la app.
    const app =
      getApps()[0] ?? initializeApp({ credential: cert(credencial) });
    return getFirestore(app);
  } catch (error) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.error(
      `Firebase no configurado, usando negocio de ejemplo. No se pudo leer FIREBASE_SERVICE_ACCOUNT: ${motivo}`,
    );
    return null;
  }
}

/** Null cuando no hay Firebase disponible. Quien lo use tiene que comprobarlo. */
export const firestore: Firestore | null = inicializar();
