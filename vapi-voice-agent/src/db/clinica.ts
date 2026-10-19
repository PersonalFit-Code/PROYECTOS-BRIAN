/**
 * Un negocio que da cita por telefono: una clinica dental, un centro de
 * estetica, una fisioterapia.
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
   * Lo que cuesta, si el negocio quiere que se diga por telefono. Vacio = el
   * agente no da precio y remite al negocio.
   *
   * En una clinica dental casi nunca se rellena: el precio depende de lo que
   * vea el dentista. En estetica es al reves, es de lo primero que preguntan
   * y el precio es cerrado. Por eso es opcional y lo decide cada negocio.
   */
  precioCentimos?: number;
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
 * Lo que el negocio quiere que se haga cuando alguien llama con una urgencia.
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
  /**
   * Solo donde tenga sentido. Una clinica dental la necesita; un centro de
   * estetica no, y entonces el agente ni menciona las urgencias.
   */
  urgencias?: Urgencias;

  /**
   * Como llama el agente a quien tiene al telefono: "paciente", "cliente",
   * "clienta". Vacio = "cliente", que vale para cualquier negocio.
   *
   * Parece un detalle y no lo es: a una esteticista llamarle "paciente" a su
   * clienta le suena a consulta medica, y es lo primero que nota.
   */
  comoLlamarAlCliente?: string;

  /** Nombre propio de la asistente en este negocio. Vacio = el de marca. */
  nombreAgente?: string;
  /** Direccion a la que avisar de cada cita. Vacio = sin aviso. */
  emailCitas: string;
}

/**
 * Como se refiere el agente a quien tiene al telefono, con su articulo.
 *
 * Trae las formas montadas en vez de solo la palabra porque "clienta" en
 * masculino sale "el clienta" y "del clienta", y eso va escrito en el prompt y
 * en lo que leen las herramientas: un jefe lo lee en la primera demo.
 *
 * El genero se saca de la terminacion, que para las tres palabras que esto
 * recibe de verdad ("cliente", "clienta", "paciente") acierta siempre. Si
 * alguien pone otra cosa, sale en masculino, que es la forma generica.
 */
export interface TratoCliente {
  /** La palabra sola: "cliente", "clienta", "paciente". */
  nombre: string;
  /** "el cliente" / "la clienta". */
  el: string;
  /** "al cliente" / "a la clienta". */
  al: string;
  /** "del cliente" / "de la clienta". */
  del: string;
  /** La palabra con mayuscula inicial, para una etiqueta: "Clienta". */
  etiqueta: string;
}

export function tratoAlCliente(
  clinica: Pick<Clinica, "comoLlamarAlCliente">,
): TratoCliente {
  const nombre = clinica.comoLlamarAlCliente?.trim() || "cliente";
  const femenino = nombre.endsWith("a");

  return {
    nombre,
    el: `${femenino ? "la" : "el"} ${nombre}`,
    al: femenino ? `a la ${nombre}` : `al ${nombre}`,
    del: femenino ? `de la ${nombre}` : `del ${nombre}`,
    etiqueta: nombre.charAt(0).toUpperCase() + nombre.slice(1),
  };
}
