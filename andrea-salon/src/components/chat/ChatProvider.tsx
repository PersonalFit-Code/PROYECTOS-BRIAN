"use client";

import dynamic from "next/dynamic";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import ChatLauncher from "@/components/chat/ChatLauncher";

export interface ChatOpenOptions {
  /** Pregunta que se envía sola al abrir (p. ej. un botón «¿Cuánto dura?» en una tarjeta de servicio). */
  prefill?: string;
}

interface ChatContextValue {
  isOpen: boolean;
  /** true desde la primera vez que se abre (el lanzador retira su punto de aviso). */
  hasOpened: boolean;
  /**
   * Si el asistente responde con IA (hay `ANTHROPIC_API_KEY` en el servidor). Lo decide el layout en
   * el servidor y el panel lo usa para que la primera capa de privacidad diga la verdad: con IA el
   * texto sale hacia Anthropic; sin ella, no sale de nuestro servidor.
   */
  conIA: boolean;
  prefill: string | null;
  open: (opts?: ChatOpenOptions) => void;
  close: () => void;
  toggle: () => void;
  consumePrefill: () => string | null;
}

const ChatContext = createContext<ChatContextValue | null>(null);

/* El panel solo existe en el cliente (framer-motion, teclado, `visualViewport`) y no aporta nada al
   HTML inicial: se carga aparte y sin SSR, así el lanzador pinta al instante y el peso del panel
   llega después. */
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
 * Estado global del asistente. Cualquier CTA puede abrirlo con `useChat().open({ prefill })`.
 * Monta el lanzador (abajo a la izquierda) y el panel en todas las páginas de la web pública. Va en
 * el layout `(web)` y NO en la reserva ni en el panel: allí ya hay un asistente que sí reserva, y dos
 * a la vez solo confundirían.
 */
export function ChatProvider({ conIA, children }: { conIA: boolean; children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasOpened, setHasOpened] = useState(false);
  const [prefill, setPrefill] = useState<string | null>(null);

  const open = useCallback((opts?: ChatOpenOptions) => {
    if (opts?.prefill) setPrefill(opts.prefill);
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
    () => ({ isOpen, hasOpened, conIA, prefill, open, close, toggle, consumePrefill }),
    [isOpen, hasOpened, conIA, prefill, open, close, toggle, consumePrefill],
  );

  return (
    <ChatContext.Provider value={value}>
      {children}
      <ChatLauncher isOpen={isOpen} hasOpened={hasOpened} onToggle={toggle} onPreload={preloadChatWidget} />
      {/* El panel se monta en la primera apertura y ya no se desmonta: así la conversación (que vive
          solo en memoria, ver `useChatSession`) sobrevive a cerrar el panel y a navegar entre páginas
          de la web, porque este proveedor vive en el layout. */}
      {(isOpen || hasOpened) && <ChatWidget />}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat debe usarse dentro de <ChatProvider>");
  return ctx;
}
