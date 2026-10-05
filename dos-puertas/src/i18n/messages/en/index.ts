import type { Messages } from "@/i18n/getMessages";
import es from "../es";

/**
 * The site in British English, for visitors. House dish names stay in Spanish (with a short gloss
 * the first time it helps), customer reviews and literal quotes stay in the original Spanish, and
 * the legal texts are only published in Spanish, which is the binding version.
 */
const en: Messages = {
  common: {
    tagline: "The authentic taste of Los Vinos since 1974",
    description:
      "A pincho bar on Rúa dos Fornos, in Ourense's Os Viños wine-bar district, since 1974. The classic chicharrones, calamares, tortilla and empanadillas, standing up at the bar.",
    skipToContent: "Skip to content",
    area: "Old town · Os Viños district",
    language: "Language",
    call: "Call",
    directions: "Get directions",
    openInMaps: "Open in Google Maps",
    loadMap: "Load map",
    loadMapNote: "The map is provided by Google, which may use its own cookies.",
    loadMapPolicy: "Cookie policy",
    pending: "To be confirmed",
    photoPending: "Real photo coming soon",
    close: "Close",
    readMore: "See more",
    source: "Source",
    days: {
      mon: "Monday",
      tue: "Tuesday",
      wed: "Wednesday",
      thu: "Thursday",
      fri: "Friday",
      sat: "Saturday",
      sun: "Sunday",
    },
    daysShort: { mon: "Mo", tue: "Tu", wed: "We", thu: "Th", fri: "Fr", sat: "Sa", sun: "Su" },
    status: {
      open: "Open now",
      closesAt: "until {time}",
      closingSoon: "Closing soon",
      opensToday: "Opens today at {time}",
      closedToday: "Closed today",
      opensOn: "We open on {day} at {time}",
      opensTomorrow: "We open tomorrow at {time}",
      closed: "Closed",
    },
    today: "Today",
    closedDay: "Closed",
  },

  nav: {
    items: {
      home: "Home",
      carta: "Food & drink",
      vinos: "Wines",
      historia: "Our story",
      visita: "Visit us",
      preguntas: "FAQ",
    },
    subheadings: {
      home: "The front page",
      carta: "Pinchos, montados, bocadillos and sharing plates",
      vinos: "Galicia's wine denominations",
      historia: "Who we are, since 1974",
      visita: "Opening hours, map and how the bar works",
      preguntas: "Bookings, prices, dogs, allergens…",
    },
    menu: { label: "Menu", open: "Open the menu", close: "Close the menu", heading: "Navigation" },
    hoursShort: "Wednesday to Sunday, 19:30 – 00:00",
  },

  cover: {
    label: "Café Bar Dos Puertas",
    tagline: "Ourense · Since 1974",
    scroll: "Scroll",
  },

  puertas: {
    kicker: "Two doors",
    titleBefore: "Which way",
    titleAccent: "in?",
    lead: "Outside, the 1974 sign. Inside, a bar that's bang up to date.",
    hint: "Scroll to open them, or tap a door",
    open: "Open door {n}: {name}",
    doors: {
      siempre: {
        n: "1",
        label: "Door 1",
        name: "Same as ever",
        text: "Classic pinchos and half a century of history.",
        links: [
          { path: "/carta", label: "The menu" },
          { path: "/historia", label: "Our story" },
        ],
      },
      hoy: {
        n: "2",
        label: "Door 2",
        name: "Here and now",
        text: "Galician wine, well-pulled cañas and a freshly refurbished bar.",
        links: [
          { path: "/vinos", label: "The wines" },
          { path: "/#por-dentro", label: "Inside" },
        ],
      },
    },
  },

  hero: {
    kicker: "Rúa dos Fornos 7 · Since 1974",
    titleBefore: "The heart of",
    titleAccent: "Los Vinos",
    titleAfter: "in Ourense",
    subtitle: "Tradition, authenticity and the pinchos we've always made, on Rúa dos Fornos since 1974.",
    ctaPrimary: "See our pinchos",
    ctaSecondary: "Get directions",
    press: {
      outlet: "La Voz de Galicia",
      aria: "Read La Voz de Galicia's feature on the Dos Puertas",
      items: ["Even Amancio Ortega fell for its «calamares»", "Over 50 years behind the bar on Rúa dos Fornos", "A legend of the Os Viños district"],
    },
    showcase: {
      label: "House favourites",
      boardPrices: "Pinchos at €2",
      seeCarta: "See the menu",
    },
  },

  manifesto: {
    kicker: "How it works",
    titleBefore: "In one door,",
    titleAccent: "out",
    titleAfter: "the other",
    lead:
      "The two doors aren't just a pretty name: Irene and José put them in back in 1974 so people could come and go without holding up the bar. Half a century on, it's still that simple.",
    rules: [
      { title: "No bookings", text: "We don't take bookings: you turn up, order and share the bar." },
      { title: "Standing at the bar", text: "Tapas the old-fashioned way, shoulder to shoulder with whoever walks in." },
      { title: "Pinchos at €2", text: "Good old-fashioned bar prices, which are part of the recipe too." },
    ],
  },

  barra: {
    kicker: "The bar",
    titleBefore: "The same pinchos",
    titleAccent: "as ever",
    titleAfter: "",
    lead: "Laid out on the bar, ready to order on the spot, just as on day one. These are the four that never let you down.",
    seeAll: "See the full menu",
    openDetail: "Read the story of {name}",
    pageTitle: "Menu",
    pageLead:
      "What people order at the Dos Puertas, standing up and in no hurry. It changes from day to day: what you see on the bar is what there is.",
    priceNote:
      "Going by the board on the front of the bar: pinchos €2 and bocadillos (sandwiches) €4. Prices for raciones (sharing plates) still to be confirmed with the bar.",
    allergensNote: "Allergen information still to come: please ask at the bar.",
    storyLabel: "The story",
    filterLabel: "Filter the menu",
    all: "All",
    results: "{count} on the bar",
    categories: {
      casa: "House specials",
      montados: "Montados",
      raciones: "Bocadillos & sharing plates",
      beber: "Drinks",
    },
    items: {
      chicharrones: {
        name: "The famous chicharrones",
        tag: "House favourite",
        text: "Crispy pork, full of flavour and made to the traditional recipe. The most celebrated and sought-after pincho at the bar.",
        story:
          "They arrived in the 90s and were made in-house every day. One Ourense couple living in Switzerland used to fly over some weekends just for the chicharrones and the chipirones (baby squid).",
      },
      calamares: {
        name: "Calamares pincho",
        tag: "A must",
        text: "A Rúa dos Fornos icon. Tender squid, fried just right, in a little bread roll.",
        story:
          "It was born of a mix-up: in the 80s there was a roll of pork belly so crispy and curly that tourists asked for it as «the calamares one». So calamares joined the bar: baby squid (chipirones), in fact, but the name stuck. The family says even Amancio Ortega was won over.",
      },
      tortilla: {
        name: "Juicy tortilla",
        tag: "Homemade",
        text: "A juicy Spanish omelette, freshly made and onion-free, just the way customers asked for it.",
        story:
          "At first it had onion in it, but lots of people complained, so they started making it without, and that was that. Since the 90s it has been famous for how juicy it is.",
      },
      empanadillas: {
        name: "Traditional empanadillas",
        tag: "1974 recipe",
        text: "Little pasties with crisp pastry and a classic sofrito filling. Perfect for starting the round.",
        story:
          "They've been on the bar since the very first year. Some local schools used to order them for their parties: there were whole nights spent making a thousand empanadillas and more.",
      },
      rixones: {
        name: "Rixones",
        tag: "Galician",
        text: "Traditional Galician rixones (fried pork morsels), just like in the taverns of old.",
        story: "",
      },
      "lomo-queso": { name: "Pork loin and cheese", tag: "Montado", text: "Montado (topped bread) with pork loin and cheese.", story: "" },
      "jamon-queso": { name: "Ham and cheese", tag: "Montado", text: "Montado with ham and cheese.", story: "" },
      "atun-tomate": { name: "Tuna and tomato", tag: "Montado", text: "Montado with tuna and tomato.", story: "" },
      bocadillos: {
        name: "Bocadillos",
        tag: "€4",
        text: "The house pinchos as a proper sandwich, for when you're really hungry.",
        story: "",
      },
      raciones: {
        name: "Raciones",
        tag: "For sharing",
        text: "Calamares, serrano ham, fresh cheese and tortilla, as listed on the board by the door.",
        story: "",
      },
      vinos: {
        name: "Galician wines",
        tag: "Galician D.O.",
        text: "A selection of wines from Galicia's denominations of origin. Specific labels still to be confirmed.",
        story: "",
      },
      cerveza: { name: "Well-poured beer", tag: "Caña", text: "The classic caña (small draught beer) to go with your round.", story: "" },
    },
  },

  vinos: {
    kicker: "Wines",
    titleBefore: "Wines from",
    titleAccent: "these parts",
    pageLead:
      "People come to Os Viños for pinchos and Galician wine. Four of Galicia's five denominations of origin have vineyards in the province of Ourense.",
    houseKicker: "At the bar",
    houseTitle: "The house selection",
    houseText: "Wines from Galicia's denominations of origin, by the glass, to go with your round of pinchos.",
    houseFacts: ["By the glass", "Galician D.O.s"],
    housePending: "Specific labels still to be confirmed with the bar.",
    quoteLabel: "What people say about the wine",
    doKicker: "Denominations of origin",
    doTitle: "Five origins, one country",
    doLead: "Tap one to open it. On the map, each number sits where its denomination is, and all roads lead to Rúa dos Fornos.",
    doNote: "This shows where Galician wine comes from, not the bar's wine list: the Dos Puertas labels are still to be confirmed.",
    doPrefix: "D.O.",
    since: "D.O. since {year}",
    ourenseBadge: "Ourense province",
    mostly: { blanco: "Mostly white", tinto: "Mostly red" },
    whites: "White grapes",
    reds: "Red grapes",
    mapAria: "Map of Galicia showing its five wine denominations of origin.",
    mapFlow: "From each one, a path leads to Ourense, home of the Dos Puertas.",
    mapCredit: "Outline of Galicia: OpenStreetMap data, ODbL licence.",
    mapAtlantic: "Atlantic",
    mapPortugal: "Portugal",
    mapHere: "We're here",
    regionAria: "{name} denomination of origin",
    items: {
      "rias-baixas": {
        zone: "Atlantic coast of Pontevedra and southern A Coruña",
        text: "The only one of the five outside Ourense: the kingdom of Albariño, the Atlantic white.",
      },
      ribeiro: {
        zone: "The Miño, Avia and Arnoia valleys, west of the city",
        text: "One of the oldest denominations in Spain. Aromatic whites from Treixadura and reds from native grape varieties.",
      },
      "ribeira-sacra": {
        zone: "The Sil and Miño canyons, between Ourense and Lugo",
        text: "Terraced vineyards on impossibly steep slopes: what's known as heroic viticulture. Mencía red country.",
      },
      valdeorras: {
        zone: "The Sil valley, at the far eastern end of the province",
        text: "The home of Godello, Galicia's great inland white, and of Mencía reds.",
      },
      monterrei: {
        zone: "The Monterrei valley, around Verín, next to Portugal",
        text: "Godello and Treixadura whites and Mencía reds, in the southernmost of the five, right by Portugal.",
      },
    },
  },

  historia: {
    kicker: "Our story",
    titleBefore: "Over 50 years",
    titleAccent: "of history",
    titleAfter: "and counting",
    pageTitle: "Our story",
    pageLead:
      "The Dos Puertas opened in 1974, when the only other bar on Rúa dos Fornos was O Campante. This is its story, told by the family who founded it.",
    timeline: [
      {
        year: "1950s",
        title: "From Laza to Basel",
        text: "Irene Fernández and José García emigrated from Laza to Basel, in Switzerland. There they learnt the hospitality trade: «todo lo que luego pusimos en práctica en Ourense» (everything we later put into practice in Ourense).",
      },
      {
        year: "1974",
        title: "The two doors open",
        text: "They came back to be near their daughter Rosa and opened the bar on Rúa dos Fornos, with two doors to make coming and going easier and something new: every pincho laid out on the bar, ready to order on the spot. José in the kitchen, Irene behind the bar.",
      },
      {
        year: "1970s",
        title: "The house moruno",
        text: "The most popular pincho of the early years was the moruno (spiced meat skewer): steel skewers brought from Switzerland, a sauce José never gave away and a price of around 25 pesetas. They were also the first to serve bread rolls, handmade by a baker.",
        photo: "anos70",
      },
      {
        year: "1984",
        title: "Along come the «calamares»",
        text: "Luis Aguiar, Rosa's husband, joined the bar. A mix-up over a pork-belly roll so crispy that tourists asked for it as «the calamares one» gave birth to the most famous pincho. On Fridays and Saturdays more than 1,200 rolls went out a day.",
      },
      {
        year: "1990s",
        title: "Tortilla and chicharrones",
        text: "In came the tortilla (Spanish potato omelette), without onion because that's how customers wanted it, and the chicharrones (crispy pork), made in-house every day, which soon became one of the best-selling pinchos.",
      },
      {
        year: "2000s",
        title: "Keeping it in the family",
        text: "José and Irene retired and Luis took over, keeping the business just as it was. When the euro arrived, a pincho went from 80 pesetas to 65 cents.",
      },
      {
        year: "Today",
        title: "Marisol and Marisa",
        text: "Since the pandemic the bar has been run by sisters Marisol and Marisa López, who have long experience in Ourense's bars and restaurants and have set out to keep the spirit of the Dos Puertas intact.",
        photo: "hoy",
      },
    ],
    photos: {
      anos70: {
        alt: "Black-and-white photograph: Irene behind the bar of the Dos Puertas, with customers on the other side, in the late seventies.",
        caption: "Irene, behind the bar of the Dos Puertas, in the late seventies.",
        credit: "Photo: La Voz de Galicia",
      },
      hoy: {
        alt: "Today's team behind the granite bar, with the day's pinchos.",
        caption: "The bar today.",
        credit: "Photo: Faro de Vigo",
      },
    },
    sourceLabel: "Source",
    source:
      "La Voz de Galicia, “Hasta Amancio Ortega se dejó conquistar por los «calamares» del Dos Puertas de Ourense” (Even Amancio Ortega fell for the Dos Puertas «calamares»), 2 March 2024.",
    quote: "Lo nuestro eran los pinchos a buen precio.",
    quoteAuthor: "Luis Aguiar, to La Voz de Galicia (“good-value pinchos were our thing”)",
    famousKicker: "Famous faces at the bar",
    famousTitle: "Even Amancio Ortega",
    famousText:
      "The family proudly remembers that Amancio Ortega came into the bar and loved the «calamares». Fran, the Deportivo footballer, the singer Cristina Pato and politicians such as Feijóo and Santalices were regulars too.",
    pressLink: "Read the article in La Voz de Galicia",
  },

  social: {
    kicker: "What people say",
    titleBefore: "Not to be",
    titleAccent: "missed",
    titleAfter: "",
    lead: "{count} genuine 4- and 5-star reviews from Google and TripAdvisor, quoted word for word in the original Spanish, with the reviewer's name.",
    ratingLabel: "Value-for-money rating",
    ratingCount: "{count} reviews on TripAdvisor",
    readOn: "Read more on TripAdvisor",
    readOnGoogle: "See them all on Google",
    stars: "{n} out of 5",
  },

  interior: {
    kicker: "Inside",
    titleBefore: "What it's like",
    titleAccent: "inside",
    lead:
      "White walls, shelves full of wine lit in blue, glasses hanging upside down above the bar and black signs with good old-fashioned bar sayings, all of them upbeat.",
    signsLabel: "Signs on the wall",
    note: "An illustration of the bar. The signs carry quotes from customers on Google and TripAdvisor until we have a photo of the real ones.",
  },

  visita: {
    kicker: "Visit us",
    titleBefore: "Right in the",
    titleAccent: "old town",
    titleAfter: "",
    lead: "A stone's throw from the cathedral, on the street with the longest pincho tradition in Ourense.",
    hoursTitle: "Opening hours",
    addressTitle: "Where",
    paymentTitle: "Payment",
    payments: { cash: "Cash", card: "Card", mobile: "Mobile payment" },
    noReservations: "We don't take bookings: it's tapas at the bar, first come, first served.",
    pageTitle: "Visit us",
    pageLead: "Everything you need to know before you walk through either of our two doors.",
    mapLabel: "Map of the Os Viños district showing where the Dos Puertas is",
    faqLink: "Frequently asked questions",
  },

  faq: {
    kicker: "Questions",
    titleBefore: "Before you",
    titleAccent: "step inside",
    pageLead: "What we get asked most: bookings, opening hours, prices and everything else. If anything's still unclear, give us a call.",
    pendingBadge: "To be confirmed",
    ctaTitle: "Still got a question?",
    ctaText: "Give us a call during opening hours and we'll fill you in.",
    groups: [
      {
        title: "Before you come",
        items: [
          { q: "Do you take bookings?", a: "No. The Dos Puertas is a stand-at-the-bar place: you turn up, order and eat, first come, first served." },
          { q: "Are there tables to sit at?", a: "No. Here you eat standing at the bar, just as people have since 1974. That's part of the charm." },
          { q: "What days and times are you open?", a: "Wednesday to Sunday, from 7:30 pm to midnight. We're closed on Mondays and Tuesdays." },
          { q: "When is it busiest?", a: "According to our customers, the bar gets absolutely packed on weekend nights. A good sign." },
          {
            q: "Where are you?",
            a: "At Rúa dos Fornos 7, right in Ourense's old town and a stone's throw from the cathedral: the Os Viños wine-bar district.",
            link: { path: "/visita", label: "See the map" },
          },
        ],
      },
      {
        title: "At the bar",
        items: [
          { q: "How much is a pincho?", a: "According to the board by the door, €2 a pincho and €4 a bocadillo (sandwich).", pending: true },
          {
            q: "What are the house pinchos?",
            a: "The chicharrones (crispy pork), the calamares, the tortilla (Spanish omelette) and the empanadillas (little pasties). There are also rixones and montados.",
            link: { path: "/carta", label: "See the menu" },
          },
          {
            q: "Are the «calamares» really squid?",
            a: "The pincho was born in the 80s from a mix-up with a crispy pork-belly roll that tourists asked for as «the calamares one». What's served is baby squid (chipirones), but the name stuck.",
          },
          { q: "Does the tortilla have onion in it?", a: "No. It used to, but lots of people complained, so since the 90s it's been made without." },
          {
            q: "What wines do you have?",
            a: "Wines from Galicia's denominations of origin, by the glass, to go with your round.",
            link: { path: "/vinos", label: "See the wines" },
          },
          { q: "Can I get food to take away?", a: "The bar's online listings say yes. Ask at the bar.", pending: true },
          { q: "Do you have allergen information?", a: "Ask at the bar before you order and we'll tell you what's in each pincho.", pending: true },
        ],
      },
      {
        title: "Anything else",
        items: [
          { q: "Can I pay by card?", a: "Yes: cash, card and mobile payment." },
          {
            q: "Can I bring my dog?",
            a: "Several customers say in their reviews that they came in with their dog without any problem; one was even given water for it.",
            pending: true,
          },
        ],
      },
    ],
  },

  footer: {
    about: "A pincho bar in Ourense's Os Viños district since 1974.",
    hours: "Opening hours",
    location: "Location",
    links: "The bar",
    rights: "© {year} Café Bar Dos Puertas",
    legal: "Legal notice",
    credits: "Website proposal · photos and information still to be checked with the bar",
  },

  consent: {
    title: "Cookies, only if you want them",
    settingsTitle: "Cookie settings",
    text: "There are no analytics or advertising cookies here. The only thing that uses them is the Google map, and it won't load until you accept it.",
    policy: "Cookie policy",
    accept: "Accept all",
    reject: "Reject",
    configure: "Customise",
    save: "Save my choices",
    close: "Close without changes",
    necessary: {
      title: "Necessary",
      always: "Always on",
      text: "They store the choice you make here in your browser, so we don't have to ask you on every page. They never leave your device.",
    },
    maps: {
      title: "Google map",
      text: "Loads Google Maps so you can see how to get here without leaving the website. Once it loads, Google may set its own cookies.",
    },
    footerLink: "Cookie settings",
    mapsOn: "Google map loaded with your permission.",
    change: "Change",
  },

  legal: {
    ...es.legal,
    kicker: "Legal",
    draftNotice:
      "Draft: the business owner's details are still missing (marked in gold), and a professional should review it before the final website goes live.",
    updated: "Last updated: 5 October 2026",
    tocLabel: "On this page",
    otherDocs: "Other legal texts",
    onlySpanish: "These legal texts are published in Spanish, which is the binding version.",
    docs: {
      "aviso-legal": { ...es.legal.docs["aviso-legal"], title: "Legal notice" },
      privacidad: { ...es.legal.docs.privacidad, title: "Privacy" },
      cookies: { ...es.legal.docs.cookies, title: "Cookies" },
    },
  },

  notFound: {
    title: "This door doesn't lead anywhere",
    text: "But the other two do.",
    back: "Back to the bar",
  },
};

export default en;
