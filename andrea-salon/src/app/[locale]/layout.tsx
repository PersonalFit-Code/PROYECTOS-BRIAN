import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { BUSINESS, type DayKey } from "@/data/business";
import "@/data/integrity";
import { fontVariables } from "@/app/fonts";
import { LOCALES, LOCALE_META, isLocale, type Locale } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import CookieConsent from "@/components/consent/CookieConsent";
import ClientBoot from "@/components/layout/ClientBoot";
import HomeJsonLd from "@/components/legal/HomeJsonLd";
import { urlFor } from "@/lib/hosts";
import { SITE_URL, pageMetadata, serializeJsonLd, type JsonLdObject } from "@/lib/seo";
import { SITE_URL_IS_PROVISIONAL } from "@/lib/siteUrl";
import "../globals.css";

/*
 * LAYOUT RAÍZ DE TODO LO QUE LLEVA IDIOMA: la web pública `(web)` y la reserva `(reservar)`. El
 * panel no pasa por aquí (vive en `app/(panel)` con su propio `<html>`), y no hay `app/layout.tsx`.
 * Importar `@/data/integrity` aquí es lo que hace que el build se caiga si los datos no cuadran.
 */

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const m = await getMessages(locale);
  const title = m.home.seo.title;
  const description = m.home.seo.description;
  return {
    metadataBase: new URL(SITE_URL),
    description,
    keywords: [...m.common.seoKeywords],
    /* Mientras la web viva en el subdominio de Vercel, los buscadores no la listan (ver
       `SITE_URL_IS_PROVISIONAL`). Se abre sola al poner el dominio propio. */
    robots: SITE_URL_IS_PROVISIONAL ? { index: false, follow: true } : { index: true, follow: true },
    /* SVG para navegadores modernos. PENDIENTE: `apple-touch-icon.png` (180) y los PNG del manifiesto,
       que se generan del logo vectorial cuando Andrea lo mande. */
    icons: { icon: [{ url: "/favicon.svg", type: "image/svg+xml" }] },
    manifest: "/manifest.webmanifest",
    ...pageMetadata(locale, "/", { title, description }),
    /* Después del spread: `pageMetadata` devuelve `title` como cadena y borraría la plantilla. */
    title: { default: title, template: `%s · ${BUSINESS.name}` },
  };
}

export const viewport: Viewport = {
  themeColor: "#fdf7f9",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  /* Que el teclado encoja la página (formulario de reserva, chat futuro) en vez de taparla. */
  interactiveWidget: "resizes-content",
};

const DAY_SCHEMA: Record<DayKey, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

function salonJsonLd(locale: Locale, description: string): JsonLdObject {
  const openingHoursSpecification = (Object.entries(BUSINESS.hours) as Array<[DayKey, readonly { open: string; close: string }[]]>).flatMap(([day, ranges]) =>
    ranges.map((r) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: DAY_SCHEMA[day], opens: r.open, closes: r.close })),
  );
  return {
    "@context": "https://schema.org",
    "@type": "NailSalon",
    "@id": `${SITE_URL}/#salon`,
    name: BUSINESS.name,
    alternateName: [BUSINESS.legalName, ...BUSINESS.alternateNames],
    description,
    inLanguage: LOCALE_META[locale].hreflang,
    url: `${SITE_URL}/${locale}`,
    logo: `${SITE_URL}/brand/logo.png`,
    image: `${SITE_URL}/brand/logo.png`,
    telephone: BUSINESS.phone.e164,
    address: {
      "@type": "PostalAddress",
      streetAddress: BUSINESS.address.street,
      addressLocality: BUSINESS.address.city,
      addressRegion: BUSINESS.address.region,
      postalCode: BUSINESS.address.postalCode,
      addressCountry: BUSINESS.address.country,
    },
    /* Coordenadas aproximadas (PENDIENTE de fijar con la ficha de Google): mejor no publicarlas que
       mandar a Google a otra calle. Con la dirección le basta para geocodificar. */
    ...(BUSINESS.geo.pendiente ? {} : { geo: { "@type": "GeoCoordinates", latitude: BUSINESS.geo.lat, longitude: BUSINESS.geo.lng } }),
    hasMap: BUSINESS.maps,
    openingHoursSpecification,
    /* SIN `aggregateRating` A PROPÓSITO (lección de tixola): la nota es de la ficha de Google, no
       nuestra, y publicarla como AggregateRating propio de un LocalBusiness va contra las reglas de
       fragmentos de reseña de Google y puede acabar en acción manual. Las reseñas se citan en la web
       con su fuente; aquí no. */
    potentialAction: {
      "@type": "ReserveAction",
      target: urlFor("reservar", "/"),
    },
    sameAs: [BUSINESS.social.instagram, BUSINESS.social.facebook],
  };
}

export default async function LocaleLayout({ children, params }: Readonly<{ children: React.ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const messages = await getMessages(locale);

  return (
    <html lang={LOCALE_META[locale].hreflang} className={fontVariables}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(salonJsonLd(locale, messages.nav.footer.about)) }} />
        {/*
          RED DE SEGURIDAD DE LOS REVELADOS. El estado oculto de los `[data-reveal]` vive en CSS y el
          atributo viaja ya en el HTML del servidor; el ocultado solo se arma con `data-reveal-armed`,
          escrito aquí de forma síncrona antes del primer pintado (sin JS no existe y todo se lee). El
          temporizador es el vigía: si en 2,6 s nadie ha montado `useReveal` —bundle lento, error de
          hidratación— suelta el atributo y la página aparece sin animación en vez de en blanco. El
          hook lo cancela al montarse (`__asRevealWatchdog`).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{var r=document.documentElement;r.setAttribute("data-reveal-armed","");' +
              'window.__asRevealWatchdog=window.setTimeout(function(){r.removeAttribute("data-reveal-armed");' +
              "delete window.__asRevealWatchdog},2600)}catch(e){}",
          }}
        />
      </head>
      <body className="min-h-dvh bg-crema font-sans text-tinta antialiased">
        <LocaleProvider locale={locale} messages={messages}>
          {/* SALTAR AL CONTENIDO (WCAG 2.4.1). Primer enfocable, invisible hasta recibir el foco; el
              destino `#main` lo ponen los layouts `(web)` y `(reservar)`. */}
          <a
            href="#main"
            className="sr-only rounded-full focus-visible:not-sr-only focus-visible:fixed focus-visible:left-4 focus-visible:top-4 focus-visible:z-[100] focus-visible:inline-flex focus-visible:items-center focus-visible:bg-carmin focus-visible:px-5 focus-visible:py-3 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-carmin focus-visible:ring-offset-2 focus-visible:ring-offset-crema"
          >
            {messages.common.misc.skipToContent}
          </a>
          <ClientBoot />
          {children}
          {/* FAQPage + WebSite (solo emite en la portada de cada idioma). */}
          <HomeJsonLd locale={locale} />
          <CookieConsent />
        </LocaleProvider>
      </body>
    </html>
  );
}
