import type { MenuItemId } from "./menu";

/**
 * Fotos reales del local y de los platos (public/images).
 * Añade nuevas fotos aquí y aparecerán en la galería y en los carruseles.
 *
 * `dishIds` enlaza la foto con platos estrella (`dishes.ts`) y/o platos de la carta (`menu.ts`).
 * La parte de la carta va tipada: un id que deje de existir da error de compilación en vez de
 * dejar la foto sin salir, en silencio, hasta que alguien se dé cuenta meses después.
 */
export type PhotoTag = "plato" | "terraza" | "local" | "catedral" | "vinos";

export interface Photo {
  id: string;
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  tags: PhotoTag[];
  dishIds?: (MenuItemId | string)[];
  /** foco para object-position (ej. "50% 40%") */
  focus?: string;
}

export const PHOTOS: Photo[] = [
  {
    id: "terraza-catedral",
    src: "/images/terraza-catedral.jpg",
    width: 1000,
    height: 1000,
    alt: "Terraza de Tixola Tapería en Rúa Juan de Austria con una tixola de raxo, croquetas y dos copas de vino blanco, y la iglesia de Santa Eufemia de Ourense al fondo",
    caption: "La terraza, con Santa Eufemia al fondo",
    tags: ["terraza", "catedral", "plato", "vinos"],
    dishIds: ["tix-raxo-arzua", "coc-croquetas-grelos-chipiron"] satisfies MenuItemId[],
    focus: "50% 45%",
  },
  {
    id: "zamburinas-plancha",
    src: "/images/zamburinas-plancha.jpg",
    width: 1000,
    height: 1335,
    alt: "Zamburiñas gallegas a la plancha en su concha con aceite de oliva, ajo y perejil, plato estrella de Tixola Tapería en Ourense",
    caption: "Zamburiñas a la plancha",
    tags: ["plato"],
    dishIds: ["zamburinas", "esp-zamburinas-plancha" satisfies MenuItemId],
    focus: "50% 50%",
  },
  {
    id: "tixola-raxo-croquetas",
    src: "/images/tixola-raxo-croquetas.jpg",
    width: 1000,
    height: 1000,
    alt: "Tixola de raxo con queso de Arzúa en sartén de hierro, croquetas caseras y vino blanco gallego en la terraza de Tixola Tapería, Ourense",
    caption: "Tixola de raxo con queso de Arzúa y croquetas",
    tags: ["plato", "terraza"],
    /* Las croquetas de ESTA foto son las de grelos y chipirón. Las de jamón estuvieron aquí un rato
       y se quitaron: la ficha las abría con una foto en la que el plato del centro es una tixola de
       raxo, así que quien pinchaba "Croquetas de jamón" veía patatas con carne y queso. Sin foto
       sale el icono, que no promete nada. Cuando Brian traiga la suya, se añade con su propia entrada. */
    dishIds: ["raxo", "croquetas", "tix-raxo-arzua" satisfies MenuItemId, "coc-croquetas-grelos-chipiron" satisfies MenuItemId],
    focus: "50% 50%",
  },
  {
    id: "fachada",
    src: "/images/fachada.jpg",
    width: 806,
    height: 490,
    alt: "Fachada de Tixola Tapería en Rúa Juan de Austria 7, casco histórico de Ourense, con sus toldos rojos y la pizarra del día",
    caption: "Rúa Juan de Austria, 7",
    tags: ["local"],
    focus: "50% 40%",
  },
];

export const photoById = (id: string) => PHOTOS.find((p) => p.id === id);
export const photosForDish = (dishId: string) => PHOTOS.filter((p) => p.dishIds?.includes(dishId));
export const photosByTag = (tag: PhotoTag) => PHOTOS.filter((p) => p.tags.includes(tag));
