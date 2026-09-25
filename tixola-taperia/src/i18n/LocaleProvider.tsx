"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { localePath, type Locale } from "./config";
import { format } from "./getMessages";
import type { Messages } from "./types";

interface LocaleContextValue {
  locale: Locale;
  messages: Messages;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useCtx() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale/useMessages deben usarse dentro de <LocaleProvider>");
  return ctx;
}

/** Idioma activo ("es" | "gl" | "en" | "pt"). */
export function useLocale(): Locale {
  return useCtx().locale;
}

/** Mensajes tipados del idioma activo: const m = useMessages(); m.hero.title */
export function useMessages(): Messages {
  return useCtx().messages;
}

/** Interpolador: const t = useFormat(); t(m.carta.results, { count: 12 }) */
export function useFormat() {
  return useCallback((template: string, vars?: Record<string, string | number>) => format(template, vars), []);
}

/** Rutas con prefijo de idioma: const lp = useLocalePath(); <Link href={lp("/carta")}> */
export function useLocalePath() {
  const locale = useLocale();
  return useCallback((path = "/") => localePath(locale, path), [locale]);
}
