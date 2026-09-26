/**
 * Sección "Platos estrella" (#platos): carrusel de fotos reales + detalle (DishSpotlight).
 * Los marcadores {así} se rellenan con useFormat(): t(m.dishes.slide, { index, total }).
 */
const dishes = {
  kicker: "Platos estrella",
  title: "Lo que nadie se va sin probar",
  accent: "de Tixola",
  description:
    "Producto gallego de la ría y del rural, marcado en nuestras tixolas de hierro hasta ese punto de brasa que solo da el hierro caliente.",
  hint: "Toca para ver detalles",
  ingredients: "Ingredientes",
  allergens: "Alérgenos",
  noAllergens: "Sin alérgenos declarados",
  allergensNote: "Ante cualquier alergia o intolerancia, dínoslo al pedir: lo preparamos con cuidado.",
  pairing: "Maridaje recomendado",
  pairingWhy: "Por qué funciona",
  seeInMenu: "Ver en la carta",
  ctaMenu: "Ver carta completa con alérgenos",
  ctaNote: "Más de 80 tapas, raciones y vinos gallegos, con los 14 alérgenos de la UE señalados plato a plato.",
  photoOf: "Foto de {name} en Tixola Tapería, Ourense",
  slide: "Plato {index} de {total}",
  /** Carrusel (DishCarousel) */
  carousel: {
    label: "Carrusel de platos estrella",
    prev: "Plato anterior",
    next: "Plato siguiente",
    goTo: "Ir a {name}",
    current: "actual",
    hint: "Toca un plato para ver ingredientes, alérgenos y maridaje",
    swipe: "Explora los platos",
    open: "Ver detalles de {name}",
    pause: "Pausar el carrusel",
    play: "Reanudar el carrusel",
    /** Anuncio para lectores de pantalla al cambiar de plato (solo con el carrusel en pausa). */
    status: "{name}, plato {index} de {total}",
  },
  /** Detalle del plato (DishSpotlight) */
  spotlight: {
    dialogLabel: "Detalles de {name}",
    close: "Cerrar detalles del plato",
    closeOverlay: "Cerrar",
    dragHandle: "Arrastra hacia abajo para cerrar",
    perUnit: "/ {unit}",
    askWaiter: "¿Dudas? Pregunta al camarero virtual",
    askWaiterPrefill: "Cuéntame más sobre {name}: cómo lo preparáis y con qué vino me lo recomendáis.",
    allergenContains: "Contiene {label}",
    /** Lista de alérgenos en texto, ya localizada: "Contiene: gluten, huevos" */
    contains: "Contiene: {list}",
    priceLabel: "Precio",
  },
  /** Visual compuesto (tixola de hierro + icono) cuando el plato aún no tiene foto */
  visual: {
    label: "Ilustración de {name} sobre tixola de hierro",
  },
} as const;
export default dishes;
