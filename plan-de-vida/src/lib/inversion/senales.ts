/**
 * Motor de recomendaciones de inversión. Puro (sin red ni base de datos) para poder probarlo.
 *
 * Filosofía (perfil mixto): un NÚCLEO indexado a largo plazo que se alimenta con la aportación
 * mensual hacia el reparto objetivo, y un SATÉLITE pequeño que sigue la tendencia. Cada regla
 * ("señal") es pequeña y se puede explicar en una frase; el bucle de automejora (aprendizaje.ts)
 * ajusta cuánto se fía de cada una según sus aciertos y el feedback del usuario.
 */
import type { AssetClass, RecAction, Sleeve } from "@/lib/tipos";
import type { Indicadores } from "./indicadores";

export type Senal = "aportacion_mensual" | "caida_nucleo" | "tendencia_satelite" | "debilidad_satelite" | "sobreponderado" | "rentabilidad_liquidez";

export const NOMBRE_SENAL: Record<Senal, string> = {
  aportacion_mensual: "Aportación mensual al reparto objetivo",
  caida_nucleo: "Comprar caídas del núcleo",
  tendencia_satelite: "Tendencia alcista del satélite",
  debilidad_satelite: "Debilidad del satélite",
  sobreponderado: "Posición por encima de su peso",
  rentabilidad_liquidez: "Rentabilidad de la liquidez frente a la inflación",
};

/** Solo estas se pueden puntuar con precios (las de liquidez no cotizan). */
export const SENALES_EVALUABLES: Senal[] = ["aportacion_mensual", "caida_nucleo", "tendencia_satelite", "debilidad_satelite", "sobreponderado"];

export interface Activo {
  symbol: string;
  name: string;
  asset_class: AssetClass;
  sleeve: Sleeve;
  target_pct: number;
  quoted: boolean;
  yield_pct: number | null;
}

export interface Propuesta {
  symbol: string;
  action: RecAction;
  sleeve: Sleeve;
  signal: Senal;
  thesis: string;
  confidence: number;
  horizon_days: number;
  price_ref: number | null;
}

export interface EntradaMotor {
  activos: Activo[];
  indicadores: Map<string, Indicadores>;
  /** valor actual de la posición por símbolo (cuentas de patrimonio con ticker) */
  posiciones: Map<string, number>;
  aportacionMensual: number;
  inflacion: number;
  /** peso de cada señal según su historial (1 = neutro). Ver aprendizaje.ts */
  pesos: Partial<Record<Senal, number>>;
}

const f1 = (x: number) => x.toFixed(1).replace(".", ",");
const eur = (x: number) => `${Math.round(x).toLocaleString("es-ES")} €`;

function ajustarConfianza(base: number, peso: number | undefined): number {
  return Math.max(1, Math.min(5, Math.round(base * (peso ?? 1))));
}

/** Por debajo de este peso una señal se "silencia": baja a vigilar con confianza 1, pero se sigue midiendo. */
export const UMBRAL_SILENCIO = 0.6;

export function generarPropuestas(e: EntradaMotor): Propuesta[] {
  const out: Propuesta[] = [];
  const total = [...e.posiciones.values()].reduce((a, b) => a + b, 0);
  const pesoActual = (s: string) => (total > 0 ? (100 * (e.posiciones.get(s) ?? 0)) / total : 0);

  // 1 · Aportación mensual: reparte hacia los huecos respecto al objetivo (sin vender nada).
  const huecos = e.activos
    .filter((a) => a.target_pct > 0)
    .map((a) => ({ a, hueco: total > 0 ? Math.max(0, a.target_pct - pesoActual(a.symbol)) : a.target_pct }))
    .filter((h) => h.hueco > 0);
  if (e.aportacionMensual > 0 && huecos.length) {
    // los 3 huecos más grandes se reparten TODA la aportación, en proporción a su hueco
    const top = [...huecos].sort((x, y) => y.hueco - x.hueco).slice(0, 3);
    const sumaTop = top.reduce((acc, h) => acc + h.hueco, 0);
    const reparto = top.map((h) => ({ ...h, euros: (e.aportacionMensual * h.hueco) / sumaTop }));
    for (const r of reparto) {
      const ind = e.indicadores.get(r.a.symbol);
      out.push({
        symbol: r.a.symbol,
        action: "aportar",
        sleeve: r.a.sleeve,
        signal: "aportacion_mensual",
        thesis:
          total > 0
            ? `Está en ${f1(pesoActual(r.a.symbol))} % de tu cartera y su objetivo es ${f1(r.a.target_pct)} %. Destina unos ${eur(r.euros)} de la aportación de este mes.`
            : `Para construir tu reparto objetivo (${f1(r.a.target_pct)} %), destina unos ${eur(r.euros)} de la aportación de este mes.`,
        confidence: ajustarConfianza(4, e.pesos.aportacion_mensual),
        horizon_days: 90,
        price_ref: r.a.quoted ? (ind?.ultimo ?? null) : null,
      });
    }
  }

  for (const a of e.activos) {
    const ind = e.indicadores.get(a.symbol);

    const sobreponderado = total > 0 && a.target_pct > 0 && pesoActual(a.symbol) > a.target_pct + 5;

    // 2 · Caídas del núcleo de renta variable: oportunidad para el largo plazo (salvo que ya pese de más).
    if (a.quoted && ind && a.sleeve === "nucleo" && a.asset_class === "renta_variable" && ind.drawdown >= 10 && !sobreponderado) {
      out.push({
        symbol: a.symbol,
        action: "aportar",
        sleeve: a.sleeve,
        signal: "caida_nucleo",
        thesis: `Cotiza un ${f1(ind.drawdown)} % por debajo de su máximo del último año. Para el núcleo a largo plazo, las caídas son rebajas: si tienes liquidez de sobra, adelanta o amplía la aportación.`,
        confidence: ajustarConfianza(ind.drawdown >= 20 ? 4 : 3, e.pesos.caida_nucleo),
        horizon_days: 90,
        price_ref: ind.ultimo,
      });
    }

    // 3 y 4 · Satélite: seguir la tendencia (medias de 50 y 200 sesiones).
    if (a.quoted && ind && a.sleeve === "satelite" && ind.sma50 != null && ind.sma200 != null) {
      const alcista = ind.ultimo > ind.sma200 && ind.sma50 > ind.sma200 && (ind.mom3m ?? 0) > 0;
      const bajista = ind.ultimo < ind.sma200 && ind.sma50 < ind.sma200;
      if (alcista) {
        const infraponderado = total > 0 && pesoActual(a.symbol) < a.target_pct - 1;
        out.push({
          symbol: a.symbol,
          action: infraponderado ? "aportar" : "mantener",
          sleeve: a.sleeve,
          signal: "tendencia_satelite",
          thesis: `Tendencia alcista: precio sobre la media de 200 sesiones, media de 50 por encima de la de 200 y ${f1(ind.mom3m ?? 0)} % en 3 meses. ${infraponderado ? "Está por debajo de su peso: puedes completarlo." : "Mantén la posición."}`,
          confidence: ajustarConfianza(3, e.pesos.tendencia_satelite),
          horizon_days: 30,
          price_ref: ind.ultimo,
        });
      } else if (bajista) {
        out.push({
          symbol: a.symbol,
          action: "reducir",
          sleeve: a.sleeve,
          signal: "debilidad_satelite",
          thesis: `Tendencia bajista: precio y media de 50 por debajo de la media de 200 sesiones (${f1(ind.mom3m ?? 0)} % en 3 meses). Pausa las aportaciones a esta posición o reduce peso y pásalo al núcleo.`,
          confidence: ajustarConfianza(3, e.pesos.debilidad_satelite),
          horizon_days: 30,
          price_ref: ind.ultimo,
        });
      }
    }

    // 5 · Sobreponderado: más de 5 puntos por encima de su objetivo.
    if (sobreponderado) {
      out.push({
        symbol: a.symbol,
        action: "reducir",
        sleeve: a.sleeve,
        signal: "sobreponderado",
        thesis: `Pesa un ${f1(pesoActual(a.symbol))} % frente a un objetivo de ${f1(a.target_pct)} %. Deja de aportarle hasta que el resto lo alcance (rebalancear con aportaciones evita vender y pagar impuestos).`,
        confidence: ajustarConfianza(3, e.pesos.sobreponderado),
        horizon_days: 90,
        price_ref: a.quoted ? (ind?.ultimo ?? null) : null,
      });
    }

    // 6 · Liquidez y renta fija sin cotización: ¿gana a la inflación?
    if (!a.quoted && a.yield_pct != null) {
      const real = a.yield_pct - e.inflacion;
      out.push({
        symbol: a.symbol,
        action: real < 0 ? "vigilar" : "mantener",
        sleeve: a.sleeve,
        signal: "rentabilidad_liquidez",
        thesis:
          real < 0
            ? `Rinde un ${f1(a.yield_pct)} % con la inflación en ${f1(e.inflacion)} %: pierdes ${f1(-real)} % de poder adquisitivo al año. Compara con Letras del Tesoro, depósitos o un fondo monetario.`
            : `Rinde un ${f1(a.yield_pct)} %, ${f1(real)} puntos por encima de la inflación. Bien para el colchón; lo que pase de 6 meses de gastos, al núcleo.`,
        confidence: 2,
        horizon_days: 30,
        price_ref: null,
      });
    }
  }

  // Señales que el historial ha "suspendido": se mantienen como vigilar para seguir midiéndolas.
  return out.map((p) => {
    const peso = e.pesos[p.signal];
    if (peso != null && peso < UMBRAL_SILENCIO && p.action !== "vigilar") {
      return { ...p, action: "vigilar" as const, confidence: 1, thesis: `${p.thesis} (Señal en observación: su historial de aciertos es flojo.)` };
    }
    return p;
  });
}
