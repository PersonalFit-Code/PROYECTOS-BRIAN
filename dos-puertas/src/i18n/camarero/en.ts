import type { CamareroTexts } from "./es";

/**
 * The virtual waiter in English. Review quotes stay in the original Spanish, as on the rest of the
 * site, with a short translation in brackets where it helps.
 */
const en: CamareroTexts = {
  open: "Ask the waiter",
  title: "The waiter",
  subtitle: "Virtual · answers from the bar",
  close: "Close chat",
  greeting: "Hi there! I'm the Dos Puertas virtual waiter. Ask me anything about the bar or tap one of these questions.",
  nowLine: "Right now: {label}{detail}.",
  more: "See all questions",
  placeholder: "Type your question…",
  send: "Send",
  typing: "The waiter is typing…",
  fallback: "I don't have that one in my notebook. Ask at the bar or call us on {phone} and we'll tell you.",
  note: "Pre-written answers based on this website. What you type never leaves your phone.",
  pending: "Still to be confirmed with the bar",
  log: "Chat with the waiter",
  you: "You",
  language: "Chat language",
  groups: { lugar: "Hours & place", funciona: "How it works", pinchos: "Pinchos", beber: "Drinks", casa: "The bar" },
  status: {
    open: "Open now",
    closesAt: "open until {time}",
    closingSoon: "Closing soon",
    opensToday: "Opens today at {time}",
    closedToday: "Closed today",
    opensOn: "We open on {day} at {time}",
    opensTomorrow: "We open tomorrow at {time}",
    closed: "Closed",
  },
  days: { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" },
  actions: {
    call: "Call",
    maps: "Open in Google Maps",
    carta: "See the menu",
    vinos: "See the wines",
    historia: "Read the story",
    visita: "Hours and map",
    preguntas: "More questions",
  },
  items: {
    ahora: {
      q: "Are you open now?",
      a: "We're open Wednesday to Sunday, 7:30 pm to midnight. Closed on Mondays and Tuesdays.",
      keys: ["open", "now", "today", "closed"],
    },
    horario: {
      q: "What are your opening hours?",
      a: "Wednesday to Sunday, 7:30 pm to midnight. Closed on Mondays and Tuesdays.",
      keys: ["hours", "opening", "time", "close", "closing", "days", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "weekend", "when"],
    },
    donde: {
      q: "Where are you?",
      a: "At Rúa dos Fornos 7, right in Ourense's old town and a stone's throw from the cathedral: the Os Viños wine-bar district. Look for the green sign on the front.",
      keys: ["where", "address", "location", "find you", "street", "map", "fornos", "cathedral", "get there", "area"],
    },
    telefono: {
      q: "How can I call you?",
      a: "On {phone}, during opening hours.",
      keys: ["phone", "call", "contact", "number", "whatsapp"],
    },
    reservar: {
      q: "Can I book a table?",
      a: "No. This is a stand-at-the-bar place: you come in, order and eat, first come, first served.",
      keys: ["book", "reserv", "group", "party", "birthday"],
    },
    mesas: {
      q: "Are there tables to sit at?",
      a: "No: here you eat standing at the bar, just as people have since 1974. That's part of the charm.",
      keys: ["table", "sit", "seat", "chair", "stool", "standing"],
    },
    gente: {
      q: "When is it busiest?",
      a: "According to customers, it gets packed at peak times, especially on weekend nights. But they also talk about quick, attentive service at the bar.",
      keys: ["busy", "busiest", "crowd", "queue", "wait", "peak", "quiet", "atmosphere", "people"],
    },
    recomienda: {
      q: "What do you recommend?",
      a: "The four house classics: chicharrones (crispy pork), «calamares», tortilla and empanadillas. If it's your first time, start with the calamares and the chicharrones, the ones reviews mention most. And as customers say, two or three pinchos and you've had dinner.",
      keys: ["recommend", "pincho", "tapa", "eat", "food", "speciality", "specialty", "try", "menu", "dinner"],
    },
    precio: {
      q: "How much is a pincho?",
      a: "According to the board by the door, €2 a pincho and €4 a bocadillo (sandwich).",
      keys: ["price", "cost", "how much", "expensive", "cheap", "euro"],
    },
    calamares: {
      q: "Are the «calamares» really squid?",
      a: "Almost: they're baby squid (chipirones). The pincho was born in the 80s from a mix-up with a roll of pork belly so crispy that tourists asked for «the calamares one», and the name stuck. The family says Amancio Ortega loved them.",
      keys: ["calamar", "squid", "chipiron", "roll"],
    },
    chicharrones: {
      q: "What are the chicharrones like?",
      a: "Crispy, made to the traditional recipe and the most sought-after pincho at the bar. They arrived in the 90s and were made in-house every day. One customer sums them up: «chicharrones ricos, nada aceitosos» (tasty, not greasy at all).",
      keys: ["chicharr", "pork", "crackling"],
    },
    tortilla: {
      q: "Does the tortilla have onion?",
      a: "No. It used to, but lots of people complained, so since the 90s it's been made without.",
      keys: ["tortilla", "omelette", "omelet", "onion", "egg", "potato"],
    },
    vinos: {
      q: "What wines do you have?",
      a: "Galician wine by the glass, from Galicia's denominations of origin, to go with your round. The specific labels are still to be confirmed with the bar.",
      keys: ["wine", "albarin", "godello", "mencia", "ribeiro", "ribeira", "valdeorras", "monterrei", "glass", "red", "white"],
    },
    canas: {
      q: "Do you have draught beer?",
      a: "Of course! A proper caña (small draught beer), well poured, to go with your round. One customer puts it like this: «cañas y pinchos buenísimos».",
      keys: ["beer", "cana", "draught", "draft", "drink", "lager", "soft drink"],
    },
    pagar: {
      q: "Can I pay by card?",
      a: "Yes: cash, card and mobile payment.",
      keys: ["card", "pay", "payment", "cash", "contactless", "apple pay"],
    },
    llevar: {
      q: "Can I get food to take away?",
      a: "The bar's online listings say yes. Best to ask at the bar or give us a call.",
      keys: ["take away", "takeaway", "to go", "delivery", "order"],
    },
    alergenos: {
      q: "Do you have allergen information?",
      a: "Ask at the bar before ordering and we'll tell you what's in each pincho.",
      keys: ["allerg", "gluten", "coeliac", "celiac", "intoleran", "lactose", "vegan", "vegetarian"],
    },
    perro: {
      q: "Can I bring my dog?",
      a: "Several customers say in their reviews that they went in with their dog without any problem; one was even given water for it.",
      keys: ["dog", "pet", "animal", "puppy", "my dog", "bring my dog", "bring a dog"],
    },
    historia: {
      q: "How long has the bar been around?",
      a: "Since 1974. Irene Fernández and José García opened it after coming back from Switzerland, when the only other bar on Rúa dos Fornos was O Campante. Today it's run by the sisters Marisol and Marisa López.",
      keys: ["history", "how long", "since when", "how old", "1974", "founded", "opened", "owner", "who runs", "family", "marisa", "marisol"],
    },
    nombre: {
      q: "Why is it called Dos Puertas?",
      a: "Because it has two doors (dos puertas): Irene and José opened it in 1974 with two doors to make getting in and out easier, so you come in through one and leave through the other without holding up the bar.",
      keys: ["why is it called", "name", "doors", "door", "puertas"],
    },
    famosos: {
      q: "Has anyone famous been here?",
      a: "The family remembers that Amancio Ortega came in and loved the «calamares». Fran, the Deportivo footballer, the singer Cristina Pato and politicians such as Feijóo and Santalices were regulars too.",
      keys: ["famous", "celebrit", "amancio", "ortega", "cristina pato", "feijoo", "football", "deportivo"],
    },
  },
};

export default en;
