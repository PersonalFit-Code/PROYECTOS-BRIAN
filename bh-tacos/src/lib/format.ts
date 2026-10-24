const eur = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" });

/** 9.99 → "9,99 €" */
export function formatPrice(value: number): string {
  return eur.format(value);
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
