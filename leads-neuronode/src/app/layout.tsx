import type { Metadata, Viewport } from "next";
import { APP_NOMBRE } from "@/lib/marca";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: APP_NOMBRE, template: `%s · ${APP_NOMBRE}` },
  description: "Seguimiento de los negocios a contactar: diagnóstico, propuesta e historial.",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
