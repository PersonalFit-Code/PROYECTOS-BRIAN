/**
 * Los 14 alérgenos de declaración obligatoria en la UE (Reglamento 1169/2011).
 * `code` es la abreviatura que se muestra en la leyenda; `icon` referencia un icono de lucide-react
 * resuelto en la capa de UI (components/carta/AllergenIcon.tsx).
 */
export type AllergenId =
  | "gluten"
  | "crustaceos"
  | "huevos"
  | "pescado"
  | "cacahuetes"
  | "soja"
  | "lacteos"
  | "frutos-cascara"
  | "apio"
  | "mostaza"
  | "sesamo"
  | "sulfitos"
  | "altramuces"
  | "moluscos";

export interface Allergen {
  id: AllergenId;
  label: string;
  code: string;
  description: string;
  /** nombre de icono lucide-react */
  icon:
    | "Wheat"
    | "Shell"
    | "Egg"
    | "Fish"
    | "Nut"
    | "Bean"
    | "Milk"
    | "TreeDeciduous"
    | "Leaf"
    | "Flame"
    | "CircleDot"
    | "Wine"
    | "Sprout"
    | "Snail";
  /** color de acento para el badge (hex) */
  color: string;
}

export const ALLERGENS: Allergen[] = [
  { id: "gluten", label: "Gluten", code: "GL", description: "Cereales con gluten: trigo, centeno, cebada, avena, espelta.", icon: "Wheat", color: "#E0B04A" },
  { id: "crustaceos", label: "Crustáceos", code: "CR", description: "Gambas, langostinos, nécoras, centollo y derivados.", icon: "Shell", color: "#E8663D" },
  { id: "huevos", label: "Huevos", code: "HU", description: "Huevo y productos a base de huevo.", icon: "Egg", color: "#F2D66B" },
  { id: "pescado", label: "Pescado", code: "PE", description: "Pescado y productos a base de pescado.", icon: "Fish", color: "#4FA3D9" },
  { id: "cacahuetes", label: "Cacahuetes", code: "CA", description: "Cacahuetes y productos a base de cacahuetes.", icon: "Nut", color: "#C98A4B" },
  { id: "soja", label: "Soja", code: "SO", description: "Soja y productos a base de soja.", icon: "Bean", color: "#9BC53D" },
  { id: "lacteos", label: "Lácteos", code: "LA", description: "Leche y derivados, incluida la lactosa.", icon: "Milk", color: "#F1EDE4" },
  { id: "frutos-cascara", label: "Frutos de cáscara", code: "FC", description: "Almendras, avellanas, nueces, anacardos, pistachos…", icon: "TreeDeciduous", color: "#A4713F" },
  { id: "apio", label: "Apio", code: "AP", description: "Apio y productos derivados.", icon: "Leaf", color: "#7CC47F" },
  { id: "mostaza", label: "Mostaza", code: "MO", description: "Mostaza y productos derivados.", icon: "Flame", color: "#D9B23A" },
  { id: "sesamo", label: "Sésamo", code: "SE", description: "Granos de sésamo y productos a base de sésamo.", icon: "CircleDot", color: "#D8C7A0" },
  { id: "sulfitos", label: "Sulfitos", code: "SU", description: "Dióxido de azufre y sulfitos (> 10 mg/kg). Presente en vinos y encurtidos.", icon: "Wine", color: "#B21E27" },
  { id: "altramuces", label: "Altramuces", code: "AL", description: "Altramuces y productos a base de altramuces.", icon: "Sprout", color: "#E6D35A" },
  { id: "moluscos", label: "Moluscos", code: "ML", description: "Pulpo, calamar, zamburiñas, mejillones, almejas…", icon: "Snail", color: "#8E6BC1" },
];

export const ALLERGEN_MAP: Record<AllergenId, Allergen> = Object.fromEntries(
  ALLERGENS.map((a) => [a.id, a]),
) as Record<AllergenId, Allergen>;
