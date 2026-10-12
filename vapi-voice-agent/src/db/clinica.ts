/**
 * Una clinica que da citas por telefono.
 *
 * Es el equivalente de Business para el otro modo del agente. Comparte la
 * identidad del negocio (nombre, ciudad, zona horaria) y cambia lo demas: no
 * hay carta ni importes, hay tipos de cita con su duracion y una agenda de
 * la que salen los huecos.
 *
 * La duracion vive aqui y no la decide el modelo: igual que en los pedidos el
 * total lo calcula el servidor, aqui el hueco que se ofrece lo calcula el
 * servidor a partir de estos minutos. El agente solo lee lo que se le da.
 */

/** Un tratamiento para el que se puede pedir cita. */
export interface TipoCita {
  /** Identificador estable. Es lo que el modelo manda en los tool-calls. */
  id: string;
  /** Como lo llama el paciente y como lo dice el agente en voz alta. */
  nombre: string;
  /**
   * Para que el agente sepa reconocerlo cuando el paciente lo diga con otras
   * palabras ("una limpieza", "quitarme el sarro").
   */
  descripcion: string;
  /** Cuanto ocupa en la agenda. De aqui sale el hueco que se reserva. */
  minutos: number;
  /**
   * Si solo lo hace un profesional concreto, su nombre. Vacio = cualquiera.
   * El agente nunca lo usa para aconsejar, solo para encajar la agenda.
   */
  profesional?: string;
  /**
   * true para el tipo que recoge las urgencias. El agente lo trata aparte:
   * no busca hueco, da el telefono de urgencias y cuelga el circuito.
   */
  esUrgencia?: boolean;
}

/** Una franja de la semana en la que la clinica da citas. */
export interface FranjaHoraria {
  /** Dia de la semana en formato ISO: 1 lunes ... 7 domingo. */
  dia: number;
  /** Hora local de inicio, "09:00". */
  desde: string;
  /** Hora local de fin, "13:30". */
  hasta: string;
}

/** De donde salen los huecos y con que reglas se ofrecen. */
export interface Agenda {
  /**
   * El calendario de la clinica, tal como lo identifica Google. Suele ser el
   * correo de la cuenta que lo comparte con nosotros.
   */
  calendarId: string;
  /** Cuando se dan citas. Fuera de estas franjas no se ofrece nada. */
  franjas: FranjaHoraria[];
  /** Minutos de respiro entre una cita y la siguiente. */
  margenMinutos: number;
  /**
   * Con cuanta antelacion minima se puede coger cita. Evita ofrecer un hueco
   * dentro de diez minutos, que en una clinica no sirve de nada.
   */
  antelacionMinimaHoras: number;
  /** Cuantos dias hacia delante se miran huecos. */
  diasVista: number;
  /**
   * Cuantos huecos como maximo se le dicen al paciente de una vez. Por
   * telefono, mas de tres no se retienen.
   */
  huecosPorTanda: number;
  /**
   * Cada cuantos minutos puede empezar una cita. Vacio = 15, que es como
   * trabaja casi todo el mundo. Subirlo a 30 da agendas mas limpias; bajarlo
   * a 10 aprovecha mas el hueco pero deja horas raras.
   */
  pasoMinutos?: number;
}

/**
 * Lo que la clinica quiere que se haga cuando alguien llama con dolor.
 *
 * Esto no es un detalle de producto: el agente tiene terminantemente
 * prohibido valorar si algo es grave o puede esperar. Lo unico que puede
 * hacer es seguir lo que diga la clinica aqui.
 */
export interface Urgencias {
  /** Telefono al que se deriva. Vacio = el de la propia clinica. */
  telefono: string;
  /** Frase exacta que el agente dice. La escribe la clinica, no nosotros. */
  queDecir: string;
}

/**
 * Una clinica, tal como se guarda en Firestore en /businesses/{id} con
 * modo "citas".
 */
export interface Clinica {
  /** Discrimina de un negocio de pedidos. Es lo que mira el servidor. */
  modo: "citas";

  /** Identificador del documento. Es el valor que llega en ?business=. */
  id: string;
  /** Nombre comercial. El agente lo dice al descolgar. */
  nombre: string;
  ciudad: string;
  /** Direccion completa, para quien pregunta como llegar. */
  direccion: string;
  /** Zona horaria IANA ("Europe/Madrid"). Manda sobre todo lo demas. */
  zonaHoraria: string;
  /** Que clase de centro es: "clinica dental", "fisioterapia". */
  tipoLabel: string;

  /** Horario de atencion, para decirlo y para no coger fuera de hora. */
  horario: {
    /** Frase lista para leer en voz alta. */
    texto: string;
    /** Dia o dias de cierre, para mencionarlos si llaman ese dia. */
    diaCierre: string;
  };

  /** Los unicos tratamientos para los que el agente puede dar cita. */
  tiposCita: TipoCita[];
  agenda: Agenda;
  urgencias: Urgencias;

  /** Nombre propio de la asistente en esta clinica. Vacio = el de marca. */
  nombreAgente?: string;
  /** Direccion a la que avisar de cada cita. Vacio = sin aviso. */
  emailCitas: string;
}
