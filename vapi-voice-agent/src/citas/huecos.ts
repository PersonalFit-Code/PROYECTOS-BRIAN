/**
 * Que huecos tiene libres la clinica.
 *
 * Es el equivalente de pedido.ts en el otro modo del agente, y existe por el
 * mismo motivo: igual que el total de un pedido no lo suma el modelo, el hueco
 * que se le ofrece a un paciente no lo decide el modelo. Lo calcula el
 * servidor a partir del horario que puso la clinica y de lo que ya hay en su
 * calendario, y el agente se limita a leer en voz alta lo que le den.
 *
 * Todo entra por parametro y no se llama a ninguna red: asi esto se puede
 * probar entero, que es justo lo que no se puede hacer con una agenda real.
 */

import type { Clinica, TipoCita } from "../db/clinica";
import { enZona, instanteEnZona, minutosDeHhMm } from "../util/zona";

/** Un tramo de tiempo ocupado, en instantes absolutos. */
export interface Intervalo {
  desde: Date;
  hasta: Date;
}

/** Un hueco que se le puede ofrecer al paciente. */
export interface Hueco {
  inicio: Date;
  fin: Date;
}

export class AgendaInvalidaError extends Error {}

/** Cada cuantos minutos se prueba un comienzo de cita si la clinica no dice otra cosa. */
const PASO_POR_DEFECTO = 15;

/** Tope de dias que se miran hacia delante, pase lo que pase en la ficha. */
const MAX_DIAS_VISTA = 30;

const MINUTOS = 60_000;

/** Une los tramos ocupados que se solapan o se tocan, para restar una sola vez. */
function fusionar(tramos: readonly Intervalo[]): Intervalo[] {
  const ordenados = [...tramos]
    .filter((t) => t.hasta.getTime() > t.desde.getTime())
    .sort((a, b) => a.desde.getTime() - b.desde.getTime());

  const unidos: Intervalo[] = [];
  for (const tramo of ordenados) {
    const ultimo = unidos[unidos.length - 1];
    if (ultimo && tramo.desde.getTime() <= ultimo.hasta.getTime()) {
      if (tramo.hasta.getTime() > ultimo.hasta.getTime()) ultimo.hasta = tramo.hasta;
      continue;
    }
    unidos.push({ desde: tramo.desde, hasta: tramo.hasta });
  }
  return unidos;
}

function chocaCon(inicio: number, fin: number, bloqueado: readonly Intervalo[]): boolean {
  for (const tramo of bloqueado) {
    if (inicio < tramo.hasta.getTime() && fin > tramo.desde.getTime()) return true;
  }
  return false;
}

/**
 * Todos los huecos libres de aqui a los dias de vista de la agenda.
 *
 * `ocupado` son los tramos que ya estan cogidos, tal como los devuelve el
 * calendario. Entra por parametro para que esto siga siendo puro: quien llame
 * decide si eso viene de Google, de una prueba o de un fichero.
 */
export function calcularHuecos(opciones: {
  clinica: Clinica;
  tipoCita: TipoCita;
  ocupado: readonly Intervalo[];
  ahora: Date;
}): Hueco[] {
  const { clinica, tipoCita, ocupado, ahora } = opciones;
  const { agenda, zonaHoraria } = clinica;

  const duracion = tipoCita.minutos;
  if (!Number.isInteger(duracion) || duracion < 5) {
    throw new AgendaInvalidaError(
      `La cita "${tipoCita.nombre}" tiene una duracion imposible: ${tipoCita.minutos} minutos.`,
    );
  }

  const paso = agenda.pasoMinutos && agenda.pasoMinutos > 0 ? agenda.pasoMinutos : PASO_POR_DEFECTO;
  const dias = Math.min(Math.max(agenda.diasVista, 1), MAX_DIAS_VISTA);
  const margen = Math.max(agenda.margenMinutos, 0);

  // Antes de esto no se ofrece nada: una cita dentro de diez minutos no le
  // sirve a nadie, ni al paciente que tiene que llegar ni a la clinica.
  const noAntesDe = ahora.getTime() + agenda.antelacionMinimaHoras * 60 * MINUTOS;

  // El margen se le suma a lo ocupado por los dos lados: asi el respiro entre
  // citas sale solo, sin tener que recortarlo despues.
  const bloqueado = fusionar(
    ocupado.map((t) => ({
      desde: new Date(t.desde.getTime() - margen * MINUTOS),
      hasta: new Date(t.hasta.getTime() + margen * MINUTOS),
    })),
  );

  const hoy = enZona(ahora, zonaHoraria);
  const huecos: Hueco[] = [];

  for (let salto = 0; salto < dias; salto++) {
    // Se avanza por el calendario civil, no sumando 24 horas: el dia que entra
    // el cambio de hora no dura 24 horas y sumarlas corre el dia entero.
    const civil = new Date(Date.UTC(hoy.anio, hoy.mes - 1, hoy.dia + salto));
    const anio = civil.getUTCFullYear();
    const mes = civil.getUTCMonth() + 1;
    const dia = civil.getUTCDate();
    const diaSemana = civil.getUTCDay() === 0 ? 7 : civil.getUTCDay();

    for (const franja of agenda.franjas) {
      if (franja.dia !== diaSemana) continue;

      const desdeMin = minutosDeHhMm(franja.desde);
      const hastaMin = minutosDeHhMm(franja.hasta);
      if (hastaMin <= desdeMin) {
        throw new AgendaInvalidaError(
          `La franja del dia ${franja.dia} acaba antes de empezar: de ${franja.desde} a ${franja.hasta}.`,
        );
      }

      const abre = instanteEnZona(anio, mes, dia, Math.floor(desdeMin / 60), desdeMin % 60, zonaHoraria);
      const cierra = instanteEnZona(anio, mes, dia, Math.floor(hastaMin / 60), hastaMin % 60, zonaHoraria);

      for (let t = abre.getTime(); t + duracion * MINUTOS <= cierra.getTime(); t += paso * MINUTOS) {
        const fin = t + duracion * MINUTOS;
        if (t < noAntesDe) continue;
        if (chocaCon(t, fin, bloqueado)) continue;
        huecos.push({ inicio: new Date(t), fin: new Date(fin) });
      }
    }
  }

  return huecos.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
}

/**
 * Elige unos pocos huecos para decirlos por telefono.
 *
 * No vale coger los primeros: "a las diez, a las diez y cuarto y a las diez y
 * media" gasta las tres balas en el mismo momento del dia, y si ese rato no le
 * viene bien al paciente se queda sin opciones. Se reparten por dia y por
 * manana o tarde, que es como de verdad elige la gente.
 */
export function repartirHuecos(huecos: readonly Hueco[], cuantos: number, zonaHoraria: string): Hueco[] {
  if (cuantos <= 0) return [];
  if (huecos.length <= cuantos) return [...huecos];

  const cestas = new Map<string, Hueco[]>();
  for (const hueco of huecos) {
    const local = enZona(hueco.inicio, zonaHoraria);
    const momento = local.hora < 14 ? "manana" : "tarde";
    const clave = `${local.anio}-${local.mes}-${local.dia}-${momento}`;
    const cesta = cestas.get(clave);
    if (cesta) cesta.push(hueco);
    else cestas.set(clave, [hueco]);
  }

  // Las cestas ya salen en orden cronologico porque los huecos venian ordenados.
  const colas = [...cestas.values()];
  const elegidos: Hueco[] = [];
  for (let vuelta = 0; elegidos.length < cuantos; vuelta++) {
    let habiaAlguno = false;
    for (const cola of colas) {
      const siguiente = cola[vuelta];
      if (!siguiente) continue;
      habiaAlguno = true;
      elegidos.push(siguiente);
      if (elegidos.length === cuantos) break;
    }
    if (!habiaAlguno) break;
  }

  return elegidos.sort((a, b) => a.inicio.getTime() - b.inicio.getTime());
}
