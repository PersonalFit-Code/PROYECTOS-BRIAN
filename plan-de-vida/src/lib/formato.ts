const euro = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", useGrouping: "always" });
const euroSinDecimales = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0, useGrouping: "always" });

export function euros(n: number | string | null | undefined, decimales = true): string {
  const v = Number(n ?? 0);
  return (decimales ? euro : euroSinDecimales).format(v);
}

export function pct(n: number | null | undefined, decimales = 0): string {
  if (n == null || Number.isNaN(n)) return "—";
  return `${n.toFixed(decimales).replace(".", ",")} %`;
}

export function signo(n: number, decimales = 1): string {
  return `${n > 0 ? "+" : ""}${n.toFixed(decimales).replace(".", ",")} %`;
}

/** Une clases condicionales sin dependencias: cx("a", cond && "b"). */
export function cx(...clases: (string | false | null | undefined)[]): string {
  return clases.filter(Boolean).join(" ");
}
