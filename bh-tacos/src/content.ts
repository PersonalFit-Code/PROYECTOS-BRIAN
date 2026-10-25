/*
 * Todo lo que se puede editar de la web sin tocar componentes: datos del local, horario, textos,
 * reseñas, preguntas frecuentes, textos legales y SEO. La carta (precios, carnes, salsas, extras)
 * NO está aquí: vive en `src/data/menu.json`.
 *
 * Fuentes de los datos reales: Páxinas Galegas (teléfono, horario, Instagram), Uber Eats y
 * Just Eat (carta y valoraciones) y La Voz de Galicia, 26-05-2025 (la historia).
 */

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";
export interface TimeRange {
  open: string;
  close: string;
}

export const BUSINESS = {
  name: "BH Tacos",
  claim: "Los auténticos French Tacos de Lyon en Ourense",
  address: {
    street: "Rúa Pena Trevinca, 12 Bajo",
    postalCode: "32005",
    city: "Ourense",
    region: "Galicia",
    country: "ES",
    full: "Rúa Pena Trevinca, 12 Bajo, 32005 Ourense, Galicia, España",
  },
  // TODO: confirmar las coordenadas exactas del local (estas son las de la calle).
  geo: { lat: 42.3374, lng: -7.8721 },
  phone: { display: "988 601 723", tel: "+34988601723" },
  // TODO: número real de WhatsApp (formato wa.me: prefijo de país sin "+").
  whatsapp: "34988000000",
  // TODO: email real del local.
  email: "hola@bhtacos.es",
  social: {
    instagram: "https://www.instagram.com/bhtacos/",
    // TODO: perfil real de TikTok.
    tiktok: "https://www.tiktok.com/@bhtacos",
  },
  delivery: {
    justEat: "https://www.just-eat.es/restaurants-bh-tacos-ourense/menu",
    uberEats: "https://www.ubereats.com/es/store/bh-tacos/jak6p7wjT1uVvwvA4JiOoA",
  },
  maps: "https://www.google.com/maps/search/?api=1&query=BH+Tacos+Rua+Pena+Trevinca+12+Ourense",
  mapsEmbed: "https://www.google.com/maps?q=BH+Tacos+Rua+Pena+Trevinca+12+Ourense&output=embed",
  timezone: "Europe/Madrid",
  ratings: [
    { platform: "Uber Eats", value: 4.7, count: 69 },
    { platform: "Just Eat", value: 4.6, count: 53 },
  ],
  // TODO: dominio definitivo.
  siteUrl: "https://bh-tacos.vercel.app",
} as const;

/*
 * Horario real (Páxinas Galegas): lunes cerrado; de martes a domingo 12:30–16:30 y 20:00–00:00.
 * Un cierre "00:00" significa medianoche. Para cambiar el horario basta con editar esta tabla:
 * el estado abierto/cerrado, el widget de contacto, el pie y el JSON-LD salen de aquí.
 */
export const HOURS: Record<DayKey, readonly TimeRange[]> = {
  mon: [],
  tue: [{ open: "12:30", close: "16:30" }, { open: "20:00", close: "00:00" }],
  wed: [{ open: "12:30", close: "16:30" }, { open: "20:00", close: "00:00" }],
  thu: [{ open: "12:30", close: "16:30" }, { open: "20:00", close: "00:00" }],
  fri: [{ open: "12:30", close: "16:30" }, { open: "20:00", close: "00:00" }],
  sat: [{ open: "12:30", close: "16:30" }, { open: "20:00", close: "00:00" }],
  sun: [{ open: "12:30", close: "16:30" }, { open: "20:00", close: "00:00" }],
};

export const DAY_NAMES: Record<DayKey, string> = {
  mon: "Lunes",
  tue: "Martes",
  wed: "Miércoles",
  thu: "Jueves",
  fri: "Viernes",
  sat: "Sábado",
  sun: "Domingo",
};

export const HOURS_SUMMARY = "Martes a domingo · 12:30–16:30 y 20:00–00:00 · Lunes cerrado";

export const NAV = [
  { href: "/", label: "Inicio" },
  { href: "/carta", label: "Carta" },
  { href: "/monta-tu-taco", label: "Monta tu Taco" },
  { href: "/sobre-nosotros", label: "Sobre nosotros" },
  { href: "/contacto", label: "Contacto" },
] as const;

export const HOME = {
  hero: {
    title: "Los auténticos French Tacos de Lyon llegan a Ourense",
    subtitle:
      "¿Buscas algo diferente, contundente y lleno de sabor? Ven a probar la fusión perfecta de la comida rápida europea. Hechos con tortilla de trigo, carnes a tu elección, patatas fritas crujientes por dentro, queso derretido y nuestra salsa quesera casera. ¡Todo prensado a la perfección!",
    ctaMenu: "Ver la Carta",
    ctaBuilder: "Monta tu Taco",
    ctaDelivery: "Pedir a Domicilio",
  },
  whatIs: {
    title: "Esto no es un taco mexicano. Es mucho más.",
    text: "El French Taco nació en Lyon y conquistó Europa. Nada de tortillas de maíz finas: aquí hablamos de una tortilla de trigo rectangular que se rellena con carne, patatas fritas crujientes, salsa quesera casera y se prensa en un grill hasta quedar compacta, dorada y perfecta. Es contundente, es saciante, y cuando lo pruebas, no hay vuelta atrás.",
    layers: [
      { id: "gratinado", label: "Gratinado superior (opcional)", detail: "Mozzarella o queso de cabra fundido por encima, para los que quieren más queso." },
      { id: "tortilla", label: "Tortilla de trigo", detail: "Grande y rectangular. Se dobla como un sobre y lo envuelve todo." },
      { id: "salsa", label: "Salsa quesera casera", detail: "La hace Hassan aquí, cada día. Es lo que une todo el relleno." },
      { id: "carne", label: "Carne a elegir", detail: "Pollo marinado, carne picada, nuggets, cordon bleu o tenders." },
      { id: "patatas", label: "Patatas fritas internas", detail: "Sí, dentro. Crujientes y empapadas de salsa quesera." },
      { id: "plancha", label: "Prensado a la plancha", detail: "Se prensa en el grill hasta quedar compacto, dorado y crujiente por fuera." },
    ],
  },
  sizes: {
    title: "M, L o XL. Tú decides cuánta hambre tienes.",
    text: "El M es perfecto para una comida normal. El L es para los que vienen con hambre de verdad. El XL… el XL es otro nivel. Tres carnes, rebozado crujiente y a disfrutar.",
  },
  sauces: {
    title: "Las salsas que lo cambian todo",
    intro: "En BH Tacos no improvisamos con las salsas. Cada una tiene su carácter, su origen y su maridaje ideal.",
  },
  featured: {
    title: "Los favoritos de la casa",
    text: "Si es tu primera vez, empieza por uno de estos. No fallan.",
  },
  gaming: {
    title: "Ven a jugar mientras preparamos tu taco",
    text: "¡Tal cual lo lees! Queremos que BH Tacos sea un punto de encuentro agradable. Tenemos una zona de videojuegos equipada con una PlayStation 5 para que nuestros clientes echen unas partidas gratis mientras preparamos sus tacos al momento o se toman algo con amigos.",
    cta: "Cómo llegar",
  },
  reviews: { title: "Lo que dicen los que ya han probado" },
  faq: { title: "Preguntas frecuentes" },
  finalCta: {
    title: "¿Pedimos?",
    text: "Ven a BH Tacos, monta tu taco o pídelo a domicilio. Te esperamos en Rúa Pena Trevinca, 12.",
    ctaBuilder: "Montar mi taco",
    ctaWhatsapp: "Pedir por WhatsApp",
    ctaMaps: "Cómo llegar",
  },
} as const;

// TODO: sustituir por reseñas reales (con permiso de sus autores).
export const REVIEWS = [
  { name: "Laura M.", stars: 5, text: "El XL rebozado es una locura. No he probado nada igual en Ourense." },
  { name: "Carlos R.", stars: 5, text: "Vine por curiosidad y ya soy cliente fijo. La salsa algérienne es brutal." },
  { name: "Andrea P.", stars: 5, text: "Buenísimo, contundente y encima puedes echarte una partida a la PS5 mientras esperas." },
] as const;

export const FAQ = [
  {
    q: "¿Qué es exactamente un taco francés?",
    a: "No tiene nada que ver con el taco mexicano de maíz. Un French taco nace en Lyon; es una tortilla de trigo rectangular que se rellena con carnes, patatas fritas crujientes en su interior y una salsa de queso espectacular. Luego se prensa en un grill caliente. El resultado es un bocado compacto, caliente y sumamente saciante.",
  },
  {
    q: "¿Hacéis envíos a domicilio en Ourense?",
    a: "¡Sí! Puedes pedir cómodamente desde tu sofá a través de Just Eat o Uber Eats. También puedes llamarnos directamente por teléfono para encargar tu comida y pasar a recogerla por el local sin esperas. (Nota: no operamos con la app de Glovo).",
  },
  {
    q: "¿Hay opciones vegetarianas o sin gluten?",
    a: "Actualmente nuestros tacos se centran en combinaciones de carnes (pollo, ternera, cordon bleu) envueltas en tortillas de trigo, por lo que no disponemos de opciones aptas para celíacos o menús estrictamente vegetarianos. Si vienes al local, puedes disfrutar de nuestros palitos de mozzarella fritos como complemento.",
  },
  {
    q: "¿Qué es eso de que tenéis una PS5?",
    a: "¡Tal cual lo lees! Queremos que BH Tacos sea un punto de encuentro agradable. Tenemos una zona de videojuegos equipada con una PlayStation 5 para que nuestros clientes echen unas partidas gratis mientras preparamos sus tacos al momento o se toman algo con amigos.",
  },
] as const;

export const CARTA = {
  intro: [
    "En BH Tacos no hacemos tacos al uso. Hacemos ",
    "French Tacos",
    ". Olvídate de la tortilla fina y el relleno escaso. Aquí todo es generoso, contundente y está prensado a la plancha hasta alcanzar la perfección. Elige tu tamaño, tu carne y tus salsas. ¡Tú mandas!",
  ],
  note: "Precios en el local, con IVA incluido, según el cartel «Hazte un taco». En Just Eat y Uber Eats pueden ser distintos.",
} as const;

export const CONTACT = {
  order: {
    title: "Pide como quieras",
    delivery: { title: "A domicilio", text: "Pide por Just Eat o Uber Eats y te lo llevamos caliente a casa." },
    pickup: { title: "Para recoger", text: "Llámanos, dinos qué quieres y pásate a por ello sin esperar." },
    whatsapp: { title: "Por WhatsApp", text: "Escríbenos tu pedido directamente y te confirmamos enseguida." },
    noGlovo: "No trabajamos con Glovo.",
  },
  hoursTitle: "Horario",
  mapTitle: "Dónde estamos",
  mapExtra: "A 5 min andando de la Plaza Mayor. Junto a la estación de tren.",
  formTitle: "Escríbenos",
  socialTitle: "Síguenos",
} as const;

export const ABOUT = {
  story: {
    title: "De Lyon a Ourense. Con escala en tu estómago.",
    paragraphs: [
      "El French Taco es hijo de Lyon, la capital gastronómica de Francia. Nació en los barrios donde los estudiantes buscaban algo contundente, barato y sabroso para después de clase. Y funcionó. Tanto, que se expandió por toda Europa conquistando a quien lo probaba.",
      "Nosotros lo probamos una vez. Y ya no pudimos dejarlo. Por eso trajimos la receta, el prensado, las patatas internas y la salsa quesera a Ourense, con un toque propio: nuestra zona gaming, nuestro ambiente, nuestra gente. BH Tacos no es una franquicia. Es un sitio de barrio con el mejor taco francés que vas a encontrar por aquí.",
    ],
  },
  people: {
    title: "Patricia y Hassan",
    text: "Detrás de la plancha están Patricia da Silva y Hassan, una pareja joven que siempre había trabajado en hostelería: él como cocinero y ella como camarera. Hassan pasó un mes en Marruecos, donde su familia tiene varios locales de tacos, para aprender a hacerlos antes de abrir aquí. Solo hay un cocinero y todo se prepara en el local con producto fresco.",
    source: "La Voz de Galicia, «Llegaron los tacos franceses a Ourense», 26 de mayo de 2025",
    sourceUrl:
      "https://www.lavozdegalicia.es/noticia/ourense/ourense/2025/05/23/llegaron-tacos-franceses-ourense/00031748020952803181113.htm",
  },
  values: {
    title: "Tres cosas en las que no negociamos",
    items: [
      { title: "Producto honesto", text: "Nada de congelados industriales. Carnes frescas, patatas crujientes y salsa quesera hecha aquí cada día." },
      { title: "Precio justo", text: "Llenar el estómago no debería costar una fortuna. Por eso nuestros precios son lo que son." },
      { title: "Buen rollo", text: "Ven a comer, a jugar a la PS5, a ver el partido o a echar el rato. Aquí se está bien." },
    ],
  },
  badges: [
    { icon: "🥖", label: "Receta original de Lyon" },
    { icon: "🧀", label: "Salsa quesera casera" },
    { icon: "🎮", label: "Zona gaming PS5" },
    { icon: "📍", label: "En el centro de Ourense" },
  ],
  cta: { title: "¿Te apetece probarlo? Ven a vernos.", menu: "Ver la carta", maps: "Cómo llegar" },
} as const;

/*
 * TEXTOS LEGALES · PLACEHOLDER.
 * Nada de lo que sigue es un texto legal válido: es una estructura para que el cliente lo sustituya
 * por el texto real redactado o revisado por un profesional, con sus datos fiscales.
 */
// TODO: datos del titular (razón social o nombre, NIF/CIF, domicilio fiscal, registro).
export const LEGAL_OWNER = {
  name: "[Nombre o razón social del titular]",
  nif: "[NIF/CIF]",
  address: BUSINESS.address.full,
  email: BUSINESS.email,
};

export const LEGAL_UPDATED = "24 de octubre de 2026";
export const LEGAL_WARNING = "⚠️ Este texto es un placeholder. Sustituir por aviso legal real generado por un profesional.";

export interface LegalSection {
  title: string;
  body: string[];
}

export const LEGAL: Record<"aviso-legal" | "privacidad" | "cookies", { title: string; sections: LegalSection[] }> = {
  "aviso-legal": {
    title: "Aviso legal",
    sections: [
      {
        title: "Datos identificativos del titular",
        body: [
          `Titular: ${LEGAL_OWNER.name}. NIF: ${LEGAL_OWNER.nif}.`,
          `Domicilio: ${LEGAL_OWNER.address}. Correo electrónico: ${LEGAL_OWNER.email}.`,
        ],
      },
      { title: "Objeto del sitio web", body: ["Este sitio web informa sobre el restaurante BH Tacos, su carta, su horario y las formas de hacer un pedido."] },
      { title: "Condiciones de uso", body: ["El acceso a la web es libre y gratuito. Quien la usa se compromete a hacerlo de forma lícita y sin dañar el sitio ni a terceros."] },
      { title: "Propiedad intelectual e industrial", body: ["Los textos, diseños, logotipos e ilustraciones de esta web pertenecen a su titular o a terceros que han autorizado su uso. No se permite su reproducción sin autorización."] },
      { title: "Exclusión de responsabilidad", body: ["Los precios y la carta son orientativos y pueden cambiar sin previo aviso. El titular no se hace responsable de interrupciones del servicio ajenas a su voluntad."] },
      { title: "Enlaces a terceros", body: ["La web enlaza a servicios de terceros (Just Eat, Uber Eats, WhatsApp, Google Maps, Instagram, TikTok). Cada uno se rige por sus propias condiciones."] },
      { title: "Legislación aplicable", body: ["Este aviso se rige por la legislación española. Para cualquier conflicto serán competentes los juzgados y tribunales de Ourense, salvo que la ley disponga otra cosa."] },
    ],
  },
  privacidad: {
    title: "Política de privacidad",
    sections: [
      { title: "Responsable del tratamiento", body: [`${LEGAL_OWNER.name} (NIF ${LEGAL_OWNER.nif}), ${LEGAL_OWNER.address}. Contacto: ${LEGAL_OWNER.email}.`] },
      { title: "Finalidad del tratamiento", body: ["Responder a los mensajes que nos envías y gestionar los pedidos que nos haces por teléfono o WhatsApp. La web no guarda datos en ningún servidor: el formulario abre tu programa de correo."] },
      { title: "Base jurídica", body: ["Tu consentimiento al escribirnos y, en el caso de los pedidos, la ejecución de la relación comercial que solicitas."] },
      { title: "Destinatarios", body: ["No cedemos tus datos a terceros salvo obligación legal. Si escribes por WhatsApp o pides por una app de reparto, esos servicios tratan tus datos según sus propias políticas."] },
      { title: "Derechos del usuario", body: ["Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad escribiendo al correo indicado arriba."] },
      { title: "Conservación de datos", body: ["Conservamos los datos el tiempo necesario para atender tu solicitud y cumplir las obligaciones legales."] },
      { title: "Reclamación ante la AEPD", body: ["Si consideras que no hemos tratado bien tus datos, puedes reclamar ante la Agencia Española de Protección de Datos (www.aepd.es)."] },
    ],
  },
  cookies: {
    title: "Política de cookies",
    sections: [
      { title: "Qué son las cookies", body: ["Son pequeños archivos que una web guarda en tu navegador para recordar información entre visitas."] },
      {
        title: "Tipos de cookies que usamos",
        body: [
          "Técnicas: la web guarda en tu navegador (localStorage) el tema claro u oscuro, el taco que estás montando y tu elección sobre cookies. No sirven para identificarte y no salen de tu dispositivo.",
          "De terceros: el mapa de Google Maps de la página de contacto puede instalar cookies de Google. Por eso no se carga hasta que lo aceptas.",
          "No usamos cookies analíticas ni publicitarias.",
        ],
      },
      { title: "Cómo desactivarlas en el navegador", body: ["Puedes borrar o bloquear las cookies desde la configuración de tu navegador (Chrome, Firefox, Safari o Edge). Si las bloqueas, la web seguirá funcionando; el mapa no se mostrará."] },
      { title: "Cambios en la política", body: ["Si añadimos algún servicio nuevo que use cookies, actualizaremos esta página y te volveremos a pedir permiso."] },
    ],
  },
};

export const SEO = {
  home: {
    title: "BH Tacos | Los Originales French Tacos de Lyon en Ourense",
    description:
      "Descubre BH Tacos en Rúa Pena Trevinca, Ourense. Auténticos tacos franceses personalizables con patatas fritas interiores, carnes y deliciosa salsa quesera. ¡Pide online o ven a jugar a la PS5!",
  },
  carta: {
    title: "Carta y precios | BH Tacos Ourense",
    description: "Carta y precios de BH Tacos: French tacos M, L y XL, taco rebozado, entrantes y bebidas. Comida rápida en Ourense para cenar barato o pedir tacos a domicilio.",
  },
  builder: {
    title: "Monta tu French Taco paso a paso | BH Tacos",
    description: "Elige estilo, tamaño, carnes, salsas y gratinado y pide tu French taco por WhatsApp o para recoger en Rúa Pena Trevinca, Ourense.",
  },
  contacto: {
    title: "Contacto, horario y pedidos | BH Tacos Ourense",
    description: "Horario, dirección y formas de pedir en BH Tacos: a domicilio por Just Eat y Uber Eats, para recoger o por WhatsApp. Dónde comer en Peña Trevinca, Ourense.",
  },
  about: {
    title: "Sobre nosotros — De Lyon a Ourense | BH Tacos",
    description: "La historia de BH Tacos: los tacos franceses de Lyon, la salsa quesera casera y la zona gaming con PS5 en el centro de Ourense.",
  },
} as const;
