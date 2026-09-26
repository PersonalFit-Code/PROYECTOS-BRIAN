import type esScroll from "@/i18n/messages/es/scroll";
import type { Translation } from "./shape";

/**
 * Cinematic scroll module copy: side chapter navigation, progress bar and
 * accessibility of the jumps between sections.
 */
const scroll = {
  /** Chapter labels (by section id: hero, platos, experiencia, opiniones, footer) */
  chapters: {
    hero: "Home",
    dishes: "Dishes",
    experience: "Find us",
    social: "Reviews",
    footer: "Contact",
  },
  nav: {
    /** aria-label of the side <nav> with the dots */
    label: "Page chapters",
    /** aria-label of each dot */
    goTo: "Go to the {chapter} chapter",
    /** Screen-reader-only suffix on the active chapter */
    current: "current chapter",
  },
  /** aria-label of the top progress bar */
  progress: "Page progress",
  /** aria-valuetext of the progress bar */
  progressValue: "{percent}% of the page",
} satisfies Translation<typeof esScroll>;
export default scroll;
