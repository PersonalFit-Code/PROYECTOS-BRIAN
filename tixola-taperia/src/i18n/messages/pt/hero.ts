import type esHero from "@/i18n/messages/es/hero";
import type { Translation } from "./shape";

/**
 * Capa (hero). As linhas do título declaram-se à mão para que a composição editorial
 * (máximo 3 linhas, palavra acentuada em itálico) seja idêntica em todos os idiomas.
 */
const TITLE_LINES: readonly string[] = ["A Arte do Petisco", "no Coração", "de Ourense"];

const hero = {
  kicker: "Tapería · Vinoteca · Ourense",
  /** Título completo (metadados, leitores de ecrã). */
  title: "A Arte do Petisco no Coração de Ourense",
  /** Título partido em linhas de capa (máx. 3). */
  titleLines: TITLE_LINES,
  /** Palavra do título realçada em itálico com o degradê de brasa. */
  accent: "Coração",
  subtitle:
    "Tixolas de ferro que chegam à mesa a chiar, croquetes caseiros, polvo da ria e doses para partilhar com um bom vinho galego, a um minuto da Catedral.",
  ctaPrimary: "Reservar Mesa",
  ctaSecondary: "Ir para a Ementa",
  scrollCue: "Descobrir a casa",
  scrollCueAria: "Descer até aos pratos estrela",
  since: "Centro histórico de Ourense",
  /** Ligação discreta sob os CTAs: "4,4 · 858 avaliações no Google". */
  reviewsLink: "Ver as avaliações no Google",
} satisfies Translation<typeof esHero>;
export default hero;
