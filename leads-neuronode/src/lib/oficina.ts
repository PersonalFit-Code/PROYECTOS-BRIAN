/** Los cinco puestos de la oficina. Las claves coinciden con el `check` de la tabla `actividad`. */

export const PUESTOS = ["captacion", "diagnostico", "guion", "oferta", "diseno"] as const;
export type Puesto = (typeof PUESTOS)[number];

export interface FichaPuesto {
  nombre: string;
  cargo: string;
  hace: string;
  /** Colores del personaje: camiseta, pelo y piel. */
  camiseta: string;
  pelo: string;
  piel: string;
  peinado: "corto" | "melena" | "mono" | "rizo" | "gorra";
}

export const PUESTO: Record<Puesto, FichaPuesto> = {
  captacion: { nombre: "Leo", cargo: "Captación", hace: "Busca negocios en las cuatro comunidades y los guarda sin repetir.", camiseta: "#2e8bff", pelo: "#3b2a20", piel: "#f1c9a5", peinado: "corto" },
  diagnostico: { nombre: "Dora", cargo: "Diagnóstico", hace: "Mira la web y las redes de cada negocio y apunta qué le falla, con su prueba.", camiseta: "#178a62", pelo: "#1d1a2b", piel: "#e2b08a", peinado: "melena" },
  guion: { nombre: "Gus", cargo: "Guion", hace: "Prepara qué decir en la llamada a cada negocio, con tu forma de hablar.", camiseta: "#6447fa", pelo: "#a8552a", piel: "#f4d3b5", peinado: "rizo" },
  oferta: { nombre: "Olga", cargo: "Oferta", hace: "Escribe la propuesta para los negocios que dicen que les interesa.", camiseta: "#c2283b", pelo: "#d9a441", piel: "#eec3a0", peinado: "mono" },
  diseno: { nombre: "Dani", cargo: "Diseño", hace: "Monta la propuesta visual: lo que hemos visto y lo que les montaríamos.", camiseta: "#9a5208", pelo: "#15131f", piel: "#c98f66", peinado: "gorra" },
};

export interface EstadoPuesto {
  /** Con trabajo pendiente: el personaje teclea. Si no, espera. */
  activo: boolean;
  /** Frase corta del bocadillo. */
  frase: string;
  hechos: number;
  total: number;
  /** Texto de la cifra: «300 de 1.000 negocios». */
  cifra: string;
}

export const esPuesto = (v: string | undefined): v is Puesto => PUESTOS.includes(v as Puesto);
