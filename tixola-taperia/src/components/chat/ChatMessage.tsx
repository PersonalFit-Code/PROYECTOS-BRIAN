"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { CalendarCheck, Phone, RotateCcw, TriangleAlert } from "lucide-react";
import { BUSINESS } from "@/data/business";
import { TMark } from "@/components/ui/Logo";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/waiter/types";
import type { ChatErrorKind } from "./useChatSession";

/* ────────────────────────────────────────────────────────────
   Markdown "lite": negrita, listas, saltos de línea y enlaces.
   Sin dangerouslySetInnerHTML: se construyen nodos React, así que
   el texto del modelo nunca se interpreta como HTML.
   ──────────────────────────────────────────────────────────── */
const INLINE_TOKEN = /(\*\*[^*\n]+\*\*)|(\[[^\]\n]+\]\([^)\s]+\))|(https?:\/\/[^\s<>)]+)/g;
const MD_LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;
const SAFE_HREF = /^(https?:\/\/|tel:|mailto:|\/(?!\/)|#)/i;
const LIST_ITEM = /^\s*(?:[-*•]|\d+[.)])\s+(.*)$/;
const ORDERED_ITEM = /^\s*\d+[.)]\s+/;
const HEADING = /^#{1,6}\s+(.*)$/;

const linkClass = "font-medium text-gold underline decoration-gold/40 underline-offset-2 transition-colors hover:text-cream hover:decoration-cream/60";

function renderLink(label: string, href: string, key: string): ReactNode {
  if (!SAFE_HREF.test(href)) return <span key={key}>{label}</span>;
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link key={key} href={href} className={linkClass}>
        {label}
      </Link>
    );
  }
  const external = /^https?:/i.test(href);
  return (
    <a key={key} href={href} className={linkClass} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
      {label}
    </a>
  );
}

/** Convierte una línea con **negrita**, [enlaces](url) y URLs sueltas en nodos React. */
export function renderInline(text: string, keyBase: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  let last = 0;
  let n = 0;
  for (const match of text.matchAll(INLINE_TOKEN)) {
    const index = match.index ?? 0;
    const raw = match[0];
    if (index > last) nodes.push(text.slice(last, index));
    const key = `${keyBase}-${n++}`;
    if (match[1]) {
      nodes.push(
        <strong key={key} className="font-semibold text-cream">
          {raw.slice(2, -2)}
        </strong>,
      );
    } else if (match[2]) {
      const link = MD_LINK.exec(raw);
      nodes.push(link ? renderLink(link[1], link[2], key) : raw);
    } else {
      // URL suelta: la puntuación final ("…mapa.", "(url)") queda fuera del enlace.
      const trimmed = raw.replace(/[.,;:!?]+$/, "");
      nodes.push(renderLink(trimmed, trimmed, key));
      if (trimmed.length < raw.length) nodes.push(raw.slice(trimmed.length));
    }
    last = index + raw.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

/** Bloques: párrafos (con <br/> entre líneas), listas y títulos (como párrafo en negrita). */
export function renderMarkdownLite(text: string): ReactNode[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const key = `p-${blocks.length}`;
    blocks.push(
      <p key={key}>
        {paragraph.flatMap((line, i) => {
          const nodes = renderInline(line, `${key}-${i}`);
          return i < paragraph.length - 1 ? [...nodes, <br key={`${key}-br-${i}`} />] : nodes;
        })}
      </p>,
    );
    paragraph = [];
  };
  const flushList = () => {
    if (!list) return;
    const key = `l-${blocks.length}`;
    const Tag = list.ordered ? "ol" : "ul";
    blocks.push(
      <Tag key={key} className={cn("space-y-1 pl-4", list.ordered ? "list-decimal" : "list-disc marker:text-pimenton-light")}>
        {list.items.map((item, i) => (
          <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    const item = LIST_ITEM.exec(line);
    if (item) {
      flushParagraph();
      const ordered = ORDERED_ITEM.test(line);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push(item[1]);
      continue;
    }
    flushList();
    const heading = HEADING.exec(line);
    paragraph.push(heading ? `**${heading[1]}**` : line);
  }
  flushParagraph();
  flushList();
  return blocks;
}

/** Texto del camarero con formato ligero (memoizado por contenido). */
export function MarkdownLite({ text }: { text: string }) {
  const nodes = useMemo(() => renderMarkdownLite(text), [text]);
  return <>{nodes}</>;
}

/* ────────────────────────────────────────────────────────────
   Bocadillos
   ──────────────────────────────────────────────────────────── */
function TypingDots({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" role="status" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          aria-hidden
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-cream-400"
          style={{ animationDelay: `${i * 140}ms`, animationDuration: "1.1s" }}
        />
      ))}
    </span>
  );
}

interface ErrorCardProps {
  kind: ChatErrorKind | null;
  onRetry?: () => void;
}

/** Aviso de error con reintento y las dos salidas de siempre: llamar o reservar por WhatsApp. */
function ErrorCard({ kind, onRetry }: ErrorCardProps) {
  const m = useMessages();
  const text = kind === "rateLimited" ? m.chat.rateLimited : m.chat.error;
  const ctaBase =
    "inline-flex h-11 items-center gap-2 rounded-full px-4 font-sans text-xs font-semibold tracking-wide transition-[transform,background-color,color] duration-300 ease-[var(--ease-out-expo)] active:scale-95 [&>svg]:h-4 [&>svg]:w-4";
  return (
    <div role="alert" className="rounded-2xl rounded-tl-md border border-pimenton/35 bg-pimenton/10 px-4 py-3 text-[14px] leading-relaxed text-cream-200">
      <p className="flex items-start gap-2">
        <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-pimenton-a11y" />
        <span>{text}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {onRetry && kind !== "rateLimited" && (
          <button type="button" onClick={onRetry} className={cn(ctaBase, "bg-pimenton text-cream hover:bg-pimenton-light")}>
            <RotateCcw aria-hidden />
            {m.chat.retry}
          </button>
        )}
        <a href={BUSINESS.phone.tel} className={cn(ctaBase, "border border-cream/15 bg-cream/5 text-cream hover:bg-cream/10")}>
          <Phone aria-hidden />
          {m.chat.callCta}
        </a>
        <a
          href={BUSINESS.phone.whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(ctaBase, "border border-cream/15 bg-cream/5 text-cream hover:bg-cream/10")}
        >
          <CalendarCheck aria-hidden />
          {m.chat.reserveCta}
        </a>
      </div>
    </div>
  );
}

export interface ChatMessageBubbleProps {
  message: ChatMessage;
  /** motivo del error (solo si `message.status === "error"`) */
  errorKind?: ChatErrorKind | null;
  onRetry?: () => void;
}

/**
 * Bocadillo de un mensaje: usuario (pimentón traslúcido, a la derecha) o camarero (hierro, con la
 * marca "T"). Mientras llega la respuesta muestra los puntos de "escribiendo…" y, con texto parcial,
 * un pequeño cursor pulsante.
 */
export default function ChatMessageBubble({ message, errorKind = null, onRetry }: ChatMessageBubbleProps) {
  const m = useMessages();
  const isUser = message.role === "user";
  const streaming = message.status === "streaming";

  if (isUser) {
    return (
      <div className="flex justify-end pl-8">
        <div className="max-w-[88%] rounded-2xl rounded-tr-md border border-pimenton/30 bg-pimenton/10 px-4 py-3 text-[14px] leading-relaxed text-cream shadow-[0_10px_30px_-18px_rgba(178,30,39,0.8)]">
          <span className="sr-only">{m.chat.you}: </span>
          <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-2.5 pr-6">
      <TMark size={28} className="mb-1 shrink-0" />
      <div className="min-w-0 max-w-[88%] flex-1">
        <span className="sr-only">{m.chat.waiter}: </span>
        {message.status === "error" ? (
          <ErrorCard kind={errorKind} onRetry={onRetry} />
        ) : (
          <div
            className={cn(
              "space-y-2 rounded-2xl rounded-tl-md border border-cream/8 bg-iron-800 px-4 py-3 text-[14px] leading-relaxed text-cream-200 [overflow-wrap:anywhere]",
              streaming && !message.content && "inline-flex min-h-11 items-center",
            )}
          >
            {streaming && !message.content ? (
              <TypingDots label={m.chat.thinking} />
            ) : (
              <>
                <MarkdownLite text={message.content} />
                {streaming && <span aria-hidden className="ml-1 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-pimenton-light align-text-bottom" />}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
