import "server-only";

import { euros } from "@/lib/formato";
import type { Sesion } from "@/lib/sesion";
import { interpretarImporte } from "./categorias";
import { ejecutarHerramienta, type Efectos } from "./herramientas";

/**
 * Coach SIN IA (no hay ANTHROPIC_API_KEY o la API ha fallado). Entiende lo básico para que apuntar
 * cosas hablando funcione igual: gastos, ingresos, hábitos hechos y "¿cuánto he gastado?".
 */

/** "en efectivo", "en mano", "en metálico", "cash": si no lo dice, se entiende tarjeta. */
const EFECTIVO = /\s*,?\s*\b(?:(?:en|con|pagado en|pagué en)\s+)?(?:efectivo|metálico|metalico|cash|en mano)(?![\p{L}])/iu;

export async function responderSinIA(s: Sesion, mensaje: string, efectos: Efectos): Promise<string> {
  const crudo = mensaje.trim();
  const metodo = EFECTIVO.test(crudo) ? "efectivo" : "tarjeta";
  const t = crudo.replace(EFECTIVO, "").trim();

  // Gasto: "gasté 12 € en gasolina", "he pagado 30 de cena", "12€ super"
  const gasto = t.match(/^(?:hoy\s+)?(?:me\s+he\s+gastado|he\s+gastado|gast[eé]|he\s+pagado|pagu[eé]|compr[eé])\s+(.+)$/i) ?? t.match(/^(\d[\d.,]*\s*(?:€|euros?)\s+.+)$/i);
  if (gasto) {
    const importe = interpretarImporte(gasto[1]);
    if (importe) {
      const nota = gasto[1].replace(/^.*?\d[\d.,]*\s*(?:€|eur|euros?)?\s*(?:en|de|del|para)?\s*/i, "").trim();
      const r = (await ejecutarHerramienta(s, "registrar_movimiento", { importe, tipo: "gasto", nota: nota || undefined, metodo }, efectos)) as { ok?: boolean; categoria?: string; error?: string };
      return r.ok ? `Apuntado: ${euros(importe)}${r.categoria ? ` en ${r.categoria}` : ""}${nota ? ` (${nota})` : ""}, ${metodo === "efectivo" ? "en efectivo" : "con tarjeta"}. Cada euro con nombre.` : `No he podido apuntarlo: ${r.error}`;
    }
  }

  // Ingreso: "cobré 1500 de un cliente", "me han pagado 300"
  const ingreso = t.match(/^(?:cobr[eé]|he\s+cobrado|ingres[eé]|me\s+han\s+pagado|me\s+ha\s+entrado)\s+(.+)$/i);
  if (ingreso) {
    const importe = interpretarImporte(ingreso[1]);
    if (importe) {
      const nota = ingreso[1].replace(/^.*?\d[\d.,]*\s*(?:€|eur|euros?)?\s*(?:de|del|por)?\s*/i, "").trim();
      const r = (await ejecutarHerramienta(s, "registrar_movimiento", { importe, tipo: "ingreso", nota: nota || undefined, metodo }, efectos)) as { ok?: boolean; error?: string };
      return r.ok ? `Ingreso apuntado: ${euros(importe)}. Bien hecho, ahora decide a qué hucha va una parte.` : `No he podido apuntarlo: ${r.error}`;
    }
  }

  // Hábito: "hecho: gimnasio", "he hecho meditar", "ya he leído"
  const habito = t.match(/^(?:hecho|hecha|completado|he\s+hecho|ya\s+he\s+hecho|hice)[:\s]+(.+)$/i);
  if (habito) {
    const r = (await ejecutarHerramienta(s, "marcar_habito", { habito: habito[1].replace(/[.!]+$/, "") }, efectos)) as { ok?: boolean; habito?: string; error?: string; habitos?: string[] };
    if (r.ok) return `${r.habito} marcado. Una casilla más: así se construye la identidad.`;
    return `${r.error}.${r.habitos?.length ? ` Tus hábitos: ${r.habitos.join(", ")}.` : ""}`;
  }

  // Consulta de gasto
  if (/cu[aá]nto.*(gast|llevo)/i.test(t)) {
    const r = (await ejecutarHerramienta(s, "resumen_finanzas", {}, efectos)) as { gastos: number; ingresos: number; por_categoria: { categoria: string; gastado: number }[] };
    const top = r.por_categoria.slice(0, 3).map((c) => `${c.categoria} ${euros(c.gastado)}`).join(", ");
    return `Este mes llevas ${euros(r.gastos)} gastados e ${euros(r.ingresos)} ingresados.${top ? ` Donde más: ${top}.` : ""}`;
  }

  return (
    "Ahora mismo funciono en modo básico (sin IA). Puedo:\n" +
    "· Apuntar gastos: «gasté 12 € en gasolina»\n" +
    "· Apuntar ingresos: «cobré 800 de un cliente»\n" +
    "· Marcar hábitos: «hecho: gimnasio»\n" +
    "· Decirte cuánto llevas gastado: «¿cuánto he gastado este mes?»\n\n" +
    "Para conversar de verdad, analizar y hacer revisiones conmigo, añade ANTHROPIC_API_KEY en Vercel."
  );
}
