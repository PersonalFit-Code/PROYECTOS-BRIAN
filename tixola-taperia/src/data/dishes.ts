import type { AllergenId } from "./allergens";

/**
 * PLATOS ESTRELLA — módulo interactivo 3D (tarjetas con tilt + flip).
 * Cada plato enlaza con su ítem de la carta (`menuId`) y con un maridaje gallego.
 */
export interface StarDish {
  id: string;
  menuId: string;
  name: string;
  kicker: string;
  headline: string;
  description: string;
  ingredients: string[];
  price: number;
  unit: string;
  allergens: AllergenId[];
  pairing: {
    wine: string;
    do: string;
    why: string;
  };
  /** color de acento para la iluminación / glow de la tarjeta */
  accent: string;
  /** emoji de gran tamaño como "hero" visual de la tarjeta */
  emoji: string;
  /** imagen opcional (public/images/...) — si existe, sustituye al emoji */
  image?: string;
  badge?: string;
}

export const STAR_DISHES: StarDish[] = [
  {
    id: "zamburinas",
    menuId: "mar-zamburinas-plancha",
    name: "Zamburiñas a la plancha",
    kicker: "Plato estrella",
    headline: "Las zamburiñas que han hecho famoso al local",
    description:
      "Zamburiñas gallegas abiertas en su concha y marcadas a la plancha con aceite de oliva virgen extra, ajo laminado y perejil fresco. Jugosas, con ese punto de brasa que solo da el hierro.",
    ingredients: ["Zamburiñas de la ría", "AOVE", "Ajo laminado", "Perejil fresco", "Sal de Arousa", "Limón"],
    price: 14,
    unit: "6 uds",
    allergens: ["moluscos"],
    pairing: {
      wine: "Albariño",
      do: "D.O. Rías Baixas",
      why: "Su salinidad y acidez limpian la grasa del aceite y realzan el dulzor del molusco.",
    },
    accent: "#F0A868",
    emoji: "🐚",
    badge: "Nº 1 en zamburiñas",
  },
  {
    id: "pulpo",
    menuId: "sug-pulpo-grelos",
    name: "Pulpo a la gallega · con grelos",
    kicker: "Tradición",
    headline: "El pulpo de Ourense, capital gallega del pulpo",
    description:
      "Lo servimos de dos formas: á feira, cocido en pota de cobre con cachelos y pimentón, o a la plancha sobre grelos salteados con ajo y pimentón de La Vera. Tierno por dentro, tostado por fuera.",
    ingredients: ["Pulpo de la ría", "Grelos", "Cachelos", "Pimentón de La Vera", "AOVE", "Sal gorda"],
    price: 16,
    unit: "ración",
    allergens: ["moluscos"],
    pairing: {
      wine: "Godello",
      do: "D.O. Valdeorras",
      why: "Un blanco con cuerpo y mineralidad que acompaña la textura del pulpo sin taparlo.",
    },
    accent: "#B21E27",
    emoji: "🐙",
  },
  {
    id: "bacalao",
    menuId: "mar-bacalao-tempura",
    name: "Bacalao en tempura",
    kicker: "Crujiente",
    headline: "Tempura ligera, bacalao en lascas",
    description:
      "Lomos de bacalao desalado en casa envueltos en una tempura aireada y muy fina, fritos al momento y servidos con alioli suave de ajo asado.",
    ingredients: ["Bacalao desalado", "Tempura ligera", "Alioli de ajo asado", "Cebollino", "AOVE"],
    price: 13.5,
    unit: "ración",
    allergens: ["pescado", "gluten", "huevos"],
    pairing: {
      wine: "Ribeiro Treixadura",
      do: "D.O. Ribeiro",
      why: "El vino de Ourense: floral y ligero, contrasta con el rebozado y refresca cada bocado.",
    },
    accent: "#E8C27A",
    emoji: "🐟",
  },
  {
    id: "oreja",
    menuId: "tie-oreja",
    name: "Oreja a la plancha",
    kicker: "Tapeo clásico",
    headline: "Crujiente por fuera, melosa por dentro",
    description:
      "Oreja de cerdo cocida lentamente y marcada a la plancha hasta quedar crujiente, terminada con pimentón, sal gorda y un hilo de aceite. La tapa de toda la vida, hecha con mimo.",
    ingredients: ["Oreja de cerdo", "Pimentón dulce y picante", "Sal gorda", "AOVE", "Ajo"],
    price: 9.5,
    unit: "ración",
    allergens: [],
    pairing: {
      wine: "Mencía",
      do: "D.O. Ribeira Sacra",
      why: "Un tinto atlántico fresco y frutal que equilibra la untuosidad de la oreja.",
    },
    accent: "#D8323C",
    emoji: "🔥",
    badge: "Sin gluten",
  },
];
