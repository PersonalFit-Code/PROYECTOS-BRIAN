import type esScroll from "@/i18n/messages/es/scroll";
import type { Translation } from "./shape";

/**
 * Textos do módulo de scroll cinematográfico: navegação lateral por capítulos,
 * barra de progresso e acessibilidade dos saltos entre secções.
 */
const scroll = {
  /** Etiquetas dos capítulos (por id de secção: hero, platos, experiencia, opiniones, footer) */
  chapters: {
    hero: "Início",
    dishes: "Pratos",
    experience: "Localização",
    social: "Opiniões",
    footer: "Contacto",
  },
  nav: {
    /** aria-label do <nav> lateral com os pontos */
    label: "Capítulos da página",
    /** aria-label de cada ponto */
    goTo: "Ir para o capítulo {chapter}",
    /** Sufixo só para leitores de ecrã no capítulo ativo */
    current: "capítulo atual",
  },
  /** aria-label da barra de progresso superior */
  progress: "Progresso da página",
  /** aria-valuetext da barra de progresso */
  progressValue: "{percent} % da página",
} satisfies Translation<typeof esScroll>;
export default scroll;
