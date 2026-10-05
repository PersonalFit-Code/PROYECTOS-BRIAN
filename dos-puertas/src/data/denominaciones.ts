/**
 * Las cinco denominaciones de origen de Galicia. Datos traídos de la web de Tixola, donde se
 * contrastaron uno por uno contra el pliego o la web de cada consejo regulador (y Agacal/Xunta
 * donde no lo publican): año de reconocimiento, provincias, uvas preferentes (la dominante primero)
 * y si la zona es mayoritariamente de blanco o de tinto. Notas de esa revisión:
 *  · Valdeorras va al ESTE (su pliego dice «suroccidental» por error; O Barco linda con León).
 *  · Rías Baixas no lleva año: 1988 es la constitución de su consejo, no el reconocimiento.
 *  · Monterrei es 1994 (aprobación del reglamento por la Xunta), no 1996.
 *
 * No es la carta del Dos Puertas: esa está PENDIENTE de confirmar con la casa.
 */
export const DO_IDS = ["rias-baixas", "ribeiro", "ribeira-sacra", "valdeorras", "monterrei"] as const;
export type DoId = (typeof DO_IDS)[number];

export interface Denominacion {
  id: DoId;
  label: string;
  provinces: readonly string[];
  /** Tiene viñedo, total o parcialmente, en la provincia de Ourense. */
  ourense: boolean;
  mostly: "blanco" | "tinto";
  blancas: readonly string[];
  tintas: readonly string[];
  since?: number;
  /**
   * Posición en el mapa (% del lienzo): longitud y latitud reales de la sede de su consejo,
   * proyectadas sobre `GALICIA_BOUNDS` (`geo/galicia.ts`).
   */
  map: { x: number; y: number };
}

export const DENOMINACIONES: readonly Denominacion[] = [
  {
    id: "rias-baixas",
    label: "Rías Baixas",
    provinces: ["Pontevedra", "A Coruña"],
    ourense: false,
    mostly: "blanco",
    blancas: ["Albariño", "Loureira", "Treixadura", "Caíño blanco", "Godello"],
    tintas: ["Sousón", "Mencía", "Caíño tinto", "Espadeiro", "Brancellao"],
    map: { x: 21.3, y: 63.7 },
  },
  {
    id: "ribeiro",
    label: "Ribeiro",
    provinces: ["Ourense"],
    ourense: true,
    mostly: "blanco",
    blancas: ["Treixadura", "Godello", "Albariño", "Loureira", "Torrontés"],
    tintas: ["Mencía", "Sousón", "Caíño tinto", "Brancellao", "Ferrón"],
    since: 1932,
    map: { x: 45.8, y: 74.4 },
  },
  {
    id: "ribeira-sacra",
    label: "Ribeira Sacra",
    provinces: ["Lugo", "Ourense"],
    ourense: true,
    mostly: "tinto",
    blancas: ["Godello", "Treixadura", "Albariño", "Loureira", "Dona Branca"],
    tintas: ["Mencía", "Brancellao", "Merenzao", "Sousón", "Caíño tinto"],
    since: 1995,
    map: { x: 68.7, y: 63.2 },
  },
  {
    id: "valdeorras",
    label: "Valdeorras",
    provinces: ["Ourense"],
    ourense: true,
    mostly: "blanco",
    blancas: ["Godello", "Treixadura", "Dona Branca", "Loureira", "Albariño"],
    tintas: ["Mencía", "Tempranillo", "Brancellao", "Merenzao", "Sousón"],
    since: 1945,
    map: { x: 87.8, y: 68.3 },
  },
  {
    id: "monterrei",
    label: "Monterrei",
    provinces: ["Ourense"],
    ourense: true,
    mostly: "blanco",
    blancas: ["Godello", "Treixadura", "Albariño", "Dona Branca", "Loureira"],
    tintas: ["Mencía", "Tempranillo", "Sousón", "Merenzao", "Caíño tinto"],
    since: 1994,
    map: { x: 71.3, y: 90.9 },
  },
];

/** El Dos Puertas (rúa dos Fornos, 42,337 N · 7,864 O) en el mismo mapa: a donde van los caminos. */
export const DOS_PUERTAS_ON_MAP = { x: 55.9, y: 72.1 } as const;
