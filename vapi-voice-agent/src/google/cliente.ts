/**
 * El cliente de Calendar ya montado con la credencial de verdad.
 *
 * Esta separado de calendario.ts para que aquel se pueda probar sin arrastrar
 * la libreria de autenticacion ni necesitar claves. Aqui solo vive el pegamento.
 *
 * No se instala el paquete "googleapis", que es el cliente generado de
 * cientos de APIs, para usar dos endpoints. google-auth-library ya viene con
 * firebase-admin, y firma el token que necesitamos.
 */

import { JWT } from "google-auth-library";

import { config } from "../config";
import { crearClienteCalendario, PERMISOS, type ClienteCalendario } from "./calendario";
import { datosDeAcceso, parsearCuentaDeServicio } from "./credencial";

/** undefined = todavia no se ha intentado. null = no hay credencial utilizable. */
let cache: ClienteCalendario | null | undefined;

function construir(): ClienteCalendario | null {
  if (!config.firebaseServiceAccount) {
    console.warn(
      "Google Calendar no configurado: sin FIREBASE_SERVICE_ACCOUNT no se pueden dar citas.",
    );
    return null;
  }

  let acceso;
  try {
    acceso = datosDeAcceso(parsearCuentaDeServicio(config.firebaseServiceAccount));
  } catch (error) {
    const motivo = error instanceof Error ? error.message : String(error);
    console.error(`Google Calendar no configurado: ${motivo}`);
    return null;
  }

  if (!acceso) {
    console.error(
      "Google Calendar no configurado: la cuenta de servicio no trae client_email y private_key.",
    );
    return null;
  }

  const jwt = new JWT({
    email: acceso.clientEmail,
    key: acceso.privateKey,
    scopes: [...PERMISOS],
  });

  return crearClienteCalendario({
    // La libreria ya guarda el token y lo renueva sola; aqui solo se pide.
    token: async () => {
      const { token } = await jwt.getAccessToken();
      if (!token) throw new Error("Google no devolvio token de acceso");
      return token;
    },
  });
}

/**
 * El cliente compartido, o null si no hay forma de hablar con Google.
 *
 * Quien lo use tiene que comprobar el null y decirle a quien llama que le
 * llamaran, en vez de dejar la llamada colgada. Un negocio sin calendario
 * accesible es un problema de configuracion, no de quien llama.
 */
export function calendarioDeGoogle(): ClienteCalendario | null {
  if (cache === undefined) cache = construir();
  return cache;
}

/**
 * Pone otro calendario en su sitio. Para las pruebas y para el simulador de
 * llamada, que tienen que poder ver el circuito entero sin tocar Google.
 *
 * Nunca se llama desde el servidor. Si algun dia se llamara, el agente
 * confirmaria citas que no se escriben en ninguna parte, que es justo el fallo
 * que todo lo demas de este modulo esta puesto para evitar. Por eso avisa en
 * el log cada vez: si esta linea aparece en un servidor de verdad, se ve.
 */
export function usarCalendario(cliente: ClienteCalendario | null): void {
  console.warn("[calendario] se ha sustituido el calendario de Google. Esto solo vale para pruebas.");
  cache = cliente;
}
