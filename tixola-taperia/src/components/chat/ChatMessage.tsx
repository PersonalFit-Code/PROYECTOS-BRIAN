"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useMemo, type ReactNode } from "react";
import { MessageCircle, Phone, RotateCcw, TriangleAlert } from "lucide-react";
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

   Endurecido para el streaming. Se midió antes la otra opción —montar `streamdown` (Vercel), que es
   lo que pedía el cliente—: arrastra unified + remark + rehype + marked y añade 475 kB (144 kB
   gzip) al chunk del chat, que hoy pesa 20 kB (7 kB gzip) y se precarga en reposo para todo el
   mundo. Veinte veces el peso para formatear cuatro negritas y una lista no sale a cuenta en un
   móvil con datos, que es el grueso del tráfico aquí, así que se endureció este parser.
   ──────────────────────────────────────────────────────────── */
const INLINE_TOKEN = /(\*\*[^*\n]+\*\*)|(\[[^\]\n]+\]\([^)\s]+\))|(https?:\/\/[^\s<>)]+)/g;
const MD_LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;
const SAFE_HREF = /^(https?:\/\/|tel:|mailto:|\/(?!\/)|#)/i;
const LIST_ITEM = /^\s*(?:[-*•]|\d+[.)])\s+(.*)$/;
const ORDERED_ITEM = /^\s*\d+[.)]\s+/;
const HEADING = /^#{1,6}\s+(.*)$/;

/* Marcadores a medio llegar en la cola del texto (lo último que ha escrito el modelo). */
/* `**negrita` a la que todavía le falta el cierre. El `\*?` final es para el fotograma en el que ha
   llegado el primer asterisco del cierre pero no el segundo: sin él, `**pulpo*` se escapaba de la
   cura y enseñaba los asteriscos justo antes de completarse, que es el parpadeo de siempre. */
const TAIL_BOLD = /\*\*([^*\n]*)\*?$/;
/* `[etiqueta`, `[etiqueta]`, `[etiqueta](` o `[etiqueta](htt`: enlace al que le falta el cierre.
   El `]` a secas cuenta porque también es un fotograma intermedio: sin él, los corchetes asomaban
   un instante entre `[etiqueta` y `[etiqueta](`. */
const TAIL_LINK = /\[([^\]\n]*)(\](?:\([^)\s]*)?)?$/;
/** Línea que solo trae el marcador de lista o de título: su texto aún no ha llegado. */
const TAIL_MARKER_ONLY = /^\s*(?:[-*•]|\d+[.)]?|#{1,6})\s*$/;

const boldClass = "font-semibold text-cream";
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

/**
 * Pinta la cola de una línea cuando trae un marcador sin cerrar.
 *
 * El porqué: mientras llegaba la respuesta, un `**negrita` a medias se veía como asteriscos
 * literales y, al cerrarse el marcador, el texto cambiaba de golpe (los asteriscos desaparecían y
 * la línea se recolocaba). Se probó primero dejarlo literal y disimular el cambio con una
 * transición, pero el salto es de maquetación y no de color: una transición no lo tapa. La
 * solución que sí funciona es no llegar a pintar nunca el marcador y dar el formato desde el
 * primer carácter, de modo que al completarse no se mueve nada.
 *
 * La negrita y el enlace con `](` se curan también en el mensaje ya terminado, no solo mientras
 * llega. Es a propósito: si la cura fuese solo para el streaming, un marcador que el modelo nunca
 * cierra volvería a convertirse en asteriscos en el último fotograma, que es justo el parpadeo que
 * se quería quitar. El precio es que un `**` suelto que el modelo escriba a posta no se ve; a
 * cambio, lo que se pinta no cambia nunca bajo los pies del que lee.
 */
function renderTail(rest: string, keyBase: string, streaming: boolean): ReactNode[] {
  const bold = TAIL_BOLD.exec(rest);
  const found = TAIL_LINK.exec(rest);
  /* Solo el `[etiqueta](` es inequívocamente un enlace a medias y se cura siempre. Un corchete
     suelto (`[etiqueta` o `[etiqueta]`) se cura únicamente mientras llega: en un mensaje ya
     cerrado es texto del modelo y comérselo sería perder contenido. */
  const link = found && (found[2]?.startsWith("](") || streaming) ? found : null;

  // Manda el que empiece antes: `**[Carta](/ca` es una negrita que contiene un enlace a medias.
  if (bold && (!link || bold.index < link.index)) {
    return [
      rest.slice(0, bold.index),
      <strong key={keyBase} className={boldClass}>
        {renderTail(rest.slice(bold.index + 2), `${keyBase}-b`, streaming)}
      </strong>,
    ];
  }
  /* Solo la etiqueta, sin corchetes: cuando llegue el `)` se convierte en enlace y ni un carácter
     se mueve de sitio (solo gana color y subrayado). */
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
      /* URL pegada al final mientras llega: todavía puede crecer. Antes se enlazaba ya y quedaba
         un enlace truncado en el que se podía pulsar (lleva a ninguna parte). Se pinta con las
         mismas clases pero en un <span> sin href: al completarse solo gana el destino, no cambia
         ni un píxel. */
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
  /* La cola hereda la clave que le tocaría al token completo: cuando el marcador se cierra, el
     <strong> curado y el <strong> del tokenizador tienen la misma clave y React reutiliza el nodo
     en vez de desmontarlo y volver a montarlo. */
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
      <Tag key={key} className={cn("space-y-1 pl-4", list.ordered ? "list-decimal" : "list-disc marker:text-pimenton-light")}>
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
       es una lista ni un título: pintarla la convertía en un párrafo con un guion suelto que, al
       llegar el texto, pasaba a <ul>. Al cambiar el tipo de bloque React desmonta el nodo y salta
       la viñeta y la sangría. Se espera al contenido: así el bloque nace ya siendo el definitivo. */
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
 * Texto del camarero con formato ligero (memoizado por contenido).
 * `streaming` activa la cura de la cola mientras la respuesta llega token a token.
 */
export function MarkdownLite({ text, streaming = false }: { text: string; streaming?: boolean }) {
  const nodes = useMemo(() => renderMarkdownLite(text, streaming), [text, streaming]);
  return <>{nodes}</>;
}

/* ────────────────────────────────────────────────────────────
   Bocadillos
   ──────────────────────────────────────────────────────────── */

/** Entrada de cada bocadillo: llega desde su lado y se asienta. */
const ENTER = {
  user: { initial: { opacity: 0, y: 10, x: 14 } },
  waiter: { initial: { opacity: 0, y: 10, x: -14 } },
  shown: { opacity: 1, y: 0, x: 0 },
  transition: { duration: 0.34, ease: [0.22, 1, 0.36, 1] },
} as const;
/**
 * Los tres puntos del camarero pensando. Van con framer-motion y no con `animate-bounce` para que
 * suban y se enciendan a la vez (la clase de Tailwind solo bota), y para que `MotionConfig
 * reducedMotion="user"` del panel los deje quietos cuando el usuario pide menos movimiento.
 */
function TypingDots({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" role="status" aria-label={label}>
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          aria-hidden
          className="h-1.5 w-1.5 rounded-full bg-gold"
          initial={{ opacity: 0.35, y: 0 }}
          animate={{ opacity: [0.35, 1, 0.35], y: [0, -3.5, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
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
      <motion.div initial={ENTER.user.initial} animate={ENTER.shown} transition={ENTER.transition} className="flex justify-end pl-8">
        <div className="max-w-[88%] rounded-2xl rounded-tr-md border border-pimenton/35 bg-gradient-to-br from-pimenton/20 to-pimenton/8 px-4 py-3 text-[14px] leading-relaxed text-cream shadow-[0_12px_32px_-18px_rgba(158,22,24,0.9)]">
          <span className="sr-only">{m.chat.you}: </span>
          <p className="whitespace-pre-wrap [overflow-wrap:anywhere]">{message.content}</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div initial={ENTER.waiter.initial} animate={ENTER.shown} transition={ENTER.transition} className="flex items-end gap-2.5 pr-6">
      <TMark size={28} className="mb-1 shrink-0" />
      <div className="min-w-0 max-w-[88%] flex-1">
        <span className="sr-only">{m.chat.waiter}: </span>
        {message.status === "error" ? (
          <ErrorCard kind={errorKind} onRetry={onRetry} />
        ) : (
          <div
            className={cn(
              "space-y-2 rounded-2xl rounded-tl-md border border-cream/10 bg-gradient-to-br from-granate-700/90 to-granate-800 px-4 py-3 text-[14px] leading-relaxed text-cream-200 shadow-[0_10px_28px_-20px_rgba(0,0,0,0.9)] [overflow-wrap:anywhere]",
              streaming && !message.content && "inline-flex min-h-11 items-center",
            )}
          >
            {streaming && !message.content ? (
              <TypingDots label={m.chat.thinking} />
            ) : (
              <>
                <MarkdownLite text={message.content} streaming={streaming} />
                {streaming && <span aria-hidden className="ml-1 inline-block h-3.5 w-1.5 animate-pulse rounded-sm bg-pimenton-light align-text-bottom" />}
              </>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}
