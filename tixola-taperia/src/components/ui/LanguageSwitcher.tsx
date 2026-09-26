"use client";

import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Globe } from "lucide-react";
import { LOCALES, LOCALE_META, localePath, stripLocale, type Locale } from "@/i18n/config";
import { useFormat, useLocale, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Constantes
   ────────────────────────────────────────────────────────────── */

const COOKIE = "NEXT_LOCALE";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

export interface LanguageSwitcherProps {
  /** `dropdown` (cabecera de escritorio) o `chips` (fila de 4 botones en el menú móvil). */
  variant?: "dropdown" | "chips";
  /** Lado hacia el que se abre el desplegable. */
  align?: "left" | "right";
  /** Se llama tras cambiar de idioma (p. ej. para cerrar el menú móvil). */
  onSelect?: (locale: Locale) => void;
  className?: string;
}

/* ──────────────────────────────────────────────────────────────
   Hook: cambiar de idioma conservando la ruta
   ────────────────────────────────────────────────────────────── */

/**
 * Devuelve `switchTo(locale)`: guarda la preferencia en la cookie NEXT_LOCALE (la misma que lee
 * `src/proxy.ts`) y navega a la misma ruta con el nuevo prefijo, conservando la query y el hash
 * (`/carta?cat=croquetas&sin=gluten#tix-raxo`: los filtros de la carta viven en la URL).
 */
function useSwitchLocale(onSelect?: (locale: Locale) => void) {
  const router = useRouter();
  const pathname = usePathname();
  const current = useLocale();

  return useCallback(
    (next: Locale) => {
      if (next === current) {
        onSelect?.(next);
        return;
      }
      document.cookie = `${COOKIE}=${next}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
      const { path } = stripLocale(pathname ?? "/");
      const { search, hash } = typeof window !== "undefined" ? window.location : { search: "", hash: "" };
      router.push(`${localePath(next, path)}${search}${hash}`);
      onSelect?.(next);
    },
    [current, pathname, router, onSelect],
  );
}

/* ──────────────────────────────────────────────────────────────
   Variante "chips" (menú móvil)
   ────────────────────────────────────────────────────────────── */

function LanguageChips({ onSelect, className }: Pick<LanguageSwitcherProps, "onSelect" | "className">) {
  const m = useMessages();
  const t = useFormat();
  const current = useLocale();
  const switchTo = useSwitchLocale(onSelect);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <span className="font-caps text-[10px] uppercase tracking-[0.3em] text-cream-faint">{m.nav.language.label}</span>
      <div role="group" aria-label={m.nav.languageSwitcher} className="grid grid-cols-4 gap-2">
        {LOCALES.map((locale) => {
          const active = locale === current;
          const meta = LOCALE_META[locale];
          return (
            <button
              key={locale}
              type="button"
              lang={meta.hreflang}
              onClick={() => switchTo(locale)}
              aria-pressed={active}
              aria-label={active ? t(m.nav.language.current, { language: meta.native }) : t(m.nav.language.switchTo, { language: meta.native })}
              className={cn(
                "flex h-11 flex-col items-center justify-center rounded-xl border font-caps text-[12px] tracking-[0.2em] transition-colors duration-300",
                active
                  ? "border-pimenton-light/70 bg-pimenton/25 text-cream shadow-[0_0_18px_rgba(178,30,39,0.35)]"
                  : "border-cream/12 text-cream-muted hover:border-cream/30 hover:text-cream",
              )}
            >
              {meta.short}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Variante "dropdown" (cabecera)
   ────────────────────────────────────────────────────────────── */

function LanguageDropdown({ align = "right", onSelect, className }: Omit<LanguageSwitcherProps, "variant">) {
  const m = useMessages();
  const t = useFormat();
  const current = useLocale();
  const switchTo = useSwitchLocale(onSelect);
  const listId = useId();

  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [open, setOpen] = useState(false);

  /* Cierre por clic fuera y por Escape; el foco vuelve al botón. */
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    /* Foco inicial en el idioma activo. */
    const idx = Math.max(0, LOCALES.indexOf(current));
    const timer = window.setTimeout(() => itemRefs.current[idx]?.focus(), 30);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open, current]);

  /* Navegación con flechas / Home / End dentro de la lista (patrón "menu" de ARIA). */
  const onListKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    const items = itemRefs.current.filter((el): el is HTMLButtonElement => el !== null);
    if (!items.length) return;
    const idx = items.findIndex((el) => el === document.activeElement);
    let next: number | null = null;
    if (e.key === "ArrowDown") next = (idx + 1) % items.length;
    else if (e.key === "ArrowUp") next = (idx - 1 + items.length) % items.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = items.length - 1;
    else if (e.key === "Tab") {
      setOpen(false);
      return;
    }
    if (next !== null) {
      e.preventDefault();
      items[next].focus();
    }
  }, []);

  const select = useCallback(
    (locale: Locale) => {
      setOpen(false);
      switchTo(locale);
    },
    [switchTo],
  );

  const meta = LOCALE_META[current];

  return (
    <div ref={rootRef} className={cn("relative", className)}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${m.nav.languageSwitcher} · ${t(m.nav.language.current, { language: meta.native })}`}
        className={cn(
          "inline-flex h-11 items-center gap-1.5 rounded-full px-3 font-caps text-[12px] tracking-[0.25em] transition-colors duration-300",
          open ? "text-cream" : "text-cream-muted hover:text-cream",
        )}
      >
        <Globe className="h-4 w-4 text-pimenton-light" aria-hidden />
        <span aria-hidden>{meta.short}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300", open && "rotate-180")} aria-hidden />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="lang-menu"
            id={listId}
            role="menu"
            aria-label={m.nav.languageSwitcher}
            onKeyDown={onListKeyDown}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98, transition: { duration: 0.15 } }}
            transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
            className={cn(
              "absolute top-full z-50 mt-2 min-w-[11.5rem] origin-top overflow-hidden rounded-2xl p-1.5",
              "border border-cream/10 bg-[linear-gradient(160deg,rgba(20,20,20,0.96),rgba(20,20,20,0.9))] shadow-card backdrop-blur-xl",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            {LOCALES.map((locale, i) => {
              const active = locale === current;
              const item = LOCALE_META[locale];
              return (
                <button
                  key={locale}
                  ref={(el) => {
                    itemRefs.current[i] = el;
                  }}
                  type="button"
                  role="menuitemradio"
                  aria-checked={active}
                  lang={item.hreflang}
                  onClick={() => select(locale)}
                  className={cn(
                    "flex h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-left font-sans text-sm transition-colors duration-200",
                    active ? "bg-pimenton/20 text-cream" : "text-cream-muted hover:bg-cream/8 hover:text-cream focus-visible:bg-cream/8",
                  )}
                >
                  <span className="flex items-center gap-3">
                    <span className="font-caps text-[11px] tracking-[0.25em] text-pimenton-a11y">{item.short}</span>
                    <span>{item.native}</span>
                  </span>
                  {active && <Check className="h-4 w-4 text-gold" aria-hidden />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   Componente público
   ────────────────────────────────────────────────────────────── */

/**
 * Selector de idioma ES / GL / EN / PT con nombres nativos.
 *  - `variant="dropdown"`: botón compacto + menú (cabecera de escritorio).
 *  - `variant="chips"`: fila de 4 chips de 44 px (menú móvil).
 * Al cambiar, conserva la ruta actual (stripLocale + localePath), el hash y guarda la cookie NEXT_LOCALE.
 */
export default function LanguageSwitcher({ variant = "dropdown", ...rest }: LanguageSwitcherProps) {
  if (variant === "chips") return <LanguageChips onSelect={rest.onSelect} className={rest.className} />;
  return <LanguageDropdown {...rest} />;
}
