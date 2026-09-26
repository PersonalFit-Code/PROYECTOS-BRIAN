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
 * English messages. Every section is a complete translation of its Spanish counterpart
 * (each file `satisfies Translation<typeof esSection>`, see ./shape.ts), so nothing falls
 * back to Spanish. The cast is needed only because the Spanish sources are `as const` and
 * `DeepPartial<Messages>` therefore carries literal string types.
 */
const en = { common, nav, hero, dishes, experience, social, footer, carta, chat, legal, scroll };
export default en as DeepPartial<Messages>;
