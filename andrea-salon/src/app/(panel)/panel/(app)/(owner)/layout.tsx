import type { ReactNode } from "react";
import { requireOwner } from "@/lib/panel/sesion";

/**
 * Secciones solo de la dueña (servicios, equipo, configuración y, en la fase 3, analítica y
 * exportar). Además de esta comprobación, RLS en la base de datos impide a una empleada leer cobros
 * ajenos o métricas por empleada aunque llegara a la consulta por otro camino.
 */
export default async function OwnerLayout({ children }: { children: ReactNode }) {
  await requireOwner();
  return children;
}
