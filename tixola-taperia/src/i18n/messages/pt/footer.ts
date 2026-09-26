import type esFooter from "@/i18n/messages/es/footer";
import type { Translation } from "./shape";

/** Rodapé: colunas, horário, ligações legais e barra inferior. */
const footer = {
  about:
    "Tapas galegas de qualidade, cerveja artesanal e vinhos da região num bar acolhedor com esplanada, a escassos metros da Catedral de Ourense.",
  tixolaMeaning: "«Tixola» é frigideira em galego: a de ferro que chega à mesa ainda a chiar.",
  contact: "Contacto",
  hours: "Horário",
  links: "Ementa e ligações",
  legal: "Legal",
  privacy: "Política de privacidade",
  legalNotice: "Aviso legal",
  cookies: "Política de cookies",
  cookieSettings: "Configurar cookies",
  backToTop: "Voltar ao topo",
  rights: "Todos os direitos reservados.",
  credit: "Design web",
  creditBy: "O seu estúdio",
  menuWithAllergens: "Ementa com alergénios",
  ratingsAria: "Classificações",
  hoursCaption: "Horário semanal de {name}",
  todaySr: "(hoje)",
  closedDay: "Fechado",
  kitchenNote: "Cozinha aberta de forma contínua em cada período.",
} satisfies Translation<typeof esFooter>;
export default footer;
