import type { DeepPartial, Messages } from "@/i18n/types";

/**
 * Mensaxes en galego (normativa RAG/ILG). AÍNDA BALEIRO A PROPÓSITO: o galego actívase na fase 3,
 * cando a tradución estea completa. Mentres tanto, calquera clave que falte cae ao castelán polo
 * `deepMerge` de `getMessages`, así que se pode traducir por espazos de nomes (un ficheiro por
 * sección, como en `messages/es/`) sen romper o build. Para publicalo: engadir `"gl"` a `LOCALES`
 * en `src/i18n/config.ts`.
 */
const gl: DeepPartial<Messages> = {};
export default gl;
