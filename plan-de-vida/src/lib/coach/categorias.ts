import type { Category, TxKind } from "@/lib/tipos";

/** Palabras que delatan la categoría de un gasto dicho en lenguaje natural ("12 € de gasolina"). */
const PISTAS: [RegExp, string][] = [
  [/super|mercadona|lidl|carrefour|dia\b|alcampo|eroski|gadis|compra|fruta|comida/i, "Comida"],
  [/restaurante|cena|comida fuera|bar\b|caf[eé]|caña|tapas|men[uú]|pizza|burger|glovo|just eat|uber eats/i, "Restaurantes"],
  [/gasolina|gasoil|di[eé]sel|tren|renfe|bus|autob[uú]s|uber|cabify|taxi|parking|peaje|metro|coche|taller|itv/i, "Transporte"],
  [/netflix|spotify|hbo|max\b|disney|prime|icloud|youtube|chatgpt|claude|suscripci/i, "Suscripciones"],
  [/farmacia|m[eé]dico|dentista|fisio|psic[oó]log|seguro m[eé]dico/i, "Salud"],
  [/ropa|zapatillas|camiseta|pantal[oó]n|zara|primark|nike/i, "Ropa"],
  [/curso|libro|formaci[oó]n|udemy|m[aá]ster|clase/i, "Formación"],
  [/alquiler|hipoteca|luz|agua|gas natural|internet|fibra|comunidad|mueble|ikea/i, "Casa"],
  [/cine|concierto|entrada|viaje|hotel|vuelo|ocio|fiesta|copas/i, "Ocio"],
  [/cliente|factura|herramienta|dominio|hosting|vercel|software|publicidad|anuncio/i, "Negocio"],
];

/** Busca la categoría por nombre exacto, luego por parecido y por último por pistas del texto. */
export function encontrarCategoria(categorias: Category[], kind: TxKind, nombre?: string | null, texto?: string | null): Category | null {
  const lista = categorias.filter((c) => c.kind === kind);
  const norm = (s: string) => s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase().trim();
  if (nombre) {
    const n = norm(nombre);
    const exacta = lista.find((c) => norm(c.name) === n);
    if (exacta) return exacta;
    const parecida = lista.find((c) => norm(c.name).includes(n) || n.includes(norm(c.name)));
    if (parecida) return parecida;
  }
  const fuente = `${nombre ?? ""} ${texto ?? ""}`;
  if (kind === "gasto") {
    for (const [re, cat] of PISTAS) {
      if (re.test(fuente)) {
        const c = lista.find((x) => x.name === cat);
        if (c) return c;
      }
    }
    return lista.find((c) => c.name === "Otros") ?? null;
  }
  return lista[0] ?? null;
}

/** Primer importe de un texto: "12", "12,50 €", "1.234,50 euros". */
export function interpretarImporte(texto: string): number | null {
  const m = texto.match(/(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?|\d+(?:[.,]\d{1,2})?)\s*(?:€|eur|euros?)?/i);
  if (!m) return null;
  let v = m[1];
  // "1.234,50" → 1234.50 ; "12,5" → 12.5 ; "12.50" → 12.50
  if (/\d\.\d{3}(,|$)/.test(v)) v = v.replace(/\./g, "");
  v = v.replace(",", ".");
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}
