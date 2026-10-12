/**
 * Como se dice una hora en voz alta.
 *
 * Esto no es cosmetica. El agente lee por telefono a gente que muchas veces
 * esta de pie, con prisa o con un nino al lado, y "dieciocho treinta" obliga a
 * traducir mentalmente mientras el otro sigue hablando. "Las seis y media de
 * la tarde" no hay que traducirlo.
 *
 * Y hay un motivo mas prosaico: a los sintetizadores de voz las horas en
 * cifras se les atragantan. Dandoselas ya escritas en palabras, suenan igual
 * siempre.
 */

import { enZona } from "../util/zona";

const HORAS = [
  "", "una", "dos", "tres", "cuatro", "cinco", "seis",
  "siete", "ocho", "nueve", "diez", "once", "doce",
] as const;

const MINUTOS_EN_PALABRA = [
  "", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho",
  "nueve", "diez", "once", "doce", "trece", "catorce", "cuarto",
  "dieciseis", "diecisiete", "dieciocho", "diecinueve", "veinte",
  "veintiuno", "veintidos", "veintitres", "veinticuatro", "veinticinco",
  "veintiseis", "veintisiete", "veintiocho", "veintinueve", "media",
] as const;

const DIAS = ["", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado", "domingo"] as const;

const MESES = [
  "", "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
] as const;

function parteDelDia(hora: number): string {
  if (hora < 6) return "de la madrugada";
  if (hora < 13) return "de la manana";
  if (hora < 21) return "de la tarde";
  return "de la noche";
}

/**
 * "las seis y media de la tarde", "la una menos cuarto de la tarde".
 *
 * Pasada la media se dice la hora siguiente menos lo que falta, que es como
 * se habla aqui: las nueve y cuarenta y cinco no lo dice nadie.
 */
export function decirHora(hora: number, minuto: number): string {
  let h = hora;
  let resto = minuto;
  let conector = "y";

  if (minuto > 30) {
    h = (hora + 1) % 24;
    resto = 60 - minuto;
    conector = "menos";
  }

  const docenas = h % 12 === 0 ? 12 : h % 12;
  const articulo = docenas === 1 ? "la" : "las";
  const palabraHora = HORAS[docenas];

  const cuerpo =
    resto === 0
      ? `${articulo} ${palabraHora}`
      : `${articulo} ${palabraHora} ${conector} ${MINUTOS_EN_PALABRA[resto]}`;

  return `${cuerpo} ${parteDelDia(h)}`;
}

/** Dias civiles entre dos instantes, contados en la zona del negocio. */
function diasDeDiferencia(instante: Date, ahora: Date, zonaHoraria: string): number {
  const a = enZona(ahora, zonaHoraria);
  const b = enZona(instante, zonaHoraria);
  const unoUtc = Date.UTC(a.anio, a.mes - 1, a.dia);
  const otroUtc = Date.UTC(b.anio, b.mes - 1, b.dia);
  return Math.round((otroUtc - unoUtc) / 86_400_000);
}

/** "hoy", "manana", "el jueves", "el jueves 23 de octubre". */
export function decirDia(instante: Date, ahora: Date, zonaHoraria: string): string {
  const diferencia = diasDeDiferencia(instante, ahora, zonaHoraria);
  const local = enZona(instante, zonaHoraria);

  if (diferencia === 0) return "hoy";
  if (diferencia === 1) return "manana";
  if (diferencia === 2) return "pasado manana";

  const nombre = DIAS[local.diaSemana];
  // Pasada la semana, "el jueves" ya no identifica nada: hace falta la fecha.
  if (diferencia <= 6) return `el ${nombre}`;
  return `el ${nombre} ${local.dia} de ${MESES[local.mes]}`;
}

/** "manana a las diez de la manana". */
export function decirMomento(instante: Date, ahora: Date, zonaHoraria: string): string {
  const local = enZona(instante, zonaHoraria);
  return `${decirDia(instante, ahora, zonaHoraria)} a ${decirHora(local.hora, local.minuto)}`;
}

/**
 * Enumera en castellano: "A, B o C". Con "o" y no con "y" porque son
 * alternativas y el paciente tiene que elegir una.
 */
function enumerar(partes: readonly string[]): string {
  if (partes.length === 0) return "";
  if (partes.length === 1) return partes[0] as string;
  return `${partes.slice(0, -1).join(", ")} o ${partes[partes.length - 1]}`;
}

/**
 * La frase que el agente lee al paciente.
 *
 * Sale de aqui ya redactada, en una sola linea, porque es lo que Vapi le
 * entrega al modelo como resultado de la herramienta: si se le da un JSON lo
 * reinterpreta y acaba inventandose matices.
 */
export function describirHuecos(opciones: {
  huecos: readonly { inicio: Date }[];
  ahora: Date;
  zonaHoraria: string;
  nombreCita: string;
}): string {
  const { huecos, ahora, zonaHoraria, nombreCita } = opciones;

  if (huecos.length === 0) {
    return `No queda ningun hueco libre para ${nombreCita} en los proximos dias. Dile que le llamaran para buscarle sitio y pidele un telefono.`;
  }

  const dichos = huecos.map(
    (hueco, i) => `[${i + 1}] ${decirMomento(hueco.inicio, ahora, zonaHoraria)}`,
  );

  return (
    `Huecos libres para ${nombreCita}: ${enumerar(dichos)}. ` +
    `Ofreceselos tal cual, sin leer los corchetes. ` +
    `Cuando elija, llama a reservar_cita con el numero de la opcion.`
  );
}
