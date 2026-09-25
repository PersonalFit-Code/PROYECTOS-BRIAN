"use client";

import { Bot, MessageCircle, Sparkles } from "lucide-react";
import { useId } from "react";
import { useChat } from "@/components/chat/ChatProvider";
import NeonButton from "@/components/ui/NeonButton";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/utils";

/**
 * WaiterCard — bloque protagonista del camarero virtual en la carta.
 *
 *  - Kicker "Camarero virtual" + titular + subtítulo (m.carta.askWaiter*).
 *  - 3-4 preguntas sugeridas como chips (m.chat.quickReplies): cada una abre el chat con esa
 *    pregunta ya enviada (`useChat().open({ prefill, page: "carta" })`).
 *  - CTA principal NeonButton "Abrir el chat".
 *  En móvil se pinta como banda a ancho completo justo después de la cabecera; en escritorio como
 *  tarjeta lateral pegajosa junto a los resultados (el orquestador decide dónde y cuándo se muestra).
 */

export interface WaiterCardProps {
  className?: string;
}

/** Nº de preguntas sugeridas que se muestran. */
const SUGGESTED_QUESTIONS = 4;

export default function WaiterCard({ className }: WaiterCardProps) {
  const m = useMessages();
  const chat = useChat();
  const titleId = useId();
  const questions = m.chat.quickReplies.slice(0, SUGGESTED_QUESTIONS);

  return (
    <section
      aria-labelledby={titleId}
      className={cn(
        "noise after:noise-after relative overflow-hidden rounded-3xl border border-pimenton-light/35 bg-[linear-gradient(160deg,rgba(58,14,19,0.85),rgba(18,18,18,0.92)_58%,rgba(34,8,11,0.9))] shadow-card",
        className,
      )}
    >
      {/* Brasa decorativa */}
      <span aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[radial-gradient(closest-side,rgba(216,50,60,0.45),transparent)] blur-2xl" />
      <span aria-hidden className="pointer-events-none absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(232,194,122,0.18),transparent)] blur-2xl" />

      <div className="relative p-5 md:p-7">
        <p className="inline-flex items-center gap-2 font-caps text-[11px] uppercase tracking-[0.3em] text-pimenton-a11y">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-pimenton-light/40 bg-pimenton/20 text-pimenton-light">
            <Bot size={16} aria-hidden />
          </span>
          {m.carta.askWaiterKicker}
        </p>

        <h2 id={titleId} className="mt-4 font-display text-3xl font-medium leading-[0.98] text-cream md:text-4xl text-balance">
          {m.carta.askWaiter}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-cream-muted md:text-[15px]">{m.carta.askWaiterSub}</p>

        <p className="mt-5 font-caps text-[10px] uppercase tracking-[0.3em] text-cream-faint">{m.carta.askWaiterHint}</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {questions.map((question) => (
            <li key={question}>
              <button
                type="button"
                onClick={() => chat.open({ prefill: question, page: "carta" })}
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-cream/15 bg-iron/40 px-3.5 py-2 text-left text-sm text-cream-200 transition-colors hover:border-pimenton-light/60 hover:bg-pimenton/15 hover:text-cream"
              >
                <Sparkles size={14} aria-hidden className="shrink-0 text-gold" />
                {question}
              </button>
            </li>
          ))}
        </ul>

        <NeonButton
          variant="primary"
          size="md"
          pulse
          icon={<MessageCircle aria-hidden />}
          onClick={() => chat.open({ page: "carta" })}
          className="mt-6 w-full sm:w-auto lg:w-full"
        >
          {m.carta.askWaiterCta}
        </NeonButton>

        <p className="mt-4 text-[11px] leading-relaxed text-cream-faint">{m.carta.askWaiterNote}</p>
      </div>
    </section>
  );
}
