"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";

export type ChatPage = "home" | "carta" | "legal";

export interface ChatOpenOptions {
  /** mensaje que se envía automáticamente al abrir (p. ej. "¿Qué platos no llevan gluten?") */
  prefill?: string;
  /** contexto de página para el prompt del sistema */
  page?: ChatPage;
}

interface ChatContextValue {
  isOpen: boolean;
  page: ChatPage;
  prefill: string | null;
  open: (opts?: ChatOpenOptions) => void;
  close: () => void;
  toggle: () => void;
  consumePrefill: () => string | null;
}

const ChatContext = createContext<ChatContextValue | null>(null);

/**
 * Estado global del "camarero virtual". Cualquier CTA puede abrirlo con `useChat().open({ prefill })`.
 * El widget visual (ChatWidget) se monta dentro del provider por el módulo de chat.
 */
export function ChatProvider({ page = "home", children }: { page?: ChatPage; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prefill, setPrefill] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<ChatPage>(page);

  const open = useCallback((opts?: ChatOpenOptions) => {
    if (opts?.prefill) setPrefill(opts.prefill);
    if (opts?.page) setCurrentPage(opts.page);
    setIsOpen(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);
  const consumePrefill = useCallback(() => {
    const p = prefill;
    setPrefill(null);
    return p;
  }, [prefill]);

  const value = useMemo(
    () => ({ isOpen, page: currentPage, prefill, open, close, toggle, consumePrefill }),
    [isOpen, currentPage, prefill, open, close, toggle, consumePrefill],
  );
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat debe usarse dentro de <ChatProvider>");
  return ctx;
}
