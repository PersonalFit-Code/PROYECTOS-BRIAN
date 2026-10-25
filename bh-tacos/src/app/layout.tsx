import type { Metadata, Viewport } from "next";
import { BUSINESS, SEO } from "@/content";
import { fontVariables } from "@/app/fonts";
import { restaurantJsonLd, serializeJsonLd } from "@/lib/seo";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import StickyOrderBar from "@/components/layout/StickyOrderBar";
import CookieBanner from "@/components/layout/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.siteUrl),
  title: { default: SEO.home.title, template: "%s" },
  description: SEO.home.description,
  keywords: [
    "French tacos Ourense",
    "BH Tacos",
    "tacos franceses Galicia",
    "comida rápida en Ourense",
    "cenar barato Ourense",
    "pedir tacos a domicilio Ourense",
    "dónde comer Peña Trevinca",
    "salsa quesera",
    "taco rebozado",
  ],
  applicationName: BUSINESS.name,
  icons: { icon: "/favicon.svg" },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "es_ES",
    siteName: BUSINESS.name,
    title: SEO.home.title,
    description: SEO.home.description,
    url: "/",
  },
  twitter: { card: "summary_large_image", title: SEO.home.title, description: SEO.home.description },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#1c1714" },
    { media: "(prefers-color-scheme: light)", color: "#f7efe2" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

/* Antes del primer pintado: tema guardado (oscuro por defecto) y marca de que hay JS (las
   apariciones solo ocultan contenido si hay JavaScript para mostrarlo). */
const BOOT = `try{var d=document.documentElement;var t=localStorage.getItem("bh_theme");d.dataset.theme=t==="light"?"light":"dark";d.setAttribute("data-js","")}catch(e){document.documentElement.setAttribute("data-js","")}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" data-theme="dark" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(restaurantJsonLd()) }} />
      </head>
      <body className="min-h-dvh">
        <a href="#main" className="skip-link">
          Saltar al contenido
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <StickyOrderBar />
        <CookieBanner />
      </body>
    </html>
  );
}
