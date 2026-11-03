import { CATEGORIAS, SERIES, type Serie } from "@/data/catalogo";

export interface ItemMenu {
  nombre: string;
  href: string;
  hijos?: { nombre: string; href: string; lema?: string }[];
}

const seriesDeMaquinas: Serie[] = ["elite", "pro", "prelude"];

/** El menú refleja el catálogo: cada categoría con su página y las series dentro de Máquinas. */
export const MENU: ItemMenu[] = CATEGORIAS.map((c) => ({
  nombre: c.nombre,
  href: `/categoria/${c.slug}`,
  hijos:
    c.slug === "maquinas"
      ? seriesDeMaquinas.map((s) => ({ nombre: SERIES[s].nombre, href: `/categoria/maquinas?serie=${s}`, lema: SERIES[s].lema }))
      : undefined,
}));
