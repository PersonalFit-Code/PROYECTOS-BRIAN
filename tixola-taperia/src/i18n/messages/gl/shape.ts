import type { Messages } from "@/i18n/types";

/**
 * Forma "ensanchada" dunha sección das mensaxes.
 *
 * As seccións de es/ declaranse `as const`, polo que `Messages` fixa cada texto ao seu literal en
 * castelán e ningunha tradución sería asignable. `Widen<T>` conserva exactamente as mesmas claves,
 * a mesma anidación e os mesmos arrays, pero substitúe cada literal por `string`.
 * Todas as claves son OBRIGATORIAS: se falta unha ou está mal escrita, `tsc` avisa.
 */
export type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : T extends object
      ? { readonly [K in keyof T]: Widen<T[K]> }
      : T;

/** Forma completa (ensanchada) da sección `K` das mensaxes: `Section<"common">`, `Section<"nav">`… */
export type Section<K extends keyof Messages> = Widen<Messages[K]>;
