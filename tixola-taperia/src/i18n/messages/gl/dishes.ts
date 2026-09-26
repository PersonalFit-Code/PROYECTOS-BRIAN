import type { Section } from "./shape";

/**
 * Sección "Pratos estrela" (#platos): carrusel de fotos reais + detalle (DishSpotlight).
 * Os marcadores {así} énchense con useFormat(): t(m.dishes.slide, { index, total }).
 */
const dishes: Section<"dishes"> = {
  kicker: "Pratos estrela",
  title: "O que ninguén marcha sen probar",
  accent: "de Tixola",
  description:
    "Produto galego da ría e do rural, marcado nas nosas tixolas de ferro ata ese punto de brasa que só dá o ferro quente.",
  hint: "Toca para ver os detalles",
  ingredients: "Ingredientes",
  allergens: "Alérxenos",
  noAllergens: "Sen alérxenos declarados",
  allergensNote: "Ante calquera alerxia ou intolerancia, dínolo ao pedir: preparámolo con coidado.",
  pairing: "Maridaxe recomendada",
  pairingWhy: "Por que funciona",
  seeInMenu: "Ver na carta",
  ctaMenu: "Ver a carta completa con alérxenos",
  ctaNote: "Máis de 80 tapas, racións e viños galegos, cos 14 alérxenos da UE sinalados prato a prato.",
  photoOf: "Foto de {name} en Tixola Tapería, Ourense",
  slide: "Prato {index} de {total}",
  /** Carrusel (DishCarousel) */
  carousel: {
    label: "Carrusel de pratos estrela",
    prev: "Prato anterior",
    next: "Prato seguinte",
    goTo: "Ir a {name}",
    current: "actual",
    hint: "Toca un prato para ver ingredientes, alérxenos e maridaxe",
    swipe: "Despraza para descubrir máis",
    open: "Ver os detalles de {name}",
    pause: "Pausar o carrusel",
    play: "Retomar o carrusel",
    /** Anuncio para lectores de pantalla ao cambiar de prato (só co carrusel en pausa). */
    status: "{name}, prato {index} de {total}",
  },
  /** Detalle do prato (DishSpotlight) */
  spotlight: {
    dialogLabel: "Detalles de {name}",
    close: "Pechar os detalles do prato",
    closeOverlay: "Pechar",
    dragHandle: "Arrastra para abaixo para pechar",
    perUnit: "/ {unit}",
    askWaiter: "Dúbidas? Pregúntalle ao camareiro virtual",
    askWaiterPrefill: "Cóntame máis sobre {name}: como o preparades e con que viño mo recomendades.",
    allergenContains: "Contén {label}",
    /** Lista de alérxenos en texto, xa localizada: "Contén: glute, ovos" */
    contains: "Contén: {list}",
    priceLabel: "Prezo",
  },
  /** Visual composto (tixola de ferro + icona) cando o prato aínda non ten foto */
  visual: {
    label: "Ilustración de {name} sobre tixola de ferro",
  },
};
export default dishes;
