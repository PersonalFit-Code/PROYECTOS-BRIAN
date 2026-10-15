import type { AllergenId } from "./allergens";
import { assertMenuIntegrity } from "./integrity";
import type { MenuItemId, MenuVariant } from "./menu";

/**
 * PLATOS ESTRELLA — el carrusel de la portada.
 *
 * Son SEIS, y el número no es caprichoso: cada uno tiene que tener una FOTO DE VERDAD del plato,
 * porque un carrusel de "platos estrella" ilustrado con dibujos vende bastante menos que uno con
 * comida. Empezaron siendo ocho inventados, se quedaron en tres al llegar la carta real (los únicos
 * fotografiados entonces) y el 14-10-2026 subieron a seis: con tres, el cilindro de la portada
 * enseñaba en escritorio una sola tarjeta con media pantalla vacía a los lados, porque con tres
 * caras a 120° las vecinas quedan de canto. Con seis, a 60°, se ven tres a la vez.
 *
 * Para añadir otro: una entrada aquí, la foto enlazada en `photos.ts` y la etiqueta "estrella" en
 * su plato de `menu.ts` (lo exige `assertMenuIntegrity`). Y la foto tiene que ser DE ESE PLATO: el
 * pulpo de la portada es "a la gallega o a la plancha" y no el "a la plancha con grelos" justamente
 * por eso —la única foto de pulpo que hay es un á feira sobre cachelos, que es el primero, no el
 * segundo—.
 *
 * `menuId` es el enlace con la carta y va tipado con `MenuItemId`: un id que deje de existir ya no
 * pasa desapercibido (antes era una cadena suelta y el enlace "Ver en la carta" simplemente no
 * hacía nada). El precio, la unidad y los alérgenos se repiten aquí y en `menu.ts` por comodidad de
 * quien edita, pero los vigila `assertMenuIntegrity()` para que no puedan discrepar.
 *
 * ⚠️ Los maridajes de esta sección son los ÚNICOS que quedan en la web: son recomendaciones de
 * vino que el local ya hacía, no una promesa de tenerlo en carta. La carta de vinos ya está
 * publicada (`src/data/wines.ts`): conviene repasarlos contra ella.
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
   * Media ración y ración, cuando el plato las tiene. Ninguno de los destacados las tiene, pero
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
    image: "/images/zamburinas-plancha.webp",
    /* Decía "Nº 1 en zamburiñas". Fuera el 10-10-2026: una afirmación de superioridad hay que poder
       demostrarla (Ley de Competencia Desleal), y esta no salía de ningún sitio. Lo que sí es cierto y
       además vende igual es que son el plato por el que se conoce la casa. */
    badge: "El plato por el que nos conocen",
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
      why: "Ligero y fresco, aguanta el queso fundido sin tapar el adobo de la carne.",
    },
    accent: "#e8565a",
    emoji: "🍳",
    /* La sartén sola, de la tanda del 2 de octubre de 2026. La anterior era la de la terraza, donde
       la tixola comparte mesa con croquetas y dos copas: esa sigue en la galería, que es su sitio. */
    image: "/images/tixola-raxo.webp",
    badge: "La más pedida",
  },
  {
    id: "pulpo",
    menuId: "pul-gallega-plancha",
    name: "Pulpo a la gallega o a la plancha",
    kicker: "Dos escuelas, un pulpo",
    headline: "Á feira sobre cachelos o marcado a la plancha",
    description:
      "Pulpo cocido al punto y servido como se pida: á feira, en el plato de madera de siempre, con cachelos, pimentón y un hilo de aceite; o marcado a la plancha. El mismo pulpo, dos maneras de entenderlo.",
    ingredients: ["Pulpo", "Cachelos", "Pimentón", "AOVE", "Sal gruesa"],
    price: 18.5,
    unit: "ración",
    allergens: ["moluscos"],
    pairing: {
      wine: "Treixadura",
      do: "D.O. Ribeiro",
      why: "El blanco de taberna de toda la vida: fresco y sin madera, aguanta el pimentón sin pelearse con él.",
    },
    accent: "#C0533A",
    emoji: "🐙",
    /* La foto es un pulpo á FEIRA, que es exactamente este plato. Al "Pulpo a la plancha con
       grelos" —otro plato de la carta— esa misma foto le vale de ilustración en la carta pero no
       para la portada, donde la tarjeta es grande y el plato se mira entero. */
    image: "/images/pulpo-feira.webp",
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
    /* Mismo cambio que en `menu.ts`: una tabla de croquetas en vez de la foto de la terraza, donde
       el plato del centro era una tixola de raxo. Qué croqueta es exactamente, lo confirma Tatiana
       (docs/fotos-para-revisar.md). */
    image: "/images/croquetas-tabla.webp",
    badge: "Las más pedidas",
  },
  {
    id: "tixola-gulas",
    menuId: "tix-gulas-setas-langostinos",
    name: "Tixola con gulas, setas y langostinos",
    kicker: "De la sartén a la mesa",
    headline: "La tixola más completa de la casa",
    description:
      "Gulas, setas salteadas y langostinos sobre huevos y patatas, hechos en la misma sartén de hierro en la que llegan a la mesa. La más completa de las tixolas.",
    ingredients: ["Gulas", "Setas salteadas", "Langostinos", "Huevos", "Patatas", "AOVE"],
    price: 16.9,
    unit: "sartén",
    allergens: ["huevos", "crustaceos", "pescado", "gluten", "soja"],
    pairing: {
      wine: "Godello",
      do: "D.O. Monterrei",
      why: "Tiene grasa de huevo y dulzor de langostino: pide un blanco con cuerpo y acidez, no uno ligero.",
    },
    accent: "#D9A441",
    emoji: "🍳",
    image: "/images/tixola-gulas-langostinos.webp",
  },
  {
    id: "cecina",
    menuId: "ens-cecina-helado-oveja",
    name: "Ensalada de cecina con helado de queso de oveja",
    kicker: "Curado y frío",
    headline: "El helado se deshace encima de la cecina",
    description:
      "Láminas de cecina repartidas en corona sobre lechuga y endivia, con gajos de tomate, manzana y nueces, y una quenelle de helado de queso de oveja en el centro que se va deshaciendo por encima. La más vistosa de la carta.",
    ingredients: ["Cecina", "Helado de queso de oveja", "Lechuga y endivia", "Tomate", "Manzana", "Nueces"],
    price: 17.8,
    unit: "ración",
    /* Los mismos que en `menu.ts`, incluidos los frutos de cáscara por las nueces que se ven en la
       foto: si allí cambian al revisarlos Tatiana, `assertMenuIntegrity` rompe el build hasta que
       cambien también aquí. Es justo lo que se quiere. */
    allergens: ["lacteos", "frutos-cascara"],
    pairing: {
      wine: "Mencía",
      do: "D.O. Ribeira Sacra",
      why: "Un tinto ligero de los que se sirven algo fríos: acompaña la cecina sin tapar el helado de queso.",
    },
    accent: "#B07A5A",
    emoji: "🥗",
    image: "/images/ensalada-cecina.webp",
  },
];

/* Se ejecuta al cargar el módulo, es decir, durante `next build`. Si la carta y los platos estrella
   discrepan, el despliegue no sale: con datos estáticos, más vale un build roto que una carta que
   anuncia un precio que no es. */
assertMenuIntegrity();
