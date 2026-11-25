import type { Metadata, Viewport } from "next";
import { Intro, SCRIPT_INTRO } from "@/components/Intro";
import { APP_NOMBRE } from "@/lib/marca";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: APP_NOMBRE, template: `%s · ${APP_NOMBRE}` },
  description: "Seguimiento de los negocios a contactar: diagnóstico, propuesta e historial.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#0b0918" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_INTRO }} />
      </head>
      <body className="antialiased">
        <Intro />
        {children}
      </body>
    </html>
  );
}
