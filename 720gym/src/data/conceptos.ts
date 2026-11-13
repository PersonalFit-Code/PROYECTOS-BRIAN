import type { ClaseId } from "./horario";
import { fotos } from "./fotos";

/**
 * «Conceptos» (como los llama Bodyism): una tarjeta y una página por disciplina propia de 720.
 * Precios: dosier 2025-26 y PDF de 720 Pilates. Yoga, CrossGym y Powerlifting no tienen precio
 * publicado: no se inventa ninguno.
 */
export interface Concepto {
  slug: string;
  /** Enlace de la tarjeta (720 Pilates tiene página propia con su paleta). */
  href: string;
  /** Icono de Lucide para índices y menús. */
  icono: "dumbbell" | "user-check" | "flower" | "sun" | "weight" | "flame";
  nombre: string;
  marca: string;
  /** Las dos líneas de la tarjeta. */
  lineas: string;
  descripcion: string[];
  paraQuien: string;
  nivel: string;
  precio?: { desde?: boolean; cifra: string; unidad: string };
  incluye: string[];
  clases: ClaseId[];
  fotoDescripcion: string;
  fotosExtra: [string, string];
  foto?: string;
  /** Fotos reales para el collage de su página (sustituyen a los huecos). */
  extras?: { src: string; descripcion: string }[];
  /** Valor del desplegable «actividad» del formulario. */
  actividad: string;
  /** Plan de la pasarela para «Inscríbete» (si se puede pagar online). */
  planPago?: string;
  seo: { titulo: string; descripcion: string };
}

export const conceptos: Concepto[] = [
  {
    slug: "gimnasio",
    href: "/gimnasio",
    icono: "dumbbell",
    nombre: "Gimnasio libre",
    marca: "720 GYM",
    lineas: "Máquinas, peso libre y cardio los 365 días. Con aforo limitado, la máquina que quieres está libre.",
    descripcion: [
      "Más de 1.000 m² con todo el material: máquinas, peso libre, powerlifting, cardio, entrenamiento funcional y zona de estiramiento.",
      "El número de socios es el justo para que entrenes sin agobios ni masificaciones. Aquí nadie te mira por encima del hombro: cada persona va a su ritmo.",
    ],
    paraQuien: "Quien quiere entrenar a su aire, en un sitio tranquilo y con alguien cerca que le corrija la técnica.",
    nivel: "Todos los niveles",
    precio: { cifra: "35", unidad: "€/mes" },
    incluye: ["Acceso ilimitado 365 días", "Máquinas, peso libre y cardio", "Zona funcional y de estiramiento", "Entrada diaria a 5 € para quien está de paso"],
    clases: [],
    fotoDescripcion: "Sala de musculación: máquinas rojas y negras sobre suelo negro, plano vertical",
    fotosExtra: ["Detalle de mancuernas en el rack", "Socio entrenando en peso libre"],
    actividad: "gimnasio",
    foto: fotos.maquinas.src,
    extras: [{ src: fotos.sala.src, descripcion: fotos.sala.alt }, { src: fotos.racks.src, descripcion: fotos.racks.alt }],
    planPago: "gimnasio-libre",
    seo: { titulo: "Gimnasio con aforo limitado en Ourense", descripcion: "Gimnasio libre en Ourense por 35 €/mes: máquinas, peso libre, powerlifting y cardio, abierto los 365 días de 08:00 a 22:30 y con aforo limitado. Sin colas." },
  },
  {
    slug: "entrenamiento-personal",
    href: "/entrenamiento-personal",
    icono: "user-check",
    nombre: "Entrenamiento personal",
    marca: "720 GYM",
    lineas: "Entrevista, valoración y un plan solo para ti. Solo, en pareja o en grupos de hasta cuatro.",
    descripcion: [
      "Empezamos con una entrevista y una valoración inicial para conocerte. A partir de ahí, un plan personalizado y sesiones de 1 h con seguimiento cercano.",
      "Entrena acompañado: en pareja, en trío o en grupo de cuatro el precio por atleta baja y la motivación sube.",
    ],
    paraQuien: "Quien quiere resultados visibles, aprender a entrenar bien o volver después de una lesión o un parón.",
    nivel: "Todos los niveles",
    precio: { desde: true, cifra: "15", unidad: "€/sesión" },
    incluye: ["Valoración inicial y plan a medida", "Dudas por WhatsApp incluidas", "Material online: vídeos y rutinas", "Cuota del gimnasio incluida en tus sesiones", "Los bonos no caducan"],
    clases: [],
    fotoDescripcion: "Entrenador corrigiendo la técnica de un socio en sentadilla, plano vertical",
    fotosExtra: ["Libreta o tablet con el plan de entrenamiento", "Entreno en pareja"],
    actividad: "personal",
    foto: fotos.sala.src,
    extras: [{ src: fotos.maquinas.src, descripcion: fotos.maquinas.alt }],
    planPago: "valoracion",
    seo: { titulo: "Entrenador personal en Ourense", descripcion: "Entrenador personal en Ourense: valoración inicial y plan a medida por 35 €, bonos de 10 sesiones a 27 €/sesión y entrenos en pareja o grupo desde 15 €." },
  },
  {
    slug: "pilates",
    href: "/pilates",
    icono: "flower",
    nombre: "720 Pilates",
    marca: "720 PILATES",
    lineas: "Reformer, Mat, Wall Unit e Hipopresivos en grupos reducidos. Primera clase gratis.",
    descripcion: [
      "Un estudio con personalidad propia dentro del universo 720 y un equipo de profesionales del Pilates.",
      "Reformer, Mat y Wall Unit, en estilo clásico y contemporáneo, e Hipopresivos para suelo pélvico y postura.",
    ],
    paraQuien: "Quien busca fuerza, postura y control en grupos pequeños y con atención a cada detalle.",
    nivel: "Grupos por niveles",
    precio: { desde: true, cifra: "35", unidad: "€/mes" },
    incluye: ["Prueba gratuita", "Sin matrícula", "Grupos reducidos por niveles", "Recuperas tus clases dentro del mes"],
    clases: ["reformer", "mat", "hipopresivos"],
    fotoDescripcion: "Sala de Pilates Reformer, máquinas en fila, luz natural, plano vertical",
    fotosExtra: ["Detalle de manos en la barra del Reformer", "Clase de Mat con esterillas"],
    actividad: "pilates",
    planPago: "reformer-1",
    seo: { titulo: "Pilates Reformer en Ourense", descripcion: "720 Pilates en Ourense: Reformer, Mat, Wall Unit e Hipopresivos en grupos reducidos. Primera clase gratis, sin matrícula." },
  },
  {
    slug: "yoga",
    href: "/yoga",
    icono: "sun",
    nombre: "720 Yoga",
    marca: "720 YOGA",
    lineas: "Movilidad, respiración y calma. El contrapunto perfecto a la sala de fuerza.",
    descripcion: [
      "Clases de yoga en una sala tranquila dentro del club, para moverte mejor y soltar tensión.",
      "Combínalo con la sala o con Pilates: el cuerpo lo agradece.",
    ],
    paraQuien: "Quien quiere ganar movilidad, desconectar o complementar su entrenamiento de fuerza.",
    nivel: "Todos los niveles",
    incluye: ["Grupos reducidos", "Sala propia y tranquila", "Compatible con la cuota del gimnasio"],
    clases: ["yoga"],
    fotoDescripcion: "Clase de yoga en la sala, luz cálida, plano vertical",
    fotosExtra: ["Detalle de esterillas y bloques", "Postura de grupo"],
    actividad: "yoga",
    seo: { titulo: "Yoga en Ourense", descripcion: "Clases de yoga en Ourense en grupo reducido: movilidad, respiración y calma en 720 GYM CLUB, abierto los 365 días en la calle Río Bibei. Prueba una clase gratis." },
  },
  {
    slug: "powerlifting",
    href: "/powerlifting",
    icono: "weight",
    nombre: "720 Powerlifting",
    marca: "720 POWERLIFTING",
    lineas: "Material de competición y un equipo que entrena fuerza en serio. Sentadilla, banca y peso muerto.",
    descripcion: [
      "Racks, barras y discos de competición para entrenar los tres básicos como se hace en una plataforma.",
      "Desde la primera sentadilla técnica hasta preparar tu primera competición, rodeado de gente que comparte tu objetivo.",
    ],
    paraQuien: "Quien quiere ser más fuerte, aprender la técnica de los básicos o competir.",
    nivel: "Iniciación y competición",
    incluye: ["Material de competición", "Grupo de entrenamiento", "Horario amplio, 365 días"],
    clases: ["powerlifting"],
    fotoDescripcion: "Peso muerto con discos de competición, plano bajo y vertical",
    fotosExtra: ["Discos calibrados en el soporte", "Magnesio y barra"],
    actividad: "powerlifting",
    foto: fotos.racks.src,
    extras: [{ src: fotos.sala.src, descripcion: fotos.sala.alt }],
    seo: { titulo: "Powerlifting en Ourense", descripcion: "Powerlifting en Ourense: entrena sentadilla, press banca y peso muerto con racks, barras y discos de competición en 720 GYM CLUB. Desde iniciación hasta competir." },
  },
  {
    slug: "crossgym",
    href: "/crossgym",
    icono: "flame",
    nombre: "CrossGym 720",
    marca: "CROSSGYM 720",
    lineas: "Fuerza y acondicionamiento físico general en grupo. Entreno duro, técnica primero.",
    descripcion: [
      "Sesiones dirigidas de fuerza y acondicionamiento físico general: levantamientos, trabajo metabólico y movilidad.",
      "Cada ejercicio se adapta a tu nivel, así que puedes empezar sin experiencia.",
    ],
    paraQuien: "Quien quiere entrenar intenso y acompañado, con sesiones ya programadas.",
    nivel: "Adaptado a cada nivel",
    incluye: ["Sesiones dirigidas en grupo", "Programación pensada para progresar", "Corrección de técnica"],
    clases: ["crossgym"],
    fotoDescripcion: "Grupo de CrossGym con kettlebells y cajones, plano vertical",
    fotosExtra: ["Kettlebells en el suelo negro", "Pizarra con el entreno del día"],
    actividad: "crossgym",
    foto: fotos.pista.src,
    extras: [{ src: fotos.funcional.src, descripcion: fotos.funcional.alt }, { src: fotos.racks.src, descripcion: fotos.racks.alt }],
    seo: { titulo: "CrossGym: entrenamiento funcional en Ourense", descripcion: "CrossGym 720: entrenamiento funcional de fuerza y acondicionamiento en grupo en Ourense, con la técnica por delante y adaptado a cada nivel. Clase gratis." },
  },
];

export function conceptoPorSlug(slug: string): Concepto | undefined {
  return conceptos.find((c) => c.slug === slug);
}

/** Clubes externos que entrenan dentro de 720 (cada uno con su propio contacto en su Beacons). */
export const clubes = [
  { nombre: "Clube Ximnasia Burgas", disciplina: "Gimnasia acrobática", corto: "BURGAS", detalle: "Acrobacia para peques y familias.", actividad: "acrobacia", clase: "acrobacia" as ClaseId },
  { nombre: "Capoeira Ourense Andaruê", disciplina: "Capoeira", corto: "ANDARUÊ", detalle: "Arte marcial afrobrasileño con música y ritmo.", actividad: "capoeira", clase: "capoeira" as ClaseId },
  { nombre: "Brazilian Jiu-Jitsu Mambises", disciplina: "Brazilian Jiu-Jitsu", corto: "MAMBISES", detalle: "Lucha en el suelo, técnica y estrategia.", actividad: "bjj", clase: "bjj" as ClaseId },
  { nombre: "Halterofilia", disciplina: "Halterofilia", corto: "HALTEROFILIA", detalle: "Arrancada y dos tiempos.", actividad: "halterofilia", clase: undefined },
];

/** Opciones del desplegable «actividad» del formulario. `grupo` decide qué planes se ofrecen. */
export const actividades: { id: string; nombre: string; grupo?: "gimnasio" | "personal" | "pilates"; pilates?: boolean }[] = [
  { id: "gimnasio", nombre: "Gimnasio libre (sala)", grupo: "gimnasio" },
  { id: "personal", nombre: "Entrenamiento personal", grupo: "personal" },
  { id: "pilates", nombre: "720 Pilates (Reformer, Mat, Hipopresivos)", grupo: "pilates", pilates: true },
  { id: "yoga", nombre: "720 Yoga" },
  { id: "crossgym", nombre: "CrossGym 720" },
  { id: "powerlifting", nombre: "720 Powerlifting" },
  { id: "acrobacia", nombre: "Gimnasia acrobática (Burgas)" },
  { id: "capoeira", nombre: "Capoeira (Andaruê)" },
  { id: "bjj", nombre: "Brazilian Jiu-Jitsu (Mambises)" },
  { id: "halterofilia", nombre: "Halterofilia" },
];
