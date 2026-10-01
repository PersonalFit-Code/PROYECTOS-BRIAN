import type { MenuItemId } from "./menu";

/**
 * LA VINOTECA — modelo de datos de la carta de vinos.
 *
 * HOY ESTÁ VACÍA A PROPÓSITO (`WINES = []`). La dueña no ha mandado la lista definitiva porque va a
 * dejar de comprar parte de los vinos que están hoy en la carta de papel, así que transcribir ese
 * papel sería publicar botellas que mañana no se pueden servir. Es el mismo error que esta web ya
 * corrigió una vez —platos inventados en las preguntas frecuentes— y no se repite: la estructura se
 * deja montada y probada, y el día que llegue la lista solo hay que rellenar `WINES`.
 *
 * POR QUÉ UN FICHERO APARTE Y NO UNA CATEGORÍA MÁS DE `menu.ts`. Un vino y una ración no comparten
 * casi ningún campo: el vino tiene bodega, denominación, uvas, añada y crianza, y no tiene alérgenos
 * declarables plato a plato ni media ración. Metidos en el mismo tipo, cada vino llevaría media
 * docena de campos vacíos y cada plato otra media docena, y los filtros de la carta (alérgenos,
 * dietas) no significarían nada sobre una botella.
 *
 * DÓNDE VIVE LA RELACIÓN PLATO ↔ VINO, que es lo que pidió el cliente ("qué vino puede ofrecer en
 * ese momento"): en el VINO, en `pairsWith`, y en ningún sitio más. Un único origen evita que la
 * ficha del raxo diga una cosa y la del godello la contraria. La ficha del plato obtiene sus vinos
 * invirtiendo este mapa, no guardando una copia. Y como `pairsWith` se tipa con `MenuItemId`,
 * retirar un plato de la carta rompe la compilación en vez de dejar un enlace muerto en producción.
 */

/** Tipos de vino que puede llevar la carta. El orden es el de presentación en la página. */
export const WINE_KINDS = ["blanco", "tinto", "rosado", "espumoso", "dulce"] as const;
export type WineKind = (typeof WINE_KINDS)[number];

/* ──────────────────────────────────────────────────────────────
   Las cinco denominaciones de origen de Galicia
   ────────────────────────────────────────────────────────────── */

/** De oeste a este, que es como se recorren en el mapa. */
export const GALICIAN_DO_IDS = ["rias-baixas", "ribeiro", "ribeira-sacra", "valdeorras", "monterrei"] as const;
export type GalicianDoId = (typeof GALICIAN_DO_IDS)[number];

/**
 * Datos de una denominación. Aquí van solo HECHOS —nombre oficial, provincia, uvas, año— y la
 * posición en el mapa. La frase de carácter de cada zona vive en los mensajes
 * (`m.vinos.regionCharacter`), porque es prosa y hay que traducirla a los cuatro idiomas.
 *
 * Los nombres de uva (Albariño, Godello, Mencía…) NO se traducen: son nombres propios de variedad y
 * se escriben igual en la etiqueta de la botella en cualquier idioma.
 */
export interface WineRegion {
  id: GalicianDoId;
  /**
   * El NOMBRE PROTEGIDO, sin el "D.O." delante: eso es lo que dice el pliego de cada una. El prefijo
   * lo pone la interfaz donde cabe (en las fichas sí, en el mapa no, para que las chapas no choquen
   * entre ellas), y así no hay que repetirlo cinco veces en los datos.
   */
  label: string;
  /** Provincia o provincias que abarca. Lista, no frase: así no hay conjunción que traducir. */
  provinces: readonly string[];
  /** `true` si la zona está, total o parcialmente, en la provincia de Ourense (donde está Tixola). */
  inOurense: boolean;
  /**
   * Si la denominación es mayoritariamente de blanco o de tinto. Está publicado por los cinco
   * consejos (en tres de ellos con cifras; en Ribeiro solo cualitativamente, y por eso aquí no hay
   * porcentajes: no se publica ninguno que se pueda citar).
   */
  mostly: WineKind & ("blanco" | "tinto");
  /** Variedades blancas preferentes, la dominante primero. */
  whites: readonly string[];
  /** Variedades tintas preferentes, la dominante primero. */
  reds: readonly string[];
  /**
   * Año de reconocimiento de la denominación, SOLO si su consejo lo publica como tal. Rías
   * Baixas se queda sin año a propósito: lo único publicado es 1988 como constitución de su
   * consejo regulador, que es otra cosa.
   */
  since?: number;
  /**
   * Posición en el mapa esquemático, en % del lienzo (0,0 arriba-izquierda). NO está puesta a ojo:
   * sale de la longitud y la latitud reales de la sede de cada consejo regulador, proyectadas sobre
   * un encuadre de −9,05° a −6,60° de longitud y de 42,58° a 41,88° de latitud. Esas ventanas dan
   * 202 km de ancho por 78 de alto, que es la proporción 2,6:1 que usa la caja del mapa: así las
   * distancias relativas entre denominaciones son las de verdad y no hay estiramiento.
   */
  map: { x: number; y: number };
}

/**
 * LAS CINCO DENOMINACIONES, con sus datos.
 *
 * Todo lo de aquí abajo está contrastado contra el pliego de condiciones o la web del consejo
 * regulador de cada denominación (y, donde no lo publican, contra Agacal/Xunta). No es relleno
 * decorativo: es la parte de esta página que SÍ puede ser verdad mientras la carta no llegue, y por
 * eso se verificó una por una en vez de escribirla de memoria. Tres avisos que salieron de esa
 * revisión y conviene no deshacer:
 *
 *  · VALDEORRAS VA AL ESTE. Su propio pliego oficial dice "parte suroccidental de la provincia de
 *    Ourense", y es un error del documento: se contradice con la lista de municipios del mismo
 *    pliego (O Barco, Rubiá, Carballeda lindan con León) y con que lo llame "la puerta natural de
 *    entrada a Galicia". O Barco está a −6,98º de longitud, el punto más oriental de las cinco.
 *  · RÍAS BAIXAS NO LLEVA AÑO. Lo único publicado es 1988 como constitución de su consejo
 *    regulador, que no es lo mismo que el reconocimiento de la denominación. Antes que poner un año
 *    que no se sostiene, se deja sin año: `since` es opcional justo para esto.
 *  · MONTERREI ES 1994, no 1996. 1996 circula por muchas webs; lo que publica su consejo es la
 *    aprobación del reglamento por la Xunta el 25 de noviembre de 1994.
 *
 * `provinces` es una lista y no una frase para no tener que traducir la conjunción ("y" / "e" /
 * "and"): la interfaz las une con un separador neutro.
 */
export const WINE_REGIONS: Record<GalicianDoId, WineRegion> = {
  "rias-baixas": {
    id: "rias-baixas",
    label: "Rías Baixas",
    provinces: ["Pontevedra", "A Coruña"],
    inOurense: false,
    mostly: "blanco",
    whites: ["Albariño", "Loureira", "Treixadura", "Caíño blanco", "Godello"],
    reds: ["Sousón", "Mencía", "Caíño tinto", "Espadeiro", "Brancellao"],
    map: { x: 14.3, y: 40.0 },
  },
  ribeiro: {
    id: "ribeiro",
    /* "Ribeiro", sin artículo: "O Ribeiro" es la comarca, no la denominación. Su consejo nunca
       escribe "D.O. O Ribeiro". */
    label: "Ribeiro",
    provinces: ["Ourense"],
    inOurense: true,
    mostly: "blanco",
    whites: ["Treixadura", "Godello", "Albariño", "Loureira", "Torrontés"],
    reds: ["Mencía", "Sousón", "Caíño tinto", "Brancellao", "Ferrón"],
    since: 1932,
    map: { x: 37.1, y: 41.4 },
  },
  "ribeira-sacra": {
    id: "ribeira-sacra",
    label: "Ribeira Sacra",
    provinces: ["Lugo", "Ourense"],
    inOurense: true,
    mostly: "tinto",
    whites: ["Godello", "Treixadura", "Albariño", "Loureira", "Dona Branca"],
    reds: ["Mencía", "Brancellao", "Merenzao", "Sousón", "Caíño tinto"],
    since: 1995,
    map: { x: 59.2, y: 18.6 },
  },
  valdeorras: {
    id: "valdeorras",
    label: "Valdeorras",
    provinces: ["Ourense"],
    inOurense: true,
    mostly: "blanco",
    whites: ["Godello", "Treixadura", "Dona Branca", "Loureira", "Albariño"],
    reds: ["Mencía", "Tempranillo", "Brancellao", "Merenzao", "Sousón"],
    since: 1945,
    map: { x: 84.5, y: 22.9 },
  },
  monterrei: {
    id: "monterrei",
    label: "Monterrei",
    provinces: ["Ourense"],
    inOurense: true,
    mostly: "blanco",
    whites: ["Godello", "Treixadura", "Albariño", "Dona Branca", "Loureira"],
    reds: ["Mencía", "Tempranillo", "Sousón", "Merenzao", "Caíño tinto"],
    since: 1994,
    map: { x: 65.3, y: 90.0 },
  },
};

/** Dónde está Ourense en ese mismo mapa. La ciudad del local, para situar lo demás respecto a ella. */
export const OURENSE_ON_MAP = { x: 48.6, y: 34.3 } as const;

/** Las cinco, en el orden de `GALICIAN_DO_IDS` (oeste → este). */
export const WINE_REGION_LIST: readonly WineRegion[] = GALICIAN_DO_IDS.map((id) => WINE_REGIONS[id]);

/** Cuántas tienen viñedo en la provincia de Ourense. Se calcula, no se escribe: si mañana cambia un dato, el texto no miente. */
export const REGIONS_IN_OURENSE = WINE_REGION_LIST.filter((r) => r.inOurense).length;

/* ──────────────────────────────────────────────────────────────
   Los vinos
   ────────────────────────────────────────────────────────────── */

export interface Wine {
  /** Identificador en minúsculas con guiones; se usa como ancla en la URL. */
  id: string;
  /** Nombre de la botella, como en la etiqueta. No se traduce. */
  name: string;
  /** Bodega. No se traduce. */
  winery: string;
  /**
   * Denominación: el id de una de las cinco gallegas, o el nombre tal cual para lo que venga de
   * fuera de Galicia (un cava, un ribera). Así la carta puede crecer sin forzar que todo sea gallego.
   */
  origin: GalicianDoId | { label: string; area: string };
  kind: WineKind;
  /** Variedades, la mayoritaria primero. */
  grapes: readonly string[];
  vintage?: number;
  /** Crianza, en las palabras de la bodega: "4 meses sobre lías", "12 meses en barrica de roble". */
  ageing?: string;
  /** Grado alcohólico en % vol. */
  abv?: number;
  /**
   * Precios en euros. LOS DOS SON OPCIONALES y no por pereza: no todo vino se sirve por copa, y
   * publicar un precio de copa que no existe manda a alguien a la barra a pedir algo que no se le
   * puede servir.
   */
  glassPrice?: number;
  bottlePrice?: number;
  /**
   * Nota de cata e historia de la botella. OPCIONALES A PROPÓSITO, y es la decisión más importante
   * de este fichero: el cliente quiere fichas con mucha información ("la uva, procedencia,
   * maduración, información a tope"), y la forma de que eso no acabe en prosa inventada es que la
   * web funcione perfectamente sin ellas. Un vino con nombre, D.O. y precio se publica igual; lo que
   * no se publica es una nota de cata que nadie ha escrito. Se rellenan con lo que publiquen la
   * bodega o el consejo regulador, y lo confirma Tatiana.
   */
  notes?: string;
  story?: string;
  /** Platos de la carta con los que va bien. Única fuente de la relación plato ↔ vino. */
  pairsWith?: readonly MenuItemId[];
  /** Foto de la botella, cuando la haya (public/images/...). */
  image?: string;
}

/**
 * LA CARTA DE VINOS. Vacía hasta que llegue la lista definitiva de Tatiana.
 *
 * Al rellenarla: un vino por entrada, `id` único en minúsculas con guiones, y `pairsWith` apuntando
 * a platos que existan (el tipo lo comprueba). `assertWineIntegrity()` repasa el resto.
 */
export const WINES: Wine[] = [];

/**
 * `true` mientras no haya ni un vino. Lo mira la página para enseñar el aviso de "estamos cerrando
 * la carta" en vez de una lista vacía. Se apaga sola al añadir el primer vino — no hay que acordarse
 * de tocar ningún interruptor, que es justo lo que pasa con `LEGAL_IDENTITY_PENDING` en `legal.ts`.
 */
export const WINES_PENDING = WINES.length === 0;

/** Los vinos de un tipo, respetando el orden de `WINE_KINDS`. */
export function winesByKind(kind: WineKind): Wine[] {
  return WINES.filter((w) => w.kind === kind);
}

/**
 * Vinos recomendados para un plato, invirtiendo `pairsWith`. La ficha del plato llama aquí en vez de
 * guardar su propia lista: una sola fuente, imposible que las dos se contradigan.
 */
export function winesForDish(dishId: MenuItemId): Wine[] {
  return WINES.filter((w) => w.pairsWith?.includes(dishId));
}
