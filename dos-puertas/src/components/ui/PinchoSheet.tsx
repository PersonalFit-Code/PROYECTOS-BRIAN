"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import PinchoArt from "./PinchoArt";
import { useMessages } from "@/i18n/LocaleProvider";
import type { Pincho } from "@/data/menu";

/**
 * Ficha de un pincho. Móvil: hoja desde abajo, arrastrable para cerrar. Escritorio: diálogo.
 * La ilustración viaja desde la tarjeta (`layoutId`). Escape cierra y devuelve el foco; el fondo
 * queda `inert` mientras está abierta.
 */
export default function PinchoSheet({ pincho, onClose }: { pincho: Pincho | null; onClose: () => void }) {
  const m = useMessages();
  const closeRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef<HTMLElement | null>(null);
  /* true solo en el cliente: el portal necesita `document.body`. */
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!pincho) return;
    returnFocus.current = document.activeElement as HTMLElement | null;
    const shell = document.getElementById("app-shell");
    const dock = document.getElementById("dock");
    shell?.setAttribute("inert", "");
    dock?.setAttribute("inert", "");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      shell?.removeAttribute("inert");
      dock?.removeAttribute("inert");
      document.body.style.overflow = prevOverflow;
      returnFocus.current?.focus();
    };
  }, [pincho, onClose]);

  if (!mounted) return null;

  const item = pincho ? m.barra.items[pincho.id] : null;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {pincho && item ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center" key="sheet">
          <motion.div
            className="absolute inset-0 bg-tinta-900/85"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pincho-title"
            className="liquid-glass liquid-glass-strong sin-desenfoque relative max-h-[88svh] w-full overflow-y-auto rounded-t-[28px] px-5 pt-3 pb-[max(24px,env(safe-area-inset-bottom))] md:max-w-xl md:rounded-[28px] md:p-8"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
          >
            <div aria-hidden className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-cream/25 md:hidden" />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label={m.common.close}
              className="pulsable absolute top-3 right-3 inline-flex size-11 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
            >
              <X aria-hidden className="size-5" />
            </button>

            <motion.div layoutId={`art-${pincho.id}`} className="mx-auto w-44 sm:w-52">
              <PinchoArt kind={pincho.illustration} className="w-full" />
            </motion.div>
            <p className="mt-1 text-center text-[11px] text-cream-faint">{m.common.photoPending}</p>

            <p className="mt-5 font-caps text-[11px] font-semibold tracking-[0.24em] text-oro-a11y uppercase">{item.tag}</p>
            <h2 id="pincho-title" className="mt-2 font-display text-3xl leading-tight font-medium">
              {item.name}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed text-cream-muted">{item.text}</p>

            {item.story ? (
              <div className="mt-6 rounded-2xl border border-oro/20 bg-oro/[0.06] p-4">
                <p className="font-caps text-[10px] font-semibold tracking-[0.24em] text-oro-a11y uppercase">{m.barra.storyLabel}</p>
                <p className="mt-2 text-[15px] leading-relaxed text-cream">{item.story}</p>
              </div>
            ) : null}

            <p className="mt-5 text-xs leading-relaxed text-cream-faint">
              {m.barra.priceNote} {m.barra.allergensNote}
            </p>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
