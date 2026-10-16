import type { Messages } from "@/i18n/types";

/**
 * Tipo das traducións ao galego, espazo de nomes a espazo de nomes.
 *
 * POR QUE NON VALE `DeepPartial<Messages>` TAL CAL: os ficheiros de `messages/es/` levan `as const`,
 * así que `typeof es` garda cada frase como TIPO LITERAL ("Uñas y belleza en Ourense"), e o
 * `DeepPartial` de `types.ts` conserva eses literais: calquera texto en galego daría erro de tipos.
 * Aquí os literais ensánchanse a `string` e mantense o resto da forma:
 *   - as claves son as do castelán (unha clave que non exista alí é un erro);
 *   - os obxectos son parciais (o que falte cae ao castelán polo `deepMerge`);
 *   - as listas van COMPLETAS e coa mesma lonxitude, porque o `deepMerge` substitúe as listas
 *     enteiras: unha lista a medias deixaría a web sen elementos.
 *
 * `legal` non o precisa: os seus tipos xa son `string` (interface `LegalMessages`) e ensanchalos
 * perdería os discriminantes dos bloques (`type: "p"`, `"dl"`…). Ese ficheiro usa `DeepPartial`.
 */
type Ancho<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? { readonly [I in keyof T]: Ancho<T[I]> }
    : T extends object
      ? { readonly [K in keyof T]: Ancho<T[K]> }
      : T;

type Parcial<T> = T extends string
  ? string
  : T extends readonly unknown[]
    ? Ancho<T>
    : T extends object
      ? { readonly [K in keyof T]?: Parcial<T[K]> }
      : T;

export type Traducion<K extends keyof Messages> = Parcial<Messages[K]>;
