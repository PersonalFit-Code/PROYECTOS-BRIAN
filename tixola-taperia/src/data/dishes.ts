import type { AllergenId } from "./allergens";
import { assertMenuIntegrity } from "./integrity";
import type { MenuItemId, MenuVariant } from "./menu";

/**
 * PLATOS ESTRELLA — el carrusel de la portada.
 *
 * Son TRES, no ocho. Antes eran ocho porque la carta era inventada y las fichas también; con la
 * carta real encima de la mesa, solo hay tres platos de los que exista una foto de verdad, y un
 * carrusel de "platos estrella" ilustrado con dibujos vende bastante menos que uno con comida.
 * En cuanto lleguen fotos nuevas, añadir un destacado es una entrada aquí y otra en `photos.ts`.
 *
 * `menuId` es el enlace con la carta y va tipado con `MenuItemId`: un id que deje de existir ya no
 * pasa desapercibido (antes era una cadena suelta y el enlace "Ver en la carta" simplemente no
 * hacía nada). El precio, la unidad y los alérgenos se repiten aquí y en `menu.ts` por comodidad de
 * quien edita, pero los vigila `assertMenuIntegrity()` para que no puedan discrepar.
 *
 * ⚠️ Los maridajes de esta sección son los ÚNICOS que quedan en la web: son recomendaciones de
 * vino que el local ya hacía, no una promesa de tenerlo en carta. Cuando llegue la carta de vinos,
 * conviene revisarlos contra ella.
 */
export interface StarDish {
  id: string;
  menuId: MenuItemId;
  name: string;
  kicker: string;
  headline: string;
  description: string;
  ingredients: string[];
  price: number;
  unit: string;
  /**
   * Media ración y ración, cuando el plato las tiene. Ninguno de los tres destacados las tiene, pero
   * esta misma ficha la reutiliza la carta entera (`useMenuItemSlide`) y allí hay cuatro platos que
   * sí: sin este campo, en móvil —que es por donde entra casi todo el mundo— la media ración no
   * aparecía por ninguna parte.
   */
  variants?: MenuVariant[];
  allergens: AllergenId[];
  pairing: {
    wine: string;
    do: string;
    why: string;
  };
  /** color de acento para la iluminación / glow de la tarjeta */
  accent: string;
  /** clave de icono (ver components/icons/DishIcons.tsx); la UI nunca pinta el emoji */
  emoji: string;
  /** foto real (public/images/...) — si existe, la tarjeta la usa como visual principal */
  image?: string;
  badge?: string;
}

export const STAR_DISHES: StarDish[] = [
  {
    id: "zamburinas",
    menuId: "esp-zamburinas-plancha",
    name: "Zamburiñas a la plancha",
    kicker: "Plato estrella",
    headline: "Las zamburiñas que han hecho famoso al local",
    description:
      "Zamburiñas gallegas abiertas en su concha y marcadas a la plancha con aceite de oliva virgen extra, ajo laminado y perejil fresco. Jugosas, con ese punto de brasa que solo da el hierro.",
    ingredients: ["Zamburiñas de la ría", "AOVE", "Ajo laminado", "Perejil fresco", "Sal", "Limón"],
    price: 18,
    unit: "ración",
    allergens: ["moluscos"],
    pairing: {
      wine: "Albariño",
      do: "D.O. Rías Baixas",
      why: "Su salinidad y su acidez limpian la grasa del aceite y realzan el dulzor del molusco.",
    },
    accent: "#F0A868",
    emoji: "🐚",
    image: "/images/zamburinas-plancha.jpg",
    badge: "Nº 1 en zamburiñas",
  },
  {
    id: "raxo",
    menuId: "tix-raxo-arzua",
    name: "Tixola de raxo y Arzúa",
    kicker: "La especialidad de la casa",
    headline: "La sartén que llega chisporroteando a la mesa",
    description:
      "Raxo de cerdo adobado al estilo gallego sobre huevos y patatas fritas, con queso Arzúa-Ulloa fundido por encima, servido en la propia sartén de hierro. Se oye antes de verse.",
    ingredients: ["Raxo de cerdo", "Queso Arzúa-Ulloa D.O.P.", "Huevos camperos", "Patatas", "Pimentón", "AOVE"],
    price: 12.9,
    unit: "sartén",
    allergens: ["huevos", "lacteos"],
    pairing: {
      wine: "Mencía",
      do: "D.O. Ribeira Sacra",
      why: "Un tinto ligero y fresco que aguanta el queso fundido sin tapar el adobo de la carne.",
    },
    accent: "#D8323C",
    emoji: "🍳",
    image: "/images/tixola-raxo-croquetas.jpg",
    badge: "La más pedida",
  },
  {
    id: "croquetas",
    menuId: "coc-croquetas-grelos-chipiron",
    name: "Croquetas de grelos y chipirón",
    kicker: "Bechamel que reposa",
    headline: "Verde y mar en la misma croqueta",
    description:
      "Grelos salteados y chipirón dentro de una bechamel que reposa hasta cuajar, empanadas y fritas al momento. Crujen al morder y por dentro siguen casi líquidas.",
    ingredients: ["Grelos", "Chipirón", "Bechamel de 24 h", "Pan rallado", "Huevo", "AOVE"],
    price: 11.5,
    unit: "ración",
    allergens: ["gluten", "lacteos", "huevos", "moluscos"],
    pairing: {
      wine: "Godello",
      do: "D.O. Valdeorras",
      why: "Tiene cuerpo para la bechamel y el amargor justo para acompañar al grelo.",
    },
    accent: "#8FA35C",
    emoji: "🥟",
    image: "/images/tixola-raxo-croquetas.jpg",
    badge: "Las más pedidas",
  },
];

/* Se ejecuta al cargar el módulo, es decir, durante `next build`. Si la carta y los platos estrella
   discrepan, el despliegue no sale: con datos estáticos, más vale un build roto que una carta que
   anuncia un precio que no es. */
assertMenuIntegrity();
