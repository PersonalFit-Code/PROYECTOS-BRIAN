"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import {
  ASISTENTE_MODE_HEADER,
  CHAT_LIMITS,
  isAsistenteMode,
  type AsistenteMode,
  type AsistentePage,
  type ChatApiMessage,
  type ChatMessage,
  type ChatRequestBody,
} from "@/lib/asistente/types";

export type ChatSessionStatus = "idle" | "streaming" | "error";

/** Motivo del último error (para elegir el texto del aviso). */
export type ChatErrorKind = "network" | "rateLimited" | "server" | "empty";

export interface UseChatSessionOptions {
  locale: Locale;
  /**
   * Página desde la que se pregunta, leída EN EL MOMENTO de enviar (el panel sobrevive a la
   * navegación, así que la página cambia bajo él). Una función y no un valor para no recrear el
   * envío en cada cambio de ruta.
   */
  getPage: () => AsistentePage;
}

export interface ChatSession {
  messages: ChatMessage[];
  status: ChatSessionStatus;
  /** cómo se generó la última respuesta (cabecera x-asistente-mode); null hasta la primera */
  mode: AsistenteMode | null;
  errorKind: ChatErrorKind | null;
  /** Envía un mensaje (aborta cualquier respuesta en curso). */
  send: (text: string) => Promise<void>;
  /** Reenvía la última pregunta que falló. */
  retry: () => Promise<void>;
  /** Detiene la respuesta en curso conservando el texto parcial. */
  stop: () => void;
  /** Borra la conversación. */
  reset: () => void;
}

/**
 * Compás de espera antes de empezar a pintar la respuesta.
 *
 * El motor sin IA contesta al instante —resuelve en memoria— y un muro de texto que aparece de golpe
 * no se lee como una conversación: parece un formulario. Reteniendo el texto un momento, los puntos de
 * «escribiendo…» llegan a verse. Solo retrasa el PRIMER fragmento: el resto fluye a la velocidad a la
 * que llega, y el botón de detener sigue cortando en cualquier momento.
 */
const THINKING_MIN_MS = 700;

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Historial que viaja a la API: mensajes completos, empezando por el usuario y con el tope del servidor. */
function toWire(history: ChatMessage[], text: string): ChatApiMessage[] {
  const wire: ChatApiMessage[] = history
    .filter((m) => m.status === "done" && m.content.trim().length > 0)
    .map((m) => ({ role: m.role, content: m.content }));
  wire.push({ role: "user", content: text });
  let trimmed = wire.slice(-CHAT_LIMITS.maxMessages);
  while (trimmed.length && trimmed[0].role !== "user") trimmed = trimmed.slice(1);
  return trimmed;
}

/**
 * Estado de la conversación con el asistente: envío, streaming de la respuesta y errores con
 * reintento.
 *
 * LA CONVERSACIÓN VIVE SOLO EN MEMORIA, y es a propósito (en tixola iba a `sessionStorage`). La
 * política de cookies del salón enumera, uno por uno, lo que la web guarda en el navegador (idioma y
 * decisión sobre cookies) y dice que no hay nada más; guardar aquí la conversación la dejaría
 * desmentida. En memoria basta: el proveedor vive en el layout de la web, así que la charla sobrevive
 * a cerrar el panel y a cambiar de página, y se borra al recargar o cerrar la pestaña, que es
 * exactamente lo que promete la nota de privacidad del panel.
 */
export function useChatSession({ locale, getPage }: UseChatSessionOptions): ChatSession {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatSessionStatus>("idle");
  const [mode, setMode] = useState<AsistenteMode | null>(null);
  const [errorKind, setErrorKind] = useState<ChatErrorKind | null>(null);

  const messagesRef = useRef<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const lastQuestionRef = useRef<string | null>(null);
  const getPageRef = useRef(getPage);

  // Espejos del estado y de la prop para leerlos desde callbacks sin recrearlos en cada render.
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);
  useEffect(() => {
    getPageRef.current = getPage;
  }, [getPage]);

  // Al desmontar, cancelamos cualquier petición en vuelo.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const updateMessage = useCallback((id: string, patch: Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }, []);

  const runRequest = useCallback(
    async (text: string, reuseLastQuestion: boolean) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      lastQuestionRef.current = text;

      const now = Date.now();
      const assistantId = newId();
      const history = messagesRef.current.filter((m) => m.status === "done");
      const userMessage: ChatMessage = { id: newId(), role: "user", content: text, status: "done", createdAt: now };
      const assistantMessage: ChatMessage = { id: assistantId, role: "assistant", content: "", status: "streaming", createdAt: now + 1 };

      // Al reintentar reutilizamos la pregunta ya pintada (última del usuario) y quitamos el error anterior.
      const base = reuseLastQuestion ? history : [...history, userMessage];
      setMessages([...base, assistantMessage]);
      setStatus("streaming");
      setErrorKind(null);

      // Al reintentar, la pregunta ya es el último mensaje completo del historial: no se duplica.
      const lastDone = history[history.length - 1];
      const priorHistory = reuseLastQuestion && lastDone?.role === "user" && lastDone.content === text ? history.slice(0, -1) : history;
      const body: ChatRequestBody = { messages: toWire(priorHistory, text), locale, page: getPageRef.current() };

      const fail = (kind: ChatErrorKind) => {
        updateMessage(assistantId, { status: "error" });
        setErrorKind(kind);
        setStatus("error");
      };

      let accumulated = "";
      let frame = 0;
      const paint = () => {
        const snapshot = accumulated;
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: snapshot } : m)));
      };

      /* Puerta del compás de espera: hasta que se abre, el texto se acumula sin pintarse. Al abrirse
         vuelca de una vez lo que haya llegado; si la persona corta antes, no se pinta nada a destiempo. */
      let gateOpen = false;
      const gate = new Promise<void>((resolve) => {
        window.setTimeout(() => {
          gateOpen = true;
          resolve();
        }, THINKING_MIN_MS);
      });
      void gate.then(() => {
        if (!controller.signal.aborted && accumulated) paint();
      });

      const flush = () => {
        frame = 0;
        if (!gateOpen) return;
        paint();
      };

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        if (res.status === 429) return fail("rateLimited");
        if (!res.ok || !res.body) return fail("server");

        const header = res.headers.get(ASISTENTE_MODE_HEADER);
        setMode(isAsistenteMode(header) ? header : "claude");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        for (;;) {
          const { value, done } = await reader.read();
          if (done) break;
          accumulated += decoder.decode(value, { stream: true });
          if (!frame) frame = window.requestAnimationFrame(flush);
        }
        accumulated += decoder.decode();
        if (frame) window.cancelAnimationFrame(frame);

        const finalText = accumulated.trim();
        if (!finalText) return fail("empty");
        /* La respuesta entera puede llegar antes de que se abra la puerta (motor sin IA): se espera a
           que abra para que los puntos de «escribiendo…» no parpadeen un solo fotograma. */
        if (!gateOpen) await gate;
        /* Si se pulsa «detener» justo durante ese compás, la respuesta ya está completa: se entrega
           igual. Aquí no salta el `catch` (no queda nada que abortar), así que el mensaje se cierra a
           mano o se quedaría en «escribiendo…» para siempre. */
        updateMessage(assistantId, { content: finalText, status: "done" });
        if (!controller.signal.aborted || abortRef.current === controller || abortRef.current === null) setStatus("idle");
      } catch (err) {
        if (frame) window.cancelAnimationFrame(frame);
        if (controller.signal.aborted) {
          // Detenido a mano (o sustituido por otra pregunta): conservamos lo recibido.
          const partial = accumulated.trim();
          if (partial) updateMessage(assistantId, { content: partial, status: "done" });
          else setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          // Si ya hay otra petición en vuelo (esta la abortó `runRequest` al empezar la siguiente),
          // el estado lo manda la nueva: dejarlo en "idle" mostraría el botón de enviar y las
          // respuestas rápidas mientras la sustituta aún está transmitiendo.
          if (abortRef.current === controller || abortRef.current === null) setStatus("idle");
          return;
        }
        console.error("[asistente] fallo de red al consultar al asistente:", err);
        fail("network");
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [locale, updateMessage],
  );

  const send = useCallback(
    async (text: string) => {
      const clean = text.replace(/\r\n?/g, "\n").trim().slice(0, CHAT_LIMITS.maxChars);
      if (!clean) return;
      await runRequest(clean, false);
    },
    [runRequest],
  );

  const retry = useCallback(async () => {
    const text = lastQuestionRef.current;
    if (!text) return;
    await runRequest(text, true);
  }, [runRequest]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    lastQuestionRef.current = null;
    setMessages([]);
    setStatus("idle");
    setErrorKind(null);
    setMode(null);
  }, []);

  return { messages, status, mode, errorKind, send, retry, stop, reset };
}
