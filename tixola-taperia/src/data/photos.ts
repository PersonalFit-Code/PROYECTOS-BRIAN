import type { MenuItemId } from "./menu";

/**
 * Fotos reales del local y de los platos (public/images).
 * Añade nuevas fotos aquí y aparecerán en la galería y en los carruseles.
 *
 * `dishIds` enlaza la foto con platos estrella (`dishes.ts`) y/o platos de la carta (`menu.ts`).
 * La parte de la carta va tipada: un id que deje de existir da error de compilación en vez de
 * dejar la foto sin salir, en silencio, hasta que alguien se dé cuenta meses después.
 */
export type PhotoTag = "plato" | "terraza" | "local" | "catedral" | "vinos";

export interface Photo {
  id: string;
  src: string;
  /**
   * Recorte VERTICAL (2:3) de la misma foto, para la columna de la ficha de plato.
   *
   * No es un capricho de diseño: esa columna mide 375 × 758 px en escritorio —proporción 1:2— y la
   * foto va a sangre (`object-cover`). Metiendo ahí la versión apaisada, el navegador la agranda
   * hasta cubrir los 758 px de alto y enseña una franja estrecha del centro: del plato se ve un
   * tercio, y encima ampliado, o sea borroso. Con el recorte vertical el plato entra entero y cada
   * píxel de la pantalla es un píxel de la foto. Quien no lo tenga sigue funcionando con `src`.
   */
  srcTall?: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  tags: PhotoTag[];
  dishIds?: (MenuItemId | string)[];
  /** foco para object-position (ej. "50% 40%") */
  focus?: string;
}

export const PHOTOS: Photo[] = [
  {
    id: "terraza-catedral",
    src: "/images/terraza-catedral.jpg",
    width: 1000,
    height: 1000,
    alt: "Terraza de Tixola Tapería en Rúa Juan de Austria con una tixola de raxo, croquetas y dos copas de vino blanco, y la iglesia de Santa Eufemia de Ourense al fondo",
    caption: "La terraza, con Santa Eufemia al fondo",
    tags: ["terraza", "catedral", "plato", "vinos"],
    /* También sin `dishIds`, y por lo mismo que la de abajo: es una foto de terraza con mesa puesta,
       y mientras siguiera reclamando el raxo y las croquetas tapaba las fotos propias de esos dos
       platos, porque va la primera del manifiesto y gana el `find`. */
    focus: "50% 45%",
  },
  /* LA FOTO DEL PLATO QUE DA NOMBRE A LA CASA, y ahora es suya: la que había era de archivo y esta
     es la de la mesa de Tixola, con la pared de botellas detrás.
     Va en "a la plancha" y no en "rellenas" porque es lo que se ve: la vieira al descubierto con su
     ajada verde por encima, no un sofrito gratinado. El cliente lo mandó dudando ("las rellenas o a
     la plancha"), así que queda anotado en docs/fotos-para-revisar.md; moverla es cambiar un id. */
  {
    id: "zamburinas-plancha",
    src: "/images/zamburinas-plancha.webp",
    srcTall: "/images/zamburinas-plancha-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Ocho zamburiñas a la plancha en su concha, con ajada de ajo y perejil por encima, servidas en plato blanco con un cordón de reducción al lado",
    caption: "Zamburiñas a la plancha",
    tags: ["plato", "local"],
    dishIds: ["zamburinas", "esp-zamburinas-plancha" satisfies MenuItemId],
    focus: "50% 50%",
  },
  {
    id: "tixola-raxo-croquetas",
    src: "/images/tixola-raxo-croquetas.jpg",
    width: 1000,
    height: 1000,
    alt: "Tixola de raxo con queso de Arzúa en sartén de hierro, croquetas caseras y vino blanco gallego en la terraza de Tixola Tapería, Ourense",
    caption: "Tixola de raxo con queso de Arzúa y croquetas",
    tags: ["plato", "terraza"],
    /* SIN `dishIds`, Y ESO ES UN ARREGLO, NO UN OLVIDO. Esta foto es de mesa puesta: una tixola, unas
       croquetas y dos copas. Mientras fue la única que había, se colgaba del raxo y de las croquetas
       porque algo había que enseñar. Ahora los dos platos tienen su propia foto cenital, y como
       `localizePhotos(locale).find(...)` se queda con la PRIMERA del manifiesto que reclame el plato
       —y esta va antes—, seguir reclamándolos aquí tapaba las nuevas: la ficha del raxo abría con la
       mesa entera en vez de con su sartén. Se queda en la galería, que es donde una foto de ambiente
       vale por sí sola. */
    focus: "50% 50%",
  },
  {
    id: "fachada",
    /* RECORTADA EL 3-10-2026, y no por encuadre: el archivo original era una CAPTURA DE PANTALLA de
       un visor de fotos. Traía las barras blancas del visor arriba y abajo y, sobre el muro de la
       casa de al lado, su botón de cerrar —un círculo blanco con una × — perfectamente visible. En el
       carrusel anterior pasaba medio desapercibido; en el mural de la galería, a 290 px de ancho y
       quieto, se ve a la primera, y además sale en la tarjeta de ubicación (`MapCard`). El recorte
       quita las barras y el botón sin inventar un solo píxel: solo se pierden ~90 px del borde
       derecho (parte del portal rojo del vecino) y el rótulo entero se queda dentro.
       Sigue pendiente SUSTITUIRLA por una foto propia de la fachada: ver docs/fotos-para-revisar.md. */
    src: "/images/fachada.jpg",
    width: 712,
    height: 454,
    alt: "Fachada de Tixola Tapería en Rúa Juan de Austria 7, casco histórico de Ourense, con sus toldos rojos y la pizarra del día",
    caption: "Rúa Juan de Austria, 7",
    tags: ["local"],
    focus: "50% 40%",
  },

  /* ─────────────────────────────────────────────────────────────
     Fotos de la casa, hechas por Brian el 2 de octubre de 2026.

     QUÉ SE PUBLICA Y QUÉ NO. De las 104 fotos de la carpeta se han dejado fuera las del comedor
     lleno: salían clientes con la cara perfectamente reconocible y nadie les ha pedido permiso
     para aparecer en la web del bar. Por lo mismo, el rótulo de la calle va recortado por encima
     de la gente que pasaba. No es exceso de celo: es que una foto así no se puede retirar de
     Internet una vez publicada.

     EL `alt` DICE LO QUE SE VE, NO LO QUE NOS GUSTARÍA QUE FUERA. Un plato solo se enlaza a su
     entrada de la carta (`dishIds`) cuando se reconoce sin discusión —la chistorra se ve, el
     aguacate se ve—. Los dos platos de croquetas van SIN `dishIds` a propósito: en la foto no hay
     forma de saber si son las de jamón, las de grelos y chipirón o las de cecina, y colgarlas de
     una entrada concreta sería prometer un relleno al azar. Salen en la galería, que no afirma
     nada, y ahí cumplen igual.
     ───────────────────────────────────────────────────────────── */

  /* Platos */
  {
    id: "tixola-raxo",
    src: "/images/tixola-raxo.webp",
    srcTall: "/images/tixola-raxo-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Tixola de raxo con queso de Arzúa vista desde arriba: sartén con patatas, tacos de raxo y huevo cuajado, sobre la mesa de Tixola Tapería",
    caption: "Tixola de raxo y Arzúa",
    tags: ["plato"],
    dishIds: ["raxo", "tix-raxo-arzua" satisfies MenuItemId],
    focus: "50% 50%",
  },
  {
    id: "tixola-chistorra",
    src: "/images/tixola-chistorra.webp",
    srcTall: "/images/tixola-chistorra-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Tixola con chistorra vista desde arriba: sartén con patatas, huevo cuajado y rodajas de chistorra",
    caption: "Tixola con chistorra",
    tags: ["plato"],
    dishIds: ["tix-chistorra" satisfies MenuItemId],
    focus: "50% 50%",
  },
  /* Esta foto destapó un alérgeno que faltaba: el queso frito sale con NUECES y la carta no las
     declaraba. Preguntado a la casa, van siempre, así que el plato ya declara frutos de cáscara
     (`src/data/menu.ts`) y lo dice su descripción. El `alt` las nombra igualmente, para que quien no
     vea la imagen tenga la misma información que quien sí la ve. */
  {
    id: "queso-frito",
    src: "/images/queso-frito.webp",
    srcTall: "/images/queso-frito-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Ración de queso frito: cuatro tacos de queso rebozados y dorados sobre hojas de lechuga, con un cuenco de nueces peladas y otro de salsa roja al lado",
    caption: "Queso frito, con nueces y salsa",
    tags: ["plato", "local"],
    dishIds: ["esp-queso-frito" satisfies MenuItemId],
    focus: "50% 50%",
  },
  {
    id: "mejillones-tigre",
    src: "/images/mejillones-tigre.webp",
    srcTall: "/images/mejillones-tigre-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Ración de mejillones tigre: ocho conchas rellenas y rebozadas, doradas, sobre un lecho de brotes de ensalada en plato verde",
    caption: "Mejillones tigre",
    tags: ["plato", "local"],
    dishIds: ["coc-mejillones-tigre" satisfies MenuItemId],
    focus: "50% 50%",
  },
  /* EL POSTRE. La carta lo llama "Postre del día" y dice que cambia, y eso sigue siendo verdad: la
     foto no la contradice, la acompaña. Lo que pasa es que últimamente la casa mantiene el mismo, y
     una foto de lo que hay de verdad vale más que un icono de postre genérico. Si cambia el postre,
     se cambia la foto y ya está — por eso el pie no dice "nuestro postre" sino lo que se ve.
     El `alt` describe lo que hay en el plato y nada más: ni "coulant" ni "casero" ni ningún adjetivo
     que no se pueda comprobar mirando la foto. */
  {
    id: "postre-chocolate",
    src: "/images/postre-chocolate.webp",
    srcTall: "/images/postre-chocolate-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Postre de chocolate con azúcar glas y sirope, servido en plato verde con una bola de helado de vainilla y dos de nata montada, sobre la mesa de Tixola Tapería",
    caption: "El postre: chocolate, helado y nata",
    tags: ["plato", "local"],
    dishIds: ["var-postre" satisfies MenuItemId],
    focus: "50% 50%",
  },
  /* Las dos de abajo son los MISMOS platos que las cenitales de arriba, pero vistas desde la mesa,
     con la pared de botellas detrás. No llevan `dishIds` a propósito: la foto que abre la ficha de
     un plato tiene que ser la cenital, donde se ve lo que lleva. Estas cuentan la otra mitad de la
     casa —que se come rodeado de vino— y por eso van a la galería y no a la ficha. */
  {
    id: "tixola-raxo-mesa",
    src: "/images/tixola-raxo-mesa.webp",
    width: 1800,
    height: 1350,
    alt: "Tixola de raxo con patatas y huevo cuajado servida en la mesa de Tixola Tapería, con la vinoteca y las cajas de madera de las bodegas al fondo",
    caption: "Tixola de raxo, con la vinoteca detrás",
    tags: ["plato", "local", "vinos"],
    focus: "50% 55%",
  },
  {
    id: "tixola-chistorra-mesa",
    src: "/images/tixola-chistorra-mesa.webp",
    width: 1800,
    height: 1350,
    alt: "Tixola con chistorra, patatas y huevo cuajado servida en la mesa con dos tenedores, y los expositores de vino de la sala al fondo",
    caption: "Tixola con chistorra, servida en mesa",
    tags: ["plato", "local", "vinos"],
    focus: "50% 55%",
  },
  {
    id: "tixola-gulas-langostinos",
    src: "/images/tixola-gulas-langostinos.webp",
    srcTall: "/images/tixola-gulas-langostinos-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Tixola con gulas, setas y langostinos vista desde arriba: sartén de mango de madera con patatas, huevo y gulas",
    caption: "Tixola con gulas, setas y langostinos",
    tags: ["plato"],
    dishIds: ["tix-gulas-setas-langostinos" satisfies MenuItemId],
    focus: "50% 50%",
  },
  {
    id: "patatas-alioli",
    src: "/images/patatas-alioli.webp",
    srcTall: "/images/patatas-alioli-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Ración de patatas con alioli y perejil en cuenco de cerámica verde, en Tixola Tapería de Ourense",
    caption: "Patatas con alioli",
    tags: ["plato"],
    dishIds: ["coc-patatas" satisfies MenuItemId],
    focus: "50% 50%",
  },
  {
    id: "calamares-fritos",
    src: "/images/calamares-fritos.webp",
    srcTall: "/images/calamares-fritos-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Calamares fritos en aros sobre patatas panadera, con una cuña de limón y unas hojas de ensalada, servidos en cuenco de barro sobre la mesa de Tixola Tapería",
    caption: "Calamares fritos",
    tags: ["plato", "local"],
    dishIds: ["coc-calamares" satisfies MenuItemId],
    focus: "50% 50%",
  },
  {
    id: "ensalada-gulas-langostinos",
    src: "/images/ensalada-gulas-langostinos.webp",
    srcTall: "/images/ensalada-gulas-langostinos-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Ensalada de gulas, setas y langostinos: brotes de lechuga y rodajas de tomate con gulas, setas salteadas y langostinos por encima, en cuenco de barro",
    caption: "Ensalada de gulas, setas y langostinos",
    tags: ["plato", "local"],
    dishIds: ["ens-gulas-setas-langostinos" satisfies MenuItemId],
    focus: "50% 50%",
  },
  /* AJADA DE BACALAO. Brian mandó la foto sin acordarse del nombre ("algo de bacalao"), y es esta:
     bacalao desmigado con la ajada por encima —aceite, ajo y pimentón— y su cachelo al lado, que es
     literalmente lo que describe la carta. No es el de tempura (ese va rebozado) ni el revuelto
     (ese lleva huevo, grelos y langostinos). Queda anotado en docs/fotos-para-revisar.md por si
     Tatiana lo ve de otra manera; cambiarlo de plato es cambiar un id. */
  {
    id: "ajada-bacalao",
    src: "/images/ajada-bacalao.webp",
    srcTall: "/images/ajada-bacalao-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Ajada de bacalao: bacalao desmigado con aceite, ajo y pimentón por encima, con una patata cocida al lado, en cuenco de cerámica verde",
    caption: "Ajada de bacalao",
    tags: ["plato", "local"],
    dishIds: ["esp-ajada-bacalao" satisfies MenuItemId],
    focus: "50% 50%",
  },
  /* PULPO Á FEIRA: cachelos, pimentón y aceite sobre el plato de madera de siempre.
     Va en las DOS entradas de pulpo a la plancha, que es lo que pidió el cliente. En "Pulpo a la
     gallega o a la plancha" es exactamente el plato. En "Pulpo a la plancha con grelos" NO lo es
     —ahí el pulpo va sobre una cama de grelos, no sobre cachelos— y queda dicho en
     docs/fotos-para-revisar.md: enseña el mismo pulpo y la misma mano, que es lo que se busca, pero
     el día que haya una foto con los grelos, esa manda y basta con cambiar el id. */
  {
    id: "pulpo-feira",
    src: "/images/pulpo-feira.webp",
    srcTall: "/images/pulpo-feira-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Pulpo á feira en plato de madera: rodajas de pulpo cocido sobre cachelos, con pimentón y aceite de oliva por encima",
    caption: "Pulpo á feira",
    tags: ["plato", "local"],
    dishIds: ["pul-gallega-plancha" satisfies MenuItemId, "pul-plancha-grelos" satisfies MenuItemId],
    focus: "50% 50%",
  },
  /* PIMIENTOS DE PADRÓN, Y SIN `dishIds` A PROPÓSITO: no están en la carta de papel, así que no hay
     entrada a la que enlazarlos — y darles una obligaría a ponerles un precio que nadie ha dicho.
     El cliente pidió integrarlos igual ("aunque no los haya en la carta como tal"), y la galería es
     justo el sitio donde una foto enseña lo que hay en la casa sin afirmar que sea un plato de
     carta. Si Tatiana quiere que entren en la carta, lo único que falta es su precio. */
  {
    id: "pimientos-padron",
    src: "/images/pimientos-padron.webp",
    srcTall: "/images/pimientos-padron-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Fuente de pimientos de Padrón fritos y espolvoreados con sal gorda, en plato de cerámica verde sobre la mesa de madera de Tixola Tapería",
    caption: "Pimientos de Padrón",
    tags: ["plato", "local"],
    focus: "50% 50%",
  },
  {
    id: "pulpo-tempura",
    src: "/images/pulpo-tempura.webp",
    srcTall: "/images/pulpo-tempura-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Pulpo en tempura sobre cama de patatas, con limón y salsa de pimentón en salsera aparte, en fuente de cerámica verde",
    caption: "Pulpo en tempura",
    tags: ["plato"],
    dishIds: ["pul-tempura" satisfies MenuItemId],
    focus: "50% 50%",
  },
  {
    id: "revuelto-bacalao-grelos",
    src: "/images/revuelto-bacalao-grelos.webp",
    srcTall: "/images/revuelto-bacalao-grelos-alto.webp",
    width: 2000,
    height: 1500,
    alt: "Revuelto de bacalao, grelos y langostinos visto desde arriba, en plato blanco con un hilo de reducción",
    caption: "Revuelto de bacalao, grelos y langostinos",
    tags: ["plato"],
    dishIds: ["rev-bacalao-grelos-langostinos" satisfies MenuItemId],
    focus: "50% 50%",
  },
  {
    id: "ensalada-pollo-crujiente",
    src: "/images/ensalada-pollo-crujiente.webp",
    srcTall: "/images/ensalada-pollo-crujiente-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Ensalada de pollo crujiente con nueces, manzana en bastones, tomate y brotes verdes, en plato hondo de cerámica",
    caption: "Ensalada de pollo crujiente, nueces y manzana",
    tags: ["plato"],
    dishIds: ["ens-pollo-crujiente" satisfies MenuItemId],
    focus: "50% 50%",
  },
  {
    id: "ensalada-aguacate-bacalao",
    src: "/images/ensalada-aguacate-bacalao.webp",
    srcTall: "/images/ensalada-aguacate-bacalao-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Ensalada de aguacate y bacalao ahumado con canónigos, tomate, pimiento rojo y aceitunas negras, en plato blanco",
    caption: "Ensalada de aguacate y bacalao ahumado",
    tags: ["plato"],
    dishIds: ["ens-aguacate-bacalao" satisfies MenuItemId],
    focus: "50% 50%",
  },
  {
    id: "croquetas-tabla",
    src: "/images/croquetas-tabla.webp",
    srcTall: "/images/croquetas-tabla-alto.webp",
    width: 1800,
    height: 1350,
    alt: "Croquetas caseras recién fritas, vistas desde arriba sobre una tabla de madera alargada",
    caption: "Croquetas de la casa",
    tags: ["plato"],
    /* LA MISMA FOTO PARA LAS CUATRO CROQUETAS, y lo decidió la casa: "al final no se va a
       diferenciar por el exterior, sino por el interior, así que con la misma nos vale". Es verdad —
       de jamón, de grelos y chipirón, de cecina con queso de cabra o sin gluten, por fuera son la
       misma croqueta dorada—, y resuelve la duda que estaba anotada en docs/fotos-para-revisar.md:
       la foto ya no tiene que decir cuál es, porque lo dice el nombre del plato encima.
       El primero de la lista es el destacado de la portada; los otros cuatro, las entradas de la
       carta. */
    dishIds: [
      "croquetas",
      "coc-croquetas-jamon" satisfies MenuItemId,
      "coc-croquetas-grelos-chipiron" satisfies MenuItemId,
      "coc-croquetas-cecina-cabra" satisfies MenuItemId,
      "coc-croquetas-sin-gluten" satisfies MenuItemId,
    ],
    focus: "50% 50%",
  },
  {
    id: "croquetas-racion",
    src: "/images/croquetas-racion.webp",
    srcTall: "/images/croquetas-racion-alto.webp",
    width: 1500,
    height: 2000,
    alt: "Ración de croquetas caseras alineadas en plato alargado blanco sobre la mesa de madera de la tapería",
    caption: "Ración de croquetas",
    tags: ["plato"],
    focus: "50% 50%",
  },

  /* El local y la vinoteca */
  {
    id: "rotulo-noche",
    src: "/images/rotulo-noche.webp",
    width: 1200,
    height: 1234,
    alt: "Rótulo de Tixola vinoteca-tapería iluminado de noche en el casco histórico de Ourense",
    caption: "El rótulo, de noche en el casco histórico",
    tags: ["local"],
    focus: "60% 40%",
  },
  {
    id: "barra",
    src: "/images/barra.webp",
    width: 1200,
    height: 900,
    alt: "Barra de Tixola Tapería con las botellas en las estanterías y las paredes granates del local",
    caption: "La barra",
    tags: ["local", "vinos"],
    focus: "50% 50%",
  },
  {
    id: "vinoteca-armarios",
    src: "/images/vinoteca-armarios.webp",
    width: 1200,
    height: 900,
    alt: "Armarios climatizados de la vinoteca de Tixola, con cajas de madera de bodega encima",
    caption: "La vinoteca",
    tags: ["local", "vinos"],
    focus: "50% 50%",
  },
  {
    id: "vinoteca-botellas",
    src: "/images/vinoteca-botellas.webp",
    width: 1200,
    height: 1600,
    alt: "Botellas de vino gallego y de otras denominaciones ordenadas en los estantes de la vinoteca de Tixola",
    caption: "Botellas en el estante",
    tags: ["vinos", "local"],
    focus: "50% 50%",
  },
  {
    id: "pizarra-vinos",
    src: "/images/pizarra-vinos.webp",
    width: 1200,
    height: 1600,
    alt: "Pizarra de Tixola con los vinos recomendados por copa escritos a mano, por denominación de origen",
    caption: "Los vinos recomendados del día",
    tags: ["vinos", "local"],
    focus: "50% 45%",
  },
  {
    id: "cubitera-regina",
    src: "/images/cubitera-regina.webp",
    width: 1200,
    height: 1600,
    alt: "Cubitera de metal con botellas enfriándose en la vinoteca de Tixola Tapería",
    caption: "Enfriando para la siguiente ronda",
    tags: ["vinos", "local"],
    focus: "50% 50%",
  },
];

export const photoById = (id: string) => PHOTOS.find((p) => p.id === id);
export const photosForDish = (dishId: string) => PHOTOS.filter((p) => p.dishIds?.includes(dishId));
export const photosByTag = (tag: PhotoTag) => PHOTOS.filter((p) => p.tags.includes(tag));
