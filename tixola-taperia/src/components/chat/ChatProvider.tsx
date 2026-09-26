"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import ChatLauncher from "@/components/chat/ChatLauncher";
import type { WaiterPage } from "@/lib/waiter/types";

/** Página desde la que se abre el chat (contexto para el prompt del sistema). */
export type ChatPage = WaiterPage;

export interface ChatOpenOptions {
  /** mensaje que se envía automáticamente al abrir (p. ej. "¿Qué platos no llevan gluten?") */
  prefill?: string;
  /** contexto de página para el prompt del sistema */
  page?: ChatPage;
}

interface ChatContextValue {
  isOpen: boolean;
  /** true desde la primera vez que se abre (el lanzador retira su punto de aviso) */
  hasOpened: boolean;
  page: ChatPage;
  prefill: string | null;
  open: (opts?: ChatOpenOptions) => void;
  close: () => void;
  toggle: () => void;
  consumePrefill: () => string | null;
}

const ChatContext = createContext<ChatContextValue | null>(null);

/* El panel solo existe en el cliente (sessionStorage, framer-motion) y no aporta nada al HTML inicial:
   se carga aparte y sin SSR, así el lanzador pinta al instante y el peso del widget llega después. */
const ChatWidget = dynamic(() => import("@/components/chat/ChatWidget"), { ssr: false });

/**
 * Estado global del "camarero virtual". Cualquier CTA puede abrirlo con `useChat().open({ prefill })`.
 * Monta el lanzador (abajo a la izquierda) y el widget en todas las páginas que envuelve.
 */
export function ChatProvider({ page = "home", children }: { page?: ChatPage; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [prefill, setPrefill] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<ChatPage>(page);

  const open = useCallback((opts?: ChatOpenOptions) => {
    if (opts?.prefill) setPrefill(opts.prefill);
    if (opts?.page) setCurrentPage(opts.page);
    setIsOpen(true);
    setHasOpened(true);
  }, []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => {
    setIsOpen((v) => !v);
    setHasOpened(true);
  }, []);
  const consumePrefill = useCallback(() => {
    const p = prefill;
    setPrefill(null);
    return p;
  }, [prefill]);

  const value = useMemo(
    () => ({ isOpen, hasOpened, page: currentPage, prefill, open, close, toggle, consumePrefill }),
    [isOpen, hasOpened, currentPage, prefill, open, close, toggle, consumePrefill],
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
      <ChatLauncher isOpen={isOpen} hasOpened={hasOpened} onToggle={toggle} />
      {/* El chunk del panel (ChatWidget + ChatMessage + useChatSession) solo se pide en la primera
          apertura: si no, se descargaba y evaluaba en TODAS las cargas compitiendo con la portada.
          `hasOpened` lo mantiene montado después, así AnimatePresence conserva la salida. */}
      {(isOpen || hasOpened) && <ChatWidget />}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat debe usarse dentro de <ChatProvider>");
  return ctx;
}
