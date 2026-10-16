import type { DeepPartial, Messages } from "@/i18n/types";
import common from "./common";
import nav from "./nav";
import home from "./home";
import servicios from "./servicios";
import equipo from "./equipo";
import galeria from "./galeria";
import resenas from "./resenas";
import contacto from "./contacto";
import bonos from "./bonos";
import legal from "./legal";
import consent from "./consent";
import notFound from "./notFound";
import reservar from "./reservar";

/**
 * Mensaxes en galego (normativa RAG/ILG), un ficheiro por espazo de nomes como en `messages/es/`.
 * Voz do salón: de ti, próxima. O castelán segue sendo a fonte de verdade: calquera clave que falte
 * aquí (por exemplo, unha frase nova engadida só en castelán) cae ao castelán polo `deepMerge` de
 * `getMessages`, así que o build non rompe nunca por unha tradución atrasada.
 *
 * Os tipos compróbanse en cada ficheiro con `Traducion<…>` (ver `./traducion.ts`): mesmas claves e
 * mesmas listas que o castelán, pero con `string` en vez dos literais do `as const`. Por iso a
 * exportación leva un `as`: o `DeepPartial<Messages>` de `types.ts` aínda conserva eses literais e
 * non aceptaría ningún texto distinto do castelán.
 *
 * Que NON se traduce: claves, marcadores `{así}`, URL, `slug` legais (forman a URL), nomes propios,
 * marca («Andrea Salón») e teléfonos. Para publicalo: engadir `"gl"` a `LOCALES` en
 * `src/i18n/config.ts`.
 */
const gl = { common, nav, home, servicios, equipo, galeria, resenas, contacto, bonos, legal, consent, notFound, reservar };

export default gl as DeepPartial<Messages>;
