import type es from "./messages/es";

/** Forma completa de los mensajes (la fuente de verdad es el español). */
export type Messages = typeof es;

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly (infer U)[]
    ? readonly U[] | U[]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

/** Mezcla profunda: los idiomas secundarios pueden ser parciales y caen al español. */
export function deepMerge<T>(base: T, override: DeepPartial<T> | undefined): T {
  if (!override) return base;
  if (Array.isArray(base)) return (override as unknown as T) ?? base;
  if (typeof base !== "object" || base === null) return (override as T) ?? base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
    if (v === undefined) continue;
    const b = (base as Record<string, unknown>)[k];
    out[k] = typeof b === "object" && b !== null && !Array.isArray(b) && typeof v === "object" && v !== null && !Array.isArray(v)
      ? deepMerge(b, v as DeepPartial<typeof b>)
      : v;
  }
  return out as T;
}
