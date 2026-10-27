import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Estudio Adrián · Curso de incendios",
  description: "Test del curso de protección contra incendios: extintores, BIEs y detección.",
  appleWebApp: { capable: true, title: "Estudio Adrián · Curso de incendios", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f3f5fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0d1220" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="min-h-dvh font-sans antialiased">
        <div className="mx-auto w-full max-w-2xl px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </body>
    </html>
  );
}
