/**
 * Simula una llamada de cita de principio a fin y la imprime, para poder leer
 * exactamente lo que diria Noah antes de que lo oiga un cliente.
 *
 *   npm run probar:citas            # centro de estetica
 *   npm run probar:citas pontenova  # clinica dental
 *
 * Que prueba y que NO prueba, porque la diferencia importa:
 *
 *  - SI prueba: las instrucciones que recibe el modelo, los huecos que salen
 *    de la agenda del negocio, como se dicen en voz alta, que la hora que se
 *    ofrece es la que se reserva, y que no se confirma una cita que no se ha
 *    podido escribir.
 *  - NO prueba: que el modelo elija bien la herramienta (eso lo decide GPT en
 *    la llamada de verdad), ni que Google acepte la cita (aqui el calendario
 *    es de mentira), ni como suena la voz.
 *
 * Para lo que no prueba hace falta una llamada de telefono real contra un
 * calendario de Google compartido de verdad. Esto es el paso de antes.
 */

import { buildAssistantCitas, buildSystemPromptCitas } from "../src/assistantCitas";
import { buscarHuecos, olvidarOfertas, reservarCita } from "../src/citas/herramientas";
import type { Intervalo } from "../src/citas/huecos";
import { CLINICAS_DE_EJEMPLO } from "../src/db/clinicasDeEjemplo";
import { camposQueFaltanClinica } from "../src/db/validarClinica";
import type { Clinica } from "../src/db/clinica";
import type { ClienteCalendario, DatosCita } from "../src/google/calendario";

// --------------------------------------------------------------------------
// Pintar
// --------------------------------------------------------------------------

const color = process.stdout.isTTY;
const gris = (t: string) => (color ? `\x1b[90m${t}\x1b[0m` : t);
const negrita = (t: string) => (color ? `\x1b[1m${t}\x1b[0m` : t);
const verde = (t: string) => (color ? `\x1b[32m${t}\x1b[0m` : t);
const rojo = (t: string) => (color ? `\x1b[31m${t}\x1b[0m` : t);

function titulo(texto: string): void {
  console.log(`\n${negrita(texto)}\n${gris("-".repeat(texto.length))}`);
}

/** Lo que diria la persona que llama. */
function dice(quien: string, texto: string): void {
  console.log(`${negrita(`${quien}:`)} ${texto}`);
}

/** Lo que le devuelve el servidor al modelo cuando usa una herramienta. */
function herramienta(nombre: string, texto: string): void {
  console.log(gris(`  [${nombre}] -> ${texto}`));
}

// --------------------------------------------------------------------------
// Calendario de mentira
// --------------------------------------------------------------------------

/**
 * Se comporta como el de Google en lo que afecta a la conversacion: lo que se
 * escribe queda ocupado, y se le puede ocupar una hora a mano para ver que
 * pasa cuando le pisan el hueco a quien esta al telefono.
 */
function calendarioDeMentira() {
  const creadas: DatosCita[] = [];
  const ocupado: Intervalo[] = [];

  const api: ClienteCalendario = {
    async tramosOcupados() {
      return [...ocupado];
    },
    async crearCita(datos) {
      creadas.push(datos);
      ocupado.push({ desde: datos.inicio, hasta: datos.fin });
      return { nueva: true, id: `id-${creadas.length}` };
    },
  };

  return {
    api,
    creadas,
    ocupar(desde: Date, minutos: number) {
      ocupado.push({ desde, hasta: new Date(desde.getTime() + minutos * 60_000) });
    },
  };
}

// --------------------------------------------------------------------------
// La prueba
// --------------------------------------------------------------------------

/** Saca el ISO de la primera opcion del texto que devuelve buscar_huecos. */
function primeraHora(texto: string): string | undefined {
  return texto.match(/\[1\]=(\S+)/)?.[1];
}

async function main(): Promise<void> {
  const pedido = process.argv[2]?.trim() || "airea";
  const clinica: Clinica | undefined = CLINICAS_DE_EJEMPLO[pedido];

  if (!clinica) {
    console.error(
      rojo(`No hay ningun negocio de ejemplo llamado "${pedido}".`) +
        `\nLos que hay: ${Object.keys(CLINICAS_DE_EJEMPLO).join(", ")}`,
    );
    process.exitCode = 1;
    return;
  }

  // Antes de nada: el mismo validador que corre en el servidor. Si el ejemplo
  // esta mal puesto, mejor saberlo aqui que en una llamada.
  const faltan = camposQueFaltanClinica(clinica);
  if (faltan.length > 0) {
    console.error(rojo(`El ejemplo "${pedido}" esta mal: ${faltan.join(", ")}`));
    process.exitCode = 1;
    return;
  }

  const calendario = calendarioDeMentira();
  const ahora = new Date();
  const contexto = { clinica, calendario: calendario.api, callId: "prueba-1", ahora };
  olvidarOfertas();

  console.log(
    `\n${negrita(clinica.nombre)} ${gris(`(${clinica.tipoLabel}, ${clinica.ciudad})`)}`,
  );
  console.log(
    gris(
      "Calendario de mentira: nada de esto se escribe en Google. " +
        `Hora de la prueba: ${ahora.toLocaleString("es-ES", { timeZone: clinica.zonaHoraria })}`,
    ),
  );

  // -- 1. Como se presenta -------------------------------------------------
  const asistente = buildAssistantCitas(clinica, clinica.id);
  titulo("1. Lo primero que oye quien llama");
  console.log(`"${asistente.firstMessage}"`);

  titulo("2. Las unicas herramientas que tiene");
  for (const t of asistente.model.tools) {
    if (t.type === "function") {
      console.log(`- ${t.function.name}`);
    } else {
      console.log(`- ${t.type} ${gris("(colgar, de Vapi)")}`);
    }
  }

  // -- 3. Una cita normal --------------------------------------------------
  const agendables = clinica.tiposCita.filter((t) => !t.esUrgencia);
  const primero = agendables[0];
  if (!primero) {
    console.error(rojo("Este negocio no tiene ningun tratamiento agendable."));
    process.exitCode = 1;
    return;
  }

  titulo(`3. Una cita normal: ${primero.nombre}`);
  dice("Quien llama", `Hola, queria pedir cita para ${primero.nombre}.`);

  const ofrecidos = await buscarHuecos(contexto, { tipo_cita: primero.id });
  herramienta("buscar_huecos", ofrecidos);

  const hora = primeraHora(ofrecidos);
  if (!hora) {
    console.log(rojo("  No ha salido ningun hueco. Mira las franjas de la agenda."));
  } else {
    dice("Quien llama", "La primera me viene bien.");
    dice("Quien llama", "Soy Ana Ferreiro, mi telefono es el 600 11 22 33.");

    const reserva = await reservarCita(contexto, {
      inicio: hora,
      tipo_cita: primero.id,
      nombre: "Ana Ferreiro",
      telefono: "600 11 22 33",
    });
    herramienta("reservar_cita", reserva);

    const cita = calendario.creadas[0];
    if (cita) {
      console.log(verde("\n  Lo que quedaria escrito en el calendario del negocio:"));
      console.log(gris(`  Titulo: ${cita.titulo}`));
      console.log(
        gris(
          `  Cuando: ${cita.inicio.toLocaleString("es-ES", { timeZone: clinica.zonaHoraria })}` +
            ` - ${cita.fin.toLocaleTimeString("es-ES", { timeZone: clinica.zonaHoraria })}`,
        ),
      );
      for (const linea of cita.detalle.split("\n")) console.log(gris(`  ${linea}`));
    } else {
      console.log(rojo("  NO se ha escrito la cita. Esto es un fallo."));
    }
  }

  // -- 4. Algo que el negocio no hace --------------------------------------
  titulo("4. Piden algo que el negocio no hace");
  dice("Quien llama", "Queria cita para un trasplante de pelo.");
  herramienta(
    "buscar_huecos",
    await buscarHuecos(contexto, { tipo_cita: "un trasplante de pelo" }),
  );

  // -- 5. Dolor o urgencia -------------------------------------------------
  const urgencia = clinica.tiposCita.find((t) => t.esUrgencia);
  titulo("5. Llaman con dolor");
  dice("Quien llama", "Me duele muchisimo, no he dormido.");
  if (urgencia) {
    herramienta("buscar_huecos", await buscarHuecos(contexto, { tipo_cita: urgencia.id }));
  } else {
    console.log(
      gris(
        "  Este negocio no tiene circuito de urgencias, asi que el agente ni\n" +
          "  busca hueco ni valora nada. Lo que tiene en las instrucciones es:",
      ),
    );
    const prompt = buildSystemPromptCitas(clinica);
    const bloque = prompt.split("\n# ").find((b) => b.startsWith("SI ALGUIEN LLAMA"));
    for (const linea of (bloque ?? "").trim().split("\n")) console.log(gris(`  ${linea}`));
  }

  // -- 6. Le pisan el hueco ------------------------------------------------
  const segundo = agendables[1] ?? primero;
  titulo(`6. Le pisan el hueco mientras se decide (${segundo.nombre})`);

  const otraVez = await buscarHuecos(contexto, { tipo_cita: segundo.id });
  herramienta("buscar_huecos", otraVez);
  const horaPisada = primeraHora(otraVez);

  if (horaPisada) {
    console.log(gris("  (alguien del negocio da esa misma hora en mano)"));
    calendario.ocupar(new Date(horaPisada), segundo.minutos);

    const antes = calendario.creadas.length;
    const resultado = await reservarCita(contexto, {
      inicio: horaPisada,
      tipo_cita: segundo.id,
      nombre: "Marta Rey",
      telefono: "600 44 55 66",
    });
    herramienta("reservar_cita", resultado);

    const haEscrito = calendario.creadas.length > antes;
    console.log(
      haEscrito
        ? rojo("  FALLO: ha escrito una cita encima de otra.")
        : verde("  Bien: no ha escrito nada y no se la confirma."),
    );
  }

  // -- 7. Sin calendario ---------------------------------------------------
  titulo("7. Si el calendario no contesta (Google caido, mal compartido)");
  const sinCalendario = { ...contexto, calendario: null };
  herramienta("buscar_huecos", await buscarHuecos(sinCalendario, { tipo_cita: primero.id }));
  herramienta(
    "reservar_cita",
    await reservarCita(sinCalendario, {
      inicio: new Date(ahora.getTime() + 86_400_000).toISOString(),
      tipo_cita: primero.id,
      nombre: "Ana Ferreiro",
      telefono: "600 11 22 33",
    }),
  );
  console.log(verde("  Lo importante: en los dos casos no da hora y no confirma nada."));

  // -- 8. Las instrucciones completas --------------------------------------
  titulo("8. Las instrucciones que recibe el modelo");
  console.log(
    gris(
      "Esto es lo que lee el modelo en cada llamada. Vale la pena leerlo\n" +
        "entero una vez: todo lo que diga por telefono sale de aqui.\n",
    ),
  );
  console.log(buildSystemPromptCitas(clinica));
}

main().catch((error) => {
  console.error(rojo("La prueba se ha caido:"), error);
  process.exitCode = 1;
});
