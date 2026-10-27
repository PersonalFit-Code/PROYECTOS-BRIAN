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
     (0 = A, 1 = B, 2 = C, 3 = D).
   - `explicacion` es opcional, pero es lo que hace que se aprenda: sale
     justo después de contestar.
   - `imagen` es opcional: ruta a un fichero en /public (p. ej. "/img/senal-r1.png"),
     como las señales de los test de autoescuela.

   Los temas de abajo son de EJEMPLO para enseñar la app funcionando.
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

/** Reglas del examen, al estilo del teórico de la DGT: 30 preguntas, 30 minutos, 3 fallos como máximo. */
export const EXAMEN = {
  preguntas: 30,
  minutos: 30,
  fallosPermitidos: 3,
};

/** Preguntas por test de un tema (si el tema tiene menos, salen todas). */
export const PREGUNTAS_POR_TEST_DE_TEMA = 10;

export const TEMAS: Tema[] = [
  {
    id: "constitucion",
    numero: 1,
    titulo: "La Constitución Española de 1978",
    descripcion: "Estructura, principios y órganos básicos.",
    preguntas: [
      {
        id: "ce-01",
        enunciado: "¿En qué fecha se ratificó en referéndum la Constitución Española?",
        opciones: ["El 6 de diciembre de 1978", "El 29 de diciembre de 1978", "El 31 de octubre de 1978", "El 15 de junio de 1977"],
        correcta: 0,
        explicacion: "El referéndum fue el 6 de diciembre de 1978 (por eso ese día es el Día de la Constitución). Se publicó en el BOE el 29 de diciembre.",
      },
      {
        id: "ce-02",
        enunciado: "¿Cuántos artículos tiene la Constitución Española?",
        opciones: ["155", "169", "178", "200"],
        correcta: 1,
        explicacion: "Tiene 169 artículos, repartidos en un Título Preliminar y diez títulos.",
      },
      {
        id: "ce-03",
        enunciado: "Según el artículo 1.3, la forma política del Estado español es:",
        opciones: ["La república parlamentaria", "La monarquía absoluta", "La monarquía parlamentaria", "El Estado federal"],
        correcta: 2,
        explicacion: "Art. 1.3: «La forma política del Estado español es la Monarquía parlamentaria».",
      },
      {
        id: "ce-04",
        enunciado: "¿A qué edad son mayores de edad los españoles según la Constitución?",
        opciones: ["16 años", "18 años", "20 años", "21 años"],
        correcta: 1,
        explicacion: "Art. 12: los españoles son mayores de edad a los dieciocho años.",
      },
      {
        id: "ce-05",
        enunciado: "¿Qué artículo establece que la capital del Estado es la villa de Madrid?",
        opciones: ["Artículo 2", "Artículo 3", "Artículo 4", "Artículo 5"],
        correcta: 3,
        explicacion: "Art. 5: «La capital del Estado es la villa de Madrid».",
      },
      {
        id: "ce-06",
        enunciado: "El Congreso de los Diputados se compone de:",
        opciones: ["Un mínimo de 300 y un máximo de 400 diputados", "Exactamente 350 diputados", "Un mínimo de 250 y un máximo de 350 diputados", "Un máximo de 300 diputados"],
        correcta: 0,
        explicacion: "Art. 68.1: entre 300 y 400 diputados. La ley electoral fija hoy 350, pero la Constitución da el margen.",
      },
      {
        id: "ce-07",
        enunciado: "Según el artículo 69, el Senado es la cámara de:",
        opciones: ["Representación popular", "Representación territorial", "Control del Gobierno", "Representación de los municipios"],
        correcta: 1,
        explicacion: "Art. 69.1: «El Senado es la Cámara de representación territorial».",
      },
      {
        id: "ce-08",
        enunciado: "¿Cuántos miembros componen el Tribunal Constitucional?",
        opciones: ["9", "10", "12", "15"],
        correcta: 2,
        explicacion: "Art. 159.1: doce miembros nombrados por el Rey.",
      },
      {
        id: "ce-09",
        enunciado: "El Defensor del Pueblo es un alto comisionado de:",
        opciones: ["El Gobierno", "Las Cortes Generales", "El Tribunal Supremo", "El Rey"],
        correcta: 1,
        explicacion: "Art. 54: alto comisionado de las Cortes Generales para la defensa de los derechos del Título I.",
      },
      {
        id: "ce-10",
        enunciado: "¿Qué artículo se reformó en 2011 para fijar el principio de estabilidad presupuestaria?",
        opciones: ["Artículo 13.2", "Artículo 49", "Artículo 135", "Artículo 168"],
        correcta: 2,
        explicacion: "La reforma de 2011 cambió el art. 135. Las otras reformas fueron la del 13.2 (1992) y la del 49 (2024).",
      },
    ],
  },
  {
    id: "geografia",
    numero: 2,
    titulo: "Geografía de España",
    descripcion: "Relieve, ríos y organización territorial.",
    preguntas: [
      {
        id: "geo-01",
        enunciado: "¿Cuál es la montaña más alta de España?",
        opciones: ["El Mulhacén", "El Aneto", "El Teide", "El Veleta"],
        correcta: 2,
        explicacion: "El Teide (Tenerife), con 3.715 m. El Mulhacén (3.479 m) es el más alto de la Península.",
      },
      {
        id: "geo-02",
        enunciado: "¿Cuál es el pico más alto de la Península Ibérica?",
        opciones: ["El Mulhacén", "El Aneto", "El Almanzor", "El Torrecerredo"],
        correcta: 0,
        explicacion: "El Mulhacén, en Sierra Nevada, con 3.479 m.",
      },
      {
        id: "geo-03",
        enunciado: "¿Cuántas comunidades autónomas hay en España?",
        opciones: ["15", "17", "19", "50"],
        correcta: 1,
        explicacion: "17 comunidades autónomas, más las ciudades autónomas de Ceuta y Melilla.",
      },
      {
        id: "geo-04",
        enunciado: "¿Cuántas provincias tiene España?",
        opciones: ["17", "47", "50", "52"],
        correcta: 2,
        explicacion: "50 provincias. Ceuta y Melilla son ciudades autónomas, no provincias.",
      },
      {
        id: "geo-05",
        enunciado: "¿Cuántas provincias tiene Galicia?",
        opciones: ["Tres", "Cuatro", "Cinco", "Seis"],
        correcta: 1,
        explicacion: "A Coruña, Lugo, Ourense y Pontevedra.",
      },
      {
        id: "geo-06",
        enunciado: "¿Cuál es la provincia más extensa de España?",
        opciones: ["Cáceres", "Ciudad Real", "Badajoz", "Navarra"],
        correcta: 2,
        explicacion: "Badajoz, con unos 21.766 km².",
      },
      {
        id: "geo-07",
        enunciado: "¿Dónde desemboca el río Duero?",
        opciones: ["En Lisboa", "En Oporto", "En Vigo", "En Santander"],
        correcta: 1,
        explicacion: "El Duero desemboca en el Atlántico en Oporto (Portugal), donde se llama Douro.",
      },
      {
        id: "geo-08",
        enunciado: "¿Cuál es el río más largo de la Península Ibérica?",
        opciones: ["El Ebro", "El Duero", "El Guadalquivir", "El Tajo"],
        correcta: 3,
        explicacion: "El Tajo, con unos 1.000 km, desemboca en Lisboa.",
      },
      {
        id: "geo-09",
        enunciado: "¿En qué mar desemboca el río Ebro?",
        opciones: ["Mar Cantábrico", "Océano Atlántico", "Mar Mediterráneo", "Mar de Alborán"],
        correcta: 2,
        explicacion: "Desemboca en el Mediterráneo formando el delta del Ebro (Tarragona).",
      },
      {
        id: "geo-10",
        enunciado: "¿Cuál es la capital de la comunidad autónoma de las Illes Balears?",
        opciones: ["Ibiza", "Mahón", "Palma", "Manacor"],
        correcta: 2,
        explicacion: "Palma, en la isla de Mallorca.",
      },
    ],
  },
  {
    id: "primeros-auxilios",
    numero: 3,
    titulo: "Primeros auxilios",
    descripcion: "Cómo actuar ante un accidente o una emergencia.",
    preguntas: [
      {
        id: "pa-01",
        enunciado: "¿Qué significa la conducta PAS ante un accidente?",
        opciones: ["Parar, Ayudar, Salir", "Proteger, Avisar, Socorrer", "Prevenir, Atender, Sanar", "Pedir, Acudir, Señalizar"],
        correcta: 1,
        explicacion: "Primero Proteger (a ti y a la víctima), después Avisar a emergencias y por último Socorrer.",
      },
      {
        id: "pa-02",
        enunciado: "¿Cuál es el número único de emergencias en toda la Unión Europea?",
        opciones: ["091", "061", "112", "062"],
        correcta: 2,
        explicacion: "El 112 funciona en toda la UE, gratis y aunque el móvil no tenga saldo.",
      },
      {
        id: "pa-03",
        enunciado: "En la RCP de un adulto, ¿cuál es la relación entre compresiones y ventilaciones?",
        opciones: ["15 compresiones y 2 ventilaciones", "30 compresiones y 2 ventilaciones", "5 compresiones y 1 ventilación", "10 compresiones y 1 ventilación"],
        correcta: 1,
        explicacion: "30:2. Si no se sabe o no se quiere ventilar, se hacen solo compresiones continuas.",
      },
      {
        id: "pa-04",
        enunciado: "¿A qué ritmo se deben hacer las compresiones torácicas en un adulto?",
        opciones: ["60-80 por minuto", "80-100 por minuto", "100-120 por minuto", "140-160 por minuto"],
        correcta: 2,
        explicacion: "Entre 100 y 120 por minuto, hundiendo el pecho unos 5-6 cm.",
      },
      {
        id: "pa-05",
        enunciado: "Una persona inconsciente que respira con normalidad debe colocarse:",
        opciones: ["Boca arriba con las piernas elevadas", "Sentada", "En posición lateral de seguridad", "Boca abajo"],
        correcta: 2,
        explicacion: "La posición lateral de seguridad mantiene la vía aérea abierta y evita que se ahogue si vomita.",
      },
      {
        id: "pa-06",
        enunciado: "Ante una quemadura leve, lo primero que hay que hacer es:",
        opciones: ["Aplicar hielo directamente", "Enfriarla con agua a temperatura ambiente durante varios minutos", "Untar pasta de dientes", "Reventar las ampollas"],
        correcta: 1,
        explicacion: "Agua corriente a temperatura ambiente entre 10 y 20 minutos. El hielo directo puede empeorar la lesión.",
      },
      {
        id: "pa-07",
        enunciado: "Ante una hemorragia externa, la primera medida es:",
        opciones: ["Hacer un torniquete", "Comprimir directamente la herida", "Lavar la herida con alcohol", "Elevar la cabeza del herido"],
        correcta: 1,
        explicacion: "Compresión directa sobre la herida con un apósito o tela limpia. El torniquete es el último recurso.",
      },
      {
        id: "pa-08",
        enunciado: "Un adulto atragantado ya no puede toser ni hablar. ¿Qué se hace?",
        opciones: ["Darle agua", "Alternar 5 golpes en la espalda y 5 compresiones abdominales", "Tumbarlo boca arriba y esperar", "Meterle los dedos hasta el fondo de la garganta"],
        correcta: 1,
        explicacion: "Si la tos no es eficaz: 5 golpes interescapulares y 5 compresiones abdominales (maniobra de Heimlich), alternando.",
      },
      {
        id: "pa-09",
        enunciado: "En un accidente de moto, ¿cuándo se debe quitar el casco a la víctima?",
        opciones: ["Siempre, en cuanto se llega", "Nunca, salvo que no respire y haya que hacerle RCP", "Solo si lo pide la víctima", "Cuando lleva más de 10 minutos con él"],
        correcta: 1,
        explicacion: "Quitar el casco puede agravar una lesión de columna. Solo se retira si hay que abrir la vía aérea o hacer RCP.",
      },
      {
        id: "pa-10",
        enunciado: "¿Qué se debe hacer con un herido que está consciente y no corre peligro donde está?",
        opciones: ["Moverlo cuanto antes a un lugar cómodo", "No moverlo, abrigarlo y tranquilizarlo hasta que llegue la ayuda", "Darle de beber", "Llevarlo en el coche al hospital"],
        correcta: 1,
        explicacion: "No se mueve a un herido salvo peligro inminente (fuego, tráfico…). Se le abriga y se le habla para calmarlo.",
      },
    ],
  },
];

export const TODAS_LAS_PREGUNTAS: Pregunta[] = TEMAS.flatMap((t) => t.preguntas);

export function temaPorId(id: string): Tema | undefined {
  return TEMAS.find((t) => t.id === id);
}

/** El tema al que pertenece cada pregunta, para decir en el repaso de dónde sale. */
export const TEMA_DE_PREGUNTA: Record<string, Tema> = Object.fromEntries(
  TEMAS.flatMap((t) => t.preguntas.map((p) => [p.id, t] as const)),
);
