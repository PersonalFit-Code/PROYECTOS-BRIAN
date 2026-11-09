/** Tarifas reales: dosier 720 GYM 2025-26 y PDF 720 Pilates 2025 (comercial/720gym/DATOS.md). */

export interface Tarifa {
  nombre: string;
  precio: string;
  unidad?: string;
  detalle: string;
  incluye?: string[];
  destacada?: boolean;
  etiqueta?: string;
  /** Valor del desplegable «plan» del formulario al pulsar el botón. */
  plan: string;
  boton: string;
  tipo: "inscripcion" | "entrada" | "prueba";
}

export const tarifasGimnasio: Tarifa[] = [
  {
    nombre: "Gimnasio libre",
    precio: "35",
    unidad: "€/mes",
    etiqueta: "Oferta de apertura",
    detalle: "Acceso ilimitado a máquinas, peso libre y cardio, todos los días del año.",
    incluye: ["Acceso ilimitado", "365 días", "Aforo limitado: nunca masificado"],
    destacada: true,
    plan: "Gimnasio libre · 35 €/mes",
    boton: "Darme de alta",
    tipo: "inscripcion",
  },
  {
    nombre: "Supervisión en grupo",
    precio: "45",
    unidad: "€/mes",
    detalle: "Acceso ilimitado más 1 h al mes de entrenamiento en grupo supervisado para corregir técnica.",
    incluye: ["Acceso ilimitado", "1 h/mes supervisada", "Máximo 10 atletas", "Requiere valoración inicial"],
    plan: "Supervisión en grupo · 45 €/mes",
    boton: "Darme de alta",
    tipo: "inscripcion",
  },
  {
    nombre: "Paquete Inicio",
    precio: "75",
    unidad: "€",
    etiqueta: "Solo 10 plazas",
    detalle: "Para empezar con buen pie: entrevista, valoración y plan personalizado.",
    incluye: ["Entrevista y valoración", "Plan personalizado", "1 sesión de entrenamiento personal de 1 h", "1 mes de acceso ilimitado"],
    plan: "Paquete Inicio · 75 €",
    boton: "Quiero el paquete",
    tipo: "inscripcion",
  },
  {
    nombre: "Entrada libre",
    precio: "5",
    unidad: "€/día",
    detalle: "¿Estás de paso por Ourense? Entra a entrenar un día. Pídela online en un minuto.",
    incluye: ["Acceso por un día", "Sala completa"],
    plan: "Entrada diaria · 5 €",
    boton: "Pedir entrada",
    tipo: "entrada",
  },
];

export type Modalidad = "Individual" | "Pareja" | "Trío" | "Grupo de 4";

export const bonos: Record<Modalidad, { sesiones: number; total: string; porSesion: string; recomendado?: boolean }[]> = {
  Individual: [
    { sesiones: 2, total: "65", porSesion: "32,5 €/sesión" },
    { sesiones: 5, total: "150", porSesion: "30 €/sesión" },
    { sesiones: 10, total: "270", porSesion: "27 €/sesión", recomendado: true },
    { sesiones: 15, total: "375", porSesion: "25 €/sesión" },
  ],
  Pareja: [
    { sesiones: 5, total: "240", porSesion: "24 €/atleta" },
    { sesiones: 10, total: "430", porSesion: "21,5 €/atleta", recomendado: true },
    { sesiones: 15, total: "600", porSesion: "20 €/atleta" },
  ],
  Trío: [
    { sesiones: 5, total: "315", porSesion: "21 €/atleta" },
    { sesiones: 10, total: "570", porSesion: "19 €/atleta", recomendado: true },
    { sesiones: 15, total: "780", porSesion: "17,5 €/atleta" },
  ],
  "Grupo de 4": [
    { sesiones: 5, total: "360", porSesion: "18 €/atleta" },
    { sesiones: 10, total: "660", porSesion: "16,5 €/atleta", recomendado: true },
    { sesiones: 15, total: "900", porSesion: "15 €/atleta" },
  ],
};

export const primeraSesion = {
  nombre: "1 sesión + valoración inicial",
  precio: "35",
  detalle: "Entrevista, valoración y plan personalizado. De 1 a 1,5 h. Es el primer paso para cualquier bono.",
};

export const extrasPersonal = [
  "Material online gratuito con los bonos: vídeos, rutinas y consejos",
  "Dudas por WhatsApp o teléfono incluidas",
  "La cuota del gimnasio va incluida durante tus sesiones",
  "Los bonos no caducan",
];

export interface PlanPilates {
  nombre: string;
  precio: string;
}
export const tarifasPilates: { grupo: string; descripcion: string; planes: PlanPilates[] }[] = [
  {
    grupo: "Reformer",
    descripcion: "Máquina Reformer en grupo reducido. 50 min.",
    planes: [
      { nombre: "1 día/semana", precio: "55" },
      { nombre: "2 días/semana", precio: "95" },
      { nombre: "3 días/semana", precio: "127" },
    ],
  },
  {
    grupo: "Mat Integral",
    descripcion: "Pilates de suelo y Wall Unit. 50 min.",
    planes: [
      { nombre: "1 día/semana", precio: "40" },
      { nombre: "2 días/semana", precio: "57" },
      { nombre: "3 días/semana", precio: "87" },
    ],
  },
  {
    grupo: "Mixto",
    descripcion: "Combina Mat y Reformer a tu gusto.",
    planes: [
      { nombre: "2 días · Mat + Reformer", precio: "78" },
      { nombre: "3 días · 2 Mat + Reformer", precio: "98" },
      { nombre: "3 días · 2 Reformer + Mat", precio: "118" },
    ],
  },
  {
    grupo: "Hipopresivos",
    descripcion: "Suelo pélvico y postura. 30 min.",
    planes: [
      { nombre: "1 día/semana", precio: "35" },
      { nombre: "2 días/semana", precio: "55" },
      { nombre: "2 días · Hipopresivos + Mat", precio: "60" },
      { nombre: "2 días · Hipopresivos + Reformer", precio: "80" },
      { nombre: "3 días · Hipo + Reformer + Mat", precio: "100" },
    ],
  },
];

export const condicionesGimnasio = [
  "El pago mensual se hace entre el día 1 y el 7.",
  "Las sesiones de entrenamiento personal duran 1 h.",
  "Para cancelar o cambiar una sesión, avisa con 24 h.",
  "Para entrenar fuera de tus sesiones, se paga la cuota de gimnasio libre.",
];

export const condicionesPilates = [
  "Sin matrícula y con clase de prueba gratuita.",
  "Sesiones de Pilates de 50 min; de Hipopresivos, 30 min.",
  "Grupos por niveles y reducidos.",
  "Las clases se recuperan dentro del mismo mes.",
  "El pago se hace del 1 al 7.",
];

/** Opciones del desplegable «plan» del formulario, por tipo de alta. */
export const planesFormulario: Record<string, string[]> = {
  gimnasio: [
    "Gimnasio libre · 35 €/mes",
    "Supervisión en grupo · 45 €/mes",
    "Paquete Inicio · 75 €",
    "Aún no lo sé, quiero que me asesoréis",
  ],
  personal: [
    "1 sesión + valoración inicial · 35 €",
    "Bono 5 sesiones",
    "Bono 10 sesiones (recomendado)",
    "Bono 15 sesiones",
    "En pareja / trío / grupo de 4",
  ],
  pilates: [
    "Reformer 1 día · 55 €/mes",
    "Reformer 2 días · 95 €/mes",
    "Reformer 3 días · 127 €/mes",
    "Mat Integral 1 día · 40 €/mes",
    "Mat Integral 2 días · 57 €/mes",
    "Mat Integral 3 días · 87 €/mes",
    "Mixto (Mat + Reformer)",
    "Hipopresivos",
    "Sesión suelta · 15 €",
    "Aún no lo sé, quiero que me asesoréis",
  ],
};
