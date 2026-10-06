"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useLocale, useMessages } from "@/i18n/LocaleProvider";
import { LOCALES, LOCALE_META, isLocale, type Locale } from "@/i18n/config";
import { cn } from "@/lib/cn";

/** La misma página en otro idioma: cambia solo el prefijo («/es/carta» → «/gl/carta»). */
function enOtroIdioma(pathname: string, locale: Locale) {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) parts[1] = locale;
  else parts.splice(1, 0, locale);
  return parts.join("/") || `/${locale}`;
}

/**
 * Selector de idioma: ES · GL · EN · PT. Son enlaces a la misma página en cada idioma (sin
 * cookies ni almacenamiento: el idioma va en la dirección). Cada opción se anuncia con su nombre
 * en su propia lengua.
 */
export default function LanguageSwitcher({ className, onNavigate, id = "idioma" }: { className?: string; onNavigate?: () => void; id?: string }) {
  const locale = useLocale();
  const m = useMessages();
  const pathname = usePathname() ?? `/${locale}`;
  return (
    <nav aria-label={m.common.language} className={cn("grid grid-cols-4 gap-1 rounded-full bg-cream/[0.05] p-1 ring-1 ring-cream/10", className)}>
      {LOCALES.map((l) => {
        const on = l === locale;
        return (
          <Link
            key={l}
            href={enOtroIdioma(pathname, l)}
            hrefLang={LOCALE_META[l].hreflang}
            lang={LOCALE_META[l].hreflang}
            aria-current={on ? "true" : undefined}
            title={LOCALE_META[l].label}
            onClick={onNavigate}
            scroll={false}
            className={cn("pulsable relative flex min-h-9 items-center justify-center rounded-full text-[12.5px] font-semibold tracking-wide", on ? "text-botella" : "text-cream-muted hover:text-cream")}
          >
            {on ? <motion.span layoutId={`idioma-${id}`} className="absolute inset-0 rounded-full bg-oro" transition={{ type: "spring", stiffness: 420, damping: 34 }} /> : null}
            <span className="relative">{LOCALE_META[l].short}</span>
            {/* El nombre accesible empieza por lo que se ve («GL») y sigue con el idioma. */}
            <span className="sr-only"> · {LOCALE_META[l].label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
