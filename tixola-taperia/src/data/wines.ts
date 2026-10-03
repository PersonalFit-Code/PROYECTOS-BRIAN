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
   Lo que no es gallego
   ────────────────────────────────────────────────────────────── */

/**
 * Las demás procedencias de la carta, en el orden en que se presentan: primero el resto de España,
 * después Portugal, y al final lo de más lejos.
 *
 * SUS NOMBRES NO VIVEN AQUÍ, viven en los mensajes (`m.vinos.origins`). Casi todos son nombres
 * propios que se escriben igual en los cuatro idiomas, pero uno no lo es —"Fuera D.O. Ribeiro" es una
 * frase, no un nombre— y tener la mitad de los títulos en los datos y la otra mitad en las
 * traducciones sería peor que tenerlos todos en el mismo sitio.
 */
export const OTHER_ORIGIN_IDS = [
  "fuera-do-ribeiro",
  "ribera-del-duero",
  "rioja",
  "bierzo",
  "somontano",
  "dao",
  "douro",
  "bairrada",
  "rhone",
  "argentina",
  "sudafrica",
] as const;
export type OtherOriginId = (typeof OTHER_ORIGIN_IDS)[number];

/** De dónde es cada una. `undefined` cuando el propio nombre YA es el país y repetirlo sobraría. */
export const ORIGIN_COUNTRY: Record<OtherOriginId, "espana" | "portugal" | "francia" | undefined> = {
  "fuera-do-ribeiro": "espana",
  "ribera-del-duero": "espana",
  rioja: "espana",
  bierzo: "espana",
  somontano: "espana",
  dao: "portugal",
  douro: "portugal",
  bairrada: "portugal",
  rhone: "francia",
  argentina: undefined,
  sudafrica: undefined,
};

/** Procedencia de un vino: una de las cinco gallegas o una de las de fuera. */
export type WineOrigin = GalicianDoId | OtherOriginId;

/** Todas, en el orden en que se recorren en la página: Galicia de oeste a este y luego el resto. */
export const ORIGIN_ORDER: readonly WineOrigin[] = [...GALICIAN_DO_IDS, ...OTHER_ORIGIN_IDS];

const GALICIAN_SET = new Set<string>(GALICIAN_DO_IDS);

/** Si la procedencia es una de las cinco gallegas (y entonces tiene ficha y sitio en el mapa). */
export function isGalicianOrigin(origin: WineOrigin): origin is GalicianDoId {
  return GALICIAN_SET.has(origin);
}

/* ──────────────────────────────────────────────────────────────
   Los vinos
   ────────────────────────────────────────────────────────────── */

export interface Wine {
  /** Identificador en minúsculas con guiones; se usa como ancla en la URL. */
  id: string;
  /** Nombre de la botella, como en la etiqueta. No se traduce. */
  name: string;
  /**
   * Bodega. No se traduce. OPCIONAL: la carta de la casa casi nunca la imprime —en muchos vinos el
   * nombre de la botella ES el de la bodega— y poner la que uno supone es exactamente lo que esta
   * web no hace.
   */
  winery?: string;
  /** Denominación o procedencia: una de las cinco gallegas o una de `OTHER_ORIGIN_IDS`. */
  origin: WineOrigin;
  /**
   * Blanco, tinto… OPCIONAL porque la carta no lo dice de todos: marca el color en Monterrei,
   * Valdeorras y Ribeira Sacra, y en las demás secciones lo da por sabido. Donde no consta ni se
   * puede leer de la propia carta, se deja sin color antes que adivinarlo.
   */
  kind?: WineKind;
  /**
   * Variedades, la mayoritaria primero. Una sola = monovarietal; varias = ensamblaje. OPCIONAL: la
   * carta solo las imprime en cuatro vinos, y el resto hay que buscarlos ficha a ficha.
   */
  grapes?: readonly string[];
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
 * LA CARTA DE VINOS: los 52 vinos de la carta de papel de la casa, transcritos de las dos caras
 * fotografiadas el 2 de octubre de 2026.
 *
 * AQUÍ SOLO ESTÁ LO QUE EL PAPEL IMPRIME: nombre, denominación, color y precio de botella. Nada más.
 * No hay bodega inventada, ni uva deducida, ni nota de cata escrita de memoria — y por eso casi todos
 * los campos del tipo `Wine` son opcionales. Las fichas completas se irán rellenando vino a vino con
 * lo que publiquen la bodega o el consejo regulador, y lo confirmará Tatiana.
 *
 * EL COLOR, CUANDO NO CONSTA. La carta marca [BLANCO] / [TINTO] en Monterrei, Valdeorras y Ribeira
 * Sacra, y lo calla en las demás secciones. Donde lo calla se lee de la PROPIA carta, no del mundo:
 * la columna izquierda de la primera cara son los blancos gallegos (Ribeiro y Rías Baixas están ahí,
 * entre secciones marcadas [BLANCO]) y toda la segunda cara son los tintos de fuera. El único que no
 * se deja leer así es el VX Cuvée Caco, y ese se queda SIN color hasta que alguien lo confirme.
 * El reparto completo de qué consta y qué se ha leído está en `docs/vinos-para-revisar.md`.
 *
 * Al añadir vinos: `id` único en minúsculas con guiones, y `pairsWith` apuntando a platos que
 * existan (el tipo lo comprueba). `assertWineIntegrity()` repasa el resto.
 */
export const WINES: Wine[] = [
  {
    id: "condes-de-albarei",
    name: "Condes de Albarei",
    winery: "Bodega Condes de Albarei",
    origin: "rias-baixas",
    kind: "blanco",
    grapes: ["Albariño"],
    winemaking: "Elaborado con los mostos flor, para extraer la pureza varietal del albariño",
    bottlePrice: 18,
    notes: "Amarillo dorado con reflejos verdosos. Nariz de intensidad media-alta, floral y con fruta blanca; en boca fresco, amplio, redondo y de aroma persistente.",
    story: "Nació en 1988 en Cambados de la mano de un grupo de viticultores del Valle del Salnés, y este albariño es su buque insignia desde entonces.",
    subzone: "Valle del Salnés",
    terroir: "Cepas viejas en pequeñas parcelas de minifundio, en emparrado, muy cerca de la ría de Arousa",
  },
  {
    id: "pazo-baion",
    name: "Pazo Baión",
    winery: "Bodega Pazo Baión",
    origin: "rias-baixas",
    kind: "blanco",
    grapes: ["Albariño"],
    methods: ["de-pago"],
    bottlePrice: 29,
    notes: "Amarillo pajizo con reflejos verdosos y perfume varietal intenso: flores blancas y cítricos sobre un fondo de manzana y pera. En boca fresco, equilibrado, mineral y de final muy aromático.",
    story: "Se elabora solo con uva vendimiada en la propia finca, bajo el concepto de vino de pago.",
    subzone: "Valle del Salnés",
    terroir: "Finca de 22 hectáreas de albariño, llena de microclimas, en el corazón del Valle del Salnés",
  },
  { id: "bot-ribeiro", name: "Bot. Ribeiro", origin: "ribeiro", kind: "blanco", bottlePrice: 16 },
  { id: "a-flor-e-a-abella", name: "A Flor e a Abella", origin: "ribeiro", kind: "blanco", bottlePrice: 17 },
  {
    id: "el-canto-del-cuco",
    name: "El Canto del Cuco",
    origin: "ribeiro",
    kind: "blanco",
    bottlePrice: 17,
    image: "/images/vinos/el-canto-del-cuco.webp",
  },
  {
    id: "outeiro-da-barra",
    name: "Outeiro da Barra",
    origin: "ribeiro",
    kind: "blanco",
    bottlePrice: 17,
    image: "/images/vinos/outeiro-da-barra.webp",
  },
  {
    id: "casal-de-arman",
    name: "Casal de Armán",
    origin: "ribeiro",
    kind: "blanco",
    bottlePrice: 23,
    image: "/images/vinos/casal-de-arman.webp",
  },
  {
    id: "eduardo-pena",
    name: "Eduardo Peña",
    winery: "Bodega Eduardo Peña",
    origin: "ribeiro",
    kind: "blanco",
    grapes: ["Treixadura", "Albariño", "Godello", "Lado", "Loureira"],
    winemaking: "Maceración de las variedades, trabajo sobre lías y fermentación en barrica de 300 litros de roble europeo, sin fermentación maloláctica",
    bottlePrice: 24,
    notes: "Amarillo pálido con reflejos dorados. Nariz compleja de limón, azahar, piña y melocotón con fondo balsámico; en boca graso, untuoso, sabroso y muy largo.",
    story: "La bodega está medio enterrada en la ladera del viñedo, lo que mantiene el interior a 14-15 ºC sin medios mecánicos.",
    terroir: "Más de 10 hectáreas en Castrelo de Miño, a 250 metros, en pendiente suave hacia el embalse, sobre suelo arenoso de pizarra y piedra",
  },
  {
    id: "lagar-do-merens",
    name: "Lagar do Meréns",
    winery: "Lagar do Meréns",
    origin: "ribeiro",
    kind: "blanco",
    grapes: ["Treixadura", "Lado", "Torrontés", "Loureira", "Godello", "Albariño"],
    grapeShares: { Treixadura: 70, Lado: 10, "Torrontés": 10 },
    ageing: "8 meses sobre lías finas",
    winemaking: "Maceración en prensa neumática con nieve carbónica y fermentación a 17,5 ºC durante 21 días en acero inoxidable",
    abv: 13,
    bottlePrice: 29,
    notes: "Amarillo pálido con reflejos verdes. Nariz compleja y terpénica, con pera, manzana y melocotón sobre notas florales y balsámicas; en boca amplio, envolvente y muy largo.",
    story: "Bodega de colleiteiro de 2001 en A Arnoia: un lagar antiguo de piedra y madera restaurado, con 3,5 hectáreas de variedades autóctonas del Ribeiro.",
    terroir: "Suelos graníticos francoarenosos en laderas salvadas con socalcos, en A Arnoia",
    winemaker: "José Meréns",
    awards: [{ source: "Concurso Mundial de Bruselas", score: "Medalla de plata", year: 2009 }, { source: "Decanter World Wine Awards", score: "Medalla de plata", year: 2010 }],
  },
  {
    id: "ramon-do-casar",
    name: "Ramón do Casar",
    origin: "ribeiro",
    kind: "blanco",
    grapes: ["Treixadura"],
    bottlePrice: 22,
  },
  {
    id: "cunas-davia",
    name: "Cuñas Davia",
    winery: "Adegas Valdavia",
    origin: "ribeiro",
    kind: "blanco",
    grapes: ["Treixadura", "Albariño", "Godello"],
    ageing: "6 meses sobre lías",
    abv: 13.5,
    bottlePrice: 24,
    notes: "Nariz limpia y con cierta complejidad: manzana, membrillo y melón con notas florales y de hierba fresca. En boca sabroso y amplio, con cítricos y la acidez justa, de final largo y untuoso.",
    awards: [{ source: "Catas de Galicia · Acio de Ouro al mejor blanco", score: "Acio de Ouro", year: 2026 }],
    image: "/images/vinos/cunas-davia.webp",
  },
  {
    id: "regoa",
    name: "Régoa",
    winery: "Adega Régoa",
    origin: "ribeira-sacra",
    kind: "tinto",
    winemaking: "Solo levaduras y bacterias lácticas naturales; sin filtrar ni clarificar, con sulfuroso en dosis bajas",
    bottlePrice: 16,
    story: "Adega de Pinol (Sober), en el corazón de Amandi: cepas de más de 24 años, un máximo de dos kilos por planta, y un viñedo que no se abona ni se riega.",
    subzone: "Amandi",
    terroir: "Once hectáreas de bancales al sur con un 80 % de pendiente sobre el Sil, en pizarra y arenisca",
  },
  {
    id: "algueira",
    name: "Algueira",
    winery: "Adega Algueira",
    origin: "ribeira-sacra",
    kind: "tinto",
    bottlePrice: 18,
    story: "Adega familiar de Doade (Sober), en los bancales del Sil, con 14 hectáreas de variedades autóctonas vinificadas parcela a parcela.",
    subzone: "Amandi",
    image: "/images/vinos/algueira.webp",
  },
  {
    id: "vel-uveyra",
    name: "Vel'Uveyra",
    winery: "Ronsel do Sil",
    origin: "ribeira-sacra",
    kind: "tinto",
    bottlePrice: 19,
    story: "«Ronsel» es la estela que deja la barca al navegar: así se llama la bodega de Parada de Sil que firma este vino.",
    subzone: "Ribeiras do Sil",
    terroir: "Viñedo en los cañones del Sil, en Parada de Sil, sobre granito y esquisto",
    image: "/images/vinos/vel-uveyra.webp",
  },
  {
    id: "la-lama",
    name: "La Lama",
    winery: "Dominio do Bibei",
    origin: "ribeira-sacra",
    kind: "tinto",
    grapes: ["Mencía", "Brancellao", "Mouratón", "Sousón", "Garnacha Tintorera"],
    ageing: "20 meses en barrica neutra",
    winemaking: "Vendimia manual y fermentación con levaduras autóctonas en tinas grandes de madera abiertas",
    bottlePrice: 32,
    story: "Bodega de Langullo (Manzaneda), con 32 hectáreas en Quiroga-Bibei; definen sus vinos como atlánticos, de terruño y de guarda.",
    subzone: "Quiroga-Bibei",
    terroir: "Bancales de fuerte pendiente sobre pizarra y arcilla",
    image: "/images/vinos/la-lama.webp",
  },
  {
    id: "a-moucha",
    name: "A Moucha",
    origin: "ribeira-sacra",
    kind: "tinto",
    grapes: ["Mencía", "Brancellao", "Sousón", "Mouratón", "Garnacha"],
    ageing: "4 meses de fermentación en barrica de roble francés y un mínimo de 24 meses en tonel de 5.000 litros",
    abv: 13,
    bottlePrice: 29,
    subzone: "Quiroga-Bibei",
    terroir: "Bancales de montaña del valle del Bibei, con cepas de entre 15 y 100 años sobre pizarra, esquisto y granito",
    image: "/images/vinos/a-moucha.webp",
  },
  {
    id: "la-lume",
    name: "La Lume",
    winery: "Dominio do Bibei",
    origin: "ribeira-sacra",
    kind: "blanco",
    grapes: ["Treixadura", "Albariño", "Godello"],
    ageing: "Crianza sobre lías finas en el propio recipiente de fermentación: foudre, barrica y hormigón",
    winemaking: "Fermentación con levaduras autóctonas en barrica de 600 litros, foudre y huevo de hormigón, sin fermentación maloláctica",
    bottlePrice: 34,
  },
  { id: "manueleira-blanco", name: "Manueleira", origin: "valdeorras", kind: "blanco", bottlePrice: 16 },
  {
    id: "guitian",
    name: "Guitián",
    winery: "Bodega A Tapada",
    origin: "valdeorras",
    kind: "blanco",
    grapes: ["Godello"],
    grapeShares: { Godello: 100 },
    ageing: "En rama sobre sus lías finas hasta el embotellado, y al menos 2 meses en botella en bodega",
    winemaking: "Vendimia en caja, maceración prefermentativa en frío, prensado neumático a baja presión, desfangado estático en frío y fermentación en acero inoxidable a 16-18 ºC",
    abv: 13.5,
    bottlePrice: 24.5,
    notes: "Amarillo dorado con tonos verdosos, con melocotón y pomelo, un matiz de hinojo y un final de flores blancas. En boca potente y fresco, de gran longitud.",
    story: "El godello de la finca A Tapada se plantó en 1985 a partir de un clon antiguo, prefiloxérico, en el extremo oriental de Valdeorras, al pie de las Peñas Marías.",
    subzone: "Rubiá",
    terroir: "Viñedo de la finca A Tapada a unos 500 metros, en ladera al sur sobre pizarras ordovícicas de textura arcillo-limosa",
    awards: [{ source: "Premios Baco · Unión Española de Catadores", score: "Medalla de oro", year: 2017 }, { source: "Premios Baco · Unión Española de Catadores", score: "Gran Baco de oro", year: 2015 }],
  },
  {
    id: "guitian-sobre-lias",
    name: "Guitián sobre lías",
    winery: "Bodega A Tapada",
    origin: "valdeorras",
    kind: "blanco",
    grapes: ["Godello"],
    grapeShares: { Godello: 100 },
    ageing: "De 4 a 6 meses sobre lías en depósito, con removido semanal, y al menos 2 meses en botella",
    winemaking: "Vendimia en caja, maceración prefermentativa en frío, prensado neumático a baja presión, desfangado estático en frío y fermentación en acero inoxidable a 16-18 ºC",
    abv: 13.5,
    bottlePrice: 30,
    notes: "Amarillo dorado con tonos verdosos, con orejón de melocotón y corteza de naranja, hinojo y flores blancas al final. En boca muy potente y fresco, de gran persistencia.",
    story: "Fue el primer vino español criado sobre lías en depósito con removido semanal durante cuatro a seis meses: esta bodega abrió camino en el manejo de lías en España.",
    subzone: "Rubiá",
    terroir: "Viñedo de la finca A Tapada a unos 500 metros, en ladera al sur sobre pizarras ordovícicas de textura arcillo-limosa",
    awards: [{ source: "Concours Mondial de Bruxelles", score: "Medalla de oro", year: 2004 }, { source: "Concurso Internacional Bacchus", score: "Medalla de oro", year: 2015 }, { source: "Challenge International du Vin", score: "Medalla de plata", year: 2017 }],
  },
  {
    id: "pagos-de-galir",
    name: "Pagos de Galir",
    winery: "Virgen del Galir",
    origin: "valdeorras",
    kind: "tinto",
    bottlePrice: 16,
  },
  { id: "manueleira-tinto", name: "Manueleira ou similar", origin: "valdeorras", kind: "tinto", bottlePrice: 16 },
  {
    id: "pajaro-loco",
    name: "Pájaro Loco",
    winery: "Privios",
    origin: "monterrei",
    kind: "blanco",
    grapes: ["Godello"],
    winemaking: "Maceración en frío, prensado suave por sangrado y dos semanas de fermentación a baja temperatura en acero inoxidable con levaduras naturales; se embotella sin filtrar",
    serveC: [10, 12],
    bottlePrice: 17,
    notes: "Amarillo pajizo con notas verdosas, de intensidad media-alta, herbáceo y con fruta de pulpa blanca. En boca envolvente y fresco, de postgusto largo y retronasal cítrica.",
    image: "/images/vinos/pajaro-loco.webp",
  },
  {
    id: "crego-e-monaguillo-blanco",
    name: "Crego e Monaguillo",
    winery: "Crego e Monaguillo",
    origin: "monterrei",
    kind: "blanco",
    grapes: ["Godello", "Treixadura"],
    winemaking: "Maceración en frío de la treixadura, prensado neumático y desfangado por decantación en frío; fermentación en acero inoxidable a 17 ºC",
    abv: 13,
    serveC: [9, 12],
    bottlePrice: 17,
    notes: "Amarillo pajizo con toques dorados, cítrico, afrutado y floral, con un recuerdo de flor de hinojo. En boca fresco, elegante y ligeramente graso, de acidez bien integrada.",
    story: "Bodega familiar de A Salgueira (Monterrei) con más de cincuenta años detrás, que trabaja a mano cien hectáreas de godello y mencía.",
    terroir: "Suelos graníticos de grava ligera en el valle del Támega",
    winemaker: "Pablo Estévez",
    awards: [{ source: "Cata dos Viños de Galicia", score: "Mejor vino blanco", year: 2006 }],
    image: "/images/vinos/crego-e-monaguillo-blanco.webp",
  },
  {
    id: "castro-de-lobarzan",
    name: "Castro de Lobarzán",
    winery: "Castro de Lobarzán",
    origin: "monterrei",
    kind: "blanco",
    grapes: ["Godello", "Treixadura"],
    bottlePrice: 18,
    story: "Bodega familiar de Villaza que elabora solo uva de cosecha propia y trabaja en recuperar las variedades autóctonas del pueblo.",
    terroir: "5,2 hectáreas propias en laderas de pendiente suave y suelo arenoso, en Villaza (Monterrei)",
  },
  {
    id: "crego-e-monaguillo-tinto",
    name: "Crego e Monaguillo",
    winery: "Crego e Monaguillo",
    origin: "monterrei",
    kind: "tinto",
    grapes: ["Mencía", "Araúxa"],
    grapeShares: { "Mencía": 85, "Araúxa": 15 },
    winemaking: "Despalillado y estrujado muy suave, casi uva entera; fermentación y maceración en acero a 22 ºC, ligera microoxigenación antes de la maloláctica y reposo en acero hasta el embotellado",
    abv: 13.2,
    serveC: [14, 16],
    bottlePrice: 17,
    notes: "Granate de capa media con ribete violáceo, muy afrutado: mora, fresa, arándano y casis con un fondo de cacao. En boca sedoso y aterciopelado, de taninos dulces y retronasal de fruta roja y especias.",
    story: "Bodega familiar de A Salgueira (Monterrei) con más de cincuenta años detrás, que trabaja a mano cien hectáreas de godello y mencía.",
    terroir: "Suelos graníticos de grava ligera en el valle del Támega",
    winemaker: "Pablo Estévez",
    awards: [{ source: "Cata dos Viños de Galicia", score: "Mejor vino tinto", year: 2014 }, { source: "Cata dos Viños de Galicia", score: "Mejor vino tinto", year: 2009 }],
    image: "/images/vinos/crego-e-monaguillo-tinto.webp",
  },
  {
    id: "quinta-da-muradela-alanda",
    name: "Quinta da Muradela · Alanda",
    winery: "Quinta da Muradella",
    origin: "monterrei",
    kind: "tinto",
    bottlePrice: 47,
    image: "/images/vinos/quinta-da-muradela-alanda.webp",
  },
  {
    id: "vx-cuvee-caco",
    name: "VX Cuvée Caco",
    origin: "fuera-do-ribeiro",
    bottlePrice: 44,
    image: "/images/vinos/vx-cuvee-caco.webp",
  },
  {
    id: "a-capela",
    name: "A Capela ou similar",
    origin: "ribera-del-duero",
    kind: "tinto",
    bottlePrice: 16,
    image: "/images/vinos/a-capela.webp",
  },
  { id: "hito", name: "Hito", origin: "ribera-del-duero", kind: "tinto", bottlePrice: 19 },
  {
    id: "carmelo-rodero-9-meses",
    name: "Carmelo Rodero 9 meses",
    origin: "ribera-del-duero",
    kind: "tinto",
    grapes: ["Tempranillo"],
    ageing: "9 meses",
    bottlePrice: 24,
  },
  {
    id: "arzuaga-crianza",
    name: "Arzuaga Crianza",
    origin: "ribera-del-duero",
    kind: "tinto",
    ageing: "Crianza",
    bottlePrice: 39,
    image: "/images/vinos/arzuaga-crianza.webp",
  },
  {
    id: "tomas-postigo-3-ano",
    name: "Tomás Postigo 3º año",
    origin: "ribera-del-duero",
    kind: "tinto",
    bottlePrice: 54,
    image: "/images/vinos/tomas-postigo-3-ano.webp",
  },
  {
    id: "quinta-sardonia",
    name: "Quinta Sardonia",
    origin: "ribera-del-duero",
    kind: "tinto",
    bottlePrice: 52,
    image: "/images/vinos/quinta-sardonia.webp",
  },
  {
    id: "malabrigo",
    name: "Malabrigo",
    origin: "ribera-del-duero",
    kind: "tinto",
    bottlePrice: 55,
    image: "/images/vinos/malabrigo.webp",
  },
  {
    id: "dehesa-de-los-canonigos",
    name: "Dehesa de los Canónigos",
    origin: "ribera-del-duero",
    kind: "tinto",
    bottlePrice: 40,
    image: "/images/vinos/dehesa-de-los-canonigos.webp",
  },
  {
    id: "carmelo-rodero-reserva",
    name: "Carmelo Rodero Reserva",
    origin: "ribera-del-duero",
    kind: "tinto",
    ageing: "Reserva",
    bottlePrice: 52,
  },
  { id: "bot-rioja", name: "Bot. Rioja", origin: "rioja", kind: "tinto", bottlePrice: 16 },
  {
    id: "baigorri",
    name: "Baigorri",
    winery: "Bodegas Baigorri",
    origin: "rioja",
    kind: "tinto",
    grapes: ["Tempranillo", "Garnacha"],
    grapeShares: { Tempranillo: 90, Garnacha: 5 },
    ageing: "14 meses en barrica de roble francés y americano",
    winemaking: "Vendimia manual con selección de grano, maceraciones largas con levaduras indígenas, extracción por gravedad y embotellado sin filtrar",
    bottlePrice: 19,
    notes: "Rojo cereza profundo, con fruta negra recién recogida y especias. En boca elegante, sedoso y frutal, con buena frescura y final largo.",
    story: "Baigorri reivindica el crianza de Rioja frente a la producción industrial: viticultura sostenible, trabajo manual y embotellado sin clarificar ni filtrar.",
    subzone: "Rioja Alavesa",
    terroir: "Parcelas en Samaniego, Laguardia y Leza, en suelo arcillo-calcáreo a 600 metros y mayoritariamente en vaso",
    image: "/images/vinos/baigorri.webp",
  },
  {
    id: "luis-canas",
    name: "Luis Cañas",
    winery: "Bodegas Luis Cañas",
    origin: "rioja",
    kind: "tinto",
    grapes: ["Tempranillo", "Garnacha", "Graciano", "Mazuelo", "Viura", "Rojal"],
    ageing: "12 meses en barrica usada de roble francés (60 %) y americano (40 %)",
    winemaking: "Vendimia manual con doble mesa de selección, de racimo y de grano, y elaboración en acero inoxidable",
    abv: 14.5,
    serveC: [16, 16],
    bottlePrice: 18,
    notes: "Rojo picota, con fruta roja infusionada —fresa, frambuesa, grosella—, especias sutiles y un fondo lácteo. Entrada dulce y envolvente, mucho frescor y final redondo.",
    story: "Un vino marcado por el terruño de Villabuena de Álava; la bodega acredita el origen de la uva con el sello Vino de Zona de la DOCa Rioja.",
    subzone: "Rioja Alavesa",
    terroir: "Villabuena de Álava y alrededores, entre 450 y 650 metros, en suelos arcillo-calcáreos y arenosos con viñas de 35 años de media",
    image: "/images/vinos/luis-canas.webp",
  },
  {
    id: "marques-de-murrieta",
    name: "Marqués de Murrieta",
    winery: "Marqués de Murrieta",
    origin: "rioja",
    kind: "tinto",
    grapes: ["Tempranillo", "Mazuelo", "Graciano", "Garnacha"],
    grapeShares: { Tempranillo: 85, Mazuelo: 7, Graciano: 6, Garnacha: 2 },
    ageing: "25 meses en barrica de roble americano de 225 litros",
    winemaking: "Fermentación separada por variedades en acero inoxidable, encubado de 8 a 10 días y prensado lento en prensa vertical",
    abv: 14,
    serveC: [13, 13],
    bottlePrice: 40,
    notes: "Fruta roja madura y regaliz armonizadas con notas de licor de chocolate. En boca equilibrado, carnoso y redondo, de acidez amable y final largo.",
    story: "Resume la personalidad de la Finca Ygay y todo lo que pasa en ella durante un ciclo entero de la viña.",
    subzone: "Rioja Alta",
    terroir: "Finca Ygay: 300 hectáreas propias alrededor de la bodega, suelo arcillo-calcáreo entre 320 y 485 metros",
    awards: [{ source: "Tim Atkin", score: "95" }, { source: "Robert Parker", score: "94+" }, { source: "Vinous", score: "94" }],
    image: "/images/vinos/marques-de-murrieta.webp",
  },
  {
    id: "malpuesto",
    name: "Malpuesto",
    winery: "Bodegas Orben",
    origin: "rioja",
    kind: "tinto",
    grapes: ["Tempranillo"],
    grapeShares: { Tempranillo: 100 },
    ageing: "12 meses en barrica de 500 litros de roble francés de grano fino",
    winemaking: "Vendimia manual en caja de 15 kg, despalillado sin estrujar, fermentación en acero abierto y maloláctica en barrica grande y ánfora de arcilla",
    methods: ["de-parcela"],
    abv: 14,
    bottlePrice: 56,
    notes: "Cereza brillante e intenso, con fruta madura, negra y silvestre. Estructurado y amplio, con un toque cremoso y terroso, muy carnoso y de final persistente.",
    story: "Orben es el proyecto de microparcelas de viñedo viejo en las zonas altas de Rioja Alavesa, en el entorno de Laguardia.",
    subzone: "Rioja Alavesa",
    terroir: "Un único viñedo viejo de 1,68 hectáreas plantado en vaso hacia 1931, en ladera a 520 metros, sobre suelo arenoso muy pobre y superficial",
    image: "/images/vinos/malpuesto.webp",
  },
  {
    id: "macan-clasico",
    name: "Macán Clásico",
    winery: "Benjamin de Rothschild & Vega Sicilia",
    origin: "rioja",
    kind: "tinto",
    grapes: ["Tempranillo"],
    grapeShares: { Tempranillo: 100 },
    ageing: "12 meses en barrica y 18 meses en botella",
    winemaking: "Maloláctica entre barrica y depósito, y crianza en madera francesa de grano fino, la mayor parte en barrica nueva",
    abv: 14,
    serveC: [18, 18],
    bottlePrice: 95,
    notes: "El más cercano y expresivo de los dos: trago amable, carácter marcado de la tierra de la que viene y una sencillez que lo hace muy atractivo.",
    story: "Macán y Macán Clásico son la visión conjunta de Rothschild y Vega Sicilia sobre Rioja, y conviven como primer y segundo vino a la manera bordelesa.",
    terroir: "100 hectáreas de viñedo de 30 años de media en la Sonsierra, a 483 metros, con un rendimiento de 4.300 kg por hectárea",
    image: "/images/vinos/macan-clasico.webp",
  },
  {
    id: "macan-etiqueta-dorada",
    name: "Macán · Etiqueta dorada",
    winery: "Benjamin de Rothschild & Vega Sicilia",
    origin: "rioja",
    kind: "tinto",
    grapes: ["Tempranillo"],
    grapeShares: { Tempranillo: 100 },
    ageing: "16 meses en barrica y foudre y 28 meses en botella",
    winemaking: "Maloláctica entre barrica y depósito, y crianza en madera francesa de grano fino, la mayor parte en barrica nueva",
    abv: 14,
    serveC: [18, 18],
    bottlePrice: 150,
    notes: "Más escondido que su hermano menor: será el tiempo el que modele su elegancia, arropada por unos taninos aterciopelados y una gran mineralidad.",
    story: "Nació en 2009 del encuentro de las familias Rothschild y Álvarez en la Rioja sonserrana, y es el primer vino del proyecto.",
    terroir: "100 hectáreas de viñedo de 40 años de media en la Sonsierra, a 500 metros, con un rendimiento de 4.000 kg por hectárea",
    image: "/images/vinos/macan-etiqueta-dorada.webp",
  },
  {
    id: "banzao",
    name: "Banzao",
    origin: "bierzo",
    kind: "tinto",
    bottlePrice: 23,
    story: "Un «banzao» es la presa de madera y piedra que subía el nivel del agua para los canales de riego y se rehacía cada año. El proyecto arrancó en 2017 arrendando tres hectáreas de viñedo viejo abandonado para evitar que desapareciera.",
    terroir: "18 parcelas en 8 parajes de San Pedro de Olleros, a 750 metros en el valle del Ancares, en vaso y a tresbolillo con la mezcla original de variedades",
    winemaker: "Silvia Marrao Barreiro",
    image: "/images/vinos/banzao.webp",
  },
  {
    id: "enate",
    name: "Enate",
    winery: "Enate",
    origin: "somontano",
    kind: "tinto",
    grapes: ["Tempranillo", "Cabernet Sauvignon"],
    ageing: "9 meses en barrica de roble francés y americano, y afinado final en acero inoxidable",
    winemaking: "Las dos variedades fermentan por separado a 26 ºC en acero inoxidable y después hacen la maloláctica",
    abv: 14.5,
    serveC: [16, 18],
    bottlePrice: 18,
    notes: "Rojo cereza picota muy cubierto, con aroma intenso y complejo, ahumado y especiado sobre fruta roja madura. En boca denso, carnoso y de final extraordinariamente largo.",
    story: "La etiqueta es una pintura original que el artista Víctor Mira creó para la bodega.",
    awards: [{ source: "James Suckling", score: "90" }, { source: "Guía SEVI", score: "93" }, { source: "Guía Gourmets", score: "91" }],
    image: "/images/vinos/enate.webp",
  },
  {
    id: "quinta-do-escudial",
    name: "Quinta do Escudial Reserva",
    winery: "Quinta do Escudial",
    origin: "dao",
    kind: "tinto",
    grapes: ["Touriga Nacional", "Tinta Roriz"],
    ageing: "Unos 48 meses en cuba de acero inoxidable, sin pasar por barrica",
    winemaking: "Vendimia manual con selección rigurosa y fermentación separada por variedades, con una elaboración minimalista",
    abv: 13,
    bottlePrice: 23,
    notes: "Rubí con tonos violáceos, con arándano maduro, cereza y ciruela negra sobre un toque de casis y pimienta. En boca persistente y elegante, de taninos finos y sedosos.",
    story: "La bodega se presenta como especialista en vinos «sin madera»: este reserva no ve barrica y afina en acero.",
    image: "/images/vinos/quinta-do-escudial.webp",
  },
  {
    id: "carqueijal",
    name: "Carqueijal",
    winery: "Quinta Seara d'Ordens",
    origin: "douro",
    kind: "tinto",
    bottlePrice: 16,
    image: "/images/vinos/carqueijal.webp",
  },
  {
    id: "quinta-das-bagueiras",
    name: "Quinta das Bágeiras Reserva",
    winery: "Quinta das Bágeiras",
    origin: "bairrada",
    kind: "tinto",
    grapes: ["Baga", "Touriga Nacional"],
    ageing: "Unos 18 meses en los mismos toneles de madera vieja donde termina la fermentación; se embotella sin clarificar ni filtrar",
    winemaking: "Fermenta de 5 a 8 días en lagar sin despalillar, con bazuqueos a mano con pisón de madera varias veces al día",
    abv: 13,
    bottlePrice: 24,
    notes: "Baga y Touriga Nacional se conjugan con armonía: frutos silvestres, especias y hierba fresca. Jugoso, expresivo, largo y lleno de vida.",
    story: "Elabora vinos clásicos con prácticas muy tradicionales, heredadas de generación en generación, y con una enología minimalista.",
    awards: [{ source: "Revista de Vinhos", score: "17/20" }],
    image: "/images/vinos/quinta-das-bagueiras.webp",
  },
  {
    id: "piaugier-sablet",
    name: "Piaugier · Sablet",
    winery: "Domaine de Piaugier",
    origin: "rhone",
    kind: "tinto",
    grapes: ["Garnacha", "Syrah"],
    grapeShares: { Garnacha: 80, Syrah: 20 },
    ageing: "Unos 18 meses en depósito de hormigón, después del ensamblaje",
    winemaking: "Vendimia manual y vinificación separada en depósitos de hormigón levantados en 1947 por el bisabuelo de la casa, con maceración de dos a tres semanas",
    methods: ["ecologico"],
    bottlePrice: 24,
    notes: "Frutos rojos frescos en nariz, con cereza y frambuesa. En boca suave y armonioso, de taninos finos ya fundidos y final elegante y persistente.",
    story: "Finca familiar al pie de las Dentelles de Montmirail: Jean-Marc y Sophie tomaron el relevo en 1985 y hoy les acompaña su hija Maude.",
    subzone: "Sablet",
    terroir: "Parcelas de terruño arenoso en Sablet, sobre derrubios areno-limosos que drenan muy bien, con viñas de 35 a 45 años",
    winemaker: "Jean-Marc y Sophie Autran",
    image: "/images/vinos/piaugier-sablet.webp",
  },
  {
    id: "terrazas-de-los-andes",
    name: "Terrazas de los Andes",
    winery: "Terrazas de los Andes",
    origin: "argentina",
    kind: "tinto",
    grapes: ["Malbec"],
    bottlePrice: 25,
    story: "Vinos de montaña de los terruños de altura de Mendoza, al pie de los Andes.",
    image: "/images/vinos/terrazas-de-los-andes.webp",
  },
  {
    id: "abbotsdale",
    name: "Abbotsdale",
    winery: "MacRobert & Canals",
    origin: "sudafrica",
    kind: "tinto",
    grapes: ["Syrah"],
    grapeShares: { Syrah: 100 },
    ageing: "En toneles grandes de madera vieja, para redondear y estabilizar el vino",
    winemaking: "Selección de uva antes del depósito, con parte de racimo entero para mantener el frescor y una extracción suave",
    bottlePrice: 25,
    notes: "Rubí, con violetas y fruta roja y negra: cereza, ciruela, grosella negra y mora. Boca media, de taninos suaves y final largo.",
    story: "Los viñedos los selecciona Bryan MacRobert, criado en una finca cerca del pueblo de Abbotsdale, en Swartland.",
    subzone: "Swartland",
    terroir: "Viñas en vaso, de secano y bajo rendimiento, sobre suelo arenoso de granito descompuesto; se vendimia a mano de madrugada",
    image: "/images/vinos/abbotsdale.webp",
  },
];

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

    if (w.grapes && !w.grapes.length) errors.push(`"${quien}": la lista de uvas está vacía (si no se saben, se deja fuera el campo)`);

    if (w.grapeShares) {
      let suma = 0;
      for (const [uva, parte] of Object.entries(w.grapeShares)) {
        if (parte === undefined) continue;
        if (!w.grapes?.includes(uva)) errors.push(`"${quien}": el porcentaje habla de "${uva}", que no está en sus uvas`);
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

/** Los vinos de un tipo. Los que no traen color declarado no salen en ninguno. */
export function winesByKind(kind: WineKind): Wine[] {
  return WINES.filter((w) => w.kind === kind);
}

/** Los vinos de una procedencia, en el orden en que están escritos en la carta de la casa. */
export function winesByOrigin(origin: WineOrigin): Wine[] {
  return WINES.filter((w) => w.origin === origin);
}

/** Cuántos vinos hay de cada procedencia. Lo usa el mapa para decir "4 vinos en carta". */
export function wineCountByOrigin(origin: WineOrigin): number {
  return winesByOrigin(origin).length;
}

/**
 * Vinos recomendados para un plato, invirtiendo `pairsWith`. La ficha del plato llama aquí en vez de
 * guardar su propia lista: una sola fuente, imposible que las dos se contradigan.
 */
export function winesForDish(dishId: MenuItemId): Wine[] {
  return WINES.filter((w) => w.pairsWith?.includes(dishId));
}
