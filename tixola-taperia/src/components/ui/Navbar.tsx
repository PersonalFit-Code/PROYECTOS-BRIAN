"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, MotionConfig, type Variants } from "framer-motion";
import { ArrowUpRight, MapPin, Menu, Phone, X } from "lucide-react";
import { BUSINESS, NAV_LINKS } from "@/data/business";
import Logo from "@/components/ui/Logo";
import NeonButton from "@/components/ui/NeonButton";
import { useReservation } from "@/components/ui/ReservationProvider";
import { useInertBackground } from "@/hooks/useInertBackground";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Constantes
   ────────────────────────────────────────────────────────────── */

/** Píxeles de scroll a partir de los cuales la barra pasa a cristal ahumado. */
const SCROLL_THRESHOLD = 40;
/** Secciones de la home que se vigilan para resaltar el enlace activo. */
const SECTION_IDS = ["hero", "platos", "experiencia", "opiniones"] as const;
type SectionId = (typeof SECTION_IDS)[number];

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/** "/#platos" → "platos"; "/carta" → null */
function hashOf(href: string): string | null {
  const i = href.indexOf("#");
  return i >= 0 ? href.slice(i + 1) : null;
}

/** `aria-current` correcto: "page" solo para una ruta real distinta; "true" para anclas en la misma página. */
function ariaCurrentFor(href: string, active: boolean): "page" | "true" | undefined {
  if (!active) return undefined;
  return hashOf(href) ? "true" : "page";
}

/* Variantes del menú móvil */
const menuVariants: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.25, ease: "easeIn", when: "afterChildren" } },
  show: { opacity: 1, transition: { duration: 0.35, ease: EASE_OUT_EXPO, staggerChildren: 0.07, delayChildren: 0.1 } },
};
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)", transition: { duration: 0.2 } },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

/* ──────────────────────────────────────────────────────────────
   Navbar
   ────────────────────────────────────────────────────────────── */

/**
 * Cabecera fija:
 *  - Transparente sobre el hero; tras 40 px de scroll (o fuera de la home / con el menú abierto)
 *    se convierte en cristal ahumado con borde inferior (listener de scroll con rAF).
 *  - Enlaces centrales (md+) con resaltado de la sección visible (IntersectionObserver en "/").
 *  - Teléfono (lg+) + CTA "Reservar" que abre el modal global.
 *  - Móvil: hamburguesa → menú a pantalla completa con enlaces grandes escalonados, scroll
 *    bloqueado, cierre con Escape / navegación y foco atrapado dentro del panel.
 */
export default function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const { open: openReservation } = useReservation();

  const [scrolled, setScrolled] = useState(false);
  const [activeId, setActiveId] = useState<SectionId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const solid = scrolled || !isHome || menuOpen;

  /* El resto de la página queda inert mientras el menú móvil está abierto; la cabecera se
     excluye porque aloja su propio botón de abrir/cerrar (se ve por encima del panel). */
  useInertBackground(menuOpen, [headerRef, panelRef]);

  /* Scroll → cristal (throttle con requestAnimationFrame). */
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      setScrolled(window.scrollY > SCROLL_THRESHOLD);
    };
    const onScroll = () => {
      if (!raf) raf = window.requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, []);

  /* Sección activa (solo en la home): la que cruza la franja central del viewport. */
  useEffect(() => {
    if (!isHome) return;
    const targets = SECTION_IDS.map((id) => document.getElementById(id)).filter((el): el is HTMLElement => el !== null);
    if (!targets.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveId(entry.target.id as SectionId);
        }
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: 0 },
    );
    targets.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [isHome]);

  /* Menú móvil: bloqueo de scroll, Escape, foco inicial y devolución del foco al cerrar. */
  useEffect(() => {
    if (!menuOpen) return;
    const toggle = toggleRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const firstLink = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    const focusTimer = window.setTimeout(() => firstLink?.focus(), 80);
    /* Si el usuario gira/ensancha la pantalla hasta md, cerramos el menú. */
    const mq = window.matchMedia("(min-width: 768px)");
    const onMq = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onMq);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      window.clearTimeout(focusTimer);
      toggle?.focus();
    };
  }, [menuOpen]);

  /* Trampa de foco: Tab / Shift+Tab ciclan dentro del panel. */
  const trapFocus = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab" || !panelRef.current) return;
    const nodes = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const reserveFromMenu = useCallback(() => {
    setMenuOpen(false);
    openReservation();
  }, [openReservation]);

  const isActive = (href: string) => {
    const hash = hashOf(href);
    if (hash) return isHome && activeId === hash;
    return pathname === href;
  };

  return (
    <MotionConfig reducedMotion="user">
      <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 h-[var(--header-h)]">
        {/* Fondo cristal ahumado que aparece con el scroll */}
        <div
          aria-hidden
          className={cn(
            "absolute inset-0 border-b transition-[opacity,border-color] duration-500 ease-[var(--ease-out-expo)]",
            "bg-[linear-gradient(160deg,rgba(20,20,20,0.86),rgba(20,20,20,0.66))] backdrop-blur-xl backdrop-saturate-[1.2] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.7)]",
            solid ? "border-cream/10 opacity-100" : "border-transparent opacity-0",
          )}
        />

        <nav aria-label="Principal" className="container-page relative flex h-full items-center justify-between gap-4">
          {/* Marca */}
          <Link
            href="/"
            aria-label="Tixola Tapería — inicio"
            onClick={closeMenu}
            className="group inline-flex items-center gap-2 rounded-md py-2 transition-transform duration-300 hover:-translate-y-px"
          >
            <Logo size={30} decorative className="transition-[filter] duration-500 group-hover:drop-shadow-[0_0_14px_rgba(216,50,60,0.55)]" />
          </Link>

          {/* Enlaces (md+) */}
          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(link.href);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={ariaCurrentFor(link.href, active)}
                    className={cn(
                      "group relative inline-flex h-11 items-center px-3.5 font-sans text-[13px] font-semibold uppercase tracking-[0.16em] transition-colors duration-300 lg:px-4",
                      active ? "text-cream" : "text-cream-muted hover:text-cream",
                    )}
                  >
                    {link.label}
                    <span
                      aria-hidden
                      className={cn(
                        "absolute inset-x-3.5 -bottom-px h-0.5 origin-left rounded-full bg-pimenton-light transition-transform duration-500 ease-[var(--ease-out-expo)] lg:inset-x-4",
                        active ? "scale-x-100 shadow-neon" : "scale-x-0 group-hover:scale-x-100",
                      )}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Acciones */}
          <div className="flex items-center gap-2 md:gap-3">
            <a
              href={BUSINESS.phone.tel}
              className="hidden h-11 items-center gap-2 rounded-full px-3 font-sans text-sm font-semibold text-cream-200 transition-colors hover:text-cream lg:inline-flex"
            >
              <Phone className="h-4 w-4 text-pimenton-light" aria-hidden />
              <span className="tabular-nums">{BUSINESS.phone.display}</span>
            </a>
            <div className="hidden sm:block">
              <NeonButton size="sm" pulse onClick={openReservation}>
                Reservar
              </NeonButton>
            </div>

            {/* Hamburguesa */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              className="glass relative grid h-11 w-11 place-items-center rounded-full text-cream transition-colors hover:text-pimenton-light md:hidden"
            >
              <span className="relative block h-5 w-5">
                <Menu
                  className={cn("absolute inset-0 h-5 w-5 transition-all duration-300", menuOpen ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100")}
                  aria-hidden
                />
                <X
                  className={cn("absolute inset-0 h-5 w-5 transition-all duration-300", menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0")}
                  aria-hidden
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Menú móvil a pantalla completa */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="menu"
            id="menu-movil"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
            variants={menuVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            onKeyDown={trapFocus}
            className="fixed inset-0 z-[45] flex flex-col overflow-y-auto overflow-x-hidden bg-[linear-gradient(180deg,rgba(12,12,12,0.94),rgba(34,8,11,0.96))] backdrop-blur-2xl md:hidden"
          >
            {/* Brasa decorativa */}
            <span aria-hidden className="pointer-events-none absolute -bottom-32 left-1/2 h-72 w-[120vw] -translate-x-1/2 rounded-full bg-pimenton/30 blur-3xl" />
            <span aria-hidden className="pointer-events-none absolute right-[-30%] top-[10%] select-none font-condensed text-[42vw] leading-none text-cream/[0.04]">
              TIXOLA
            </span>

            <div className="container-page relative flex min-h-full flex-col pt-[calc(var(--header-h)+1.5rem)] pb-[calc(var(--mobile-bar-h)+env(safe-area-inset-bottom)+1.5rem)]">
              <motion.p variants={itemVariants} className="text-[11px] font-bold uppercase tracking-[0.3em] text-pimenton-a11y">
                Tapería · Vinoteca · Ourense
              </motion.p>

              <ul className="mt-6 flex flex-col">
                {NAV_LINKS.map((link, i) => {
                  const active = isActive(link.href);
                  return (
                    <motion.li key={link.href} variants={itemVariants} className="border-b border-cream/10">
                      <Link
                        href={link.href}
                        onClick={closeMenu}
                        aria-current={ariaCurrentFor(link.href, active)}
                        className="group flex items-center justify-between gap-4 py-4"
                      >
                        <span className="flex items-baseline gap-4">
                          <span className="font-condensed text-base tracking-widest text-pimenton-light">0{i + 1}</span>
                          <span
                            className={cn(
                              "font-display text-4xl leading-none tracking-tight transition-colors sm:text-5xl",
                              active ? "text-gradient-ember italic" : "text-cream group-hover:text-cream-200",
                            )}
                          >
                            {link.label}
                          </span>
                        </span>
                        <ArrowUpRight className="h-6 w-6 shrink-0 text-cream-faint transition-all duration-300 group-hover:text-pimenton-light group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              <motion.div variants={itemVariants} className="mt-8 flex flex-col gap-3">
                <NeonButton size="lg" pulse onClick={reserveFromMenu} className="w-full">
                  Reservar mesa
                </NeonButton>
                <NeonButton size="md" variant="outline" href={BUSINESS.phone.tel} icon={<Phone aria-hidden />} className="w-full">
                  Llamar al {BUSINESS.phone.display}
                </NeonButton>
              </motion.div>

              <motion.address variants={itemVariants} className="mt-auto flex items-start gap-3 pt-10 text-sm not-italic text-cream-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pimenton-light" aria-hidden />
                <span>
                  {BUSINESS.address.full}
                  <br />
                  <span className="text-cream-faint">{BUSINESS.address.landmark}</span>
                </span>
              </motion.address>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
