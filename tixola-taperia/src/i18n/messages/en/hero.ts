import type esHero from "@/i18n/messages/es/hero";
import type { Translation } from "./shape";

/**
 * Cover (hero). The headline lines are declared by hand so the editorial composition
 * (max. 3 lines, accented word in italics) is identical in every language.
 */
const TITLE_LINES: readonly string[] = ["The Art of Tapas", "in the Heart", "of Ourense"];

const hero = {
  kicker: "Tapas Bar · Wine Bar · Ourense",
  /** Full headline (metadata, screen readers). */
  title: "The Art of Tapas in the Heart of Ourense",
  /** Headline split into cover lines (max. 3). */
  titleLines: TITLE_LINES,
  /** Word of the headline highlighted in italics with the ember gradient. */
  accent: "Heart",
  subtitle:
    "Iron skillets that reach the table still sizzling, homemade croquetas, octopus from the Galician rías and sharing plates to enjoy with a good local wine, one minute from the Cathedral.",
  ctaPrimary: "Book a Table",
  ctaSecondary: "See the Menu",
  scrollCue: "Discover the house",
  scrollCueAria: "Scroll down to the signature dishes",
  enable3d: "Enable 3D",
  enable3dAria: "Enable the 3D effect using your phone's gyroscope",
  since: "Ourense old town",
  /** Discreet link under the CTAs: "4.4 · 858 reviews on Google". */
  reviewsLink: "Read our reviews on Google",
} satisfies Translation<typeof esHero>;
export default hero;
