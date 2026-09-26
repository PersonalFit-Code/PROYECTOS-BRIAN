import { formatCurrency } from "@/lib/format";
import type { AllergenId } from "./allergens";

/**
 * CARTA COMPLETA — datos editables.
 * Los platos provienen de la carta física de Tixola y de las reseñas públicas
 * (croquetas de grelo con chipirón, tixolas, zamburiñas, pulpo con grelos, bacalao en tempura…).
 * ⚠️ Los precios son ORIENTATIVOS (rango 10-20 €/persona). Actualízalos con la carta vigente.
 */

export type MenuCategoryId =
  | "sugerencias"
  | "croquetas"
  | "tixolas"
  | "mar"
  | "tierra"
  | "ensaladas"
  | "postres"
  | "vinos"
  | "bebidas";

export type DietTag = "vegano" | "vegetariano" | "sin-gluten" | "picante" | "estrella" | "nuevo";

export interface MenuCategory {
  id: MenuCategoryId;
  label: string;
  /** subtítulo corto, estilo RavioXO */
  kicker: string;
  description: string;
}

export interface MenuVariant {
  label: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategoryId;
  description: string;
  /** precio base en euros */
  price: number;
  /** texto que acompaña al precio: "ración", "8 uds", "copa"… */
  unit?: string;
  /** variantes (media ración / ración, copa / botella) */
  variants?: MenuVariant[];
  allergens: AllergenId[];
  tags: DietTag[];
  /** maridaje recomendado (vino gallego) */
  pairing?: string;
  /** clave de icono (ver components/icons/DishIcons.tsx); la UI nunca pinta el emoji */
  emoji: string;
  /** foto real opcional (public/images/...) */
  image?: string;
}

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: "sugerencias", label: "Sugerencias", kicker: "Pizarra del día", description: "Lo que hoy entra por la puerta de la lonja y del mercado." },
  { id: "croquetas", label: "Croquetas", kicker: "Caseras · 8 uds", description: "Nuestra bechamel reposa 24 h. Crujientes fuera, cremosas dentro." },
  { id: "tixolas", label: "Tixolas", kicker: "La especialidad de la casa", description: "\"Tixola\" es sartén en gallego. Sartenes de hierro fundido que llegan a la mesa chisporroteando." },
  { id: "mar", label: "Del Mar", kicker: "Lonja gallega", description: "Zamburiñas, pulpo, bacalao y calamar. Producto de las rías, cocinado al momento." },
  { id: "tierra", label: "De la Tierra", kicker: "Raciones para compartir", description: "Raxo, oreja, quesos gallegos y clásicos del tapeo ourensano." },
  { id: "ensaladas", label: "Ensaladas", kicker: "Fresco y de temporada", description: "Verduras de la huerta ourensana con toques creativos." },
  { id: "postres", label: "Postres", kicker: "Caseros", description: "El final dulce, hecho en casa cada mañana." },
  { id: "vinos", label: "Vinos", kicker: "Vinoteca gallega", description: "Godello, Ribeiro, Albariño y Mencía. Por copas o por botella." },
  { id: "bebidas", label: "Cervezas y más", kicker: "Artesanas y refrescos", description: "Cerveza artesanal gallega, cañas bien tiradas y refrescos." },
];

export const MENU_ITEMS: MenuItem[] = [
  // ─── SUGERENCIAS ────────────────────────────────────────────────
  {
    id: "sug-zamburinas-rellenas",
    image: "/images/zamburinas-plancha.jpg",
    name: "Zamburiñas rellenas gratinadas",
    category: "sugerencias",
    description: "Zamburiñas de la ría rellenas de sofrito de cebolla, jamón y pan rallado, gratinadas al horno.",
    price: 14.5,
    unit: "6 uds",
    allergens: ["moluscos", "gluten", "lacteos"],
    tags: ["estrella"],
    pairing: "Albariño D.O. Rías Baixas",
    emoji: "🐚",
  },
  {
    id: "sug-raxo-arzua",
    image: "/images/tixola-raxo-croquetas.jpg",
    name: "Tixola de raxo con queso de Arzúa",
    category: "sugerencias",
    description: "Lomo de cerdo adobado al estilo gallego, patatas panadera y queso Arzúa-Ulloa fundido.",
    price: 12.5,
    unit: "sartén",
    allergens: ["lacteos"],
    tags: [],
    pairing: "Mencía D.O. Ribeira Sacra",
    emoji: "🍳",
  },
  {
    id: "sug-pulpo-grelos",
    name: "Pulpo a la plancha con grelos",
    category: "sugerencias",
    description: "Pulpo de la ría marcado a la plancha sobre cama de grelos salteados con ajo y pimentón de La Vera.",
    price: 16,
    unit: "ración",
    allergens: ["moluscos"],
    tags: ["estrella", "sin-gluten"],
    pairing: "Godello D.O. Valdeorras",
    emoji: "🐙",
  },

  // ─── CROQUETAS ──────────────────────────────────────────────────
  {
    id: "croq-grelo-chipiron",
    name: "Croquetas de grelo con chipirón",
    category: "croquetas",
    description: "Las más aplaudidas de Ourense: bechamel de grelo con chipirón en su tinta.",
    price: 9.5,
    unit: "8 uds",
    variants: [
      { label: "Media (4 uds)", price: 5.5 },
      { label: "Ración (8 uds)", price: 9.5 },
    ],
    allergens: ["gluten", "lacteos", "huevos", "moluscos"],
    tags: ["estrella"],
    pairing: "Ribeiro Treixadura",
    emoji: "🥟",
  },
  {
    id: "croq-jamon",
    image: "/images/tixola-raxo-croquetas.jpg",
    name: "Croquetas de jamón ibérico",
    category: "croquetas",
    description: "Receta de la abuela con jamón ibérico picado a cuchillo.",
    price: 9,
    unit: "8 uds",
    variants: [
      { label: "Media (4 uds)", price: 5 },
      { label: "Ración (8 uds)", price: 9 },
    ],
    allergens: ["gluten", "lacteos", "huevos"],
    tags: [],
    emoji: "🥟",
  },
  {
    id: "croq-cecina-cabra",
    name: "Croquetas de cecina y queso de cabra",
    category: "croquetas",
    description: "Cecina de León ahumada con corazón de queso de cabra.",
    price: 9.5,
    unit: "8 uds",
    allergens: ["gluten", "lacteos", "huevos"],
    tags: [],
    emoji: "🥟",
  },
  {
    id: "croq-bacalao-singluten",
    name: "Croquetas de bacalao sin gluten",
    category: "croquetas",
    description: "Rebozadas con harina de maíz y arroz. Aptas para celíacos.",
    price: 10,
    unit: "8 uds",
    allergens: ["pescado", "lacteos", "huevos"],
    tags: ["sin-gluten"],
    emoji: "🥟",
  },

  // ─── TIXOLAS ────────────────────────────────────────────────────
  {
    id: "tix-chistorra-huevos",
    name: "Tixola de chistorra con huevos",
    category: "tixolas",
    description: "Chistorra navarra a la brasa, huevos camperos rotos y patatas paja.",
    price: 11.5,
    unit: "sartén",
    allergens: ["huevos", "lacteos"],
    tags: ["estrella"],
    pairing: "Mencía D.O. Ribeira Sacra",
    emoji: "🍳",
  },
  {
    id: "tix-huevos-rotos-jamon",
    name: "Tixola de huevos rotos con jamón",
    category: "tixolas",
    description: "El clásico: huevos camperos, patatas y jamón ibérico sobre hierro caliente.",
    price: 11,
    unit: "sartén",
    allergens: ["huevos"],
    tags: ["sin-gluten"],
    emoji: "🍳",
  },
  {
    id: "tix-raxo-queso-azul",
    image: "/images/tixola-raxo-croquetas.jpg",
    name: "Tixola de raxo con huevos y queso azul",
    category: "tixolas",
    description: "Raxo adobado, huevos rotos y crema de queso azul gallego.",
    price: 13,
    unit: "sartén",
    allergens: ["huevos", "lacteos"],
    tags: [],
    pairing: "Godello D.O. Valdeorras",
    emoji: "🍳",
  },
  {
    id: "tix-gulas-setas-gambas",
    name: "Tixola de gulas con setas y gambas",
    category: "tixolas",
    description: "Gulas al ajillo con setas de temporada, gambas y guindilla.",
    price: 13.5,
    unit: "sartén",
    allergens: ["pescado", "crustaceos", "huevos", "gluten", "soja"],
    tags: ["picante"],
    pairing: "Albariño D.O. Rías Baixas",
    emoji: "🍳",
  },
  {
    id: "tix-vegana",
    name: "Tixola vegana de setas y verduras",
    category: "tixolas",
    description: "Setas, pimientos, calabacín y tofu ahumado con pimentón. 100 % vegetal.",
    price: 10.5,
    unit: "sartén",
    allergens: ["soja"],
    tags: ["vegano", "vegetariano", "sin-gluten"],
    pairing: "Ribeiro Treixadura",
    emoji: "🍄",
  },

  // ─── DEL MAR ────────────────────────────────────────────────────
  {
    id: "mar-zamburinas-plancha",
    image: "/images/zamburinas-plancha.jpg",
    name: "Zamburiñas a la plancha",
    category: "mar",
    description: "Zamburiñas gallegas a la plancha con aceite de oliva virgen, ajo y perejil. Nuestro plato estrella.",
    price: 14,
    unit: "6 uds",
    allergens: ["moluscos"],
    tags: ["estrella", "sin-gluten"],
    pairing: "Albariño D.O. Rías Baixas",
    emoji: "🐚",
  },
  {
    id: "mar-pulpo-feira",
    name: "Pulpo á feira",
    category: "mar",
    description: "Pulpo cocido en pota de cobre, con cachelos, pimentón y aceite de oliva. Tradición pura.",
    price: 15.5,
    unit: "ración",
    allergens: ["moluscos"],
    tags: ["sin-gluten"],
    pairing: "Ribeiro Treixadura",
    emoji: "🐙",
  },
  {
    id: "mar-bacalao-tempura",
    name: "Bacalao en tempura con alioli",
    category: "mar",
    description: "Lomos de bacalao desalado en tempura ligera y crujiente, con alioli suave de ajo asado.",
    price: 13.5,
    unit: "ración",
    allergens: ["pescado", "gluten", "huevos"],
    tags: ["estrella"],
    pairing: "Godello D.O. Valdeorras",
    emoji: "🐟",
  },
  {
    id: "mar-calamares",
    name: "Calamares a la andaluza",
    category: "mar",
    description: "Anillas de calamar fresco, rebozado fino y limón.",
    price: 12,
    unit: "ración",
    allergens: ["moluscos", "gluten"],
    tags: [],
    emoji: "🦑",
  },
  {
    id: "mar-choubas",
    name: "Choubas fritas",
    category: "mar",
    description: "Sardinillas fritas enteras, crujientes, con sal gorda y limón.",
    price: 9.5,
    unit: "ración",
    allergens: ["pescado"],
    tags: ["sin-gluten"],
    emoji: "🐟",
  },
  {
    id: "mar-pastel-cabracho",
    name: "Pastel de cabracho",
    category: "mar",
    description: "Pastel casero de cabracho con mahonesa de pimientos y tostas.",
    price: 9,
    unit: "ración",
    allergens: ["pescado", "huevos", "lacteos", "gluten", "crustaceos"],
    tags: [],
    emoji: "🐠",
  },

  // ─── DE LA TIERRA ───────────────────────────────────────────────
  {
    id: "tie-oreja",
    name: "Oreja a la plancha",
    category: "tierra",
    description: "Oreja de cerdo cocida y marcada a la plancha hasta quedar crujiente, con pimentón y sal gorda.",
    price: 9.5,
    unit: "ración",
    allergens: [],
    tags: ["estrella", "sin-gluten"],
    pairing: "Mencía D.O. Ribeira Sacra",
    emoji: "🥓",
  },
  {
    id: "tie-fingers-pollo",
    name: "Fingers de pollo caseros",
    category: "tierra",
    description: "Tiras de pollo empanadas en casa con salsa de miel y mostaza.",
    price: 10.5,
    unit: "ración",
    allergens: ["gluten", "huevos", "mostaza"],
    tags: [],
    emoji: "🍗",
  },
  {
    id: "tie-raxo-patatas",
    name: "Raxo con patatas",
    category: "tierra",
    description: "Lomo de cerdo adobado con ajo, pimentón y orégano, con patatas fritas.",
    price: 11,
    unit: "ración",
    allergens: [],
    tags: ["sin-gluten"],
    emoji: "🥩",
  },
  {
    id: "tie-queso-frito",
    name: "Queso frito con mermelada de tomate",
    category: "tierra",
    description: "Queso de tetilla empanado y frito, con mermelada casera de tomate.",
    price: 9,
    unit: "ración",
    allergens: ["lacteos", "gluten", "huevos"],
    tags: ["vegetariano"],
    emoji: "🧀",
  },
  {
    id: "tie-bravas",
    name: "Patatas bravas Tixola",
    category: "tierra",
    description: "Patatas fritas con nuestra salsa brava \"fuera de lo común\" y alioli.",
    price: 6.5,
    unit: "ración",
    allergens: ["huevos"],
    tags: ["vegetariano", "picante", "sin-gluten"],
    emoji: "🥔",
  },
  {
    id: "tie-padron",
    name: "Pimientos de Padrón",
    category: "tierra",
    description: "Uns pican e outros non. Fritos con aceite de oliva y sal gorda.",
    price: 6.5,
    unit: "ración",
    allergens: [],
    tags: ["vegano", "vegetariano", "sin-gluten"],
    emoji: "🌶️",
  },
  {
    id: "tie-tabla-quesos",
    name: "Tabla de quesos gallegos",
    category: "tierra",
    description: "Arzúa-Ulloa, San Simón da Costa ahumado y Tetilla, con membrillo y nueces.",
    price: 13,
    unit: "tabla",
    allergens: ["lacteos", "frutos-cascara"],
    tags: ["vegetariano", "sin-gluten"],
    pairing: "Godello D.O. Valdeorras",
    emoji: "🧀",
  },
  {
    id: "tie-tabla-embutidos",
    name: "Tabla de embutidos con pan de Cea",
    category: "tierra",
    description: "Chorizo, lacón y cecina con pan de Cea (IGP), el pan de leña ourensano.",
    price: 12.5,
    unit: "tabla",
    allergens: ["gluten", "sulfitos"],
    tags: [],
    pairing: "Mencía D.O. Ribeira Sacra",
    emoji: "🥖",
  },

  // ─── ENSALADAS ──────────────────────────────────────────────────
  {
    id: "ens-pollo-crujiente",
    name: "Ensalada de pollo crujiente",
    category: "ensaladas",
    description: "Mezclum, pollo empanado, tomate cherry, parmesano y vinagreta de miel y mostaza.",
    price: 10.5,
    unit: "ración",
    allergens: ["gluten", "huevos", "lacteos", "mostaza"],
    tags: [],
    emoji: "🥗",
  },
  {
    id: "ens-ventresca",
    name: "Ensalada de tomate y ventresca",
    category: "ensaladas",
    description: "Tomate de temporada, ventresca de bonito, cebolleta y AOVE.",
    price: 10,
    unit: "ración",
    allergens: ["pescado"],
    tags: ["sin-gluten"],
    emoji: "🍅",
  },
  {
    id: "ens-vegana-quinoa",
    name: "Ensalada vegana de quinoa y aguacate",
    category: "ensaladas",
    description: "Quinoa, aguacate, edamame, granada y semillas de sésamo con lima.",
    price: 10,
    unit: "ración",
    allergens: ["sesamo", "soja"],
    tags: ["vegano", "vegetariano", "sin-gluten"],
    emoji: "🥑",
  },

  // ─── POSTRES ────────────────────────────────────────────────────
  {
    id: "pos-coulant",
    name: "Coulant de chocolate",
    category: "postres",
    description: "Bizcocho de chocolate con corazón fundido y helado de vainilla.",
    price: 6,
    unit: "ud",
    allergens: ["gluten", "huevos", "lacteos"],
    tags: ["vegetariano", "estrella"],
    emoji: "🍫",
  },
  {
    id: "pos-flan-choco-blanco",
    name: "Flan de chocolate blanco",
    category: "postres",
    description: "Flan casero de chocolate blanco con caramelo y nata.",
    price: 5.5,
    unit: "ud",
    allergens: ["huevos", "lacteos"],
    tags: ["vegetariano", "sin-gluten"],
    emoji: "🍮",
  },
  {
    id: "pos-tarta-queso",
    name: "Tarta de queso cremosa",
    category: "postres",
    description: "Al horno, con base de galleta y coulis de frutos rojos.",
    price: 6,
    unit: "ud",
    allergens: ["lacteos", "huevos", "gluten"],
    tags: ["vegetariano"],
    emoji: "🍰",
  },
  {
    id: "pos-pina",
    name: "Piña natural con lima y menta",
    category: "postres",
    description: "Piña fresca laminada, zumo de lima y hojas de menta.",
    price: 4.5,
    unit: "ud",
    allergens: [],
    tags: ["vegano", "vegetariano", "sin-gluten"],
    emoji: "🍍",
  },

  // ─── VINOS ──────────────────────────────────────────────────────
  {
    id: "vin-godello",
    name: "Godello D.O. Valdeorras",
    category: "vinos",
    description: "Blanco mineral y fresco, el favorito de la casa para pulpo y bacalao.",
    price: 3,
    unit: "copa",
    variants: [
      { label: "Copa", price: 3 },
      { label: "Botella", price: 16 },
    ],
    allergens: ["sulfitos"],
    tags: ["vegano", "sin-gluten"],
    emoji: "🍷",
  },
  {
    id: "vin-ribeiro",
    name: "Ribeiro Treixadura",
    category: "vinos",
    description: "El vino de Ourense por excelencia: floral, ligero, perfecto con croquetas.",
    price: 2.8,
    unit: "copa",
    variants: [
      { label: "Copa", price: 2.8 },
      { label: "Botella", price: 15 },
    ],
    allergens: ["sulfitos"],
    tags: ["vegano", "sin-gluten"],
    emoji: "🍷",
  },
  {
    id: "vin-albarino",
    name: "Albariño D.O. Rías Baixas",
    category: "vinos",
    description: "Aromático y salino. El maridaje natural de las zamburiñas.",
    price: 3.2,
    unit: "copa",
    variants: [
      { label: "Copa", price: 3.2 },
      { label: "Botella", price: 18 },
    ],
    allergens: ["sulfitos"],
    tags: ["vegano", "sin-gluten"],
    emoji: "🍷",
  },
  {
    id: "vin-mencia",
    name: "Mencía D.O. Ribeira Sacra",
    category: "vinos",
    description: "Tinto atlántico de viticultura heroica. Frutas rojas y frescura para las tixolas.",
    price: 3,
    unit: "copa",
    variants: [
      { label: "Copa", price: 3 },
      { label: "Botella", price: 17 },
    ],
    allergens: ["sulfitos"],
    tags: ["vegano", "sin-gluten"],
    emoji: "🍷",
  },

  // ─── BEBIDAS ────────────────────────────────────────────────────
  {
    id: "beb-artesana",
    name: "Cerveza artesana gallega",
    category: "bebidas",
    description: "Selección rotativa de cervecerías gallegas. Pregunta por la de hoy.",
    price: 4,
    unit: "33 cl",
    allergens: ["gluten"],
    tags: ["vegano"],
    emoji: "🍺",
  },
  {
    id: "beb-cana",
    name: "Caña Estrella Galicia",
    category: "bebidas",
    description: "Bien tirada, con tapa de la casa.",
    price: 2,
    unit: "caña",
    allergens: ["gluten"],
    tags: ["vegano"],
    emoji: "🍺",
  },
  {
    id: "beb-agua",
    name: "Agua mineral",
    category: "bebidas",
    description: "Con o sin gas.",
    price: 1.3,
    unit: "50 cl",
    allergens: [],
    tags: ["vegano", "sin-gluten"],
    emoji: "💧",
  },
];

export const DIET_TAG_LABELS: Record<DietTag, string> = {
  vegano: "Vegano",
  vegetariano: "Vegetariano",
  "sin-gluten": "Sin gluten",
  picante: "Picante",
  estrella: "Plato estrella",
  nuevo: "Nuevo",
};

/**
 * Precio en euros según el idioma. Usa formateo determinista (src/lib/format.ts) en lugar de
 * `Intl.NumberFormat` para que servidor y navegador produzcan exactamente el mismo texto
 * aunque el navegador no tenga datos ICU del idioma (ver el comentario de format.ts).
 */
export const formatPrice = (n: number, locale: string = "es") => formatCurrency(n, locale);
