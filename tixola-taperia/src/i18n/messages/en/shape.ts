/**
 * Type helper local to the English messages.
 *
 * The Spanish sections are declared `as const`, so their leaves are string *literals*
 * ("Reservar Mesa") and `DeepPartial<Messages>` would reject any translated string.
 * `Translation<T>` keeps the exact shape of a Spanish section — every key required, no extra
 * keys, tuples keep their length — but widens every literal to `string`, so each English
 * section can `satisfies Translation<typeof esSection>` and `index.ts` hands the merged object
 * to the loader as `DeepPartial<Messages>`.
 */
export type Translation<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends object
        ? { readonly [K in keyof T]: Translation<T[K]> }
        : T;
