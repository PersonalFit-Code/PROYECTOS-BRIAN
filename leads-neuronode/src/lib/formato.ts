/** Junta clases, saltando las vacías. */
export function cx(...partes: (string | false | null | undefined)[]): string {
  return partes.filter(Boolean).join(" ");
}

/** Teléfono español legible: 988123456 → 988 12 34 56. */
export function telefonoBonito(t: string | null): string {
  if (!t) return "";
  const d = t.replace(/\D/g, "");
  if (d.length !== 9) return t;
  return `${d.slice(0, 3)} ${d.slice(3, 5)} ${d.slice(5, 7)} ${d.slice(7)}`;
}

/** Quita el protocolo y la barra final para enseñar una web: https://www.x.es/ → x.es */
export function webCorta(u: string | null): string {
  if (!u) return "";
  return u.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

/** Solo deja pasar enlaces http(s): lo que venga de un CSV no puede acabar en un `javascript:`. */
export function enlaceSeguro(u: string | null): string | null {
  if (!u) return null;
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:" ? url.toString() : null;
  } catch {
    return null;
  }
}

const FECHA = new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Madrid" });
export function fechaHora(iso: string): string {
  return FECHA.format(new Date(iso));
}

/** Texto sin tildes, en minúsculas y sin signos: para comparar nombres y evitar duplicados. */
export function normalizar(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
