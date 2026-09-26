import type { DeepPartial, Messages } from "@/i18n/types";
import common from "./common";
import nav from "./nav";
import hero from "./hero";
import dishes from "./dishes";
import experience from "./experience";
import social from "./social";
import footer from "./footer";
import carta from "./carta";
import chat from "./chat";
import legal from "./legal";
import scroll from "./scroll";

/**
 * Mensaxes en galego (normativa RAG/ILG). Cada sección é unha tradución completa da súa
 * homóloga en castelán (cada ficheiro tipa como `Section<"…">`, ver ./shape.ts), así que
 * ningunha clave cae ao español. O cast é necesario só porque as fontes en castelán se
 * declaran `as const` e `DeepPartial<Messages>` arrastra por iso tipos literais.
 */
const gl = { common, nav, hero, dishes, experience, social, footer, carta, chat, legal, scroll };
export default gl as DeepPartial<Messages>;
