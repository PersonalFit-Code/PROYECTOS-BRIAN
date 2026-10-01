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

/**
 * Viticultura y elaboración. Es una LISTA CERRADA a propósito: son palabras con consecuencias
 * legales ("ecológico" y "vegano" son certificaciones, no adjetivos) y con texto libre acabarían
 * puestas a ojo. Solo se marca lo que la bodega certifica o declara; lo que no consta, no se pone.
 * "De pago" y "de parcela" no son certificaciones pero sí afirmaciones concretas sobre el viñedo.
 */
export const WINE_METHODS = ["ecologico", "biodinamico", "natural", "vegano", "de-pago", "de-parcela"] as const;
export type WineMethod = (typeof WINE_METHODS)[number];

/**
 * Los cuatro ejes del perfil de boca, de 1 a 5. Son la respuesta corta a "¿y esto a qué sabe?" para
 * quien no entiende de vino, que es justo lo que pidió el cliente: cuatro barritas se leen de un
 * vistazo y una nota de cata de cinco líneas no.
 *
 * NO LOS PONEMOS NOSOTROS. Salen de la ficha técnica de la bodega, o los pone Tatiana probándolo. Un
 * número inventado aquí sería una opinión disfrazada de dato, y encima la primera que leería alguien
 * que no sabe distinguir. Por eso el campo es opcional eje por eje: un blanco sin taninos
 * simplemente no trae ese eje.
 */
export const WINE_AXES = ["body", "acidity", "tannin", "sweetness"] as const;
export type WineAxis = (typeof WINE_AXES)[number];
/** 1 = muy poco, 5 = mucho. Nada de medios puntos: no se puede defender la diferencia entre 3 y 3,5. */
export type WineAxisValue = 1 | 2 | 3 | 4 | 5;

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
   * Posición en el mapa, en % del lienzo (0,0 arriba-izquierda). NO está puesta a ojo: es la
   * longitud y la latitud reales de la sede de su consejo regulador, proyectadas sobre
   * `GALICIA_BOUNDS` (`src/data/geo/galicia.ts`) —el mismo encuadre del que sale el contorno de
   * Galicia que se pinta debajo—. De ahí que cada denominación caiga donde cae de verdad DENTRO de
   * la silueta, comprobado punto por punto, y que las distancias entre ellas sean las reales.
   *
   * Si se cambia `GALICIA_BOUNDS` hay que recalcular estas seis o el mapa deja de decir la verdad:
   *     x = (lon − lonMin) / (lonMax − lonMin) × 100
   *     y = (latMax − lat) / (latMax − latMin) × 100
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
    /* Cambados (sede del consejo): 42,5125 N · 8,8139 O. */
    map: { x: 21.3, y: 63.7 },
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
    /* Ribadavia: 42,2878 N · 8,1414 O. */
    map: { x: 45.8, y: 74.4 },
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
    /* Monforte de Lemos: 42,5218 N · 7,5098 O. */
    map: { x: 68.7, y: 63.2 },
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
    /* O Barco de Valdeorras: 42,4160 N · 6,9868 O. El punto más oriental de las cinco. */
    map: { x: 87.8, y: 68.3 },
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
    /* Verín: 41,9411 N · 7,4382 O. */
    map: { x: 71.3, y: 90.9 },
  },
};

/**
 * Dónde está TIXOLA en ese mismo mapa: Ourense capital (42,3358 N · 7,8639 O), proyectada igual que
 * las cinco. Es el punto al que van los caminos del mapa, así que no es un adorno: si se mueve, los
 * cinco trazos apuntan a otro sitio.
 */
export const OURENSE_ON_MAP = { x: 55.9, y: 72.1 } as const;

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
  /** Variedades, la mayoritaria primero. Una sola = monovarietal; varias = ensamblaje. */
  grapes: readonly string[];
  /**
   * El reparto del ensamblaje en %, por nombre de uva. Aparte de `grapes` y no dentro, para que un
   * monovarietal o un vino cuya bodega no publica porcentajes se escriba en una línea y sin ceros de
   * relleno. Solo hace falta para los que SÍ los publican, y `assertWineIntegrity()` comprueba que
   * las uvas citadas aquí estén en `grapes` y que la suma no pase de 100.
   */
  grapeShares?: Readonly<Partial<Record<string, number>>>;
  vintage?: number;
  /** Crianza, en las palabras de la bodega: "4 meses sobre lías", "12 meses en barrica de roble". */
  ageing?: string;
  /** Elaboración, también en sus palabras: "fermentado en hormigón", "maceración carbónica". */
  winemaking?: string;
  /** Certificaciones y afirmaciones sobre el viñedo. Solo las que consten. */
  methods?: readonly WineMethod[];
  /** Grado alcohólico en % vol. */
  abv?: number;
  /** Capacidad de la botella en centilitros: 75 la normal, 37,5 la media, 150 la magnum. */
  bottleCl?: number;
  /** Temperatura de servicio en grados, [mínima, máxima]. Dato de servicio, no de cata. */
  serveC?: readonly [number, number];
  /** Perfil de boca. Ver `WINE_AXES`: no lo rellenamos nosotros. */
  profile?: Readonly<Partial<Record<WineAxis, WineAxisValue>>>;
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
  /** Subzona, paraje o pago concreto dentro de la denominación. */
  subzone?: string;
  /** El terreno: suelo, altitud, orientación. Lo que explica por qué sabe así y no de otra manera. */
  terroir?: string;
  /** Quien lo hace: el enólogo o la familia productora. No se traduce. */
  winemaker?: string;
  /**
   * Puntuaciones y premios. `source` es quien puntúa ("Guía Peñín", "Decanter") y `score` la nota TAL
   * CUAL la publican, en texto: unos dan 92 sobre 100, otros medallas, y convertir entre escalas sería
   * inventar. Si no hay nota pero sí premio, se deja `score` fuera.
   */
  awards?: readonly { source: string; score?: string; year?: number }[];
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

assertWineIntegrity(WINES);

/**
 * `true` mientras no haya ni un vino. Lo mira la página para enseñar el aviso de "estamos cerrando
 * la carta" en vez de una lista vacía. Se apaga sola al añadir el primer vino — no hay que acordarse
 * de tocar ningún interruptor, que es justo lo que pasa con `LEGAL_IDENTITY_PENDING` en `legal.ts`.
 */
/**
 * COMPROBACIONES DE LA CARTA DE VINOS, en el arranque. Misma idea que `assertMenuIntegrity()` (en
 * `integrity.ts`): si un dato no se sostiene, **el build no sale**.
 *
 * VIVE AQUÍ Y NO EN `integrity.ts`, y no es por capricho: ese fichero importa `menu.ts` y `dishes.ts`,
 * que a su vez importan `integrity.ts`. Mientras solo `dishes.ts` entraba por ahí el ciclo se resolvía
 * en el orden bueno, pero con `wines.ts` entrando también, el bundle de /vinos empezaba por
 * `integrity.ts` y `dishes.ts` llamaba a su comprobación antes de que `menu.ts` existiera: la página
 * entera caía con "Cannot read properties of undefined (reading 'MENU_ITEMS')". Comprobado en los
 * cuatro idiomas con vinos de prueba en la carta. Estas comprobaciones solo miran objetos `Wine`, así
 * que no tienen por qué salir de este fichero y aquí no pueden volver a crear ese ciclo.
 *
 * HOY NO COMPRUEBA NADA porque `WINES` está vacía, y eso es exactamente para lo que está. La lista va
 * a llegar de golpe, transcrita de un papel y con prisa, y es entonces cuando se cuelan el precio de
 * copa más caro que el de botella, la añada 2203, el ensamblaje que suma 140 % o la uva del
 * porcentaje que no está en la lista de uvas. Son errores de VALOR: ningún tipo los ve, y en una
 * carta de vinos cualquiera de ellos se publica sin que nadie en la casa lo note.
 *
 * El tipo de `pairsWith` ya impide apuntar a un plato que no existe, así que eso no se repite aquí.
 */
function assertWineIntegrity(wines: readonly Wine[]): void {
  const errors: string[] = [];
  const vistos = new Set<string>();
  /* Margen de un año: en otoño ya se venden añadas del año siguiente en algunos blancos. */
  const añoTope = new Date().getFullYear() + 1;

  for (const w of wines) {
    const quien = w.name || w.id || "(vino sin nombre)";

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(w.id)) {
      errors.push(`"${quien}": el id "${w.id}" tiene que ir en minúsculas con guiones (se usa como ancla en la URL)`);
    }
    if (vistos.has(w.id)) errors.push(`el id "${w.id}" está repetido`);
    vistos.add(w.id);

    if (!w.grapes.length) errors.push(`"${quien}": sin variedades de uva`);

    if (w.grapeShares) {
      let suma = 0;
      for (const [uva, parte] of Object.entries(w.grapeShares)) {
        if (parte === undefined) continue;
        if (!w.grapes.includes(uva)) errors.push(`"${quien}": el porcentaje habla de "${uva}", que no está en sus uvas`);
        if (parte <= 0 || parte > 100) errors.push(`"${quien}": "${uva}" al ${parte} %`);
        suma += parte;
      }
      /* Se admite que sume menos de 100 (bodegas que solo publican la mayoritaria), nunca más. */
      if (suma > 100) errors.push(`"${quien}": los porcentajes de uva suman ${suma} %`);
    }

    if (w.vintage !== undefined && (w.vintage < 1900 || w.vintage > añoTope)) {
      errors.push(`"${quien}": añada ${w.vintage}`);
    }
    if (w.abv !== undefined && (w.abv < 4 || w.abv > 22)) errors.push(`"${quien}": ${w.abv} % vol.`);
    if (w.bottleCl !== undefined && w.bottleCl <= 0) errors.push(`"${quien}": botella de ${w.bottleCl} cl`);

    for (const [campo, precio] of [["copa", w.glassPrice], ["botella", w.bottlePrice]] as const) {
      if (precio !== undefined && precio <= 0) errors.push(`"${quien}": precio de ${campo} ${precio} €`);
    }
    /* Una copa que cuesta más que la botella entera: el error de transcripción más caro de los dos. */
    if (w.glassPrice !== undefined && w.bottlePrice !== undefined && w.glassPrice >= w.bottlePrice) {
      errors.push(`"${quien}": la copa (${w.glassPrice} €) cuesta igual o más que la botella (${w.bottlePrice} €)`);
    }

    if (w.serveC) {
      const [min, max] = w.serveC;
      if (min > max) errors.push(`"${quien}": temperatura de servicio de ${min} a ${max} grados`);
      if (min < 0 || max > 24) errors.push(`"${quien}": se sirve entre ${min} y ${max} grados`);
    }

    if (typeof w.origin === "object" && (!w.origin.label.trim() || !w.origin.area.trim())) {
      errors.push(`"${quien}": origen de fuera de Galicia sin denominación o sin zona`);
    }

    for (const premio of w.awards ?? []) {
      if (!premio.source.trim()) errors.push(`"${quien}": una puntuación sin decir quién la da`);
    }

    if (w.pairsWith && new Set(w.pairsWith).size !== w.pairsWith.length) {
      errors.push(`"${quien}": un plato repetido en sus maridajes`);
    }
  }

  if (errors.length) throw new Error(`Carta de vinos inconsistente:\n  · ${errors.join("\n  · ")}`);
}

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
