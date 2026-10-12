/**
 * Crea una clinica en Firestore, en /businesses/{id}, con modo "citas".
 *
 *   npm run crear:clinica                                   (las lista)
 *   npm run crear:clinica pontenova <id-del-calendario>
 *
 * El id del calendario es obligatorio y no tiene valor por defecto a
 * proposito. Sin el correcto, las citas se crean en un calendario que no mira
 * nadie y no te enteras hasta que llega un paciente a deshora.
 *
 * Donde lo encuentra la clinica: Google Calendar, los tres puntos del
 * calendario, Configuracion y uso compartido, seccion "Integrar calendario",
 * campo "ID del calendario". Suele ser su propio correo, o una cadena larga
 * acabada en @group.calendar.google.com.
 *
 * Antes de que esto funcione, la clinica tiene que compartir ese calendario
 * con el correo de la cuenta de servicio, con permiso para "Realizar cambios
 * en los eventos".
 */

import { CLINICAS_DE_EJEMPLO } from "../src/db/clinicasDeEjemplo";
import { firestore } from "../src/db/firebase";
import { camposQueFaltanClinica } from "../src/db/validarClinica";
import { datosDeAcceso, parsearCuentaDeServicio } from "../src/google/credencial";
import { config } from "../src/config";

function correoDeLaCuentaDeServicio(): string {
  if (!config.firebaseServiceAccount) return "";
  try {
    return datosDeAcceso(parsearCuentaDeServicio(config.firebaseServiceAccount))?.clientEmail ?? "";
  } catch {
    return "";
  }
}

async function main(): Promise<void> {
  const id = process.argv[2];
  const calendarId = process.argv[3];

  if (!id) {
    console.log("Clinicas de ejemplo disponibles:");
    for (const [clave, clinica] of Object.entries(CLINICAS_DE_EJEMPLO)) {
      const agendables = clinica.tiposCita.filter((t) => !t.esUrgencia).length;
      console.log(`  ${clave.padEnd(12)} ${clinica.nombre} (${agendables} tratamientos)`);
    }
    console.log("\nUso: npm run crear:clinica <id> <id-del-calendario>");
    return;
  }

  const base = CLINICAS_DE_EJEMPLO[id];
  if (!base) {
    console.error(`No hay ninguna clinica de ejemplo con el id "${id}".`);
    console.error(`Disponibles: ${Object.keys(CLINICAS_DE_EJEMPLO).join(", ")}`);
    process.exit(1);
  }

  if (!calendarId) {
    console.error("Falta el id del calendario de la clinica.");
    console.error(`  npm run crear:clinica ${id} clinica@gmail.com`);
    console.error(
      "\nLo saca la clinica de: Configuracion del calendario > Integrar calendario > ID del calendario.",
    );
    process.exit(1);
  }

  if (calendarId === "primary") {
    console.error('El calendario no puede ser "primary".');
    console.error(
      "Autenticados como la cuenta de servicio, 'primary' es SU calendario, no el de la clinica:",
    );
    console.error(
      "las citas se crearian sin dar error, en una agenda que no mira nadie.",
    );
    process.exit(1);
  }

  const clinica = { ...base, agenda: { ...base.agenda, calendarId } };

  const faltan = camposQueFaltanClinica(clinica);
  if (faltan.length > 0) {
    console.error(`La ficha no es valida. Problemas: ${faltan.join(", ")}`);
    process.exit(1);
  }

  if (!firestore) {
    console.error("Firebase no esta configurado. Rellena FIREBASE_SERVICE_ACCOUNT en el .env.");
    process.exit(1);
  }

  await firestore.collection("businesses").doc(clinica.id).set(clinica);

  console.log(`Clinica "${clinica.nombre}" guardada en /businesses/${clinica.id}`);
  console.log(`Calendario: ${calendarId}`);
  console.log(
    `Da cita para: ${clinica.tiposCita.filter((t) => !t.esUrgencia).map((t) => t.nombre).join(", ")}`,
  );

  const correo = correoDeLaCuentaDeServicio();
  console.log("\nFalta un paso que no puedo hacer yo:");
  console.log(
    `  La clinica tiene que compartir ese calendario con ${correo || "el correo de tu cuenta de servicio"}`,
  );
  console.log('  con permiso "Realizar cambios en los eventos".');
  console.log(
    "\nY en tu proyecto de Google Cloud, la Google Calendar API tiene que estar habilitada.",
  );
  console.log(
    "\nEl servidor cachea los negocios 60 segundos, asi que puede tardar un minuto en verlo.",
  );
}

if (require.main === module) {
  void main();
}
