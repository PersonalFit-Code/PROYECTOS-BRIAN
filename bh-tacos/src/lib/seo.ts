import { BUSINESS, FAQ, HOURS, type DayKey } from "@/content";
import { MENU } from "@/data/menu";

const DAY_SCHEMA: Record<DayKey, string> = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" };

/** JSON seguro dentro de <script>: evita que un "</script>" en un texto cierre la etiqueta. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function restaurantJsonLd() {
  const url = BUSINESS.siteUrl;
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "@id": `${url}/#restaurant`,
    name: BUSINESS.name,
    description: "Auténticos French tacos de Lyon en Ourense: tortilla de trigo, carnes a elegir, patatas fritas dentro y salsa quesera casera, todo prensado a la plancha.",
    url,
    image: `${url}/opengraph-image`,
    telephone: BUSINESS.phone.tel,
    email: BUSINESS.email,
    priceRange: "€",
    servesCuisine: ["French tacos", "Comida rápida"],
    acceptsReservations: false,
    hasMap: BUSINESS.maps,
    hasMenu: `${url}/carta`,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: BUSINESS.geo.lat, longitude: BUSINESS.geo.lng },
    openingHoursSpecification: (Object.keys(HOURS) as DayKey[]).flatMap((day) =>
      HOURS[day].map((r) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_SCHEMA[day],
        opens: r.open,
        closes: r.close === "00:00" ? "23:59" : r.close,
      })),
    ),
    sameAs: [BUSINESS.social.instagram, BUSINESS.delivery.justEat, BUSINESS.delivery.uberEats],
  };
}

export function menuJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Menu",
    "@id": `${BUSINESS.siteUrl}/carta#menu`,
    name: "Carta de BH Tacos",
    inLanguage: "es",
    hasMenuSection: MENU.categories.map((c) => ({
      "@type": "MenuSection",
      name: c.name,
      description: c.description,
      hasMenuItem: c.items.map((i) => ({
        "@type": "MenuItem",
        name: i.name,
        description: i.description,
        offers: { "@type": "Offer", price: i.price.toFixed(2), priceCurrency: MENU.currency },
      })),
    })),
  };
}

export function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
}
