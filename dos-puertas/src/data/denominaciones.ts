/**
 * Las cinco denominaciones de origen de Galicia (datos generales de cada consejo regulador).
 * No es la carta de vinos del Dos Puertas: esa está PENDIENTE de confirmar con la casa.
 */
export const DO_IDS = ["ribeiro", "ribeira-sacra", "valdeorras", "monterrei", "rias-baixas"] as const;
export type DoId = (typeof DO_IDS)[number];

export interface Denominacion {
  id: DoId;
  /** Tiene viñedo en la provincia de Ourense. */
  ourense: boolean;
  blancas: readonly string[];
  tintas: readonly string[];
}

export const DENOMINACIONES: readonly Denominacion[] = [
  { id: "ribeiro", ourense: true, blancas: ["Treixadura", "Godello", "Albariño", "Loureira", "Torrontés"], tintas: ["Caíño", "Sousón", "Brancellao"] },
  { id: "ribeira-sacra", ourense: true, blancas: ["Godello"], tintas: ["Mencía", "Brancellao", "Merenzao"] },
  { id: "valdeorras", ourense: true, blancas: ["Godello"], tintas: ["Mencía"] },
  { id: "monterrei", ourense: true, blancas: ["Godello", "Treixadura", "Doña Branca"], tintas: ["Mencía", "Merenzao"] },
  { id: "rias-baixas", ourense: false, blancas: ["Albariño"], tintas: [] },
];
