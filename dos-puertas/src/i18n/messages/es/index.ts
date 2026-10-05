import type { CategoryId, PinchoId } from "@/data/menu";
import type { DayKey } from "@/data/business";

const common = {
  tagline: "El sabor auténtico de Los Vinos desde 1974",
  description:
    "Bar de pinchos en la rúa dos Fornos, zona de Os Viños de Ourense, desde 1974. Chicharrones, calamares, tortilla y empanadillas de siempre, de pie y en barra.",
  skipToContent: "Saltar al contenido",
  call: "Llamar",
  directions: "Cómo llegar",
  pending: "Pendiente de confirmar",
  photoPending: "Foto real próximamente",
  close: "Cerrar",
  readMore: "Ver más",
  source: "Fuente",
  days: {
    mon: "Lunes",
    tue: "Martes",
    wed: "Miércoles",
    thu: "Jueves",
    fri: "Viernes",
    sat: "Sábado",
    sun: "Domingo",
  } satisfies Record<DayKey, string>,
  daysShort: { mon: "Lu", tue: "Ma", wed: "Mi", thu: "Ju", fri: "Vi", sat: "Sá", sun: "Do" } satisfies Record<DayKey, string>,
  status: {
    open: "Abierto ahora",
    closesAt: "hasta las {time}",
    closingSoon: "Cierra pronto",
    opensToday: "Abre hoy a las {time}",
    closedToday: "Hoy descansamos",
    opensOn: "Abrimos el {day} a las {time}",
    opensTomorrow: "Abrimos mañana a las {time}",
    closed: "Cerrado",
  },
  today: "Hoy",
  closedDay: "Cerrado",
};

const nav = {
  home: "Inicio",
  barra: "La Barra",
  historia: "Historia",
  visita: "Visítanos",
  mainLabel: "Navegación principal",
  dockLabel: "Secciones",
};

const hero = {
  kicker: "Rúa dos Fornos, 7 · Desde 1974",
  titleBefore: "El corazón de",
  titleAccent: "Los Vinos",
  titleAfter: "de Ourense",
  subtitle: "Tradición, autenticidad y los pinchos de siempre en la rúa dos Fornos desde 1974.",
  ctaPrimary: "Ver la Barra de Pinchos",
  ctaSecondary: "Cómo llegar",
  proofPress: "En La Voz de Galicia",
  proofYears: "Más de 50 años de barra",
  scrollHint: "Baja y pasa",
  artLabel: "Ilustración de la fachada del Dos Puertas: dos puertas en arco de granito con la luz de la barra encendida dentro.",
};

const manifesto = {
  kicker: "Cómo funciona",
  titleBefore: "Se entra por una puerta,",
  titleAccent: "se sale",
  titleAfter: "por la otra",
  lead:
    "Las dos puertas no son un nombre bonito: Irene y José las pusieron en 1974 para que la gente pudiera entrar y salir sin parar la barra. Medio siglo después, sigue siendo así de sencillo.",
  rules: [
    { title: "Sin reservas", text: "Aquí no se reserva: se llega, se pide y se comparte barra." },
    { title: "De pie, en barra", text: "Tapeo de los de antes, hombro con hombro con quien venga." },
    { title: "Pinchos a 2 €", text: "Precio de barra de toda la vida, que también es parte de la receta." },
  ],
};

const barra = {
  kicker: "La barra",
  titleBefore: "Los pinchos",
  titleAccent: "de siempre",
  titleAfter: "",
  lead: "Expuestos en la barra para pedir al momento, como desde el primer día. Estos son los cuatro que no fallan.",
  seeAll: "Ver toda la barra",
  openDetail: "Ver la historia de {name}",
  pageTitle: "La Barra",
  pageLead:
    "Lo que se pide en el Dos Puertas, de pie y sin prisa. Se cambia según el día: lo que ves en la barra es lo que hay.",
  priceNote: "Según la pizarra de la fachada: pinchos a 2 € y bocadillos a 4 €. Precios de raciones pendientes de confirmar con la casa.",
  allergensNote: "Información de alérgenos pendiente: pregunta en barra.",
  storyLabel: "La historia",
  filterLabel: "Filtrar la barra",
  all: "Todo",
  results: "{count} en la barra",
  categories: {
    casa: "De la casa",
    montados: "Montados",
    raciones: "Bocadillos y raciones",
    beber: "Para beber",
  } satisfies Record<CategoryId, string>,
  items: {
    chicharrones: {
      name: "Los famosos chicharrones",
      tag: "El favorito de la casa",
      text: "Crujientes, sabrosos y hechos con la receta tradicional. El pincho más aclamado y buscado de la barra.",
      story:
        "Llegaron en los años 90 y se cocinaban en casa cada día. Hubo un matrimonio ourensano que vivía en Suiza y venía en avión algunos fines de semana solo por los chicharrones y los chipirones.",
    },
    calamares: {
      name: "Pincho de calamares",
      tag: "Imprescindible",
      text: "Un icono de la rúa dos Fornos. Calamares tiernos en su punto justo de fritura, en bollito de pan.",
      story:
        "Nació de una confusión: en los 80 había un bollito de panceta tan crujiente y rizada que los turistas lo pedían como «el de calamares». Así que se sumaron a la barra: chipirones, en realidad, pero se quedaron con el nombre. La familia cuenta que hasta Amancio Ortega quedó conquistado.",
    },
    tortilla: {
      name: "Tortilla jugosa",
      tag: "Casera",
      text: "Jugosa, recién hecha y sin cebolla, como la pidieron los clientes.",
      story:
        "Al principio llevaba cebolla, pero mucha gente protestaba, así que se hizo sin y listo. Desde los 90 es famosa por su jugosidad.",
    },
    empanadillas: {
      name: "Empanadillas tradicionales",
      tag: "Receta de 1974",
      text: "Masa crujiente rellena de sofrito clásico. Perfectas para empezar la ronda.",
      story:
        "Están en la barra desde el primer año. Algunos colegios de la zona las encargaban para sus fiestas: hubo noches enteras haciendo mil empanadillas y más.",
    },
    rixones: {
      name: "Rixones",
      tag: "Gallego",
      text: "Rixones gallegos tradicionales, como en las tabernas de antes.",
      story: "",
    },
    "lomo-queso": { name: "Lomo con queso", tag: "Montado", text: "Montado de lomo con queso.", story: "" },
    "jamon-queso": { name: "Jamón y queso", tag: "Montado", text: "Montado de jamón y queso.", story: "" },
    "atun-tomate": { name: "Atún con tomate", tag: "Montado", text: "Montado de atún con tomate.", story: "" },
    bocadillos: {
      name: "Bocadillos",
      tag: "4 €",
      text: "Los pinchos de la casa en formato bocadillo, para quien viene con hambre.",
      story: "",
    },
    raciones: {
      name: "Raciones",
      tag: "Para compartir",
      text: "Calamares, jamón serrano, queso fresco y tortilla, según la pizarra de la puerta.",
      story: "",
    },
    vinos: {
      name: "Vinos gallegos",
      tag: "D.O. de Galicia",
      text: "Selección de vinos de las denominaciones de origen gallegas. Referencias pendientes de confirmar.",
      story: "",
    },
    cerveza: { name: "Cerveza bien tirada", tag: "Caña", text: "La caña de siempre para acompañar la ronda.", story: "" },
  } satisfies Record<PinchoId, { name: string; tag: string; text: string; story: string }>,
};

const historia = {
  kicker: "Historia",
  titleBefore: "Más de 50 años",
  titleAccent: "de historia",
  titleAfter: "viva",
  lead:
    "Una pareja de Laza que aprendió hostelería en Suiza, una barra con los pinchos a la vista y una calle que todavía no era «la zona de los vinos».",
  cta: "Leer la historia completa",
  pageTitle: "Historia",
  pageLead:
    "El Dos Puertas abrió en 1974, cuando en la rúa dos Fornos solo estaba O Campante. Esta es su historia, contada por la familia que lo fundó.",
  timeline: [
    {
      year: "Años 50",
      title: "De Laza a Basilea",
      text: "Irene Fernández y José García emigran a Suiza. Allí aprenden de hostelería «todo lo que luego pusimos en práctica en Ourense».",
    },
    {
      year: "1974",
      title: "Se abren las dos puertas",
      text: "Abren el bar en la rúa dos Fornos con dos puertas para que la gente circule y una novedad: todos los pinchos expuestos en la barra para pedir al momento. José en los fogones, Irene en la barra.",
    },
    {
      year: "1974",
      title: "El moruno de 25 pesetas",
      text: "El primer pincho estrella, con ganchos de acero traídos de Suiza y una salsa que José nunca reveló. Fueron también los primeros en servir bollitos de pan hechos a mano.",
    },
    {
      year: "1984",
      title: "Llegan los «calamares»",
      text: "Se incorpora Luis Aguiar. De una confusión con un bollito de panceta crujiente nace el pincho de calamares. Los viernes y sábados salían más de 1.200 bollitos al día.",
    },
    {
      year: "Años 90",
      title: "Tortilla y chicharrones",
      text: "Llega la tortilla sin cebolla y los chicharrones hechos a diario, que pronto se convierten en uno de los pinchos más vendidos.",
    },
    {
      year: "Hoy",
      title: "Marisol y Marisa",
      text: "Desde la pandemia llevan el bar las hermanas Marisol y Marisa López, con larga experiencia en la hostelería de Ourense, manteniendo intacta la esencia del Dos Puertas.",
    },
  ],
  quote: "Lo nuestro eran los pinchos a buen precio.",
  quoteAuthor: "Luis Aguiar, a La Voz de Galicia",
  famousKicker: "Por la barra pasaron",
  famousTitle: "Hasta Amancio Ortega",
  famousText:
    "La familia recuerda con orgullo que Amancio Ortega estuvo en el bar y que le encantaron los «calamares». También eran habituales Fran, el del Deportivo, la gaitera Cristina Pato y políticos como Feijóo.",
  pressLink: "Leer el reportaje en La Voz de Galicia",
  stats: [
    { value: "1974", label: "Año de apertura" },
    { value: "4.100", label: "Pinchos a la semana en sus mejores años" },
    { value: "25 pta", label: "Lo que costaba el primer moruno" },
    { value: "2 €", label: "Lo que cuesta hoy un pincho" },
  ],
};

const social = {
  kicker: "Lo que dicen",
  titleBefore: "Una parada",
  titleAccent: "obligada",
  titleAfter: "",
  lead: "Reseñas reales de quienes pasan por la barra. Copiadas tal cual, con su nombre.",
  ratingLabel: "Nota de calidad-precio",
  ratingCount: "{count} opiniones en TripAdvisor",
  readOn: "Leer más en TripAdvisor",
  stars: "{n} de 5",
};

const visita = {
  kicker: "Visítanos",
  titleBefore: "En pleno",
  titleAccent: "casco histórico",
  titleAfter: "",
  lead: "A dos pasos de la catedral, en la calle con más tradición de pinchos de Ourense.",
  hoursTitle: "Horario",
  addressTitle: "Dónde",
  paymentTitle: "Pago",
  payments: { cash: "Efectivo", card: "Tarjeta", mobile: "Pago móvil" },
  noReservations: "No aceptamos reservas: tapeo de barra, por orden de llegada.",
  pageTitle: "Visítanos",
  pageLead: "Todo lo que hace falta saber antes de cruzar cualquiera de las dos puertas.",
  faqTitle: "Antes de venir",
  faq: [
    { q: "¿Se puede reservar?", a: "No. El Dos Puertas es un bar de barra, sin mesas: se llega, se pide y se tapea de pie." },
    { q: "¿Qué días abrís?", a: "De miércoles a domingo, de 19:30 a 00:00. Lunes y martes descansamos." },
    { q: "¿Cuánto cuesta un pincho?", a: "Según la pizarra de la puerta, 2 € el pincho y 4 € el bocadillo." },
    { q: "¿Se puede pagar con tarjeta?", a: "Sí: efectivo, tarjeta y pago móvil." },
  ],
  mapLabel: "Mapa de la zona de Os Viños con la ubicación del Dos Puertas",
};

const footer = {
  about: "Bar de pinchos en la zona de Os Viños de Ourense desde 1974.",
  contact: "Contacto",
  hours: "Horario",
  links: "La casa",
  rights: "© {year} Café Bar Dos Puertas",
  legal: "Aviso legal",
  credits: "Propuesta de web · fotos e información pendientes de validar con la casa",
};

const legal = {
  title: "Aviso legal",
  text: "Página pendiente: faltan los datos del titular del negocio. Se completará antes de publicar la web.",
};

const notFound = {
  title: "Esta puerta no lleva a ningún sitio",
  text: "Pero hay otras dos que sí.",
  back: "Volver a la barra",
};

const es = { common, nav, hero, manifesto, barra, historia, social, visita, footer, legal, notFound };
export default es;
