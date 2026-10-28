import type { Metadata, Viewport } from "next";
import { RegistrarSW } from "@/components/layout/RegistrarSW";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Plan de vida", template: "%s · Plan de vida" },
  description: "Metas, finanzas, hábitos y diario con coach.",
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: "Plan de vida", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#191919" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="antialiased">
        {children}
        <RegistrarSW />
      </body>
    </html>
  );
}
