/**
 * Las dos herramientas del agente en modo citas: buscar hueco y reservar.
 *
 * Mismo reparto de responsabilidades que en los pedidos. El modelo conduce la
 * conversacion y nada mas: que huecos hay lo decide el servidor, y si la cita
 * se puede poner o no, tambien. El modelo solo lee lo que se le devuelve.
 *
 * Todo lo de fuera (el calendario, la hora actual) entra por parametro, asi
 * que esto se prueba entero sin red y sin esperar a que pase el tiempo.
 */

import { tratoAlCliente, type Clinica, type TipoCita } from "../db/clinica";
import type { ClienteCalendario } from "../google/calendario";
import { CalendarioError } from "../google/calendario";
import { decirMomento, describirHuecos } from "./decir";
import { AgendaInvalidaError, calcularHuecos, repartirHuecos, type Hueco } from "./huecos";

export const TOOL_BUSCAR_HUECOS = "buscar_huecos";
export const TOOL_RESERVAR_CITA = "reservar_cita";

/** Lo que el agente necesita para resolver una herramienta de citas. */
export interface ContextoCitas {
  clinica: Clinica;
  calendario: ClienteCalendario | null;
  /** Identificador de la llamada, para no duplicar la cita si reintenta. */
  callId: string;
  ahora: Date;
}

// ---------------------------------------------------------------------------
// Memoria de lo que se le ha ofrecido a esta llamada
// ---------------------------------------------------------------------------

/**
 * Lo ultimo que se le ofrecio a cada llamada, para que el paciente pueda decir
 * "el segundo" y sepamos de cual habla.
 *
 * Es memoria del proceso, y eso tiene un limite que conviene tener presente:
 * con varias instancias del servidor, el tool-call de reservar puede caer en
 * una que no atendio el de buscar y aqui no habra nada. Por eso la hora
 * tambien viaja en el texto que se le devuelve al modelo, y reservar_cita
 * funciona igual sin esta memoria. Esto es una comodidad, no un cimiento.
 */
interface Oferta {
  huecos: Hueco[];
  tipoCitaId: string;
  caducaEn: number;
}

const ofertas = new Map<string, Oferta>();

/** Una llamada de telefono no dura mas que esto. */
const VIDA_OFERTA_MS = 20 * 60_000;

function recordar(callId: string, oferta: Omit<Oferta, "caducaEn">, ahora: Date): void {
  if (!callId) return;
  // Se limpia al escribir: no hay ningun proceso de fondo que lo haga, y sin
  // esto el mapa crece con cada llamada hasta que el servidor se reinicia.
  for (const [clave, vieja] of ofertas) {
    if (vieja.caducaEn <= ahora.getTime()) ofertas.delete(clave);
  }
  ofertas.set(callId, { ...oferta, caducaEn: ahora.getTime() + VIDA_OFERTA_MS });
}

function recordado(callId: string, ahora: Date): Oferta | undefined {
  const oferta = ofertas.get(callId);
  if (!oferta) return undefined;
  if (oferta.caducaEn <= ahora.getTime()) {
    ofertas.delete(callId);
    return undefined;
  }
  return oferta;
}

/** Solo para las pruebas: deja la memoria como recien arrancada. */
export function olvidarOfertas(): void {
  ofertas.clear();
}

// ---------------------------------------------------------------------------
// Utilidades
// ---------------------------------------------------------------------------

function sinTildes(texto: string): string {
  return texto
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/**
 * Encuentra el tipo de cita por id o por nombre. El modelo manda el id, pero
 * a veces devuelve lo que dijo el paciente ("una limpieza", "limpieza").
 */
export function buscarTipoCita(clinica: Clinica, texto: unknown): TipoCita | undefined {
  const buscado = sinTildes(String(texto ?? ""));
  if (!buscado) return undefined;

  const exacto = clinica.tiposCita.find(
    (tipo) => sinTildes(tipo.id) === buscado || sinTildes(tipo.nombre) === buscado,
  );
  if (exacto) return exacto;

  // "limpieza" contra "una limpieza": que uno contenga al otro basta, y evita
  // mandar al paciente a repetirse por un articulo.
  return clinica.tiposCita.find((tipo) => {
    const nombre = sinTildes(tipo.nombre);
    return nombre.includes(buscado) || buscado.includes(nombre);
  });
}

function listaDeTipos(clinica: Clinica): string {
  return clinica.tiposCita
    .filter((tipo) => !tipo.esUrgencia)
    .map((tipo) => tipo.nombre)
    .join(", ");
}

/** Hasta donde hay que mirar el calendario para cubrir los dias de vista. */
function ventana(clinica: Clinica, ahora: Date): { desde: Date; hasta: Date } {
  const dias = Math.max(clinica.agenda.diasVista, 1);
  return {
    desde: ahora,
    // Un dia de mas por los dos lados: una cita que empieza el ultimo dia
    // puede acabar al siguiente, y la zona horaria puede correr el borde.
    hasta: new Date(ahora.getTime() + (dias + 1) * 86_400_000),
  };
}

// ---------------------------------------------------------------------------
// buscar_huecos
// ---------------------------------------------------------------------------

export async function buscarHuecos(
  contexto: ContextoCitas,
  argumentos: Record<string, unknown>,
): Promise<string> {
  const { clinica, calendario, ahora } = contexto;

  const tipo = buscarTipoCita(clinica, argumentos["tipo_cita"]);
  if (!tipo) {
    return `No se de que tipo de cita hablas. Preguntale ${tratoAlCliente(clinica).al} que necesita y elige una de estas: ${listaDeTipos(clinica)}.`;
  }

  if (tipo.esUrgencia) {
    // Puede no haber frase de urgencias: un centro de estetica no tiene
    // urgencias que derivar. Entonces no se inventa ninguna, se recoge el
    // recado, que es lo unico que el agente puede hacer sin valorar nada.
    return clinica.urgencias
      ? `Eso es una urgencia: no busques hueco. Dile exactamente esto y nada mas: "${clinica.urgencias.queDecir}"`
      : "Eso no es una cita que puedas dar tu y no lo valores. Dile que se lo tiene que ver alguien del centro, pidele el nombre y un telefono, y di que le llaman.";
  }

  if (!calendario) {
    return "No puedo consultar la agenda ahora mismo. Pidele el nombre y un telefono, dile que le llaman en cuanto se pueda, y no le des ninguna hora.";
  }

  let ocupado;
  try {
    const { desde, hasta } = ventana(clinica, ahora);
    ocupado = await calendario.tramosOcupados({
      calendarId: clinica.agenda.calendarId,
      desde,
      hasta,
      zonaHoraria: clinica.zonaHoraria,
    });
  } catch (error) {
    // Aqui no se puede improvisar: sin saber que esta ocupado, cualquier hora
    // que diera el agente podria estar pisando a otro paciente.
    console.error("[buscar_huecos] no se pudo leer el calendario", error);
    return "No puedo consultar la agenda ahora mismo. Pidele el nombre y un telefono, dile que le llaman en cuanto se pueda, y no le des ninguna hora.";
  }

  let libres: Hueco[];
  try {
    libres = calcularHuecos({ clinica, tipoCita: tipo, ocupado, ahora });
  } catch (error) {
    if (error instanceof AgendaInvalidaError) {
      console.error("[buscar_huecos] la agenda de la clinica esta mal puesta", error);
      return "No puedo consultar la agenda ahora mismo. Pidele el nombre y un telefono, dile que le llaman en cuanto se pueda, y no le des ninguna hora.";
    }
    throw error;
  }

  const ofrecidos = repartirHuecos(libres, clinica.agenda.huecosPorTanda, clinica.zonaHoraria);
  recordar(contexto.callId, { huecos: ofrecidos, tipoCitaId: tipo.id }, ahora);

  if (ofrecidos.length === 0) {
    return describirHuecos({ huecos: [], ahora, zonaHoraria: clinica.zonaHoraria, nombreCita: tipo.nombre });
  }

  // La hora exacta viaja tambien en el texto, en formato de maquina, para que
  // el modelo la copie al reservar. Asi reservar no depende de la memoria.
  const referencias = ofrecidos
    .map((hueco, i) => `[${i + 1}]=${hueco.inicio.toISOString()}`)
    .join(" ");

  return (
    describirHuecos({ huecos: ofrecidos, ahora, zonaHoraria: clinica.zonaHoraria, nombreCita: tipo.nombre }) +
    ` Horas exactas, copialas tal cual en el campo inicio al reservar: ${referencias}`
  );
}

// ---------------------------------------------------------------------------
// reservar_cita
// ---------------------------------------------------------------------------

/** De lo que diga el modelo a un instante, por las dos vias. */
function resolverInicio(
  argumentos: Record<string, unknown>,
  oferta: Oferta | undefined,
): Date | null {
  const bruto = argumentos["inicio"];
  if (typeof bruto === "string" && bruto.trim()) {
    const fecha = new Date(bruto.trim());
    if (!Number.isNaN(fecha.getTime())) return fecha;
  }

  const opcion = Number(argumentos["opcion"]);
  if (oferta && Number.isInteger(opcion) && opcion >= 1 && opcion <= oferta.huecos.length) {
    return oferta.huecos[opcion - 1]?.inicio ?? null;
  }

  return null;
}

export async function reservarCita(
  contexto: ContextoCitas,
  argumentos: Record<string, unknown>,
): Promise<string> {
  const { clinica, calendario, ahora, callId } = contexto;
  const oferta = recordado(callId, ahora);
  const trato = tratoAlCliente(clinica);

  const nombre = String(argumentos["nombre"] ?? "").trim();
  const telefono = String(argumentos["telefono"] ?? "").trim();
  if (!nombre) return `Falta el nombre ${trato.del}. Preguntaselo y vuelve a reservar.`;
  if (!telefono) return "Falta un telefono de contacto. Pideselo y vuelve a reservar.";

  const tipo =
    buscarTipoCita(clinica, argumentos["tipo_cita"]) ??
    (oferta ? clinica.tiposCita.find((t) => t.id === oferta.tipoCitaId) : undefined);
  if (!tipo) {
    return `No se para que es la cita. Preguntaselo y elige una de estas: ${listaDeTipos(clinica)}.`;
  }

  const inicio = resolverInicio(argumentos, oferta);
  if (!inicio) {
    return "No se que hora ha elegido. Vuelve a llamar a buscar_huecos, ofreceselas otra vez y reserva con la hora exacta que te devuelva.";
  }

  if (!calendario) {
    return "No puedo escribir en la agenda ahora mismo. NO le confirmes la cita: dile que se la confirman por telefono en cuanto se pueda.";
  }

  // Se vuelve a mirar el calendario antes de escribir. Entre que se le
  // ofrecio el hueco y el paciente se decidio han pasado segundos o minutos,
  // y en ese rato la recepcionista ha podido dar esa misma hora en mano.
  let libre = false;
  try {
    const { desde, hasta } = ventana(clinica, ahora);
    const ocupado = await calendario.tramosOcupados({
      calendarId: clinica.agenda.calendarId,
      desde,
      hasta,
      zonaHoraria: clinica.zonaHoraria,
    });
    libre = calcularHuecos({ clinica, tipoCita: tipo, ocupado, ahora }).some(
      (hueco) => hueco.inicio.getTime() === inicio.getTime(),
    );
  } catch (error) {
    console.error("[reservar_cita] no se pudo comprobar el hueco", error);
    return "No puedo escribir en la agenda ahora mismo. NO le confirmes la cita: dile que se la confirman por telefono en cuanto se pueda.";
  }

  if (!libre) {
    return `Esa hora ya no esta libre. Disculpate, vuelve a llamar a buscar_huecos para ${tipo.nombre} y ofrecele las nuevas.`;
  }

  const fin = new Date(inicio.getTime() + tipo.minutos * 60_000);

  try {
    const resultado = await calendario.crearCita({
      calendarId: clinica.agenda.calendarId,
      inicio,
      fin,
      zonaHoraria: clinica.zonaHoraria,
      titulo: `${nombre} - ${tipo.nombre}`,
      detalle: [
        `Cita pedida por telefono con ${clinica.nombreAgente || "Noah"}.`,
        `${trato.etiqueta}: ${nombre}`,
        `Telefono: ${telefono}`,
        `Motivo: ${tipo.nombre}`,
        argumentos["notas"] ? `Notas: ${String(argumentos["notas"]).trim()}` : "",
      ]
        .filter(Boolean)
        .join("\n"),
      referencia: callId || `${nombre}-${inicio.toISOString()}`,
    });

    const cuando = decirMomento(inicio, ahora, clinica.zonaHoraria);
    return resultado.nueva
      ? `Cita puesta: ${tipo.nombre}, ${cuando}, a nombre de ${nombre}. Confirmaselo ${trato.al} diciendo el dia y la hora, y despidete.`
      : `Esta cita ya estaba puesta, no se ha duplicado: ${tipo.nombre}, ${cuando}, a nombre de ${nombre}. Confirmasela igual y no vuelvas a reservar.`;
  } catch (error) {
    if (error instanceof CalendarioError) {
      console.error("[reservar_cita] Google no acepto la cita", error);
    } else {
      console.error("[reservar_cita] error inesperado", error);
    }
    return "NO se ha podido poner la cita. Pide disculpas, dile que le llaman en seguida para confirmarsela, y asegurate de tener su nombre y su telefono.";
  }
}
