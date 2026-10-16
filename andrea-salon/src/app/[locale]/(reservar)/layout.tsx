import { ArrowLeft, Phone } from "lucide-react";
import type { ReactNode } from "react";
import { BUSINESS } from "@/data/business";
import { isLocale, DEFAULT_LOCALE } from "@/i18n/config";
import { getMessages } from "@/i18n/getMessages";
import { urlFor } from "@/lib/hosts";

/**
 * Reserva: cabecera mínima, sin menú, sin chat, sin Lenis. Aquí la clienta viene a una cosa y todo
 * lo que no sea reservar le estorba. Sí hay vuelta a la web y el teléfono, por si prefiere llamar.
 * (El `<html>`, las fuentes y el `LocaleProvider` los pone `app/[locale]/layout.tsx`.)
 */
export default async function ReservarLayout({ children, params }: { children: ReactNode; params: Promise<{ locale: string }> }) {
  const { locale: l } = await params;
  const locale = isLocale(l) ? l : DEFAULT_LOCALE;
  const m = (await getMessages(locale)).reservar;
  return (
    <div className="min-h-dvh bg-white">
      <header className="sticky top-0 z-30 border-b border-nude bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3 px-2 py-2 sm:px-4">
          <a href={urlFor("web", "/", locale)} className="inline-flex min-h-11 items-center gap-3 px-2 text-tinta">
            <ArrowLeft aria-hidden className="size-4" />
            <span className="titulo-editorial text-base tracking-[0.24em]">{BUSINESS.name}</span>
            <span className="sr-only">{m.header.back}</span>
          </a>
          <a href={BUSINESS.phone.tel} className="inline-flex min-h-11 items-center gap-2 px-3 text-sm text-gris hover:text-tinta">
            <Phone aria-hidden className="size-4 text-carmin-suave" />
            <span className="hidden sm:inline">{BUSINESS.phone.display}</span>
            <span className="sr-only sm:hidden">{m.header.call}</span>
          </a>
        </div>
      </header>
      <main id="main">{children}</main>
    </div>
  );
}
