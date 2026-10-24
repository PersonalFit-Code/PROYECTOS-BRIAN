"use client";

import { ChevronUp } from "lucide-react";
import { useState } from "react";
import { getStyle } from "@/data/menu";
import { cn, formatPrice } from "@/lib/format";
import { totalPrice, type TacoDraft } from "@/lib/price";
import OrderActions from "@/components/builder/OrderActions";
import TacoDetails from "@/components/builder/TacoDetails";
import TacoPreview from "@/components/common/TacoPreview";

/**
 * Vista previa + resumen. Escritorio: columna derecha fija (sticky). Móvil: barra inferior con el
 * precio que se despliega como hoja (curva de cajón, 300 ms). El precio anuncia cambios
 * con aria-live="polite".
 */
export default function SummaryPanel({ draft }: { draft: TacoDraft }) {
  const [open, setOpen] = useState(false);
  const total = formatPrice(totalPrice(draft));
  const title = `Taco ${draft.size} ${getStyle(draft.style).name}`;

  return (
    <>
      {/* Escritorio */}
      <aside aria-label="Tu taco" className="card sticky top-28 hidden p-6 lg:block">
        <div className="rounded-2xl bg-bg-alt p-3 text-fg">
          <TacoPreview {...draft} className="h-52 w-full" label={`Vista previa: ${title}`} />
        </div>
        <p className="mt-4 font-display text-3xl uppercase">{title}</p>
        <div className="mt-3">
          <TacoDetails draft={draft} />
        </div>
        <p className="mt-4 flex items-baseline justify-between">
          <span className="font-semibold">Total</span>
          <span aria-live="polite" aria-atomic="true" className="font-display text-4xl text-brand-text">
            {total}
          </span>
        </p>
      </aside>

      {/* Móvil */}
      <div className="fixed inset-x-0 bottom-0 z-30 lg:hidden">
        <div
          id="mobile-summary"
          className={cn(
            "absolute inset-x-0 bottom-full max-h-[70dvh] overflow-y-auto rounded-t-[24px] border border-line bg-bg p-5 shadow-2xl transition-[transform,opacity,visibility] duration-300 ease-[var(--ease-drawer)]",
            open ? "visible translate-y-0 opacity-100" : "invisible translate-y-full opacity-0",
          )}
          inert={!open}
        >
          <div className="rounded-2xl bg-bg-alt p-2 text-fg">
            <TacoPreview {...draft} className="h-40 w-full" label={`Vista previa: ${title}`} />
          </div>
          <div className="mt-3">
            <TacoDetails draft={draft} />
          </div>
          <div className="mt-4">
            <OrderActions draft={draft} compact />
          </div>
        </div>
        <button
          type="button"
          aria-expanded={open}
          aria-controls="mobile-summary"
          onClick={() => setOpen((v) => !v)}
          className="relative z-10 flex w-full items-center justify-between gap-3 border-t border-line bg-bg/95 px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-xl"
        >
          <span className="text-left">
            <span className="block text-xs text-fg-muted">{title}</span>
            <span aria-live="polite" aria-atomic="true" className="font-display text-2xl text-brand-text">
              {total}
            </span>
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold">
            {open ? "Ocultar" : "Ver resumen"}
            <ChevronUp className={cn("h-4 w-4 transition-transform duration-200", open && "rotate-180")} aria-hidden />
          </span>
        </button>
      </div>
    </>
  );
}
