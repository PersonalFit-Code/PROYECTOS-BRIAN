/**
 * Ajudante de tipos local às mensagens em português.
 *
 * As secções em espanhol são declaradas `as const`, pelo que as suas folhas são *literais*
 * ("Reservar Mesa") e `DeepPartial<Messages>` rejeitaria qualquer texto traduzido.
 * `Translation<T>` mantém a forma exata de uma secção espanhola — todas as chaves obrigatórias,
 * sem chaves a mais, tuplos com o mesmo comprimento — mas alarga cada literal a `string`, para
 * que cada secção portuguesa possa `satisfies Translation<typeof esSection>` e `index.ts`
 * entregue o objeto combinado ao carregador como `DeepPartial<Messages>`.
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
