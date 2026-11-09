import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { fontVariables } from "./fonts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BotonWhatsApp from "@/components/layout/BotonWhatsApp";
import Revelados from "@/components/ui/Revelados";
import CtaFlotante from "@/components/layout/CtaFlotante";
import FranjaPie from "@/components/layout/FranjaPie";
import BarraMovil from "@/components/layout/BarraMovil";
import Asistente from "@/components/layout/Asistente";
import { negocio } from "@/data/negocio";
import { INDEXAR, URL_SITIO } from "@/lib/sitio";

export const metadata: Metadata = {
  metadataBase: new URL(URL_SITIO),
  title: {
    default: "720 GYM CLUB · Gimnasio con aforo limitado en Ourense",
    template: "%s · 720 GYM CLUB",
  },
  description:
    "Gimnasio con aforo limitado en Ourense, abierto los 365 días. Fuerza, Pilates Reformer, yoga, powerlifting y CrossGym. Prueba una clase gratis.",
  keywords: ["gimnasio Ourense", "gimnasio aforo limitado Ourense", "Pilates Reformer Ourense", "powerlifting Ourense", "yoga Ourense", "entrada diaria gimnasio Ourense"],
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: "720 GYM CLUB",
    title: "720 GYM CLUB · Entrena. Cuídate. Crece.",
    description: "Club de entrenamiento con aforo limitado en Ourense, abierto los 365 días.",
  },
  robots: INDEXAR ? { index: true, follow: true } : { index: false, follow: false },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#0e0e0f", colorScheme: "dark" };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ExerciseGym",
  name: negocio.nombre,
  slogan: "Entrena. Cuídate. Crece.",
  url: URL_SITIO,
  telephone: negocio.telefono,
  email: negocio.email,
  address: {
    "@type": "PostalAddress",
    streetAddress: "Calle Río Bibei, 16, bajo",
    postalCode: negocio.direccion.cp,
    addressLocality: "Ourense",
    addressRegion: "Ourense",
    addressCountry: "ES",
  },
  geo: { "@type": "GeoCoordinates", latitude: negocio.direccion.lat, longitude: negocio.direccion.lng },
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
      opens: negocio.horario.apertura,
      closes: negocio.horario.cierre,
    },
  ],
  sameAs: [negocio.instagram, negocio.facebook],
  image: `${URL_SITIO}/opengraph-image`,
  logo: `${URL_SITIO}/icon.svg`,
  priceRange: "5 €–375 €",
  hasMap: negocio.google.url,
  areaServed: "Ourense",
  knowsAbout: ["Entrenamiento de fuerza", "Pilates Reformer", "Yoga", "Powerlifting", "Entrenamiento personal", "Hipopresivos"],
  amenityFeature: [{ "@type": "LocationFeatureSpecification", name: "Accesible en silla de ruedas", value: true }],
};

/* Antes del primer pintado: arma los revelados (con vigía) y aplica el acento guardado o pedido por
   URL (?acento=bn|naranja|rojo). Sin nada, monocromo. */
const scriptInicial =
  'try{var r=document.documentElement;r.setAttribute("data-reveal-armed","");' +
  'window.__revealWatchdog=window.setTimeout(function(){r.removeAttribute("data-reveal-armed");delete window.__revealWatchdog},2600);' +
  'var q=new URLSearchParams(location.search).get("acento");if(q==="rojo"||q==="naranja"||q==="bn"){try{localStorage.setItem("acento-720",q)}catch(e){}}' +
  'var a=q||(function(){try{return localStorage.getItem("acento-720")}catch(e){return null}})();if(a==="rojo"||a==="naranja")r.setAttribute("data-acento",a)}catch(e){}';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: scriptInicial }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[100] focus-visible:bg-acento focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-acento-tinta"
        >
          Saltar al contenido
        </a>
        <Header />
        <main id="main">{children}</main>
        <FranjaPie />
        <Footer />
        <BotonWhatsApp />
        <CtaFlotante />
        <BarraMovil />
        <Asistente />
        <Revelados />
      </body>
    </html>
  );
}
