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
import { parsearCuentaDeServicio } from "../google/credencial";

// FIREBASE_SERVICE_ACCOUNT la comparten Firestore y Google Calendar: el mismo
// JSON sirve para los dos, asi que leerlo vive en ../google/credencial.
// cert() acepta el JSON de Google en snake_case tal cual, sin convertir nada.

function inicializar(): Firestore | null {
  if (!config.firebaseServiceAccount) {
    console.warn(
      "Firebase no configurado, usando negocio de ejemplo. Define FIREBASE_SERVICE_ACCOUNT para leer de Firestore.",
    );
    return null;
  }

  try {
    const credencial = parsearCuentaDeServicio(config.firebaseServiceAccount) as ServiceAccount;
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
