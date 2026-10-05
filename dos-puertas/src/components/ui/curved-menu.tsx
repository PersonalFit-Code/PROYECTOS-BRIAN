"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/cn";

/**
 * Menú lateral con borde curvo (adaptado del componente «curved-menu» de 21st.dev).
 *
 * Cambios respecto al original:
 * - Colores de la casa (verde botella y oro) en vez de blanco y negro.
 * - El botón es un <button> real con `aria-expanded`/`aria-controls`, y no un <div>.
 * - Escape y el fondo cierran; el resto de la página queda `inert` y sin scroll mientras está abierto;
 *   al navegar se cierra solo.
 * - La curva se dibuja en un `viewBox` escalable: no lee `window` durante el render (rompía en SSR).
 * - Sin sonidos ni iconos de redes (lucide-react 1.x ya no trae los de marcas): el pie es un hueco.
 */
export interface CurvedMenuItem {
  heading: string;
  href: string;
  subheading?: string;
  active?: boolean;
}

const EASE = [0.76, 0, 0.24, 1] as const;

function NavLink({ item, index, onNavigate }: { item: CurvedMenuItem; index: number; onNavigate: () => void }) {
  return (
    <motion.li
      whileHover="hover"
      className="group border-b border-cream/10 last:border-b-0"
      variants={{ initial: { opacity: 0, x: 40 }, enter: { opacity: 1, x: 0 } }}
      transition={{ duration: 0.6, ease: EASE, delay: 0.25 + index * 0.05 }}
    >
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={item.active ? "page" : undefined}
        className="flex items-baseline gap-4 py-3.5 outline-offset-4 sm:py-4"
      >
        <span aria-hidden className={cn("w-7 shrink-0 font-condensed text-lg tracking-wide", item.active ? "text-oro" : "text-oro/55")}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="min-w-0">
          <span className="sr-only">{item.heading}</span>
          <motion.span
            aria-hidden
            className={cn(
              "block font-display text-[2rem] leading-none font-medium sm:text-[2.6rem]",
              /* Color sólido y no degradado recortado: las letras van en inline-block animadas y el
              `background-clip: text` del padre no las alcanza (se quedaban transparentes). */
              item.active ? "text-oro-light" : "text-cream group-hover:text-oro-light",
            )}
            variants={{ initial: { x: 0 }, enter: { x: 0 }, hover: { x: -6 } }}
            transition={{ type: "spring", staggerChildren: 0.03 }}
          >
            {item.heading.split("").map((letter, i) => (
              <motion.span
                key={i}
                className="inline-block whitespace-pre"
                variants={{ initial: { x: 0 }, enter: { x: 0 }, hover: { x: 6 } }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
              >
                {letter}
              </motion.span>
            ))}
          </motion.span>
          {item.subheading ? <span className="mt-1.5 block text-[13px] text-cream-faint">{item.subheading}</span> : null}
        </span>
      </Link>
    </motion.li>
  );
}

/** La curva que asoma por el borde izquierdo del panel al abrir y se aplana al llegar. */
function Curve({ reduced }: { reduced: boolean }) {
  const bent = "M100 0 L200 0 L200 100 L100 100 Q-100 50 100 0";
  const flat = "M100 0 L200 0 L200 100 L100 100 Q100 50 100 0";
  return (
    <svg aria-hidden viewBox="0 0 200 100" preserveAspectRatio="none" className="pointer-events-none absolute top-0 -left-[99px] h-full w-[200px] overflow-visible">
      <motion.path
        className="fill-botella-800"
        initial={{ d: reduced ? flat : bent }}
        animate={{ d: flat, transition: { duration: reduced ? 0 : 1, ease: EASE } }}
        exit={{ d: reduced ? flat : bent, transition: { duration: reduced ? 0 : 0.8, ease: EASE } }}
      />
    </svg>
  );
}

export default function CurvedMenu({
  items,
  label,
  openLabel,
  closeLabel,
  heading,
  footer,
  triggerClassName,
}: {
  items: CurvedMenuItem[];
  /** Texto visible junto al icono del botón (desde `sm`). */
  label: string;
  openLabel: string;
  closeLabel: string;
  heading: string;
  footer?: ReactNode;
  triggerClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const pathname = usePathname();
  const reduced = useReducedMotion() ?? false;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  /* Al cambiar de página, cerrado. */
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const shell = document.getElementById("app-shell");
    shell?.setAttribute("inert", "");
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => closeRef.current?.focus(), 80);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    const trigger = triggerRef.current;
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      shell?.removeAttribute("inert");
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [open]);

  const slide = reduced ? { duration: 0 } : { duration: 0.8, ease: EASE };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={openLabel}
        onClick={() => setOpen(true)}
        className={cn("pulsable inline-flex h-11 items-center gap-2.5 rounded-full border border-cream/15 bg-cream/[0.06] px-3.5 text-sm font-medium text-cream hover:border-oro/45", triggerClassName)}
      >
        <span aria-hidden className="flex w-5 flex-col gap-[5px]">
          <span className="h-[1.5px] w-5 rounded-full bg-current" />
          <span className="h-[1.5px] w-3.5 rounded-full bg-oro" />
          <span className="h-[1.5px] w-5 rounded-full bg-current" />
        </span>
        <span className="hidden sm:inline">{label}</span>
      </button>

      {mounted
        ? createPortal(
            <AnimatePresence mode="wait">
              {open ? (
                <div key="menu" className="fixed inset-0 z-[60]">
                  <motion.div
                    className="absolute inset-0 bg-botella-900/70"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { duration: reduced ? 0 : 0.5 } }}
                    exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.6, delay: reduced ? 0 : 0.2 } }}
                    onClick={() => setOpen(false)}
                  />
                  <motion.nav
                    id={panelId}
                    aria-label={heading}
                    className="absolute top-0 right-0 h-[100dvh] w-screen max-w-[560px] bg-botella-800 text-cream shadow-[-40px_0_80px_-40px_rgba(0,0,0,0.8)]"
                    initial={{ x: "calc(100% + 100px)" }}
                    animate={{ x: 0, transition: slide }}
                    exit={{ x: "calc(100% + 100px)", transition: slide }}
                  >
                    <Curve reduced={reduced} />
                    <div className="grano relative flex h-full flex-col overflow-y-auto px-6 pt-[max(18px,env(safe-area-inset-top))] pb-[max(20px,env(safe-area-inset-bottom))] sm:px-12">
                      <div className="flex items-center justify-between gap-4 border-b border-cream/15 pb-4">
                        <p className="font-caps text-[11px] font-semibold tracking-[0.28em] text-oro-a11y uppercase">{heading}</p>
                        <button
                          ref={closeRef}
                          type="button"
                          onClick={() => setOpen(false)}
                          aria-label={closeLabel}
                          className="pulsable inline-flex size-11 items-center justify-center rounded-full border border-cream/15 bg-cream/[0.06] hover:border-oro/45"
                        >
                          <span aria-hidden className="relative block size-4">
                            <span className="absolute top-1/2 left-0 h-[1.5px] w-4 -translate-y-1/2 rotate-45 rounded-full bg-current" />
                            <span className="absolute top-1/2 left-0 h-[1.5px] w-4 -translate-y-1/2 -rotate-45 rounded-full bg-oro" />
                          </span>
                        </button>
                      </div>
                      <motion.ul initial="initial" animate="enter" className="mt-2">
                        {items.map((item, i) => (
                          <NavLink key={item.href} item={item} index={i} onNavigate={() => setOpen(false)} />
                        ))}
                      </motion.ul>
                      {footer ? <div className="mt-auto pt-8">{footer}</div> : null}
                    </div>
                  </motion.nav>
                </div>
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}
