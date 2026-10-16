"use client";

import { usePathname } from "next/navigation";
import { BUSINESS } from "@/data/business";
import { FAQ } from "@/data/faq";
import { LOCALE_META, stripLocale, type Locale } from "@/i18n/config";
import { useFormat, useMessages } from "@/i18n/LocaleProvider";
import { faqVars, stripFaqMarks } from "@/lib/faq";
import { absoluteUrl, faqJsonLd, serializeJsonLd, SITE_URL, type JsonLdObject } from "@/lib/seo";

/**
 * JSON-LD de la portada: `FAQPage` (data/faq.ts, el mismo que pinta `<Faq />`) y `WebSite`.
 * Se monta en el layout, pero solo emite en la ruta "/" de cada idioma: el FAQ describe la home y
 * las páginas legales publican su propio `BreadcrumbList`.
 * Las `**negritas**` se quitan con `stripFaqMarks`: el bloque visible las pinta en `<strong>`, así
 * que el texto que ve el visitante es el de aquí, sin asteriscos.
 */
export default function HomeJsonLd({ locale }: { locale: Locale }) {
  const m = useMessages();
  const t = useFormat();
  const pathname = usePathname();
  if (stripLocale(pathname ?? "/").path !== "/") return null;

  const vars = faqVars(m);
  const homeUrl = absoluteUrl(locale, "/");
  const faq = faqJsonLd(
    FAQ.map(({ q, a }) => ({ q: stripFaqMarks(t(q, vars)), a: stripFaqMarks(t(a, vars)) })),
    { locale, url: homeUrl },
  );
  const website: JsonLdObject = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: homeUrl,
    name: BUSINESS.name,
    inLanguage: LOCALE_META[locale].hreflang,
    publisher: { "@id": `${SITE_URL}/#salon` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(faq) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(website) }} />
    </>
  );
}
