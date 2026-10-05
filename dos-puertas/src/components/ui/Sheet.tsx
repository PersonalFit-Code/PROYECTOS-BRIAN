"use client";

import { useEffect, useRef, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, type PanInfo } from "framer-motion";
import { X } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/cn";

/**
 * Hoja modal. Móvil: sube desde abajo y se cierra arrastrando. Escritorio: diálogo centrado.
 * Escape cierra y devuelve el foco; el resto de la página queda `inert` mientras está abierta.
 */
export default function Sheet({
  open,
  onClose,
  labelledBy,
  className,
  children,
}: {
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  className?: string;
  children: ReactNode;
}) {
  const m = useMessages();
  const closeRef = useRef<HTMLButtonElement>(null);
  /* true solo en el cliente: el portal necesita `document.body`. */
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  useEffect(() => {
    if (!open) return;
    const returnFocus = document.activeElement as HTMLElement | null;
    const blocked = [document.getElementById("app-shell")];
    blocked.forEach((el) => el?.setAttribute("inert", ""));
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 60);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      blocked.forEach((el) => el?.removeAttribute("inert"));
      document.body.style.overflow = prevOverflow;
      returnFocus?.focus();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 110 || info.velocity.y > 600) onClose();
  };

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:p-6" key="sheet">
          <motion.div className="absolute inset-0 bg-botella-900/85" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={labelledBy}
            className={cn(
              "liquid-glass liquid-glass-strong sin-desenfoque relative max-h-[88svh] w-full overflow-y-auto rounded-t-[28px] px-5 pt-3 pb-[max(24px,env(safe-area-inset-bottom))] md:max-w-xl md:rounded-[28px] md:p-8",
              className,
            )}
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
              className="pulsable absolute top-3 right-3 z-10 inline-flex size-11 items-center justify-center rounded-full bg-cream/10 text-cream hover:bg-cream/20"
            >
              <X aria-hidden className="size-5" />
            </button>
            {children}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
