import { formatCurrency } from "@/lib/format";
import type { AllergenId } from "./allergens";

/**
 * CARTA COMPLETA — transcrita de la carta física de Tixola (septiembre de 2026).
 *
 * Los NOMBRES y los PRECIOS son los del papel y no se tocan sin una carta nueva delante: son el
 * contrato con quien llega al local. Las DESCRIPCIONES sí son nuestras —la carta de papel solo trae
 * nombre y precio— y están para lo que una carta digital puede hacer y una de papel no: contar de
 * qué va el plato antes de que alguien lo pida.
 *
 * ⚠️ ALÉRGENOS. Son una DEDUCCIÓN a partir de la receta habitual de cada plato, no un dato que haya
 * dado el restaurante, y están pendientes de que Tatiana los confirme uno a uno. Mientras tanto se
 * aplican dos reglas que no se saltan:
 *  1. Solo se declara PRESENCIA. No se afirma nunca que un plato esté libre de algo: no sabemos en
 *     qué aceite se fríe, qué plancha se comparte ni qué marca de producto se compra.
 *  2. Ante la duda, se DECLARA. Declarar de más esconde el plato de un filtro (molesto); declarar de
 *     menos se lo enseña a quien no puede comerlo (peligroso). El coste no es simétrico.
 * Por eso tampoco se etiqueta "sin gluten" por nuestra cuenta: las dos únicas apariciones de esa
 * etiqueta son las que la propia carta de papel declara (croquetas sin gluten y postre sin gluten).
 *
 * MARIDAJES: vacíos a propósito. Recomendar un vino concreto es afirmar que el local lo sirve, y la
 * carta de vinos todavía no ha llegado. Se rellenarán cuando llegue.
 */

export type MenuCategoryId =
  | "tostas"
  | "tixolas"
  | "ensaladas"
  | "cocina"
  | "especiales"
  | "pulpo"
  | "embutidos"
  | "revueltos"
  | "varios";

export type DietTag = "vegano" | "vegetariano" | "sin-gluten" | "picante" | "estrella" | "nuevo";

export interface MenuCategory {
  id: MenuCategoryId;
  label: string;
  /** subtítulo corto, estilo RavioXO */
  kicker: string;
  description: string;
  /**
   * Estética de pizarra (tiza sobre fondo punteado). Antes estaba cableada en `CategorySection` a
   * la categoría "sugerencias"; al cambiar la carta esa categoría desapareció y el efecto se habría
   * perdido sin que nadie lo notase. Ahora es un dato: la próxima carta no vuelve a pasar por un
   * componente para decidir esto.
   */
  chalkboard?: boolean;
}

export interface MenuVariant {
  label: string;
  price: number;
}

/**
 * IDS DE PLATO, declarados aparte para poder derivar un TIPO de ellos.
 *
 * Existe por un fallo que no daba la cara: `dishes.ts` (platos estrella), `photos.ts` (fotos) y la
 * portada referencian platos por su id en forma de cadena suelta, y un id que dejaba de existir no
 * rompía nada — la foto simplemente no salía y el enlace no llevaba a ningún sitio. Con 47 platos
 * cambiando de golpe, eso era una mina. Ahora esas referencias se tipan con `MenuItemId` y el
 * compilador las señala una a una.
 */
export const MENU_ITEM_IDS = [
  "tos-salmon-queso",
  "tos-trigueros-jamon-codorniz",
  "tos-cebolla-foie-cabra",
  "tix-piquillos-panceta",
  "tix-chistorra",
  "tix-gulas-setas-langostinos",
  "tix-raxo-arzua",
  "tix-pisto-verduras",
  "ens-gulas-setas-langostinos",
  "ens-pollo-crujiente",
  "ens-ventresca",
  "ens-cecina-helado-oveja",
  "ens-aguacate-bacalao",
  "coc-patatas",
  "coc-croquetas-jamon",
  "coc-croquetas-grelos-chipiron",
  "coc-croquetas-cecina-cabra",
  "coc-mejillones-tigre",
  "coc-calamares",
  "coc-bacalao-tempura",
  "coc-salteado-verdura-arroz",
  "coc-croquetas-sin-gluten",
  "coc-tortilla-champinones",
  "coc-fingers-pollo",
  "coc-pastel-cabracho",
  "esp-timbal-vegetal",
  "esp-brocheta-xxl",
  "esp-ajada-bacalao",
  "esp-zamburinas-plancha",
  "esp-zamburinas-rellenas",
  "esp-queso-frito",
  "esp-oreja-plancha",
  "pul-gallega-plancha",
  "pul-plancha-grelos",
  "pul-salteado-salmon-langostinos",
  "pul-tempura",
  "emb-jamon-serrano",
  "emb-queso-pais",
  "emb-queso-oveja",
  "emb-queso-cabra",
  "rev-algas-langostinos",
  "rev-bacalao-grelos-langostinos",
  "rev-setas-oreja",
  "var-postre",
  "var-postre-sin-gluten",
  "var-pan",
  "var-pan-tomate",
] as const;

export type MenuItemId = (typeof MENU_ITEM_IDS)[number];

export interface MenuItem {
  id: MenuItemId;
  name: string;
  category: MenuCategoryId;
  description: string;
  /** precio base en euros */
  price: number;
  /** texto que acompaña al precio: "ración", "sartén", "cesta"… */
  unit?: string;
  /** variantes (media ración / ración). Siempre de menor a mayor: se traducen por posición. */
  variants?: MenuVariant[];
  allergens: AllergenId[];
  tags: DietTag[];
  /** maridaje recomendado (vino gallego). Vacío hasta que llegue la carta de vinos. */
  pairing?: string;
  /** clave de icono (ver components/icons/DishIcons.tsx); la UI nunca pinta el emoji */
  emoji: string;
  /** foto real opcional (public/images/...) */
  image?: string;
}

export const MENU_CATEGORIES: MenuCategory[] = [
  { id: "tostas", label: "Tostas", kicker: "Para empezar", description: "Pan tostado y encima, poco y bueno. El primer bocado mientras se decide el resto." },
  {
    id: "tixolas",
    label: "Tixolas",
    kicker: "La especialidad de la casa",
    description: '"Tixola" es sartén en gallego. Hierro fundido que llega a la mesa chisporroteando, y todas con huevos y patatas fritas.',
  },
  { id: "ensaladas", label: "Ensaladas", kicker: "Fresco, y de plato único", description: "Grandes, para comer de ellas y no para acompañar. De la huerta y de la lonja a partes iguales." },
  { id: "cocina", label: "A nosa cociña", kicker: "Lo de siempre, bien hecho", description: "Croquetas, frituras y raciones para compartir. Lo que sale de la cocina todo el día." },
  {
    id: "especiales",
    label: "Especiales",
    kicker: "Lo que hay que probar",
    description: "Las zamburiñas por las que nos conocen y los clásicos que no faltan en ninguna mesa.",
    chalkboard: true,
  },
  { id: "pulpo", label: "Pulpo", kicker: "De la ría", description: "Cocido en pota de cobre o marcado a la plancha. En Ourense el pulpo tiene sección propia." },
  { id: "embutidos", label: "Embutidos y quesos", kicker: "Tabla y cuchillo", description: "Para abrir boca o para alargar la sobremesa con lo que quede en la copa." },
  { id: "revueltos", label: "Revueltos", kicker: "Huevo y sartén", description: "Cuajados al punto, ni secos ni líquidos. El plato de cuchara del que no la usa." },
  { id: "varios", label: "Varios", kicker: "Postre y mesa", description: "El final dulce y lo que acompaña a todo lo demás." },
];

export const MENU_ITEMS: MenuItem[] = [
  // ─── TOSTAS ─────────────────────────────────────────────────────
  {
    id: "tos-salmon-queso",
    name: "Tosta de salmón y queso",
    category: "tostas",
    description: "Salmón ahumado y queso cremoso sobre pan tostado. Fría, suave y directa: la que se pide sin pensar mientras llega el resto.",
    price: 6.8,
    unit: "unidad",
    allergens: ["gluten", "pescado", "lacteos"],
    tags: [],
    emoji: "🥖",
  },
  {
    id: "tos-trigueros-jamon-codorniz",
    name: "Tosta de trigueros, jamón y huevo de codorniz",
    category: "tostas",
    description: "Espárragos trigueros a la plancha, jamón y un huevo de codorniz encima. Se come de dos bocados y la yema hace el resto.",
    price: 7.2,
    unit: "unidad",
    allergens: ["gluten", "huevos"],
    tags: [],
    emoji: "🥖",
  },
  {
    id: "tos-cebolla-foie-cabra",
    name: "Tosta de crema de cebolla, foie y rulo de cabra",
    category: "tostas",
    description: "Cebolla cocinada despacio hasta que se vuelve dulce, foie y un medallón de rulo de cabra. La más golosa de las tres.",
    price: 7.5,
    unit: "unidad",
    allergens: ["gluten", "lacteos", "sulfitos"],
    tags: [],
    emoji: "🥖",
  },

  // ─── TIXOLAS ────────────────────────────────────────────────────
  {
    id: "tix-piquillos-panceta",
    name: "Tixola de piquillos caramelizados y panceta",
    category: "tixolas",
    description: "Pimientos del piquillo caramelizados y panceta crujiente sobre la sartén de hierro, con sus huevos y sus patatas. Dulce y salado en el mismo bocado.",
    price: 12.5,
    unit: "sartén",
    allergens: ["huevos"],
    tags: [],
    emoji: "🍳",
  },
  {
    id: "tix-chistorra",
    name: "Tixola con chistorra",
    category: "tixolas",
    description: "Chistorra hecha en la propia sartén, con huevos y patatas fritas. La más sencilla y la que más se repite.",
    price: 11.5,
    unit: "sartén",
    allergens: ["huevos"],
    tags: [],
    emoji: "🍳",
  },
  {
    id: "tix-gulas-setas-langostinos",
    name: "Tixola con gulas, setas y langostinos",
    category: "tixolas",
    description: "Gulas, setas salteadas y langostinos sobre el hierro caliente, con huevos y patatas. La más completa de la sección.",
    price: 16.9,
    unit: "sartén",
    allergens: ["huevos", "crustaceos", "pescado", "gluten", "soja"],
    tags: [],
    emoji: "🍳",
  },
  {
    id: "tix-raxo-arzua",
    image: "/images/tixola-raxo-croquetas.jpg",
    name: "Tixola de raxo y Arzúa",
    category: "tixolas",
    description: "Raxo de cerdo adobado al estilo gallego con queso Arzúa-Ulloa fundido por encima, sobre huevos y patatas. Es la que sale en todas las fotos del local.",
    price: 12.9,
    unit: "sartén",
    allergens: ["huevos", "lacteos"],
    tags: ["estrella"],
    emoji: "🍳",
  },
  {
    id: "tix-pisto-verduras",
    name: "Tixola de pisto de verduras",
    category: "tixolas",
    description: "Pisto de verduras cocinado despacio, con huevos y patatas fritas. La opción sin carne de la sección, y no es un premio de consolación.",
    price: 11.5,
    unit: "sartén",
    allergens: ["huevos"],
    tags: ["vegetariano"],
    emoji: "🍳",
  },

  // ─── ENSALADAS ──────────────────────────────────────────────────
  {
    id: "ens-gulas-setas-langostinos",
    name: "Ensalada de gulas, setas y langostinos",
    category: "ensaladas",
    description: "Base de brotes con gulas, setas salteadas y langostinos. Tibia por arriba y fresca por abajo: se come como plato único.",
    price: 16.9,
    unit: "ración",
    allergens: ["crustaceos", "pescado", "gluten", "soja"],
    tags: [],
    emoji: "🥗",
  },
  {
    id: "ens-pollo-crujiente",
    name: "Ensalada de pollo crujiente, nueces y manzana",
    category: "ensaladas",
    description: "Tiras de pollo rebozado recién frito, nueces y manzana. La que piden los que no vienen a comer ensalada.",
    price: 14.3,
    unit: "ración",
    allergens: ["gluten", "frutos-cascara", "huevos"],
    tags: [],
    emoji: "🥗",
  },
  {
    id: "ens-ventresca",
    name: "Ensalada de ventresca",
    category: "ensaladas",
    description: "Ventresca de atún sobre verduras frescas. Poca cosa más: cuando la ventresca es buena, el resto sobra.",
    price: 13.9,
    unit: "ración",
    allergens: ["pescado"],
    tags: [],
    emoji: "🥗",
  },
  {
    id: "ens-cecina-helado-oveja",
    name: "Ensalada de cecina con helado de queso de oveja",
    category: "ensaladas",
    description: "Láminas de cecina y una quenelle de helado de queso de oveja que se va deshaciendo encima. La más vistosa de la carta.",
    price: 17.8,
    unit: "ración",
    allergens: ["lacteos"],
    tags: [],
    emoji: "🥗",
  },
  {
    id: "ens-aguacate-bacalao",
    name: "Ensalada de aguacate y bacalao ahumado",
    category: "ensaladas",
    description: "Aguacate y bacalao ahumado, suave y mantecoso. La más ligera de las cinco.",
    price: 16.9,
    unit: "ración",
    allergens: ["pescado"],
    tags: [],
    emoji: "🥑",
  },

  // ─── A NOSA COCIÑA ──────────────────────────────────────────────
  {
    id: "coc-patatas",
    name: "Patatas bravas, alioli o mixtas",
    category: "cocina",
    description: "Patatas fritas con salsa brava, con alioli o con las dos. Tú eliges; las mixtas son lo que pide casi todo el mundo.",
    price: 8.5,
    unit: "ración",
    allergens: ["huevos"],
    tags: ["vegetariano"],
    emoji: "🥔",
  },
  {
    id: "coc-croquetas-jamon",
    name: "Croquetas de jamón",
    category: "cocina",
    description: "Bechamel que reposa hasta cuajar, jamón bien picado y fritura de última hora. Crujientes fuera, casi líquidas dentro.",
    price: 10.5,
    unit: "ración",
    variants: [
      { label: "Media ración", price: 5.3 },
      { label: "Ración", price: 10.5 },
    ],
    allergens: ["gluten", "lacteos", "huevos"],
    tags: [],
    emoji: "🥟",
  },
  {
    id: "coc-croquetas-grelos-chipiron",
    image: "/images/tixola-raxo-croquetas.jpg",
    name: "Croquetas de grelos y chipirón",
    category: "cocina",
    description: "Grelos y chipirón dentro de la bechamel: verde y mar en la misma croqueta. Las más gallegas y las que más se repiten en las reseñas.",
    price: 11.5,
    unit: "ración",
    variants: [
      { label: "Media ración", price: 5.8 },
      { label: "Ración", price: 11.5 },
    ],
    allergens: ["gluten", "lacteos", "huevos", "moluscos"],
    tags: ["estrella"],
    emoji: "🥟",
  },
  {
    id: "coc-croquetas-cecina-cabra",
    name: "Croquetas de cecina y queso de cabra",
    category: "cocina",
    description: "Cecina y queso de cabra fundidos en la bechamel. Las más intensas de las tres; con una ración hay de sobra para dos.",
    price: 12.5,
    unit: "ración",
    variants: [
      { label: "Media ración", price: 6.3 },
      { label: "Ración", price: 12.5 },
    ],
    allergens: ["gluten", "lacteos", "huevos"],
    tags: [],
    emoji: "🥟",
  },
  {
    id: "coc-mejillones-tigre",
    name: "Mejillones tigre",
    category: "cocina",
    description: "Mejillón picado y ligado con bechamel, devuelto a su concha y rebozado. El bocado de bar de toda la vida, hecho como hay que hacerlo.",
    price: 10.5,
    unit: "ración",
    allergens: ["moluscos", "gluten", "lacteos", "huevos"],
    tags: [],
    emoji: "🐚",
  },
  {
    id: "coc-calamares",
    name: "Calamares fritos",
    category: "cocina",
    description: "Anillas de calamar enharinadas y fritas al momento. Con limón al lado y sin más ceremonia.",
    price: 12.9,
    unit: "ración",
    allergens: ["moluscos", "gluten"],
    tags: [],
    emoji: "🦑",
  },
  {
    id: "coc-bacalao-tempura",
    name: "Tacos de bacalao en tempura con pimientos",
    category: "cocina",
    description: "Tacos de bacalao en tempura fina, con pimientos al lado. Cruje al morder y por dentro sigue jugoso.",
    price: 15.6,
    unit: "ración",
    allergens: ["pescado", "gluten"],
    tags: ["estrella"],
    emoji: "🐟",
  },
  {
    id: "coc-salteado-verdura-arroz",
    name: "Salteado de verdura, arroz y setas",
    category: "cocina",
    description: "Verduras y setas salteadas a fuego fuerte con arroz. Un plato completo para quien no quiere fritura.",
    price: 11.5,
    unit: "ración",
    allergens: ["soja", "gluten"],
    tags: ["vegetariano"],
    emoji: "🍄",
  },
  {
    id: "coc-croquetas-sin-gluten",
    name: "Croquetas sin gluten",
    category: "cocina",
    description: "La misma croqueta, elaborada sin gluten. Está en la carta porque nos lo piden a diario; avisa al pedir para que en cocina lo tengan presente.",
    price: 12.9,
    unit: "ración",
    allergens: ["lacteos", "huevos"],
    tags: ["sin-gluten"],
    emoji: "🥟",
  },
  {
    id: "coc-tortilla-champinones",
    name: "Tortilla guisada con champiñones",
    category: "cocina",
    description: "Tortilla jugosa terminada en un guiso corto con champiñones. Se come con pan y no sobra nada.",
    price: 11.9,
    unit: "ración",
    allergens: ["huevos"],
    tags: ["vegetariano"],
    emoji: "🥚",
  },
  {
    id: "coc-fingers-pollo",
    name: "Fingers de pollo",
    category: "cocina",
    description: "Tiras de pollo empanadas y fritas. El plato al que se agarran los niños y del que acaban picando los mayores.",
    price: 7.9,
    unit: "ración",
    allergens: ["gluten", "huevos", "lacteos"],
    tags: [],
    emoji: "🍗",
  },
  {
    id: "coc-pastel-cabracho",
    name: "Pastel de cabracho",
    category: "cocina",
    description: "El clásico del norte: cabracho, huevo y nata al horno, servido frío con pan tostado. Suave y con mucho sabor a mar.",
    price: 10,
    unit: "ración",
    allergens: ["pescado", "huevos", "lacteos", "gluten"],
    tags: [],
    emoji: "🐟",
  },

  // ─── ESPECIALES ─────────────────────────────────────────────────
  {
    id: "esp-timbal-vegetal",
    name: "Timbal vegetal",
    category: "especiales",
    description: "Verduras montadas en capas, hechas al momento. La entrada más ligera de la carta.",
    price: 9.5,
    unit: "ración",
    allergens: ["lacteos"],
    tags: ["vegetariano"],
    emoji: "🥗",
  },
  {
    id: "esp-brocheta-xxl",
    name: "Brocheta XXL",
    category: "especiales",
    description: "Brocheta grande a la plancha, como indica el nombre. Para compartir o para quien viene con hambre de verdad.",
    price: 13.9,
    unit: "unidad",
    allergens: [],
    tags: [],
    emoji: "🥩",
  },
  {
    id: "esp-ajada-bacalao",
    name: "Ajada de bacalao",
    category: "especiales",
    description: "Bacalao con ajada gallega: aceite, ajo y pimentón por encima. Receta de siempre y de las que se rebañan.",
    price: 8.8,
    unit: "ración",
    variants: [
      { label: "Media ración", price: 4.5 },
      { label: "Ración", price: 8.8 },
    ],
    allergens: ["pescado"],
    tags: [],
    emoji: "🐟",
  },
  {
    id: "esp-zamburinas-plancha",
    image: "/images/zamburinas-plancha.jpg",
    name: "Zamburiñas a la plancha",
    category: "especiales",
    description: "Zamburiñas de la ría marcadas a la plancha, en su concha. Poco fuego y nada que las tape: el plato por el que nos conocen.",
    price: 18,
    unit: "ración",
    allergens: ["moluscos"],
    tags: ["estrella"],
    emoji: "🐚",
  },
  {
    id: "esp-zamburinas-rellenas",
    name: "Zamburiñas rellenas",
    category: "especiales",
    description: "Las mismas zamburiñas, rellenas de un sofrito y gratinadas al horno. La versión golosa de la anterior.",
    price: 19,
    unit: "ración",
    allergens: ["moluscos", "gluten", "lacteos"],
    tags: [],
    emoji: "🐚",
  },
  {
    id: "esp-queso-frito",
    name: "Queso frito",
    category: "especiales",
    description: "Tacos de queso rebozados y fritos, tibios y fundentes por dentro. Dura poco en la mesa.",
    price: 6.9,
    unit: "ración",
    allergens: ["lacteos", "gluten", "huevos"],
    tags: ["vegetariano"],
    emoji: "🧀",
  },
  {
    id: "esp-oreja-plancha",
    name: "Oreja a la plancha",
    category: "especiales",
    description: "Oreja cocida y después marcada en la plancha hasta que cruje por fuera. Tapeo ourensano sin rodeos.",
    price: 8.2,
    unit: "ración",
    allergens: [],
    tags: [],
    emoji: "🥓",
  },

  // ─── PULPO ──────────────────────────────────────────────────────
  {
    id: "pul-gallega-plancha",
    name: "Pulpo a la gallega o a la plancha",
    category: "pulpo",
    description: "Como lo prefieras: á feira, con cachelos, pimentón y aceite, o marcado a la plancha. El mismo pulpo, dos escuelas.",
    price: 18.5,
    unit: "ración",
    allergens: ["moluscos"],
    tags: [],
    emoji: "🐙",
  },
  {
    id: "pul-plancha-grelos",
    name: "Pulpo a la plancha con grelos",
    category: "pulpo",
    description: "Pulpo marcado a la plancha sobre una cama de grelos salteados. El amargo del grelo con el dulce del pulpo.",
    price: 19.5,
    unit: "ración",
    allergens: ["moluscos"],
    tags: ["estrella"],
    emoji: "🐙",
  },
  {
    id: "pul-salteado-salmon-langostinos",
    name: "Salteado de pulpo, salmón y langostinos",
    category: "pulpo",
    description: "Pulpo, salmón y langostinos salteados juntos en la sartén. El plato más caro de la carta y el que más mar tiene.",
    price: 20.5,
    unit: "ración",
    allergens: ["moluscos", "pescado", "crustaceos"],
    tags: [],
    emoji: "🐙",
  },
  {
    id: "pul-tempura",
    name: "Pulpo en tempura",
    category: "pulpo",
    description: "Trozos de pulpo en tempura ligera, fritos al momento. Cruje por fuera y sigue tierno dentro.",
    price: 18,
    unit: "ración",
    allergens: ["moluscos", "gluten", "huevos"],
    tags: [],
    emoji: "🐙",
  },

  // ─── EMBUTIDOS Y QUESOS ─────────────────────────────────────────
  {
    id: "emb-jamon-serrano",
    name: "Jamón serrano",
    category: "embutidos",
    description: "Cortado a cuchillo y servido a temperatura, para que suelte la grasa. Con pan al lado y poco más.",
    price: 12.9,
    unit: "ración",
    allergens: [],
    tags: [],
    emoji: "🥩",
  },
  {
    id: "emb-queso-pais",
    name: "Queso del país",
    category: "embutidos",
    description: "Queso gallego de la zona, tierno y suave. El que mejor acompaña a una copa sin taparla.",
    price: 9.5,
    unit: "ración",
    allergens: ["lacteos"],
    tags: ["vegetariano"],
    emoji: "🧀",
  },
  {
    id: "emb-queso-oveja",
    name: "Queso de oveja",
    category: "embutidos",
    description: "Curado de oveja, con más carácter que el del país. Para quien quiere que el queso se note.",
    price: 9.8,
    unit: "ración",
    allergens: ["lacteos"],
    tags: ["vegetariano"],
    emoji: "🧀",
  },
  {
    id: "emb-queso-cabra",
    name: "Queso de cabra",
    category: "embutidos",
    description: "Rulo de cabra en rodajas, ácido y cremoso. El contrapunto de la tabla.",
    price: 9.9,
    unit: "ración",
    allergens: ["lacteos"],
    tags: ["vegetariano"],
    emoji: "🧀",
  },

  // ─── REVUELTOS ──────────────────────────────────────────────────
  {
    id: "rev-algas-langostinos",
    name: "Revuelto de algas y langostinos",
    category: "revueltos",
    description: "Huevo cuajado al punto con algas y langostinos. Sabe a mar sin ser pescado.",
    price: 12.8,
    unit: "ración",
    allergens: ["huevos", "crustaceos"],
    tags: [],
    emoji: "🥚",
  },
  {
    id: "rev-bacalao-grelos-langostinos",
    name: "Revuelto de bacalao, grelos y langostinos",
    category: "revueltos",
    description: "Bacalao desmigado, grelos y langostinos ligados con huevo. El más completo de los tres.",
    price: 13.9,
    unit: "ración",
    allergens: ["huevos", "pescado", "crustaceos"],
    tags: [],
    emoji: "🥚",
  },
  {
    id: "rev-setas-oreja",
    name: "Revuelto de setas y oreja",
    category: "revueltos",
    description: "Setas y oreja crujiente sobre huevo cuajado. Tierra pura, y el que más llena.",
    price: 12.5,
    unit: "ración",
    allergens: ["huevos"],
    tags: [],
    emoji: "🥚",
  },

  // ─── VARIOS ─────────────────────────────────────────────────────
  {
    id: "var-postre",
    name: "Postre del día",
    category: "varios",
    description: "Cambia según el día y lo que haya salido esa mañana. Pregunta al personal: siempre hay casero.",
    price: 5,
    unit: "ración",
    allergens: ["gluten", "lacteos", "huevos"],
    tags: [],
    emoji: "🍮",
  },
  {
    id: "var-postre-sin-gluten",
    name: "Postre sin gluten",
    category: "varios",
    description: "La alternativa dulce elaborada sin gluten, para que nadie se quede sin final. Pregunta cuál hay hoy.",
    price: 6,
    unit: "ración",
    allergens: ["lacteos", "huevos"],
    tags: ["sin-gluten"],
    emoji: "🍰",
  },
  {
    id: "var-pan",
    name: "Ración de pan",
    category: "varios",
    description: "Pan del día en su cesta, para rebañar lo que quede en la sartén.",
    price: 1.6,
    unit: "cesta",
    allergens: ["gluten"],
    tags: ["vegetariano"],
    emoji: "🥖",
  },
  {
    id: "var-pan-tomate",
    name: "Ración de pan con tomate",
    category: "varios",
    description: "Pan tostado y frotado con tomate y aceite. Entra solo mientras llega el resto.",
    price: 3.5,
    unit: "ración",
    allergens: ["gluten"],
    tags: ["vegetariano"],
    emoji: "🍅",
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
