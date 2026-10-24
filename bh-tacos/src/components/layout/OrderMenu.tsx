"use client";

import { Bike, ChevronDown, MessageCircle, Phone } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { BUSINESS } from "@/content";
import { GENERIC_ORDER_TEXT, whatsappUrl } from "@/lib/whatsapp";

/** Botón «Pedir ahora» con desplegable: WhatsApp, llamar y las dos apps de reparto. */
export default function OrderMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector<HTMLButtonElement>("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const item = "press flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-fg hover:bg-surface-2";
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className="press btn btn-primary min-h-11 px-4 py-2 text-sm"
        aria-expanded={open}
        aria-controls={menuId}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        Pedir ahora
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} aria-hidden />
      </button>
      {/* Se abre desde el botón (origen arriba a la derecha), 180 ms ease-out; nunca desde scale(0). */}
      <div
        id={menuId}
        className={`card absolute right-0 top-[calc(100%+8px)] z-50 w-64 origin-top-right p-2 shadow-2xl transition-[opacity,transform] duration-[180ms] ease-[var(--ease-out)] ${
          open ? "visible scale-100 opacity-100" : "invisible scale-95 opacity-0"
        }`}
      >
        <a className={item} href={whatsappUrl(GENERIC_ORDER_TEXT)} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
          <MessageCircle className="h-5 w-5 text-salsa" aria-hidden /> Pedir por WhatsApp
        </a>
        <a className={item} href={`tel:${BUSINESS.phone.tel}`} onClick={() => setOpen(false)}>
          <Phone className="h-5 w-5 text-brand-text" aria-hidden /> Llamar · {BUSINESS.phone.display}
        </a>
        <a className={item} href={BUSINESS.delivery.justEat} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
          <Bike className="h-5 w-5 text-cheese" aria-hidden /> Just Eat
        </a>
        <a className={item} href={BUSINESS.delivery.uberEats} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)}>
          <Bike className="h-5 w-5 text-cheese" aria-hidden /> Uber Eats
        </a>
      </div>
    </div>
  );
}
