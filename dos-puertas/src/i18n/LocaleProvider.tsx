"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { localePath, type Locale } from "./config";
import type { Messages } from "./getMessages";

const LocaleContext = createContext<{ locale: Locale; messages: Messages } | null>(null);

export function LocaleProvider({ locale, messages, children }: { locale: Locale; messages: Messages; children: ReactNode }) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages]);
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

function useCtx() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale/useMessages deben usarse dentro de <LocaleProvider>");
  return ctx;
}

export function useLocale(): Locale {
  return useCtx().locale;
}

export function useMessages(): Messages {
  return useCtx().messages;
}

export function useLocalePath() {
  const locale = useLocale();
  return useCallback((path = "/") => localePath(locale, path), [locale]);
}
