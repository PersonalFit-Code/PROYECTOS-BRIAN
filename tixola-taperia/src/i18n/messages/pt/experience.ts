import type esExperience from "@/i18n/messages/es/experience";
import type { Translation } from "./shape";

/**
 * Secção "Experiência e localização" (#experiencia): letreiro em movimento, bloco cinematográfico
 * da esplanada, linha do tempo "Um dia na Tixola", estado em direto e cartão de localização com mapa 3D.
 * Os marcadores {assim} são preenchidos com useFormat().
 */
const experience = {
  marquee: [
    "Zamburiñas grelhadas",
    "Polvo com grelos",
    "Vinhos do Ribeiro, Valdeorras e Rías Baixas",
    "Cerveja artesanal",
    "Esplanada junto à Catedral",
    "Croquetes caseiros",
    "Tixolas de ferro",
  ],
  marqueeAria: "Especialidades da casa",
  marqueePause: "Pausar as especialidades",
  marqueePlay: "Retomar as especialidades",
  kicker: "A experiência",
  title: "Petiscos com vista para a",
  accent: "Catedral",
  description:
    "A nossa esplanada olha para a Catedral de San Martiño e para a igreja de Santa Eufemia, em pleno centro histórico: a \"zona de viños\" de Ourense, onde petiscar é uma forma de viver a cidade.",
  storyTitle: "Um dia na Tixola",
  storyKicker: "Da imperial do meio-dia ao último copo",
  story: [
    { time: "13:00", title: "Meio-dia na esplanada", text: "Uma imperial com tapa e os croquetes de grelo enquanto a praça se enche." },
    { time: "20:00", title: "A hora dos vinhos", text: "Godello, Ribeiro ou Mencía a copo, acompanhados de zamburiñas grelhadas." },
    { time: "22:00", title: "Jantar de tixolas", text: "Frigideiras de ferro que chegam à mesa a chiar. Para partilhar." },
  ],
  photoCaption: "A nossa esplanada na Rúa Juan de Austria, com a igreja de Santa Eufemia ao fundo",
  photoBadge: "Foto real",
  /** Cartão "estado em direto" (as etiquetas de estado vêm de common.status). */
  status: {
    kicker: "Neste momento",
    liveAria: "Estado de abertura em tempo real",
    today: "Hoje",
    restDay: "Hoje descansamos",
    hoursTitle: "Horário semanal",
    hoursCaption: "Horário semanal da {brand}",
    closed: "Fechado",
    note: "Horário segundo a nossa ficha do Google · Domingos fechado · Feriados: consulte-nos",
    reserveHint: "Guardamos-lhe mesa?",
  },
  map: {
    kicker: "Onde estamos",
    title: "Rúa Juan de Austria, 7",
    subtitle: "A um minuto a pé da Catedral",
    distance: "A um minuto da Catedral",
    area: "Centro histórico pedonal · zona dos vinhos",
    dragHint: "Arraste para rodar o mapa",
    dragHintTouch: "Deslize para rodar o mapa",
    view3d: "Vista 3D",
    photo: "Foto real",
    realMap: "Ver mapa real",
    hideMap: "Ocultar mapa",
    legend: "Legenda do mapa",
    legendYou: "Tixola",
    legendCathedral: "Catedral de San Martiño",
    legendChurch: "Santa Eufemia",
    plusCode: "Plus code",
    mapAria: "Mapa 3D estilizado do quarteirão da Rúa Juan de Austria com a Catedral de San Martiño, a igreja de Santa Eufemia e a localização da Tixola Tapería",
    embedTitle: "Localização da {brand} no Google Maps",
    askWaiter: "Pergunte ao empregado virtual como chegar",
    askWaiterPrefill: "Como chego à Tixola a partir da Catedral de Ourense?",
    pauseRotation: "Pausar a rotação do mapa",
    playRotation: "Retomar a rotação do mapa",
  },
} satisfies Translation<typeof esExperience>;
export default experience;
