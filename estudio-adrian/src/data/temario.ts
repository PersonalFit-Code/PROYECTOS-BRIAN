/* ─────────────────────────────────────────────────────────────
   TEMARIO · el banco de preguntas de la app

   Todo el contenido vive aquí. Para meter el temario de verdad de Adrián
   basta con cambiar este fichero: el resto de la app se adapta solo
   (lista de temas, examen, repaso de fallos, estadísticas).

   Reglas para que nada se rompa:
   - El `id` de cada tema y de cada pregunta es ÚNICO y NO se cambia una vez
     publicado: el progreso de Adrián se guarda en su móvil colgado de ese id.
     Si se cambia, esa pregunta cuenta como nueva.
   - `correcta` es la POSICIÓN de la respuesta buena empezando en 0
     (0 = A, 1 = B, 2 = C, 3 = D). En las de verdadero/falso: V o F.
   - `enunciado` admite saltos de línea (\n) para las listas con viñetas.
   - `explicacion` es opcional, pero es lo que hace que se aprenda: sale
     justo después de contestar.
   - `imagen` es opcional: ruta a un fichero en /public (p. ej. "/img/senal-r1.png"),
     como las señales de los test de autoescuela.

   Contenido: el examen de PCI (protección contra incendios) del curso de
   Adrián, tal cual venía en el Word, con su solución.
   ───────────────────────────────────────────────────────────── */

export type Pregunta = {
  id: string;
  enunciado: string;
  opciones: string[];
  correcta: number;
  explicacion?: string;
  imagen?: string;
};

export type Tema = {
  id: string;
  numero: number;
  titulo: string;
  descripcion: string;
  preguntas: Pregunta[];
};

/** Las preguntas del curso son de verdadero o falso. */
const VF = ["Verdadero", "Falso"];
const V = 0;
const F = 1;

/** Preguntas por test de un tema (si el tema tiene menos, salen todas). */
export const PREGUNTAS_POR_TEST_DE_TEMA = 12;

export const TEMAS: Tema[] = [
  {
    id: "extintores",
    numero: 1,
    titulo: "Extintores",
    descripcion: "Ubicación, pruebas, mantenimiento y normativa.",
    preguntas: [
      {
        id: "ext-01",
        enunciado: "El CTE-DB-SI nos indica dónde debemos poner los extintores y su ubicación.",
        opciones: VF,
        correcta: V,
      },
      {
        id: "ext-02",
        enunciado: "La presión de ensayo de un extintor se debe mantener durante un mínimo de 30 s y el recipiente no debe presentar fugas.",
        opciones: VF,
        correcta: V,
      },
      {
        id: "ext-03",
        enunciado: "El mantenimiento trimestral puede hacerlo solo la entidad mantenedora.",
        opciones: VF,
        correcta: F,
        explicacion: "El trimestral lo puede hacer el propio titular o usuario de la instalación; la empresa mantenedora hace las revisiones anuales y quinquenales.",
      },
      {
        id: "ext-04",
        enunciado: "Un extintor portátil es un extintor diseñado para ser trasladado.",
        opciones: VF,
        correcta: V,
      },
      {
        id: "ext-05",
        enunciado: "Un extintor puede verificarse visualmente tanto interna como externamente.",
        opciones: VF,
        correcta: F,
        explicacion: "A simple vista solo se ve por fuera: el interior se comprueba abriéndolo en el mantenimiento.",
      },
      {
        id: "ext-06",
        enunciado: "Cuando un extintor necesita recarga, retimbrado o apertura del mismo, el técnico puede realizar las pruebas en el destino donde están los extintores.",
        opciones: VF,
        correcta: F,
        explicacion: "Esas operaciones se hacen en el taller de la empresa mantenedora, no en el sitio donde está el extintor.",
      },
      {
        id: "ext-07",
        enunciado: "La definición «aquel que tiene un dispositivo de cierre que solo puede ser reinstalado por el fabricante una vez abierto el extintor» corresponde a la de un extintor sellado.",
        opciones: VF,
        correcta: V,
      },
      {
        id: "ext-08",
        enunciado: "La prueba de presión debe hacerse anualmente partiendo de la fecha de fabricación.",
        opciones: VF,
        correcta: F,
        explicacion: "La prueba de presión (retimbrado) es cada 5 años, no cada año.",
      },
      {
        id: "ext-09",
        enunciado: "La vida útil de un extintor es 20 años.",
        opciones: VF,
        correcta: V,
        explicacion: "20 años desde su fabricación; después se retira.",
      },
      {
        id: "ext-10",
        enunciado: "La altura de un extintor desde el suelo es de 0,8 m a 1,2 m.",
        opciones: VF,
        correcta: V,
      },
      {
        id: "ext-11",
        enunciado: "La normativa que rige la instalación de los extintores se llama UNE 23210/2011.",
        opciones: VF,
        correcta: F,
      },
      {
        id: "ext-12",
        enunciado: "La marca CE garantiza que el extintor ha sido fabricado según lo exigido en la norma UNE.",
        opciones: VF,
        correcta: F,
      },
    ],
  },
  {
    id: "bies",
    numero: 2,
    titulo: "BIEs",
    descripcion: "Bocas de incendio equipadas de 25 y 45 mm.",
    preguntas: [
      {
        id: "bie-01",
        enunciado: "En los dos tipos de bocas de incendio equipadas (BIE 25 mm y BIE 45 mm), la lanza-boquilla debe permitir las posiciones de conformación y regulación de los chorros siguientes:\n• Cierre\n• Agua pulverizada\n• Chorro lleno\n• Toda pulverización se debe presentar en forma de cortina o de cono.",
        opciones: VF,
        correcta: V,
      },
      {
        id: "bie-02",
        enunciado: "Cada 5 años, conforme a UNE-EN 671-3, las BIE deben superar una prueba hidrostática a 15 kg/cm².",
        opciones: VF,
        correcta: V,
      },
      {
        id: "bie-03",
        enunciado: "La longitud máxima según el tipo de manguera de una BIE es 30 m para la semirrígida y 20 m para la plana.",
        opciones: VF,
        correcta: V,
        explicacion: "Semirrígida (BIE 25 mm): hasta 30 m. Plana (BIE 45 mm): hasta 20 m.",
      },
      {
        id: "bie-04",
        enunciado: "El factor de descarga K, que indica las pérdidas de descarga en el orificio de salida, será K 80 tanto para manguera semirrígida como plana.",
        opciones: VF,
        correcta: F,
      },
      {
        id: "bie-05",
        enunciado: "La distancia máxima entre 2 BIE es de 50 m, asegurando 20 m desde cualquier punto ocupable a la BIE más cercana y existiendo al menos una BIE a 5 m de la salida del sector de incendios.",
        opciones: VF,
        correcta: V,
      },
      {
        id: "bie-06",
        enunciado: "El nivel de riesgo intrínseco ALTO en un establecimiento implica una autonomía de 90 min en la instalación de BIE con una simultaneidad de 3.",
        opciones: VF,
        correcta: V,
      },
      {
        id: "bie-07",
        enunciado: "El caudal que se debe suministrar en punta de lanza con una BIE de 25 mm es 200 l/min.",
        opciones: VF,
        correcta: F,
      },
      {
        id: "bie-08",
        enunciado: "El uso de tubería PP-R (polipropileno copolímero random) está permitido en instalaciones de BIE de 25 mm o 45 mm de riesgo alto.",
        opciones: VF,
        correcta: F,
      },
      {
        id: "bie-09",
        enunciado: "Una BIE de 25 mm, como mínimo, consta de válvula de paso del agua, racores, soporte devanadera, lanza/boquilla y manguera plana de 25 mm.",
        opciones: VF,
        correcta: F,
        explicacion: "La BIE de 25 mm lleva manguera semirrígida, no plana. La plana es la de la BIE de 45 mm.",
      },
      {
        id: "bie-10",
        enunciado: "Los números de la norma europea marcados en las BIE para su identificación son UNE-EN 671-1 para 25 mm y UNE-EN 671-2 para 45 mm.",
        opciones: VF,
        correcta: V,
      },
      {
        id: "bie-11",
        enunciado: "Una boca de incendio equipada puede tener como agente extintor espuma.",
        opciones: VF,
        correcta: V,
      },
    ],
  },
  {
    id: "deteccion",
    numero: 3,
    titulo: "Central de incendios y detección",
    descripcion: "Detectores, pulsadores, alarmas y normas EN 54.",
    preguntas: [
      {
        id: "det-01",
        enunciado: "Conforme a la Norma EN 54 parte 2, en la norma se definen:\n• Requisitos básicos de las indicaciones que debe proporcionar\n• Los diferentes estados de alarma, avería, desconexión y prueba\n• Los requisitos de la repetición de señales normalizadas\n• Los requisitos de diseño mecánico, eléctrico, integridad, etc.\n• Los requisitos de diseño adicionales para el soporte lógico (software)",
        opciones: VF,
        correcta: V,
      },
      {
        id: "det-02",
        enunciado: "Para que una explosión se produzca, deben coincidir la atmósfera explosiva y un foco de ignición. Esto requiere que se produzcan tres condiciones simultáneas:\n• Existencia de una sustancia combustible (gases, vapores, polvos o nieblas).\n• Existencia de un comburente (oxígeno del aire) en un intervalo de concentración determinado.\n• Presencia de una fuente energética capaz de iniciar la reacción.",
        opciones: VF,
        correcta: V,
      },
      {
        id: "det-03",
        enunciado: "Los detectores de humo por aspiración son sistemas que se basan en el análisis del aire aspirado mediante tuberías que conectan los puntos de muestreo con el detector, permitiendo el transporte de las muestras de aire mediante un aspirador.",
        opciones: VF,
        correcta: V,
      },
      {
        id: "det-04",
        enunciado: "Es necesaria la instalación de detección en un falso techo si existen perforaciones de más de 10 mm o, en su defecto, el conjunto de todas ellas ocupa más de un 40 % de la superficie del techo y existe una corriente de aire que impulsa el mismo hacia el falso techo.",
        opciones: VF,
        correcta: F,
      },
      {
        id: "det-05",
        enunciado: "La UNE 23700/2014-14 hace referencia a la planificación, diseño, puesta en servicio, uso y mantenimiento de sistemas de detección y alarma de incendios.",
        opciones: VF,
        correcta: F,
        explicacion: "Ojo al número: la norma de planificación, diseño, puesta en servicio, uso y mantenimiento es la UNE 23007-14.",
      },
      {
        id: "det-06",
        enunciado: "La detección de humos es adecuada para locales de menos de 12 m de altura.",
        opciones: VF,
        correcta: V,
      },
      {
        id: "det-07",
        enunciado: "Un módulo monitor o de entrada tiene como función la activación de equipos externos o mando sobre ellos desde la central de incendios general.",
        opciones: VF,
        correcta: F,
        explicacion: "El módulo monitor (de entrada) RECIBE señales y las lleva a la central. El que activa o manda sobre equipos externos es el módulo de control (de salida).",
      },
      {
        id: "det-08",
        enunciado: "Un detector de temperatura fija está pensado para ambientes donde existen temperaturas elevadas sin cambios bruscos de temperatura, al contrario que los termovelocimétricos.",
        opciones: VF,
        correcta: F,
      },
      {
        id: "det-09",
        enunciado: "La fuente de alimentación auxiliar o externa deberá estar supervisada por una persona de mantenimiento.",
        opciones: VF,
        correcta: F,
        explicacion: "La supervisa el propio sistema (la central), no una persona.",
      },
      {
        id: "det-10",
        enunciado: "Una persona no debe desplazarse más de 25 m para alcanzar un pulsador de alarma y deben estar a una altura comprendida entre 0,8 y 1,2 m.",
        opciones: VF,
        correcta: V,
      },
      {
        id: "det-11",
        enunciado: "El mantenimiento de los equipos de detección de incendios se hará conforme al RD 2267/2004.",
        opciones: VF,
        correcta: F,
        explicacion: "El RD 2267/2004 es el reglamento de seguridad contra incendios en establecimientos industriales. El mantenimiento va por el RIPCI (RD 513/2017).",
      },
      {
        id: "det-12",
        enunciado: "Los valores sonoros de una alarma de incendios deben estar comprendidos entre 65 dB y 120 dB en cualquier punto de la habitación situado a más de 1 metro de la posición del dispositivo de alarma.",
        opciones: VF,
        correcta: V,
      },
    ],
  },
];

/** Reglas del examen: todas las preguntas del curso, con tiempo y un máximo de fallos. */
export const EXAMEN = {
  preguntas: TEMAS.reduce((n, t) => n + t.preguntas.length, 0),
  minutos: 35,
  fallosPermitidos: 7,
};

export const TODAS_LAS_PREGUNTAS: Pregunta[] = TEMAS.flatMap((t) => t.preguntas);

export function temaPorId(id: string): Tema | undefined {
  return TEMAS.find((t) => t.id === id);
}

/** El tema al que pertenece cada pregunta, para decir en el repaso de dónde sale. */
export const TEMA_DE_PREGUNTA: Record<string, Tema> = Object.fromEntries(
  TEMAS.flatMap((t) => t.preguntas.map((p) => [p.id, t] as const)),
);
