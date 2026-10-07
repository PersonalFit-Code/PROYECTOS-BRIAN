/**
 * Crea un negocio de ejemplo en Firestore, en /businesses/{id}.
 *
 * Sirve para probar el multi-negocio sin tener todavia los datos reales de un
 * restaurante: con esto el mismo servidor atiende la pizzeria y la taperia
 * segun el ?business= de la URL.
 *
 *   npm run crear:negocio tixola
 *   npm run crear:negocio            (los lista)
 *
 * Para un negocio de verdad, copia uno de estos bloques, cambia los datos y
 * vuelve a lanzarlo: si el id ya existe, se sobrescribe.
 */

import { firestore } from "../src/db/firebase";
import { EJEMPLOS } from "../src/db/negociosDeEjemplo";

async function main(): Promise<void> {
  const id = process.argv[2];

  if (!id) {
    console.log("Negocios de ejemplo disponibles:");
    for (const [clave, negocio] of Object.entries(EJEMPLOS)) {
      console.log(`  ${clave.padEnd(12)} ${negocio.nombre} (${negocio.carta.length} platos)`);
    }
    console.log("\nUso: npm run crear:negocio <id>");
    return;
  }

  const negocio = EJEMPLOS[id];
  if (!negocio) {
    console.error(`No hay ningun ejemplo con el id "${id}".`);
    console.error(`Disponibles: ${Object.keys(EJEMPLOS).join(", ")}`);
    process.exit(1);
  }

  if (!firestore) {
    console.error(
      "Firebase no esta configurado. Rellena FIREBASE_SERVICE_ACCOUNT en el .env.",
    );
    process.exit(1);
  }

  await firestore.collection("businesses").doc(negocio.id).set(negocio);

  console.log(`Negocio "${negocio.nombre}" guardado en /businesses/${negocio.id}`);
  console.log(`Carta: ${negocio.carta.map((p) => p.nombre).join(", ")}`);
  console.log("\nPruebalo con:");
  console.log(`  npm run prueba:pedido ${negocio.id}`);
  console.log(`  y abre http://localhost:3000/pedidos?business=${negocio.id}`);
  console.log(
    "\nEl servidor cachea los negocios 60 segundos, asi que puede tardar un minuto en verlo.",
  );
}

// Solo se ejecuta al lanzarlo directamente, para poder importar EJEMPLOS
// desde una prueba sin que escriba nada.
if (require.main === module) {
  void main();
}
