import type { Metadata, Viewport } from "next";
import { RegistrarSW } from "@/components/layout/RegistrarSW";
import { APP_NOMBRE } from "@/lib/marca";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: APP_NOMBRE, template: `%s · ${APP_NOMBRE}` },
  description: "Tu plan de vida: metas, finanzas, hábitos y diario, con un coach que te empuja.",
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: { capable: true, title: APP_NOMBRE, statusBarStyle: "default" },
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
