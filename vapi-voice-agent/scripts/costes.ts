/**
 * Cuanto cuesta de verdad cada minuto de llamada, sacado de las llamadas que
 * ya se han hecho. Vapi manda el coste de cada una al colgar y el servidor lo
 * guarda; esto lo suma.
 *
 *   npm run costes                 (el negocio de DEFAULT_BUSINESS_ID)
 *   npm run costes lavitabuona
 *
 * Con eso se comprueba si los minutos que incluye cada plan dejan margen.
 */

import { config } from "../src/config";
import { firestore } from "../src/db/firebase";

/** Para pasar de dolares a euros. Aproximado: basta para ver el margen. */
const EUR_POR_USD = 0.92;

const PLANES = [
  { nombre: "Esencial", precio: 129, minutos: 300 },
  { nombre: "Pro", precio: 199, minutos: 750 },
  { nombre: "Total", precio: 349, minutos: 1500 },
];

async function main(): Promise<void> {
  if (!firestore) {
    console.error("Sin Firebase no hay llamadas guardadas que sumar.");
    process.exit(1);
  }
  const id = process.argv[2] ?? (config.defaultBusinessId.trim() || "lavitabuona-prueba");
  const docs = await firestore.collection("businesses").doc(id).collection("llamadas").get();

  let segundos = 0;
  let dolares = 0;
  let conCoste = 0;
  for (const doc of docs.docs) {
    const d = doc.data() as { duracionSegundos?: number; costeUsd?: number };
    if (typeof d.costeUsd === "number" && d.costeUsd > 0 && typeof d.duracionSegundos === "number" && d.duracionSegundos > 0) {
      segundos += d.duracionSegundos;
      dolares += d.costeUsd;
      conCoste += 1;
    }
  }

  console.log(`Llamadas de "${id}" con coste: ${conCoste} de ${docs.size}`);
  if (conCoste === 0) {
    console.log("Todavia no hay ninguna con coste. Haz una llamada de prueba y vuelve a mirarlo.");
    process.exit(0);
  }
  const minutos = segundos / 60;
  const euroMinuto = (dolares * EUR_POR_USD) / minutos;
  console.log(`Minutos: ${minutos.toFixed(1)}   Coste: ${dolares.toFixed(2)} $   =>  ${euroMinuto.toFixed(3)} € por minuto`);
  console.log(`Una llamada media: ${(minutos / conCoste).toFixed(1)} min, ${((dolares * EUR_POR_USD) / conCoste).toFixed(2)} €\n`);

  console.log("Si el cliente gasta TODOS los minutos del plan (lo peor para ti):");
  for (const p of PLANES) {
    const coste = p.minutos * euroMinuto;
    console.log(`  ${p.nombre.padEnd(9)} ${p.precio} €  - ${coste.toFixed(0).padStart(4)} € de llamadas  =  ${(p.precio - coste).toFixed(0).padStart(4)} € de margen`);
  }
  console.log("\nSin contar el servidor (~7 €/mes), el numero de telefono ni la tablet del Total.");
  process.exit(0);
}

void main();
