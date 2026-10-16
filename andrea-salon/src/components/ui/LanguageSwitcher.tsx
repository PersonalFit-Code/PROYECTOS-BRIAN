"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale, useMessages } from "@/i18n/LocaleProvider";
import { LOCALES, LOCALE_META, isLocale, type Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

/** La misma página en otro idioma: cambia solo el prefijo («/es/servicios» → «/gl/servicios»). */
function enOtroIdioma(pathname: string, locale: Locale) {
  const parts = pathname.split("/");
  if (isLocale(parts[1])) parts[1] = locale;
  else parts.splice(1, 0, locale);
  return parts.join("/") || `/${locale}`;
}

/**
 * Selector de idioma: ES · GL. Son enlaces a la misma página en cada idioma (el idioma va en la
 * dirección; la cookie NEXT_LOCALE la refresca `proxy.ts` en cada petición con prefijo). Cada opción
 * se anuncia con su nombre en su propia lengua.
 *
 * NO SE PINTA mientras solo haya un idioma publicado (hoy): un selector con una sola opción es un
 * botón que no hace nada. Cuando `LOCALES` tenga el gallego, aparece solo en la cabecera y el pie.
 */
export default function LanguageSwitcher({ className, onNavigate, id = "idioma" }: { className?: string; onNavigate?: () => void; id?: string }) {
  const locale = useLocale();
  const m = useMessages();
  const reduced = useReducedMotion() ?? false;
  const pathname = usePathname() ?? `/${locale}`;
  if (LOCALES.length < 2) return null;
  return (
    <nav aria-label={m.nav.languageSwitcher} className={cn("grid auto-cols-fr grid-flow-col gap-1 rounded-full bg-white/70 p-1 ring-1 ring-carmin/12", className)}>
      {LOCALES.map((l) => {
        const on = l === locale;
        return (
          <Link
            key={l}
            href={enOtroIdioma(pathname, l)}
            hrefLang={LOCALE_META[l].hreflang}
            lang={LOCALE_META[l].hreflang}
            aria-current={on ? "true" : undefined}
            title={LOCALE_META[l].native}
            onClick={onNavigate}
            scroll={false}
            className={cn("pulsable relative flex min-h-9 items-center justify-center rounded-full px-3 text-[12.5px] font-semibold tracking-wide", on ? "text-white" : "text-gris hover:text-tinta")}
          >
            {on ? (
              <motion.span layoutId={`idioma-${id}`} className="absolute inset-0 rounded-full bg-carmin" transition={reduced ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 34 }} />
            ) : null}
            <span className="relative">{LOCALE_META[l].short}</span>
            {/* El nombre accesible empieza por lo que se ve («GL») y sigue con el idioma. */}
            <span className="sr-only"> · {LOCALE_META[l].native}</span>
          </Link>
        );
      })}
    </nav>
  );
}
