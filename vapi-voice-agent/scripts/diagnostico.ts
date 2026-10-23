/**
 * Revisa, de una vez, todo lo que tiene que estar bien para que un pedido
 * por telefono llegue a la cocina, y dice en que punto falla.
 *
 *   npm run diagnostico
 *
 * Nace de dos llamadas de prueba en las que registrar_pedido fallo y desde
 * fuera no habia forma de saber por que. NUNCA imprime un valor del .env:
 * solo nombres de variables, si estan, y los mensajes de error. Se puede
 * copiar la salida entera y mandarla sin miedo.
 *
 * Hace una escritura de verdad en Firestore (un pedido de diagnostico) y la
 * borra al momento, porque leer bien y escribir mal es justo lo que paso.
 */

import { execSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const AQUI = join(__dirname, "..");
let fallos = 0;

const ok = (texto: string) => console.log(`  OK     ${texto}`);
const mal = (texto: string) => {
  fallos += 1;
  console.log(`  FALLO  ${texto}`);
};
const nota = (texto: string) => console.log(`         ${texto}`);
const titulo = (texto: string) => console.log(`\n${texto}`);

/** Variables que el servidor lee. Sirve para cazar dos pegadas en una linea. */
const CONOCIDAS = [
  "PORT", "VAPI_SERVER_SECRET", "PUBLIC_SERVER_URL", "VAPI_MODEL",
  "FIREBASE_SERVICE_ACCOUNT", "NOMBRE_AGENTE", "DEFAULT_BUSINESS_ID",
  "NEGOCIO_DE_EJEMPLO", "PANEL_PASSWORD", "GRABAR_LLAMADAS", "VOZ_PROVEEDOR",
  "VOZ_ID", "VOZ_MODELO", "VOZ_VELOCIDAD", "INTERRUPCION_PALABRAS",
  "INTERRUPCION_SEGUNDOS", "SONIDO_FONDO", "FIN_DE_TURNO", "TELEFONO_TRASPASO",
];

function revisarEnv(): void {
  titulo("1. El fichero .env");
  const ruta = join(AQUI, ".env");
  if (!existsSync(ruta)) {
    mal("no hay .env en la carpeta vapi-voice-agent");
    return;
  }
  const lineas = readFileSync(ruta, "utf8").split(/\r?\n/);
  const vistas = new Map<string, number>();

  lineas.forEach((linea, i) => {
    const limpia = linea.trim();
    if (!limpia || limpia.startsWith("#")) return;
    const igual = limpia.indexOf("=");
    if (igual < 1) {
      mal(`la linea ${i + 1} no tiene la forma NOMBRE=valor`);
      return;
    }
    const nombre = limpia.slice(0, igual).trim();
    const valor = limpia.slice(igual + 1);
    vistas.set(nombre, (vistas.get(nombre) ?? 0) + 1);

    // Dos variables pegadas en la misma linea: pasa al anadir una con
    // "echo >> .env" cuando la ultima linea no acababa en salto de linea.
    for (const otra of CONOCIDAS) {
      if (otra !== nombre && valor.includes(`${otra}=`)) {
        mal(`la linea ${i + 1} (${nombre}) lleva pegada detras ${otra}=. Tienen que ir en dos lineas`);
      }
    }
  });

  for (const [nombre, veces] of vistas) {
    if (veces > 1) mal(`${nombre} esta ${veces} veces; vale la ultima, borra las otras`);
  }
  for (const nombre of ["FIREBASE_SERVICE_ACCOUNT", "VAPI_SERVER_SECRET", "PUBLIC_SERVER_URL", "DEFAULT_BUSINESS_ID", "PANEL_PASSWORD"]) {
    if (vistas.has(nombre)) ok(`${nombre} esta puesta`);
    else nota(`${nombre} no esta`);
  }
}

function revisarCodigo(): void {
  titulo("2. La version del codigo");
  try {
    const local = execSync("git rev-parse --short HEAD", { cwd: AQUI }).toString().trim();
    ok(`version ${local}`);
    try {
      execSync("git fetch -q origin", { cwd: AQUI, stdio: "ignore", timeout: 15_000 });
      const detras = execSync("git rev-list --count HEAD..@{u}", { cwd: AQUI }).toString().trim();
      if (detras === "0") ok("al dia con lo ultimo subido");
      else mal(`faltan ${detras} cambios por bajar: haz git pull y reinicia el servidor`);
    } catch {
      nota("no he podido comparar con lo subido (sin internet o sin rama remota)");
    }
  } catch {
    nota("no es una copia de git");
  }
}

async function revisarFirestore(): Promise<void> {
  titulo("3. Firebase");
  // Se cargan aqui y no arriba: leen el .env al importarse, y si el .env
  // esta roto el paso 1 ya lo ha dicho.
  const { config } = await import("../src/config");
  const { parsearCuentaDeServicio } = await import("../src/google/credencial");

  if (!config.firebaseServiceAccount) {
    mal("FIREBASE_SERVICE_ACCOUNT esta vacia: sin ella no se puede guardar ningun pedido");
    return;
  }
  try {
    const cuenta = parsearCuentaDeServicio(config.firebaseServiceAccount);
    ok(`la cuenta de servicio se lee bien (proyecto ${String(cuenta.project_id ?? "?")})`);
  } catch (error) {
    mal(`la cuenta de servicio no se puede leer: ${(error as Error).message}`);
    nota("suele ser que esta cortada o que se le pego algo detras al editar el .env");
    return;
  }

  const { firestore } = await import("../src/db/firebase");
  if (!firestore) {
    mal("Firebase no arranca (el motivo sale justo encima)");
    return;
  }

  const id = config.defaultBusinessId.trim() || "lavitabuona-prueba";
  const { camposQueFaltan, getBusiness } = await import("../src/db/businesses");

  let datos: unknown;
  try {
    const doc = await firestore.collection("businesses").doc(id).get();
    if (!doc.exists) {
      mal(`el negocio "${id}" no esta en Firestore: npm run crear:negocio ${id}`);
      return;
    }
    datos = { ...doc.data(), id: doc.id };
    ok(`se lee el negocio "${id}" de Firestore`);
  } catch (error) {
    mal(`no se puede leer Firestore: ${(error as Error).message}`);
    return;
  }

  const faltan = camposQueFaltan(datos);
  if (faltan.length) {
    mal(`la ficha de "${id}" tiene datos que no valen: ${faltan.join(", ")}`);
    nota(`el agente estaria usando el negocio de ejemplo. Arreglo: npm run crear:negocio ${id}`);
    return;
  }
  const carta = (datos as { carta: Array<{ id: string }> }).carta;
  ok(`la ficha esta completa (${carta.length} platos)`);
  if (!carta.some((p) => p.id.startsWith("b-"))) {
    mal(`la carta de Firestore no tiene bebidas: esta sin actualizar. npm run crear:negocio ${id}`);
  }

  titulo("4. Guardar un pedido de verdad");
  const { guardarPedido } = await import("../src/db/orders");
  const negocio = await getBusiness(id);
  const plato = negocio.carta[0]!;
  const callId = `diagnostico-${Date.now()}`;
  try {
    const { pedido } = await guardarPedido(negocio, {
      articulos: [{ plato: plato.id, cantidad: 1 }],
      entrega: "reparto",
      direccion: "Calle de prueba 1",
      nombre: "Diagnostico",
      telefono: "600000000",
      notas: "pedido de diagnostico, se borra solo",
      callId,
    });
    ok(`pedido guardado con el codigo ${pedido.codigo}`);
  } catch (error) {
    mal(`NO se puede guardar un pedido: ${(error as Error).message}`);
    nota("esto es lo que le pasa a Noah al registrar. Mandame esta linea entera.");
    return;
  }
  try {
    await firestore.collection("businesses").doc(id).collection("pedidos").doc(callId).delete();
    ok("pedido de diagnostico borrado");
  } catch (error) {
    nota(`no pude borrar el pedido de diagnostico (${(error as Error).message}); marcalo atendido en el panel`);
  }
}

async function revisarServidor(): Promise<void> {
  titulo("5. El servidor encendido");
  const puerto = process.env.PORT ?? "3000";
  try {
    const r = await fetch(`http://localhost:${puerto}/health`, { signal: AbortSignal.timeout(3000) });
    if (r.ok) ok(`responde en el puerto ${puerto}`);
    else mal(`responde en el puerto ${puerto} pero con error ${r.status}`);
  } catch {
    mal(`no responde en el puerto ${puerto}: arrancalo con npm run dev en otra ventana`);
  }
  nota("si has cambiado el .env o has hecho git pull, reinicialo (Ctrl+C y npm run dev)");
}

async function main(): Promise<void> {
  console.log("Diagnostico de Noah (no se imprime ningun valor del .env)");
  revisarEnv();
  revisarCodigo();
  await revisarFirestore();
  await revisarServidor();
  console.log(fallos === 0 ? "\nTodo bien." : `\n${fallos} cosa(s) que arreglar, empezando por la primera.`);
  process.exit(fallos === 0 ? 0 : 1);
}

void main();
