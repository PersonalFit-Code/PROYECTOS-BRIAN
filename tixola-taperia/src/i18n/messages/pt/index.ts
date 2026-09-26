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
 * Mensagens em português europeu (pt-PT). Cada secção é uma tradução completa da sua
 * homóloga espanhola (cada ficheiro `satisfies Translation<typeof esSection>`, ver ./shape.ts),
 * pelo que nada cai para o espanhol. A conversão é necessária apenas porque as fontes
 * espanholas são `as const` e `DeepPartial<Messages>` transporta por isso tipos literais.
 */
const pt = { common, nav, hero, dishes, experience, social, footer, carta, chat, legal, scroll };
export default pt as DeepPartial<Messages>;
