"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
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

/** Pide el chunk del panel. Idempotente: el importador ya cachea el módulo. */
function preloadChatWidget(): void {
  void import("@/components/chat/ChatWidget");
}

/**
 * `requestIdleCallback` no existe en Safari: `setTimeout` de respaldo. El tipo de la ventana se
 * estrecha a mano porque la comprobación tiene que ser en tiempo de ejecución, no de compilación.
 */
type IdleCapableWindow = Window & {
  requestIdleCallback?: (callback: () => void, options?: { timeout?: number }) => number;
  cancelIdleCallback?: (handle: number) => void;
};

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

  /* Precarga en cuanto el hilo principal esté libre: nunca compite con la portada ni con la
     hidratación, pero llega mucho antes que el primer clic. */
  useEffect(() => {
    const w = window as IdleCapableWindow;
    if (typeof w.requestIdleCallback === "function") {
      const handle = w.requestIdleCallback(preloadChatWidget, { timeout: 4000 });
      return () => w.cancelIdleCallback?.(handle);
    }
    const timer = window.setTimeout(preloadChatWidget, 2000);
    return () => window.clearTimeout(timer);
  }, []);

  const value = useMemo(
    () => ({ isOpen, hasOpened, page: currentPage, prefill, open, close, toggle, consumePrefill }),
    [isOpen, hasOpened, currentPage, prefill, open, close, toggle, consumePrefill],
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
      <ChatLauncher isOpen={isOpen} hasOpened={hasOpened} onToggle={toggle} onPreload={preloadChatWidget} />
      {/* El chunk del panel (ChatWidget + ChatMessage + useChatSession) sigue FUERA del arranque de la
          portada: no se evalúa hasta que se monta. Lo que cambió es CUÁNDO se descarga — antes se
          pedía en el primer clic, y el camarero tardaba en abrirse lo que tardara la red; ahora llega
          en el primer hueco libre del hilo principal (o al acercar el puntero al lanzador), así que
          al pulsar ya está en memoria. */}
      {(isOpen || hasOpened) && <ChatWidget />}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat debe usarse dentro de <ChatProvider>");
  return ctx;
}
