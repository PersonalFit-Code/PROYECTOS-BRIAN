import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { BUSINESS } from "@/data/business";
import { fontVariables } from "@/app/fonts";
import { LOCALES, LOCALE_META, isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { SITE_URL, serializeJsonLd } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Dock from "@/components/layout/Dock";
import Footer from "@/components/layout/Footer";
import ClientBoot from "@/components/layout/ClientBoot";
import "../globals.css";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = getMessages(locale);
  const title = `${BUSINESS.legalName} · ${m.hero.titleBefore} ${m.hero.titleAccent} ${m.hero.titleAfter}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s · ${BUSINESS.legalName}` },
    description: m.common.description,
    icons: { icon: "/favicon.svg" },
  };
}

export const viewport: Viewport = {
  themeColor: "#121826",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const DAY_SCHEMA = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" } as const;

function barJsonLd(locale: Locale, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BarOrPub",
    "@id": `${SITE_URL}/#bar`,
    name: BUSINESS.legalName,
    description,
    inLanguage: LOCALE_META[locale].hreflang,
    url: `${SITE_URL}/${locale}`,
    telephone: BUSINESS.phone.e164,
    priceRange: BUSINESS.priceRangeSchema,
    servesCuisine: ["Galician", "Tapas"],
    acceptsReservations: "False",
    foundingDate: String(BUSINESS.founded),
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: BUSINESS.geo.lat, longitude: BUSINESS.geo.lng },
    openingHoursSpecification: Object.entries(BUSINESS.hours).flatMap(([day, ranges]) =>
      ranges.map((r) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: DAY_SCHEMA[day as keyof typeof DAY_SCHEMA],
        opens: r.open,
        closes: r.close === "00:00" ? "23:59" : r.close,
      })),
    ),
    hasMenu: `${SITE_URL}/${locale}/carta`,
    sameAs: [BUSINESS.social.tripadvisor, BUSINESS.social.facebook],
  };
}

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const messages = getMessages(locale);

  return (
    <html lang={LOCALE_META[locale].hreflang} className={fontVariables}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(barJsonLd(locale, messages.common.description)) }} />
        {/* Arma el ocultado de los revelados antes del primer pintado; el vigía lo suelta a los 2,6 s
            si el JS no llega, para que nunca quede una sección en blanco. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var r=document.documentElement;r.setAttribute("data-reveal-armed","");' +
              'window.__dpRevealWatchdog=window.setTimeout(function(){r.removeAttribute("data-reveal-armed")},2600)}catch(e){}',
          }}
        />
      </head>
      <body className="min-h-dvh bg-tinta text-cream antialiased">
        <LocaleProvider locale={locale} messages={messages}>
          <a
            href="#main"
            className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:rounded-full focus-visible:bg-oro focus-visible:px-5 focus-visible:py-3 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-tinta"
          >
            {messages.common.skipToContent}
          </a>
          <ClientBoot />
          <div id="app-shell">
            <Header />
            <main id="main">{children}</main>
            <Footer />
          </div>
          <Dock />
        </LocaleProvider>
      </body>
    </html>
  );
}
