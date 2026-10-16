import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { fontVariables } from "@/app/fonts";
import "@/app/globals.css";

/**
 * Raíz del panel: es interno, en castellano y sin idioma en la URL, así que tiene su propio
 * `<html>` (no hay `app/layout.tsx`; cada grupo pinta el suyo). Nunca se indexa.
 */
export const metadata: Metadata = {
  title: { default: "Panel · Andrea Salón", template: "%s · Panel Andrea Salón" },
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = { themeColor: "#fdf7f9", width: "device-width", initialScale: 1 };

export default function PanelRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" className={fontVariables}>
      <body className="min-h-dvh bg-crema font-sans text-tinta antialiased">{children}</body>
    </html>
  );
}
