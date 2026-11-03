import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { fontVariables } from "./fonts";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BotonWhatsApp from "@/components/layout/BotonWhatsApp";

export const metadata: Metadata = {
  title: { default: "Hungceed · Equipamiento de gimnasio", template: "%s · Hungceed" },
  description: "Maqueta de la nueva web de Hungceed: racks, máquinas, pesas y accesorios de marca propia, y Hungceed GYM.",
  /* Es una maqueta para enseñar: fuera de los buscadores. */
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: "#0a0a0b" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    /* `data-reveal-armed` lo pone el script de abajo antes del primer pintado: de ahí el aviso. */
    <html lang="es" className={fontVariables} suppressHydrationWarning>
      <head>
        {/*
          Red de seguridad de los revelados (heredada de la plantilla): el ocultado solo se arma con
          este atributo; si en 2,6 s nadie monta `useReveal`, se quita y todo se ve sin animación.
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
      <body>
        <a
          href="#main"
          className="sr-only focus-visible:not-sr-only focus-visible:fixed focus-visible:top-3 focus-visible:left-3 focus-visible:z-[100] focus-visible:bg-rojo focus-visible:px-4 focus-visible:py-2 focus-visible:text-sm focus-visible:font-semibold focus-visible:text-white"
        >
          Saltar al contenido
        </a>
        <div id="app-shell">
          <Header />
          <main id="main">{children}</main>
          <Footer />
        </div>
        <BotonWhatsApp />
      </body>
    </html>
  );
}
