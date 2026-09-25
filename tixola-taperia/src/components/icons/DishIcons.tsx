/**
 * Iconos de línea propios para platos y bebidas (sin emojis).
 * 24×24, trazo currentColor, extremos redondeados. Se usan en tarjetas de platos, carta y chat.
 */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement> & { size?: number };

const base = (size: number | undefined, props: P) => ({
  width: size ?? 24,
  height: size ?? 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
  ...props,
});

/** Zamburiña / vieira: concha estriada */
export function IconScallop({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M12 20 3.5 10.5a9 9 0 0 1 17 0Z" />
      <path d="M12 20V6.5M12 20 7 8M12 20l5-12M12 20 4.8 11.5M12 20l7.2-8.5" />
      <path d="M9.5 20h5" />
    </svg>
  );
}

/** Pulpo */
export function IconOctopus({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M8 9.5a4 4 0 1 1 8 0c0 1.8-.8 2.8-1.6 3.5" />
      <path d="M9.6 13c-.8-.7-1.6-1.7-1.6-3.5" />
      <path d="M9.6 13c-1 1.4-3.2 1.6-4.6.6M9.6 13c-.4 2.2-2.4 3.4-3.6 5.2M12 13.2c-.2 2.4.6 4.2 1 6.2M12 13.2c.2 2.4-1 4.4-2.2 6.2M14.4 13c1 1.4 3.2 1.6 4.6.6M14.4 13c.4 2.2 2.4 3.4 3.6 5.2" />
      <circle cx="10.5" cy="9" r=".5" fill="currentColor" />
      <circle cx="13.5" cy="9" r=".5" fill="currentColor" />
    </svg>
  );
}

/** Pescado (bacalao, choubas, ventresca) */
export function IconFish({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M3 12c2.5-4 6-6 10-6 3 0 5.5 2 7.5 6-2 4-4.5 6-7.5 6-4 0-7.5-2-10-6Z" />
      <path d="M20.5 12 23 9v6z" />
      <circle cx="8" cy="11" r=".7" fill="currentColor" />
      <path d="M12 8.5c1.2 1.6 1.2 5.4 0 7" />
    </svg>
  );
}

/** Calamar */
export function IconSquid({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M12 3l3 5v5a3 3 0 0 1-6 0V8Z" />
      <path d="M9.5 13c-1 2.2-2.5 3.5-3.5 6M14.5 13c1 2.2 2.5 3.5 3.5 6M11 14.5c-.3 2 .2 3.8.3 5.5M13 14.5c.3 2-.2 3.8-.3 5.5" />
      <circle cx="11" cy="9.5" r=".5" fill="currentColor" />
      <circle cx="13" cy="9.5" r=".5" fill="currentColor" />
    </svg>
  );
}

/** Gamba / langostino */
export function IconShrimp({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M6 8a6 6 0 0 1 12 0v1a6 6 0 0 1-6 6h-1" />
      <path d="M11 15c-2 1.2-3.5 2.6-4.5 5M11 15c-.6 1.6-.4 3.4.2 5M14 14.8c1 1.6 1.4 3.2 1.5 5.2" />
      <path d="M6 8H4M6 10H3.5" />
      <circle cx="16" cy="7" r=".6" fill="currentColor" />
    </svg>
  );
}

/** Oreja / cerdo */
export function IconPigEar({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M7 19c-2.5-2.5-3-7 0-10 2-2 5-2 7 0 1.6 1.6 1.6 3.6.6 5.2" />
      <path d="M7 19c2 .8 4.5.4 6-1.5 1.2-1.5 1.3-3.3.6-4.3" />
      <path d="M12 6c1.5-2 4-2.5 6-1.5" />
      <path d="M10 12c.5 1.5 1.8 2.3 3 2.5" />
    </svg>
  );
}

/** Croqueta (ovalada, con textura) */
export function IconCroquette({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <rect x="3" y="8.5" width="18" height="7" rx="3.5" />
      <path d="M7 11.5h.01M10.5 13h.01M13.5 10.8h.01M17 12.6h.01M9 10h.01M15 14h.01" strokeWidth="2.2" />
    </svg>
  );
}

/** Tixola (sartén de hierro) */
export function IconTixola({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M3 12h11a5.5 5.5 0 0 1-11 0Z" />
      <path d="M14 11.5 21 9" />
      <path d="M6 10c.3-1 .8-1.4 1.6-1.5M9.5 9.2c.6 0 1.1.3 1.4.9" />
    </svg>
  );
}

/** Copa de vino */
export function IconWine({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M7 3h10l-.6 6.5a4.4 4.4 0 0 1-8.8 0Z" />
      <path d="M12 14v6M8.5 20h7" />
      <path d="M7.4 7h9.2" />
    </svg>
  );
}

/** Cerveza (jarra) */
export function IconBeer({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M6 8h10v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" />
      <path d="M16 10h2a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2h-2" />
      <path d="M6 8c-.5-2 .5-4 3-4 1 0 1.5.5 2 1 .5-.7 1.3-1 2-1 2 0 3.3 1.5 3 4" />
      <path d="M9 11v7M12.5 11v7" />
    </svg>
  );
}

/** Ensalada / hoja */
export function IconSalad({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M4 13h16a8 8 0 0 1-16 0Z" />
      <path d="M8 13c0-3 2-5 4-6 2 1 4 3 4 6" />
      <path d="M12 7v6" />
      <path d="M6 10c.6-1.5 1.8-2.3 3-2.5M18 10c-.6-1.5-1.8-2.3-3-2.5" />
    </svg>
  );
}

/** Postre (tarta) */
export function IconCake({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M4 12h16v7H4Z" />
      <path d="M4 15c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1" />
      <path d="M8 12V9M12 12V8M16 12V9" />
      <path d="M12 5.5c.6.6.6 1.4 0 2-.6-.6-.6-1.4 0-2Z" />
    </svg>
  );
}

/** Flan / coulant */
export function IconFlan({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M7 9h10l1.5 8H5.5Z" />
      <path d="M7.5 9c0-2 2-3.5 4.5-3.5S16.5 7 16.5 9" />
      <path d="M9 12c1 .8 2 1 3 .6s2-.4 3 .2" />
      <path d="M4 20h16" />
    </svg>
  );
}

/** Chocolate */
export function IconChocolate({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M9.3 5v14M14.6 5v14M4 9.7h16M4 14.3h16" />
    </svg>
  );
}

/** Piña */
export function IconPineapple({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <ellipse cx="12" cy="14.5" rx="5" ry="6.5" />
      <path d="M12 8c-1-2 0-4 1.5-5M12 8c1-2 3-2.5 4.5-2M12 8c-1.5-1-3.5-1-5 0" />
      <path d="M8.5 11.5l7 7M15.5 11.5l-7 7M12 8.5v12M7.3 14.5h9.4" opacity=".7" />
    </svg>
  );
}

/** Queso */
export function IconCheese({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M3 10 20 6v4H3Z" />
      <path d="M3 10v7h17v-7" />
      <circle cx="8" cy="13.5" r="1" />
      <circle cx="14.5" cy="14.5" r="1.3" />
      <circle cx="17" cy="11.8" r=".7" />
    </svg>
  );
}

/** Pan / hogaza */
export function IconBread({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M4 12a8 4.5 0 0 1 16 0v5H4Z" />
      <path d="M8 9.5c.5 1 1.2 1.5 2 1.5M12 8.5c.5 1 1.2 1.5 2 1.5M16 9.5c.4.8 1 1.2 1.6 1.4" />
    </svg>
  );
}

/** Pimiento / guindilla */
export function IconPepper({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M8 6c-3 1-5 4-4 8s4 6 8 5c5-1.5 8-6 9-11-3 2-6 1-9 0-1.5-.5-2.7-1.2-4-2Z" />
      <path d="M8 6c.5-1.5 2-2.5 3.5-2.5" />
    </svg>
  );
}

/** Tomate */
export function IconTomato({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <circle cx="12" cy="13.5" r="7" />
      <path d="M12 6.5c-1.5-1.5-3.5-1.8-5-1 1.5.5 2.5 1.5 3 2.5M12 6.5c1.5-1.5 3.5-1.8 5-1-1.5.5-2.5 1.5-3 2.5M12 6.5V4" />
    </svg>
  );
}

/** Aguacate */
export function IconAvocado({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M12 3c2.5 0 4 2.5 4.5 5.5C17.2 12 19 13.5 19 16a7 7 0 0 1-14 0c0-2.5 1.8-4 2.5-7.5C8 5.5 9.5 3 12 3Z" />
      <circle cx="12" cy="15" r="2.5" />
    </svg>
  );
}

/** Patata */
export function IconPotato({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M6 9c1.5-3 5-4.5 8.5-3.5s5 4 4.5 7.5-3.5 6-7 6-7-2-7.5-5C4.2 12 5 10.5 6 9Z" />
      <path d="M9 10h.01M13 9h.01M15.5 13h.01M10 15h.01" strokeWidth="2.2" />
    </svg>
  );
}

/** Seta */
export function IconMushroom({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M3 11a9 6 0 0 1 18 0Z" />
      <path d="M9 11v6a3 3 0 0 0 6 0v-6" />
      <path d="M8 8h.01M12 6.5h.01M16 8h.01" strokeWidth="2.2" />
    </svg>
  );
}

/** Pollo (muslo) */
export function IconChicken({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M14.5 4.5a5 5 0 0 1 3.5 8.5l-2 2-6-6 2-2a5 5 0 0 1 2.5-2.5Z" />
      <path d="M10 9 4.5 14.5a2 2 0 0 0 2.8 2.8L13 11" />
      <path d="M5.5 17.5 4 19" />
    </svg>
  );
}

/** Carne (filete) */
export function IconMeat({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M4 12c0-4 3-7 8-7 3.5 0 6 1.5 7.5 4 .6 1 .5 2.5-.5 3.5-2 2-1 4-3.5 5.5-2 1.2-5 .5-7.5-1.5C5.5 15 4 14 4 12Z" />
      <path d="M8.5 13a3 3 0 1 1 5-2" />
    </svg>
  );
}

/** Huevo */
export function IconEgg({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M12 3c3.5 0 7 5.5 7 10.5A7 7 0 0 1 5 13.5C5 8.5 8.5 3 12 3Z" />
    </svg>
  );
}

/** Agua (gota) */
export function IconWaterDrop({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z" />
      <path d="M9 14.5a3 3 0 0 0 2 2.5" />
    </svg>
  );
}

/** Llama / brasa */
export function IconFlame({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M12 3c1 3 4 4.5 4 8.5a4 4 0 0 1-8 0c0-1.2.4-2.2 1-3 .3 1 1 1.6 1.8 1.8C10.2 8 10.8 5.5 12 3Z" />
      <path d="M8 17.5c1 1.8 2.5 2.8 4 2.8s3-1 4-2.8" />
    </svg>
  );
}

/** Fingers / pasta / genérico: tenedor y cuchillo */
export function IconCutlery({ size, ...p }: P) {
  return (
    <svg {...base(size, p)}>
      <path d="M7 3v18M5 3v5a2 2 0 0 0 4 0V3" />
      <path d="M16 3c-1.5 1.5-2 4-2 7 0 1.5.8 2.5 2 3v8M16 3c1.5 1.5 2 4 2 7 0 1.5-.8 2.5-2 3" />
    </svg>
  );
}

export type DishIconName =
  | "scallop"
  | "octopus"
  | "fish"
  | "squid"
  | "shrimp"
  | "pigEar"
  | "croquette"
  | "tixola"
  | "wine"
  | "beer"
  | "salad"
  | "cake"
  | "flan"
  | "chocolate"
  | "pineapple"
  | "cheese"
  | "bread"
  | "pepper"
  | "tomato"
  | "avocado"
  | "potato"
  | "mushroom"
  | "chicken"
  | "meat"
  | "egg"
  | "water"
  | "flame"
  | "cutlery";

export const DISH_ICONS: Record<DishIconName, (p: P) => React.JSX.Element> = {
  scallop: IconScallop,
  octopus: IconOctopus,
  fish: IconFish,
  squid: IconSquid,
  shrimp: IconShrimp,
  pigEar: IconPigEar,
  croquette: IconCroquette,
  tixola: IconTixola,
  wine: IconWine,
  beer: IconBeer,
  salad: IconSalad,
  cake: IconCake,
  flan: IconFlan,
  chocolate: IconChocolate,
  pineapple: IconPineapple,
  cheese: IconCheese,
  bread: IconBread,
  pepper: IconPepper,
  tomato: IconTomato,
  avocado: IconAvocado,
  potato: IconPotato,
  mushroom: IconMushroom,
  chicken: IconChicken,
  meat: IconMeat,
  egg: IconEgg,
  water: IconWaterDrop,
  flame: IconFlame,
  cutlery: IconCutlery,
};

/**
 * Mapa desde la clave `emoji` de los datos (src/data/menu.ts, dishes.ts) al icono.
 * Los datos conservan el campo `emoji` como clave semántica; la UI nunca pinta el emoji.
 */
export const DISH_ICON_BY_KEY: Record<string, DishIconName> = {
  "🐚": "scallop",
  "🐙": "octopus",
  "🐟": "fish",
  "🐠": "fish",
  "🦑": "squid",
  "🦐": "shrimp",
  "🥓": "pigEar",
  "🥟": "croquette",
  "🍳": "tixola",
  "🍷": "wine",
  "🍺": "beer",
  "🥗": "salad",
  "🍰": "cake",
  "🍮": "flan",
  "🍫": "chocolate",
  "🍍": "pineapple",
  "🧀": "cheese",
  "🥖": "bread",
  "🌶️": "pepper",
  "🌶": "pepper",
  "🍅": "tomato",
  "🥑": "avocado",
  "🥔": "potato",
  "🍄": "mushroom",
  "🍗": "chicken",
  "🥩": "meat",
  "🥚": "egg",
  "💧": "water",
  "🔥": "flame",
};

export function resolveDishIcon(key: string | undefined): DishIconName {
  if (!key) return "cutlery";
  return DISH_ICON_BY_KEY[key] ?? (key in DISH_ICONS ? (key as DishIconName) : "cutlery");
}

/** <DishIcon iconKey={item.emoji} size={28} className="text-gold" /> */
export function DishIcon({ iconKey, ...p }: P & { iconKey: string | undefined }) {
  const Cmp = DISH_ICONS[resolveDishIcon(iconKey)];
  return <Cmp {...p} />;
}
