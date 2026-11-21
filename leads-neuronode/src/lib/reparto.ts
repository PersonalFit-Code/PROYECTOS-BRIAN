import { DIAS_RETO, POR_DIA, type Sector } from "@/lib/tipos";

export interface SinDia {
  id: string;
  sector: Sector;
  comunidad: string;
}

/** El fitness va primero: es donde tenemos el caso más fuerte. */
const PRIORIDAD: Record<Sector, number> = { fitness: 0, clinica: 1, hosteleria: 2, infoproducto: 3, otro: 4 };

/**
 * Reparte los negocios sin día en los huecos libres de cada día (100 por día).
 * Dentro de cada sector se van alternando las comunidades, para que ningún día sea de una sola zona.
 * `ocupados[d]` es cuántos negocios tiene ya el día d (índice 1 a 10).
 */
export function repartir(negocios: SinDia[], ocupados: Record<number, number>): Map<number, string[]> {
  const cola: SinDia[] = [];
  for (const sector of Object.keys(PRIORIDAD).sort((a, b) => PRIORIDAD[a as Sector] - PRIORIDAD[b as Sector]) as Sector[]) {
    const porComunidad = new Map<string, SinDia[]>();
    for (const n of negocios.filter((x) => x.sector === sector)) {
      porComunidad.set(n.comunidad, [...(porComunidad.get(n.comunidad) ?? []), n]);
    }
    const listas = [...porComunidad.values()];
    for (let i = 0; listas.some((l) => i < l.length); i++) {
      for (const l of listas) if (i < l.length) cola.push(l[i]);
    }
  }

  const reparto = new Map<number, string[]>();
  let dia = 1;
  for (const n of cola) {
    while (dia <= DIAS_RETO && (ocupados[dia] ?? 0) + (reparto.get(dia)?.length ?? 0) >= POR_DIA) dia++;
    if (dia > DIAS_RETO) break;
    reparto.set(dia, [...(reparto.get(dia) ?? []), n.id]);
  }
  return reparto;
}
