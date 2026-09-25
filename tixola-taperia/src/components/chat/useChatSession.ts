"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/i18n/config";
import {
  CHAT_LIMITS,
  isWaiterMode,
  WAITER_MODE_HEADER,
  type ChatApiMessage,
  type ChatMessage,
  type ChatRequestBody,
  type WaiterMode,
  type WaiterPage,
} from "@/lib/waiter/types";

export type ChatSessionStatus = "idle" | "streaming" | "error";

/** Motivo del último error (para elegir el texto del aviso). */
export type ChatErrorKind = "network" | "rateLimited" | "server" | "empty";

export interface UseChatSessionOptions {
  locale: Locale;
  page: WaiterPage;
}

export interface ChatSession {
  messages: ChatMessage[];
  status: ChatSessionStatus;
  /** cómo se generó la última respuesta (cabecera x-waiter-mode); null hasta la primera */
  mode: WaiterMode | null;
  errorKind: ChatErrorKind | null;
  /** Envía un mensaje (aborta cualquier respuesta en curso). */
  send: (text: string) => Promise<void>;
  /** Reenvía la última pregunta que falló. */
  retry: () => Promise<void>;
  /** Detiene la respuesta en curso conservando el texto parcial. */
  stop: () => void;
  /** Borra la conversación (y su copia en sessionStorage). */
  reset: () => void;
}

const STORAGE_VERSION = 2;
const STORAGE_MAX = 40;

interface StoredSession {
  v: number;
  messages: ChatMessage[];
}

function storageKey(locale: Locale): string {
  return `tixola:waiter:v${STORAGE_VERSION}:${locale}`;
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function isStoredMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") return false;
  const m = value as Record<string, unknown>;
  return (
    typeof m.id === "string" &&
    (m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string" &&
    typeof m.createdAt === "number"
  );
}

/** Restaura la conversación de sessionStorage (solo mensajes completos). Tolera storage bloqueado. */
function restore(locale: Locale): ChatMessage[] {
  try {
    const raw = window.sessionStorage.getItem(storageKey(locale));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<StoredSession>;
    if (parsed.v !== STORAGE_VERSION || !Array.isArray(parsed.messages)) return [];
    return parsed.messages
      .filter(isStoredMessage)
      .filter((m) => m.content.trim().length > 0)
      .map((m) => ({ ...m, status: "done" as const }))
      .slice(-STORAGE_MAX);
  } catch {
    return [];
  }
}

function persist(locale: Locale, messages: ChatMessage[]): void {
  try {
    const done = messages.filter((m) => m.status === "done" && m.content.trim().length > 0).slice(-STORAGE_MAX);
    const key = storageKey(locale);
    if (done.length) window.sessionStorage.setItem(key, JSON.stringify({ v: STORAGE_VERSION, messages: done } satisfies StoredSession));
    else window.sessionStorage.removeItem(key);
  } catch {
    /* sessionStorage no disponible (modo privado, cuota…): la conversación vive solo en memoria */
  }
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
 * Estado de la conversación con el camarero virtual: envío, streaming de la respuesta,
 * errores con reintento y persistencia en sessionStorage.
 *
 * El componente que lo usa se renderiza solo en el cliente (`next/dynamic` con `ssr: false`),
 * por eso la restauración puede hacerse en el inicializador del estado sin riesgo de hidratación.
 */
export function useChatSession({ locale, page }: UseChatSessionOptions): ChatSession {
  const [messages, setMessages] = useState<ChatMessage[]>(() => restore(locale));
  const [status, setStatus] = useState<ChatSessionStatus>("idle");
  const [mode, setMode] = useState<WaiterMode | null>(null);
  const [errorKind, setErrorKind] = useState<ChatErrorKind | null>(null);

  const messagesRef = useRef<ChatMessage[]>([]);
  const abortRef = useRef<AbortController | null>(null);
  const lastQuestionRef = useRef<string | null>(null);

  // Espejo del estado para leerlo desde callbacks sin recrearlos en cada render.
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Persistencia (solo mensajes completos).
  useEffect(() => {
    persist(locale, messages);
  }, [locale, messages]);

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
      const body: ChatRequestBody = { messages: toWire(priorHistory, text), locale, page };

      const fail = (kind: ChatErrorKind) => {
        updateMessage(assistantId, { status: "error" });
        setErrorKind(kind);
        setStatus("error");
      };

      let accumulated = "";
      let frame = 0;
      const flush = () => {
        frame = 0;
        const snapshot = accumulated;
        setMessages((prev) => prev.map((m) => (m.id === assistantId ? { ...m, content: snapshot } : m)));
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

        const header = res.headers.get(WAITER_MODE_HEADER);
        setMode(isWaiterMode(header) ? header : "claude");

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
        updateMessage(assistantId, { content: finalText, status: "done" });
        setStatus("idle");
      } catch (err) {
        if (frame) window.cancelAnimationFrame(frame);
        if (controller.signal.aborted) {
          // Detenido por el usuario (o sustituido por otra pregunta): conservamos lo recibido.
          const partial = accumulated.trim();
          if (partial) updateMessage(assistantId, { content: partial, status: "done" });
          else setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          setStatus("idle");
          return;
        }
        console.error("[waiter] fallo de red al consultar al camarero virtual:", err);
        fail("network");
      } finally {
        if (abortRef.current === controller) abortRef.current = null;
      }
    },
    [locale, page, updateMessage],
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
