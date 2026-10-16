/**
 * Tipos del motor de huecos.
 *
 * Todo lo que entra y sale son instantes absolutos (`Date`), salvo el horario
 * semanal, que va en hora local del salón ("HH:MM") porque así lo escribe
 * Andrea en el panel: "abrimos a las nueve y media" no cambia con el horario
 * de verano, el instante absoluto sí. La conversión entre una cosa y otra se
 * hace una sola vez, en `slots.ts`, con las funciones de `tz.ts`.
 *
 * Nada de esto toca la base de datos: quien llama (la API de disponibilidad o
 * el panel) lee `staff_hours`, `bookings`, `time_off` y `settings`, lo
 * traduce a estas formas y recibe huecos. Así el motor se prueba entero sin
 * levantar Supabase.
 */

/** Día de la semana en formato ISO: 1 lunes ... 7 domingo (igual que `staff_hours.weekday`). */
export type DiaSemanaIso = 1 | 2 | 3 | 4 | 5 | 6 | 7;

/** Un tramo de tiempo ocupado, en instantes absolutos. `hasta` es exclusivo: [desde, hasta). */
export interface Intervalo {
  desde: Date;
  hasta: Date;
}

/** Una franja del horario semanal de una profesional, en hora local del salón. */
export interface Franja {
  dia: DiaSemanaIso;
  /** "HH:MM" */
  desde: string;
  /** "HH:MM", estrictamente posterior a `desde`. */
  hasta: string;
}

/** Una profesional con su horario. El orden en que se pasan es el `position` del panel. */
export interface ProfesionalAgenda {
  id: string;
  franjas: readonly Franja[];
}

/** Lo que importa de un servicio para colocarlo en la agenda. */
export interface ServicioElegido {
  duracionMin: number;
  /** Minutos de respiro después del servicio (limpiar el puesto, cobrar). */
  bufferMin: number;
}

/** Un hueco que se le puede ofrecer a la clienta. */
export interface Hueco {
  inicio: Date;
  /**
   * Final del bloque que se reserva. Incluye el buffer del último servicio,
   * igual que `bookings.ends_at`: es lo que se le pasa a `book_slot()`. Lo que
   * se le enseña a la clienta como hora de salida es `inicio + minutos`.
   */
  fin: Date;
  staffId: string;
  /**
   * Solo lo rellena `huecosDelDia`: todas las profesionales que pueden atender
   * a esa hora, en el orden de entrada. La primera coincide con `staffId`. Se
   * pasa tal cual a `elegirProfesional` cuando la clienta dijo "me da igual".
   */
  candidatas?: readonly string[];
}

/** Todo lo que necesita el motor. Lo rellena quien llama a partir de la base de datos. */
export interface EntradaHuecos {
  ahora: Date;
  /** Zona IANA del salón: "Europe/Madrid". */
  zona: string;
  /** Días que se miran hacia delante contando hoy (`settings.horizon_days`, 45). */
  horizonteDias: number;
  /** Nada antes de `ahora + antelacionMin` (`settings.min_lead_minutes`, 120). */
  antelacionMin: number;
  /** Cada cuántos minutos se prueba un comienzo (`settings.slot_step_min`, 15). */
  pasoMin: number;
  /** Los servicios elegidos, en el orden en que se harán. */
  servicios: readonly ServicioElegido[];
  /** Solo las profesionales que hacen TODOS los servicios elegidos. */
  profesionales: readonly ProfesionalAgenda[];
  /** Por `staffId`: citas vivas (confirmadas, hechas y holds sin caducar) más sus ausencias. */
  ocupado: Readonly<Record<string, readonly Intervalo[]>>;
  /** Cierres del salón entero: festivos, vacaciones, bloqueos sin profesional. */
  cierres: readonly Intervalo[];
  /** Primer día de la ventana pedida, en fecha local "YYYY-MM-DD". Por defecto, hoy. */
  desde?: string;
  /** Cuántos días abarca la ventana pedida. Por defecto, `horizonteDias`. */
  dias?: number;
}

/** Una casilla del calendario: si ese día hay algo que ofrecer. */
export interface DiaConHueco {
  /** Fecha local "YYYY-MM-DD". */
  fecha: string;
  hayHuecos: boolean;
}

/** Lo que ocupa una cadena de servicios en la agenda. */
export interface DuracionTotal {
  /** Suma de las duraciones: lo que la clienta pasa en el salón. */
  minutos: number;
  /** El respiro que se reserva detrás: solo el del último servicio. */
  bufferFinal: number;
}
