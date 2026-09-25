import type { Metadata, Viewport } from "next";
import { Playfair_Display, Manrope, Bebas_Neue } from "next/font/google";
import { BUSINESS } from "@/data/business";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  style: ["normal", "italic"],
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const bebas = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-bebas",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tixola.restaurantesourense.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BUSINESS.name} · Tapas junto a la Catedral de Ourense`,
    template: `%s · ${BUSINESS.name}`,
  },
  description: `${BUSINESS.subtitle} ${BUSINESS.ratings.google.value} ★ en Google con más de ${BUSINESS.ratings.google.count} reseñas. ${BUSINESS.address.full}.`,
  keywords: [
    "tapería Ourense",
    "tapas Ourense",
    "zamburiñas Ourense",
    "pulpo a la gallega Ourense",
    "bar de tapas catedral Ourense",
    "Tixola",
    "vinos gallegos",
    "cerveza artesanal Ourense",
  ],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: BUSINESS.name,
    title: `${BUSINESS.name} · ${BUSINESS.tagline}`,
    description: BUSINESS.subtitle,
    url: SITE_URL,
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: `${BUSINESS.name} — tapas en Ourense` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS.name} · ${BUSINESS.tagline}`,
    description: BUSINESS.subtitle,
    images: ["/og.jpg"],
  },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#121212",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const DAY_SCHEMA: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function jsonLd() {
  const openingHoursSpecification = Object.entries(BUSINESS.hours).flatMap(([day, ranges]) =>
    ranges.map((r) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: DAY_SCHEMA[day],
      opens: r.open,
      closes: r.close === "00:00" ? "23:59" : r.close,
    })),
  );
  return {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: BUSINESS.name,
    alternateName: BUSINESS.legalName,
    description: BUSINESS.description,
    url: SITE_URL,
    telephone: BUSINESS.phone.e164,
    priceRange: BUSINESS.priceRangeSchema,
    servesCuisine: ["Gallega", "Tapas", "Española"],
    acceptsReservations: "True",
    image: `${SITE_URL}/og.jpg`,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: BUSINESS.geo.lat, longitude: BUSINESS.geo.lng },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: BUSINESS.ratings.google.value,
      reviewCount: BUSINESS.ratings.google.count,
      bestRating: 5,
    },
    openingHoursSpecification,
    hasMenu: `${SITE_URL}/carta`,
    sameAs: [BUSINESS.social.tripadvisor],
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${playfair.variable} ${manrope.variable} ${bebas.variable}`}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd()) }} />
      </head>
      <body className="min-h-dvh bg-iron text-cream antialiased">{children}</body>
    </html>
  );
}
