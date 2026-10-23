/**
 * Simula una llamada de pedido de principio a fin y la imprime, para poder
 * leer exactamente lo que diria Noah antes de que lo oiga un cliente.
 *
 *   npm run probar:pedido               # La Vita Buona
 *   npm run probar:pedido tixola        # otro negocio de ejemplo
 *
 * Que prueba y que NO prueba, porque la diferencia importa:
 *
 *  - SI prueba: las instrucciones que recibe el modelo, la carta con sus
 *    precios, el total (que lo calcula el servidor, no el modelo), el codigo
 *    de pedido, lo que acaba viendo la cocina, y que un plato que no esta en
 *    la carta no se pueda pedir.
 *  - NO prueba: que el modelo lleve bien la conversacion (eso lo decide el
 *    modelo en la llamada de verdad), como suena la voz, ni que Firestore
 *    guarde el pedido. Aqui no se toca la red.
 *
 * Para lo que no prueba hace falta una llamada de telefono real. Con
 * NEGOCIO_DE_EJEMPLO=lavitabuona en el .env y "npm run dev", el webhook
 * sirve este negocio sin necesidad de base de datos.
 */

import { buildAssistant, buildSystemPrompt } from "../src/assistant";
import { camposQueFaltan } from "../src/db/businesses";
import { EJEMPLOS } from "../src/db/negociosDeEjemplo";
import { construirPedido } from "../src/db/orders";
import type { Business } from "../src/db/types";
import {
  PedidoInvalidoError,
  calcularTotal,
  describirTotal,
  type LineaPedido,
  type TipoEntrega,
} from "../src/pedido";
import { formatearEuros } from "../src/util/format";

// --------------------------------------------------------------------------
// Pintar
// --------------------------------------------------------------------------

const color = process.stdout.isTTY;
const gris = (t: string) => (color ? `\x1b[90m${t}\x1b[0m` : t);
const negrita = (t: string) => (color ? `\x1b[1m${t}\x1b[0m` : t);
const verde = (t: string) => (color ? `\x1b[32m${t}\x1b[0m` : t);
const rojo = (t: string) => (color ? `\x1b[31m${t}\x1b[0m` : t);
const rosa = (t: string) => (color ? `\x1b[38;5;203m${t}\x1b[0m` : t);

function titulo(texto: string): void {
  console.log(`\n${negrita(texto)}\n${gris("-".repeat(texto.length))}`);
}

/** Lo que dice quien llama. */
function cliente(texto: string): void {
  console.log(`${negrita("Cliente:")} ${texto}`);
}

/** Lo que dice el agente. */
function noah(texto: string): void {
  console.log(`${rosa("Noah:")}    ${texto}`);
}

/** Lo que el servidor le devuelve al modelo cuando usa una herramienta. */
function herramienta(nombre: string, texto: string): void {
  console.log(gris(`  [${nombre}] -> ${texto}`));
}

// --------------------------------------------------------------------------
// La prueba
// --------------------------------------------------------------------------

function main(): void {
  const pedido = process.argv[2]?.trim() || "lavitabuona";
  const negocio: Business | undefined = EJEMPLOS[pedido];

  if (!negocio) {
    console.error(
      rojo(`No hay ningun negocio de ejemplo llamado "${pedido}".`) +
        `\nLos que hay: ${Object.keys(EJEMPLOS).join(", ")}`,
    );
    process.exitCode = 1;
    return;
  }

  // El mismo validador que corre en el servidor. Si la ficha esta mal, mejor
  // saberlo aqui que en una llamada.
  const faltan = camposQueFaltan(negocio);
  if (faltan.length > 0) {
    console.error(rojo(`La ficha de "${pedido}" esta mal: ${faltan.join(", ")}`));
    process.exitCode = 1;
    return;
  }

  console.log(`\n${negrita(negocio.nombre)} ${gris(`(${negocio.tipoLabel}, ${negocio.ciudad})`)}`);
  console.log(
    gris(
      `${negocio.carta.length} platos en la carta, de ` +
        `${formatearEuros(Math.min(...negocio.carta.map((p) => p.precioCentimos)))} a ` +
        `${formatearEuros(Math.max(...negocio.carta.map((p) => p.precioCentimos)))}. ` +
        "Nada de esto toca la red.",
    ),
  );

  const asistente = buildAssistant(negocio, negocio.id);

  titulo("1. Lo primero que oye quien llama");
  console.log(`"${asistente.firstMessage}"`);

  titulo("2. Las unicas herramientas que tiene");
  for (const t of asistente.model.tools) {
    if (t.type === "function") console.log(`- ${t.function.name}`);
    else console.log(`- ${t.type} ${gris("(colgar, de Vapi)")}`);
  }

  // -- 3. Un pedido entero -------------------------------------------------
  const campeona = negocio.carta.find((p) => /sicilias/i.test(p.nombre));
  const basica = negocio.carta.find((p) => /margaritha|margherita|margarita/i.test(p.nombre));
  const postre = negocio.carta.find((p) => /tiramisu/i.test(p.nombre));
  const entrante = negocio.carta.find((p) => /bruschetta di parma/i.test(p.nombre));

  // Si el negocio no es La Vita Buona, se cogen los tres primeros platos.
  const elegidos = [campeona, basica, postre, entrante].filter(Boolean).length === 4
    ? [entrante!, basica!, campeona!, postre!]
    : negocio.carta.slice(0, 3);

  titulo("3. Un pedido para recoger");
  cliente("Hola, buenas. Queria hacer un pedido para recoger.");
  noah("Claro que si. Digame que le pongo.");

  const [uno, dos, tres] = elegidos;

  if (campeona && basica && postre && entrante) {
    cliente(`Pues una ${basica.nombre.replace(/^Pizza /, "")} y... ¿cual es la que gano el premio?`);
    noah(
      `La ${campeona.nombre.replace(/^Pizza /, "")}: ${campeona.descripcion}. ` +
        `Son ${formatearEuros(campeona.precioCentimos)}.`,
    );
    cliente("Esa, esa. Y para picar algo mientras esperamos.");
    noah(`La ${entrante.nombre} esta muy bien: ${entrante.descripcion}.`);
    cliente("Vale, y un tiramisu. Ya esta.");
    noah("Le repito el pedido entero, a ver si esta bien.");
  } else {
    cliente(`Ponme un ${uno?.nombre}, un ${dos?.nombre} y un ${tres?.nombre}.`);
    noah("Le repito el pedido entero, a ver si esta bien.");
  }

  const articulos: LineaPedido[] = elegidos
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => ({ plato: p.id, cantidad: 1 }));

  const entrega: TipoEntrega = "recogida";
  const total = calcularTotal(negocio, articulos, entrega);
  herramienta("calcular_total", describirTotal(negocio, total));
  noah("Eso es. ¿Me da un nombre y un telefono?");
  cliente("Ana Ferreiro, seis cero cero, once, veintidos, treinta y tres.");

  const comanda = construirPedido(
    negocio,
    { articulos, entrega, telefono: "600 11 22 33", callId: "prueba-1" },
    total,
  );
  herramienta(
    "registrar_pedido",
    `Pedido registrado. El codigo es ${comanda.codigo.split("").join(" ")}. Total: ${formatearEuros(comanda.totalCentimos)}.`,
  );
  noah(
    `Perfecto. Su codigo es ${comanda.codigo.split("").join(", ")}. ` +
      `En ${negocio.entrega.tiempoRecogida} lo tiene listo, y se paga al recoger.`,
  );

  // -- 4. La comanda en cocina ---------------------------------------------
  titulo("4. Lo que ve la cocina, al momento");
  console.log(
    verde(`  ${comanda.codigo}`) +
      gris(`   ${comanda.tipoEntrega}   ${comanda.telefono}   ${comanda.estado}`),
  );
  for (const linea of comanda.lineas) {
    console.log(
      `  ${String(linea.cantidad).padStart(2)} x ${linea.nombre.padEnd(34)} ` +
        `${formatearEuros(linea.importeCentimos).padStart(9)}`,
    );
  }
  console.log(gris("  " + "-".repeat(50)));
  console.log(`  ${"TOTAL".padEnd(39)} ${formatearEuros(comanda.totalCentimos).padStart(9)}`);

  // -- 5. Lo que no se puede pedir -----------------------------------------
  titulo("5. Lo que NO se puede pedir");
  // Para las pruebas de cantidad se coge el plato mas caro, que es el que mas
  // dolerian cuarenta unidades.
  const caro = [...negocio.carta].sort((a, b) => b.precioCentimos - a.precioCentimos)[0];
  for (const intento of [
    { que: "una pizza con pina", articulos: [{ plato: "pizza con pina", cantidad: 1 }] },
    { que: `cuarenta de "${caro?.nombre}"`, articulos: [{ plato: caro?.id ?? "", cantidad: 40 }] },
    { que: "media racion", articulos: [{ plato: caro?.id ?? "", cantidad: 0.5 }] },
  ]) {
    try {
      calcularTotal(negocio, intento.articulos as LineaPedido[], "recogida");
      console.log(rojo(`  FALLO: ha aceptado ${intento.que}.`));
    } catch (error) {
      const motivo = error instanceof PedidoInvalidoError ? error.message : String(error);
      console.log(`  ${intento.que.padEnd(34)} ${gris("->")} ${verde(motivo)}`);
    }
  }
  console.log(
    gris("\n  El precio no lo pone el modelo: sale de la misma carta que lee en voz alta,"),
  );
  console.log(gris("  asi que lo que dice y lo que se cobra no pueden descuadrarse."));

  // -- 6. Las instrucciones ------------------------------------------------
  titulo("6. Las instrucciones que recibe el modelo");
  console.log(
    gris(
      "Esto es lo que lee el modelo en cada llamada. Todo lo que diga por\n" +
        "telefono sale de aqui.\n",
    ),
  );
  console.log(buildSystemPrompt(negocio));
}

main();
