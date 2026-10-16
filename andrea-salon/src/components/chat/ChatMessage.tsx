"use client";

import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useMemo, type ReactNode } from "react";
import { MessageCircle, Phone, RotateCcw, TriangleAlert } from "lucide-react";
import { BUSINESS } from "@/data/business";
import { useMessages } from "@/i18n/LocaleProvider";
import { urlFor } from "@/lib/hosts";
import { SITE_URL } from "@/lib/siteUrl";
import { cn } from "@/lib/utils";
import type { ChatMessage } from "@/lib/asistente/types";
import type { ChatErrorKind } from "./useChatSession";

/* ────────────────────────────────────────────────────────────
   Markdown "lite": negrita, listas, saltos de línea y enlaces.
   Sin dangerouslySetInnerHTML: se construyen nodos React, así que
   el texto del modelo nunca se interpreta como HTML.

   Portado tal cual de tixola, donde se midió la alternativa (montar un parser de markdown completo):
   veinte veces el peso del chunk del chat para formatear cuatro negritas y una lista. Este parser
   está endurecido para el streaming: los marcadores a medio llegar no parpadean (ver `renderTail`).
   ──────────────────────────────────────────────────────────── */
const INLINE_TOKEN = /(\*\*[^*\n]+\*\*)|(\[[^\]\n]+\]\([^)\s]+\))|(https?:\/\/[^\s<>)]+)/g;
const MD_LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;
const SAFE_HREF = /^(https?:\/\/|tel:|mailto:|\/(?!\/)|#)/i;
const LIST_ITEM = /^\s*(?:[-*•]|\d+[.)])\s+(.*)$/;
const ORDERED_ITEM = /^\s*\d+[.)]\s+/;
const HEADING = /^#{1,6}\s+(.*)$/;

/* Marcadores a medio llegar en la cola del texto (lo último que ha escrito el modelo). */
/* `**negrita` a la que todavía le falta el cierre. El `\*?` final es para el fotograma en el que ha
   llegado el primer asterisco del cierre pero no el segundo. */
const TAIL_BOLD = /\*\*([^*\n]*)\*?$/;
/* `[etiqueta`, `[etiqueta]`, `[etiqueta](` o `[etiqueta](htt`: enlace al que le falta el cierre. */
const TAIL_LINK = /\[([^\]\n]*)(\](?:\([^)\s]*)?)?$/;
/** Línea que solo trae el marcador de lista o de título: su texto aún no ha llegado. */
const TAIL_MARKER_ONLY = /^\s*(?:[-*•]|\d+[.)]?|#{1,6})\s*$/;

const boldClass = "font-semibold text-tinta";
/* Carmín sobre blanco: 9,4:1, vale para texto pequeño. El subrayado tenue y entero al pasar. */
const linkClass = "font-semibold text-carmin underline decoration-carmin/30 underline-offset-2 transition-colors hover:decoration-carmin";

/* ── Enlaces propios y ajenos ──────────────────────────────────
   Las respuestas enlazan tres clases de destino y cada una se abre a su manera:
    · rutas de la web ("/es/bonos")       → <Link> de Next, navegación sin recargar;
    · nuestras otras direcciones (la reserva, que en producción vive en reservar.<dominio>)
                                           → misma pestaña: es la misma casa, y una pestaña nueva
                                             para reservar dejaría el chat huérfano en la de atrás;
    · lo demás (Google Maps, WhatsApp, Instagram) → pestaña nueva, como en el resto de la web. */
let propios: Set<string> | null = null;

function originOf(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

function ownOrigins(): Set<string> {
  if (propios) return propios;
  const set = new Set<string>();
  for (const url of [SITE_URL, urlFor("reservar", "/")]) {
    const o = originOf(url);
    if (o) set.add(o);
  }
  if (typeof window !== "undefined") set.add(window.location.origin);
  propios = set;
  return set;
}

function renderLink(label: string, href: string, key: string): ReactNode {
  if (!SAFE_HREF.test(href)) return <span key={key}>{label}</span>;
  if (href.startsWith("/") || href.startsWith("#")) {
    return (
      <Link key={key} href={href} className={linkClass}>
        {label}
      </Link>
    );
  }
  if (/^https?:/i.test(href)) {
    const origin = originOf(href);
    /* Absoluta pero de esta misma web (la reserva en modo rutas): navegación interna de Next. */
    if (origin && typeof window !== "undefined" && origin === window.location.origin) {
      const u = new URL(href);
      return (
        <Link key={key} href={`${u.pathname}${u.search}${u.hash}`} className={linkClass}>
          {label}
        </Link>
      );
    }
    if (origin && ownOrigins().has(origin)) {
      return (
        <a key={key} href={href} className={linkClass}>
          {label}
        </a>
      );
    }
    return (
      <a key={key} href={href} className={linkClass} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  // tel: y mailto: abren la aplicación del teléfono o del correo.
  return (
    <a key={key} href={href} className={linkClass}>
      {label}
    </a>
  );
}

/**
 * Pinta la cola de una línea cuando trae un marcador sin cerrar.
 *
 * Mientras llegaba la respuesta, un `**negrita` a medias se veía como asteriscos literales y, al
 * cerrarse, el texto cambiaba de golpe. La solución que funciona es no pintar nunca el marcador y dar
 * el formato desde el primer carácter, de modo que al completarse no se mueve nada. La negrita y el
 * enlace con `](` se curan también en el mensaje terminado, para que el último fotograma no
 * reintroduzca el parpadeo.
 */
function renderTail(rest: string, keyBase: string, streaming: boolean): ReactNode[] {
  const bold = TAIL_BOLD.exec(rest);
  const found = TAIL_LINK.exec(rest);
  /* Solo el `[etiqueta](` es inequívocamente un enlace a medias y se cura siempre. Un corchete suelto
     se cura únicamente mientras llega: en un mensaje ya cerrado es texto y comérselo sería perderlo. */
  const link = found && (found[2]?.startsWith("](") || streaming) ? found : null;

  // Manda el que empiece antes: `**[Bonos](/es/bo` es una negrita que contiene un enlace a medias.
  if (bold && (!link || bold.index < link.index)) {
    return [
      rest.slice(0, bold.index),
      <strong key={keyBase} className={boldClass}>
        {renderTail(rest.slice(bold.index + 2), `${keyBase}-b`, streaming)}
      </strong>,
    ];
  }
  /* Solo la etiqueta, sin corchetes: cuando llegue el `)` se convierte en enlace y ni un carácter se
     mueve de sitio (solo gana color y subrayado). */
  if (link) return [rest.slice(0, link.index), link[1]];
  // Un `*` suelto al final es el primer asterisco de un `**` que todavía no ha llegado entero.
  if (streaming && rest.endsWith("*")) return [rest.slice(0, -1)];
  return [rest];
}

/**
 * Convierte una línea con **negrita**, [enlaces](url) y URLs sueltas en nodos React.
 * `tail` marca la última línea con contenido del mensaje: es la única donde puede quedar un
 * marcador a medias, así que es la única que se cura.
 */
export function renderInline(text: string, keyBase: string, tail = false, streaming = false): ReactNode[] {
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
        <strong key={key} className={boldClass}>
          {raw.slice(2, -2)}
        </strong>,
      );
    } else if (match[2]) {
      const link = MD_LINK.exec(raw);
      nodes.push(link ? renderLink(link[1], link[2], key) : raw);
    } else if (streaming && tail && index + raw.length === text.length) {
      /* URL pegada al final mientras llega: todavía puede crecer. Se pinta con las mismas clases pero
         en un <span> sin href, para no dejar pulsable un enlace truncado. */
      nodes.push(
        <span key={key} className={linkClass}>
          {raw}
        </span>,
      );
    } else {
      // URL suelta: la puntuación final ("…mapa.", "(url)") queda fuera del enlace.
      const trimmed = raw.replace(/[.,;:!?]+$/, "");
      nodes.push(renderLink(trimmed, trimmed, key));
      if (trimmed.length < raw.length) nodes.push(raw.slice(trimmed.length));
    }
    last = index + raw.length;
  }
  const rest = text.slice(last);
  if (!rest) return nodes;
  /* La cola hereda la clave que le tocaría al token completo: cuando el marcador se cierra, React
     reutiliza el nodo en vez de desmontarlo y volver a montarlo. */
  if (tail) nodes.push(...renderTail(rest, `${keyBase}-${n}`, streaming));
  else nodes.push(rest);
  return nodes;
}

/** Una línea del texto, con la marca de si es la última con contenido. */
interface MarkdownLine {
  text: string;
  tail: boolean;
}

/** Bloques: párrafos (con <br/> entre líneas), listas y títulos (como párrafo en negrita). */
export function renderMarkdownLite(text: string, streaming = false): ReactNode[] {
  const lines = text.replace(/\r\n?/g, "\n").split("\n");
  // Última línea con contenido: si el texto acaba en salto, la cola sigue siendo la línea anterior.
  let tailIndex = lines.length - 1;
  while (tailIndex > 0 && !lines[tailIndex].trim()) tailIndex -= 1;

  const blocks: ReactNode[] = [];
  let paragraph: MarkdownLine[] = [];
  let list: { ordered: boolean; items: MarkdownLine[] } | null = null;

  const flushParagraph = () => {
    if (!paragraph.length) return;
    const key = `p-${blocks.length}`;
    const current = paragraph;
    blocks.push(
      <p key={key}>
        {current.flatMap((line, i) => {
          const nodes = renderInline(line.text, `${key}-${i}`, line.tail, streaming);
          return i < current.length - 1 ? [...nodes, <br key={`${key}-br-${i}`} />] : nodes;
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
      <Tag key={key} className={cn("space-y-1 pl-4", list.ordered ? "list-decimal" : "list-disc marker:text-carmin-suave")}>
        {list.items.map((item, i) => (
          <li key={`${key}-${i}`}>{renderInline(item.text, `${key}-${i}`, item.tail, streaming)}</li>
        ))}
      </Tag>,
    );
    list = null;
  };

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trimEnd();
    const tail = i === tailIndex;
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    /* Mientras llega la respuesta, una línea que solo trae el marcador («-», «1.», «##») todavía no
       es una lista ni un título: se espera al contenido para que el bloque nazca ya siendo el
       definitivo y no salten la viñeta y la sangría. */
    if (tail && streaming && TAIL_MARKER_ONLY.test(line)) continue;
    const item = LIST_ITEM.exec(line);
    if (item) {
      flushParagraph();
      const ordered = ORDERED_ITEM.test(line);
      if (!list || list.ordered !== ordered) {
        flushList();
        list = { ordered, items: [] };
      }
      list.items.push({ text: item[1], tail });
      continue;
    }
    flushList();
    const heading = HEADING.exec(line);
    paragraph.push({ text: heading ? `**${heading[1]}**` : line, tail });
  }
  flushParagraph();
  flushList();
  return blocks;
}

/**
 * Texto del asistente con formato ligero (memoizado por contenido).
 * `streaming` activa la cura de la cola mientras la respuesta llega trozo a trozo.
 */
export function MarkdownLite({ text, streaming = false }: { text: string; streaming?: boolean }) {
  const nodes = useMemo(() => renderMarkdownLite(text, streaming), [text, streaming]);
  return <>{nodes}</>;
}

/* ────────────────────────────────────────────────────────────
   Bocadillos
   ──────────────────────────────────────────────────────────── */

/** Entrada de cada bocadillo: llega desde su lado y se asienta. Con menos movimiento, solo se funde. */
const ENTER = {
  user: { initial: { opacity: 0, y: 10, x: 14 } },
  assistant: { initial: { opacity: 0, y: 10, x: -14 } },
  shown: { opacity: 1, y: 0, x: 0 },
  transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
} as const;

/** Avatar del asistente: el logo del salón (el mismo de la cabecera). Decorativo: el rol lo dice el texto oculto. */
export function AssistantAvatar({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <Image
      src="/brand/logo.png"
      alt=""
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full ring-1 ring-carmin/15", className)}
      style={{ width: size, height: size }}
    />
  );
}

/**
 * Los tres puntos de «escribiendo…». Van con framer-motion para que suban y se enciendan a la vez.
 * Con `prefers-reduced-motion` se quedan QUIETOS del todo: `MotionConfig reducedMotion="user"` solo
 * para los desplazamientos, y un parpadeo de opacidad sin fin también es movimiento.
 */
function TypingDots({ label }: { label: string }) {
  const reduced = useReducedMotion();
  return (
    <span className="inline-flex items-center gap-1.5" role="status" aria-label={label}>
      {[0, 1, 2].map((i) =>
        reduced ? (
          <span key={i} aria-hidden className="h-1.5 w-1.5 rounded-full bg-carmin-suave" style={{ opacity: 0.45 + i * 0.25 }} />
        ) : (
          <motion.span
            key={i}
            aria-hidden
            className="h-1.5 w-1.5 rounded-full bg-carmin-suave"
            initial={{ opacity: 0.35, y: 0 }}
            animate={{ opacity: [0.35, 1, 0.35], y: [0, -3.5, 0] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
          />
        ),
      )}
    </span>
  );
}

interface ErrorCardProps {
  kind: ChatErrorKind | null;
  onRetry?: () => void;
}

const ctaBase =
  "pulsable inline-flex h-11 items-center gap-2 rounded-full px-4 font-sans text-xs font-semibold tracking-wide [&>svg]:h-4 [&>svg]:w-4";

/** Aviso de error con reintento y las dos salidas de siempre: llamar o escribir por WhatsApp. */
function ErrorCard({ kind, onRetry }: ErrorCardProps) {
  const m = useMessages();
  const text = kind === "rateLimited" ? m.chat.rateLimited : m.chat.error;
  return (
    <div role="alert" className="glass-rosa rounded-2xl rounded-tl-md px-4 py-3 text-[14px] leading-relaxed text-tinta">
      <p className="flex items-start gap-2">
        <TriangleAlert aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-carmin" />
        <span>{text}</span>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {onRetry && kind !== "rateLimited" && (
          <button type="button" onClick={onRetry} className={cn(ctaBase, "bg-carmin text-[var(--on-accent)] hover:bg-carmin-oscuro")}>
            <RotateCcw aria-hidden />
            {m.chat.retry}
          </button>
        )}
        <a href={BUSINESS.phone.tel} className={cn(ctaBase, "border border-carmin/20 bg-white text-carmin hover:bg-rosa-niebla")}>
          <Phone aria-hidden />
          {m.chat.callCta}
        </a>
        <a
          href={BUSINESS.whatsapp.url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(ctaBase, "border border-carmin/20 bg-white text-carmin hover:bg-rosa-niebla")}
        >
          <MessageCircle aria-hidden />
          {m.common.cta.whatsapp}
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
 * Bocadillo de un mensaje: la clienta (carmín, a la derecha) o el asistente (blanco, con el logo del
 * salón). Mientras llega la respuesta muestra los puntos de «escribiendo…» y, con texto parcial, un
 * pequeño cursor.
 */
export default function ChatMessageBubble({ message, errorKind = null, onRetry }: ChatMessageBubbleProps) {
  const m = useMessages();
  const isUser = message.role === "user";
  const streaming = message.status === "streaming";

  if (isUser) {
    return (
      <motion.div initial={ENTER.user.initial} animate={ENTER.shown} transition={ENTER.transition} className="flex justify-end pl-8">
        <div className="max-w-[88%] rounded-2xl rounded-tr-md bg-carmin px-4 py-3 text-[14px] leading-relaxed text-[var(--on-accent)] shadow-soft">
          <span className="sr-only">{m.chat.you}: </span>
          <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={ENTER.assistant.initial} animate={ENTER.shown} transition={ENTER.transition} className="flex items-end gap-2.5 pr-6">
      <AssistantAvatar className="mb-1" />
      <div className="min-w-0 max-w-[88%] flex-1">
        <span className="sr-only">{m.chat.assistant}: </span>
        {message.status === "error" ? (
          <ErrorCard kind={errorKind} onRetry={onRetry} />
        ) : (
          <div
            className={cn(
              "space-y-2 rounded-2xl rounded-tl-md border border-[var(--capa-borde)] bg-white px-4 py-3 text-[14px] leading-relaxed text-tinta shadow-soft [overflow-wrap:anywhere]",
              streaming && !message.content && "inline-flex min-h-11 items-center",
            )}
          >
            {streaming && !message.content ? (
              <TypingDots label={m.chat.thinking} />
            ) : (
              <>
                <MarkdownLite text={message.content} streaming={streaming} />
                {streaming && <span aria-hidden className="ml-1 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-carmin-suave align-text-bottom" />}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
