import type { Messages } from "@/i18n/types";

/**
 * Forma "ensanchada" dunha sección das mensaxes.
 *
 * As seccións de es/ declaranse `as const`, polo que `Messages` fixa cada texto ao seu literal en
 * castelán e ningunha tradución sería asignable. `Widen<T>` conserva exactamente as mesmas claves,
 * a mesma anidación e a mesma LONXITUDE das listas, pero substitúe cada literal por `string`.
 * Todas as claves son OBRIGATORIAS: se falta unha ou está mal escrita, `tsc` avisa.
 *
 * Antes había aquí unha rama `T extends readonly (infer U)[] ? readonly Widen<U>[]` que convertía
 * as tuplas de es/ nun array sen lonxitude fixa. O resultado: o galego era o ÚNICO idioma no que
 * engadir ou quitar un elemento dunha lista compilaba limpo — inglés e portugués usan
 * `Translation<T>` (en/shape.ts), que non ten esa rama e si esixe a lonxitude. E como as listas
 * (`chat.quickReplies`, `experience.marquee`, `chat.offline.fallbackItems`…) empréganse POR
 * POSICIÓN, un descadre alí cambiaba os textos de sitio sen un só erro. Ao quitala, o galego pasa
 * a estar tan vixiado coma os outros dous.
 */
export type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends object
        ? { readonly [K in keyof T]: Widen<T[K]> }
        : T;

/** Forma completa (ensanchada) da sección `K` das mensaxes: `Section<"common">`, `Section<"nav">`… */
export type Section<K extends keyof Messages> = Widen<Messages[K]>;
