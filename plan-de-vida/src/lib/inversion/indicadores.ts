/** Indicadores técnicos simples y explicables sobre cierres diarios (ordenados de antiguo a reciente). */

export interface Cierre {
  day: string;
  close: number;
}

export interface Indicadores {
  ultimo: number;
  dia: string;
  sma50: number | null;
  sma200: number | null;
  /** caída desde el máximo de 1 año, en % (positivo = está por debajo del máximo) */
  drawdown: number;
  /** rentabilidad de los últimos ~3 meses (63 sesiones) y ~1 mes (21), en % */
  mom3m: number | null;
  mom1m: number | null;
}

function media(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

export function indicadores(serie: Cierre[]): Indicadores | null {
  if (!serie.length) return null;
  const c = serie.map((s) => s.close);
  const ultimo = c[c.length - 1];
  const ultimoAno = c.slice(-252);
  const maximo = Math.max(...ultimoAno);
  const ret = (k: number) => (c.length > k ? (100 * (ultimo - c[c.length - 1 - k])) / c[c.length - 1 - k] : null);
  return {
    ultimo,
    dia: serie[serie.length - 1].day,
    sma50: c.length >= 50 ? media(c.slice(-50)) : null,
    sma200: c.length >= 200 ? media(c.slice(-200)) : null,
    drawdown: maximo > 0 ? (100 * (maximo - ultimo)) / maximo : 0,
    mom3m: ret(63),
    mom1m: ret(21),
  };
}

/** Cierre en una fecha o el último anterior (fines de semana y festivos). */
export function cierreEn(serie: Cierre[], dia: string): Cierre | null {
  let hallado: Cierre | null = null;
  for (const s of serie) {
    if (s.day > dia) break;
    hallado = s;
  }
  return hallado;
}
