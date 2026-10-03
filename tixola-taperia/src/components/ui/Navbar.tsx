"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion, MotionConfig, type Variants } from "framer-motion";
import { ArrowUpRight, MapPin, Menu, Phone, X } from "lucide-react";
import { BUSINESS } from "@/data/business";
import { stripLocale } from "@/i18n/config";
import { useFormat, useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import CallLabel from "@/components/ui/CallLabel";
import Logo from "@/components/ui/Logo";
import NeonButton from "@/components/ui/NeonButton";
import LanguageSwitcher from "@/components/ui/LanguageSwitcher";
import FloatingWhatsApp from "@/components/ui/FloatingWhatsApp";
import { useInertBackground } from "@/hooks/useInertBackground";
import { useScrollPastPixels } from "@/hooks/useScrollPast";
import { lockScroll } from "@/lib/scrollLock";
import { cn } from "@/lib/utils";

/* ──────────────────────────────────────────────────────────────
   Enlaces de navegación (etiquetas desde m.nav.links; rutas sin prefijo → lp())
   ────────────────────────────────────────────────────────────── */

export type NavKey = "dishes" | "menu" | "wines" | "location" | "reviews";

export interface NavItem {
  key: NavKey;
  /** Ruta sin prefijo de idioma ("/#platos", "/carta"). Pásala por lp() al renderizar. */
  href: string;
  label: string;
  /** Etiqueta corta para la barra de escritorio. */
  shortLabel: string;
}

const NAV_ITEMS: readonly { key: NavKey; href: string }[] = [
  { key: "dishes", href: "/#platos" },
  { key: "menu", href: "/carta" },
  /* Los vinos van entre la carta y la ubicación porque es donde los pidió el cliente, y además es
     donde tienen sentido: quien acaba de mirar qué comer es quien se pregunta qué beber. Es una
     RUTA, no un ancla de la portada, igual que "/carta" — esta lista mezcla las dos cosas a
     propósito y `hashOf()` distingue una de otra para el `aria-current`. */
  { key: "wines", href: "/vinos" },
  { key: "location", href: "/#experiencia" },
  { key: "reviews", href: "/#opiniones" },
];

/** Enlaces principales con su etiqueta localizada (los usan Navbar y Footer). */
export function useNavItems(): NavItem[] {
  const m = useMessages();
  return useMemo(() => NAV_ITEMS.map((item) => ({ ...item, label: m.nav.links[item.key], shortLabel: m.nav.shortLinks[item.key] })), [m]);
}

/* ──────────────────────────────────────────────────────────────
   Constantes
   ────────────────────────────────────────────────────────────── */

/** Píxeles de scroll a partir de los cuales la barra pasa a hierro sólido. */
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

/* Variantes del menú móvil.
   Abrir el menú es una RESPUESTA a una pulsación, no una escena: con los valores anteriores
   (stagger 0.07 + delayChildren 0.1 + 0.7 s por hijo) el octavo elemento arrancaba a 0,59 s y el
   menú no acababa de montarse hasta 1,29 s. Ahora el primer elemento está en pantalla a ~240 ms y
   el último termina a ~0,48 s; el escalonado sigue leyéndose porque el desplazamiento baja de 24 a
   12 px, que a esa velocidad es lo que el ojo puede seguir. */
const menuVariants: Variants = {
  hidden: { opacity: 0, transition: { duration: 0.25, ease: "easeIn", when: "afterChildren" } },
  show: { opacity: 1, transition: { duration: 0.18, ease: EASE_OUT_EXPO, staggerChildren: 0.035, delayChildren: 0.02 } },
};
/* Solo `opacity` + `y`: un `filter: blur()` escalonado sería seis reflows de pintado en la apertura
   (los filtros no se componen en la GPU), justo cuando entra el panel a pantalla completa. */
const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12, transition: { duration: 0.2 } },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: EASE_OUT_EXPO } },
};

/* ──────────────────────────────────────────────────────────────
   Navbar
   ────────────────────────────────────────────────────────────── */

/**
 * Cabecera fija:
 *  - Transparente sobre el hero; tras 40 px de scroll (o fuera de la home / con el menú abierto)
 *    se convierte en una banda de hierro casi opaca con borde inferior (almacén único de scroll).
 *  - Logo grande que aprovecha el margen izquierdo (margen negativo en lg).
 *  - Enlaces centrales en Cinzel (lg+, etiquetas cortas) con resaltado de la sección visible (IntersectionObserver en "/").
 *  - Selector de idioma (md+), teléfono (icono en lg, número en xl) y CTA que lleva a la carta (o a
 *    cómo llegar cuando ya estás en ella).
 *  - Móvil y tablet (< lg): hamburguesa → menú a pantalla completa con chips de idioma, enlaces grandes escalonados,
 *    scroll bloqueado, cierre con Escape / navegación y foco atrapado dentro del panel.
 *  - Monta el botón flotante de WhatsApp como hermano de la cabecera (visible en todas las páginas).
 */
export default function Navbar() {
  const m = useMessages();
  const t = useFormat();
  const lp = useLocalePath();
  const pathname = usePathname();
  const currentPath = stripLocale(pathname ?? "/").path;
  /* En la propia carta, el CTA de la cabecera cambia: apuntar a la página en la que ya estás no
     es una llamada a la acción, es un callejón sin salida. */
  const onMenuPage = currentPath.startsWith("/carta");
  const isHome = currentPath === "/";
  const navItems = useNavItems();

  /* Scroll → barra sólida. Del almacén único de scroll: un listener y un rAF para toda la web en
     vez de uno por componente (aquí, en FloatingWhatsApp y en ChatLauncher había tres). */
  const scrolled = useScrollPastPixels(SCROLL_THRESHOLD);
  const [activeId, setActiveId] = useState<SectionId | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const solid = scrolled || !isHome || menuOpen;

  /* El resto de la página queda inert mientras el menú móvil está abierto; la cabecera se
     excluye porque aloja su propio botón de abrir/cerrar (se ve por encima del panel). */
  useInertBackground(menuOpen, [headerRef, panelRef]);

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
    /* Bloqueo CONTADO y compartido (`src/lib/scrollLock.ts`): el atributo `data-scroll-lock` del <html>
       es lo que consultan Lenis y HeroCanvas, y con cuatro paneles escribiéndolo a mano el que se
       cerrara primero lo borraba para todos. */
    const releaseScroll = lockScroll();
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    /* El foco entra en el primer fotograma pintado (antes: temporizador de 80 ms). */
    const firstLink = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    const focusFrame = window.requestAnimationFrame(() => firstLink?.focus());
    /* Si el usuario gira/ensancha la pantalla hasta lg (barra de escritorio), cerramos el menú. */
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onMq);
    return () => {
      releaseScroll();
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
      window.cancelAnimationFrame(focusFrame);
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

  const isActive = (href: string) => {
    const hash = hashOf(href);
    if (hash) return isHome && activeId === hash;
    return currentPath === href;
  };

  return (
    <MotionConfig reducedMotion="user">
      <header ref={headerRef} className="fixed inset-x-0 top-0 z-50 h-[var(--header-h)]">
        {/* LA CÁPSULA DE CRISTAL (Liquid Glass). Antes era una banda de borde a borde pegada arriba;
            ahora flota separada de los cantos, con el radio de cápsula de los controles de iOS 26, y
            aparece con el scroll creciendo un pelín desde su sitio en vez de fundirse sin más. Es la
            superficie de cristal más ancha de la web, con la página entera pasando por debajo, y por
            eso `cristal-ancho`: el desenfoque real solo en gama alta (las cifras, en globals.css). */}
        <div
          aria-hidden
          data-navbar-surface
          className={cn(
            "liquid-glass liquid-glass-strong cristal-ancho absolute inset-x-2 inset-y-2 rounded-full transition-[opacity,scale] duration-[var(--dur-morph)] ease-[var(--ease-muelle)] sm:inset-x-3 lg:inset-x-5",
            /* Oculta (opacidad 0) en lo alto de la portada: ahí la cabecera flota sobre el dibujo sin
               superficie. El desenfoque de una capa a opacidad 0 no se pinta, así que esconderla no
               cuesta nada; al aparecer crece un 2 % desde su sitio con la curva de muelle. */
            /* Visible SIN `scale` (ni siquiera `scale-100`): medido, dejar un `scale: 1` fijo en esta
               cápsula de 1.400 px costaba ~5 fotogramas de cada 220 al hacer scroll en /vinos con la CPU
               ralentizada. El escalado solo existe mientras está oculta, y de `0.98` a `none` el
               navegador interpola igual. */
            solid ? "opacity-100" : "scale-[0.98] opacity-0",
          )}
        />

        <nav aria-label={m.nav.mainAria} className="container-page relative flex h-full items-center justify-between gap-3 md:gap-4">
          {/* Marca: grande, pegada al margen izquierdo en lg */}
          <Link
            href={lp("/")}
            aria-label={m.nav.homeAria}
            onClick={closeMenu}
            className="group relative inline-flex shrink-0 items-center rounded-md py-1.5 transition-transform duration-200 ease-[var(--ease-out-expo)] hover:-translate-y-px lg:-ml-5 xl:-ml-6"
          >
            {/* El realce NO se hace animando un `filter`: eso obliga a re-rasterizar el logotipo entero en
                cada fotograma del hover. Pero el cambio de color tampoco servía: en `Logo.tsx` solo el
                `Wordmark` usa `fill="currentColor"`, así que el hover pasaba TIXOLA de #f6f4e7 a #ffffff
                —imperceptible— y la sartén, que es la que daba el halo rojo, no se movía.
                Así que el halo vuelve, pero ESTÁTICO y en su propia capa: el filtro no existe, es un
                degradado radial quieto y lo único que se anima es su opacidad, que el compositor resuelve
                sin volver a pintar nada. */}
            <span
              aria-hidden
              className="pointer-events-none absolute left-0 top-1/2 h-16 w-40 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(232,86,90,0.4),rgba(232,86,90,0.14)_52%,transparent_100%)] opacity-0 transition-opacity duration-200 group-hover:opacity-100"
            />
            <Logo size="md" decorative className="relative text-cream transition-colors duration-200 group-hover:text-white" />
          </Link>

          {/* Enlaces (lg+): etiquetas cortas en Cinzel; el menú completo vive en el panel móvil/tablet */}
          <ul className="hidden items-center lg:flex xl:gap-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.key}>
                  <Link
                    href={lp(item.href)}
                    aria-current={ariaCurrentFor(item.href, active)}
                    className={cn(
                      "pulsable group relative isolate inline-flex h-11 items-center rounded-full px-3 font-caps text-[11px] uppercase tracking-[0.22em] xl:px-4 xl:text-[12px] xl:tracking-[0.25em]",
                      active ? "text-cream" : "text-cream-muted hover:bg-cream/[0.05] hover:text-cream",
                    )}
                  >
                    {item.shortLabel}
                    {/* La sección activa va dentro de una cápsula que VIAJA de un enlace al siguiente
                        (layoutId) en vez de apagarse en uno y encenderse en otro. Es contenido dentro
                        del cristal: sin desenfoque propio, solo un velo y su filo de luz. */}
                    {active && (
                      <motion.span
                        layoutId="nav-capsula-activa"
                        aria-hidden
                        transition={{ type: "spring", stiffness: 420, damping: 34, mass: 0.8 }}
                        className="absolute inset-y-1 inset-x-0 -z-10 rounded-full bg-cream/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.16)]"
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Acciones */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3">
            <LanguageSwitcher className="hidden md:block" />
            <a
              href={BUSINESS.phone.tel}
              aria-label={t(m.common.cta.callNumber, { phone: BUSINESS.phone.display })}
              className="hidden h-11 min-w-11 items-center justify-center gap-2 rounded-full font-sans text-sm font-semibold text-cream-200 transition-colors hover:text-cream lg:inline-flex xl:px-3"
            >
              <Phone className="h-4 w-4 text-pimenton-light" aria-hidden />
              <span className="hidden tabular-nums xl:inline">{BUSINESS.phone.display}</span>
            </a>
            {/* Era el botón de "Reservar". Sin reservas, el CTA de la cabecera es la carta; y cuando
                ya estás EN la carta apunta a cómo llegar, para que nunca lleve a la página en la que
                estás. */}
            <div className="hidden sm:block">
              {onMenuPage ? (
                <NeonButton size="sm" pulse href={BUSINESS.social.directions} target="_blank" aria-label={m.common.cta.directionsAria}>
                  {m.common.cta.directions}
                </NeonButton>
              ) : (
                <NeonButton size="sm" pulse href={lp("/carta")}>
                  {m.common.cta.menuShort}
                </NeonButton>
              )}
            </div>

            {/* Hamburguesa */}
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="menu-movil"
              aria-label={menuOpen ? m.nav.closeMenu : m.nav.openMenu}
              /* Sin cristal propio: vive DENTRO de la cápsula de la cabecera (nunca cristal sobre
                 cristal). En lo alto de la portada, con la cápsula aún oculta, el velo granate al 70 %
                 le basta para leerse sobre el dibujo. */
              className="pulsable relative grid h-10 w-10 place-items-center rounded-full border border-cream/15 bg-granate-900/70 text-cream hover:text-pimenton-light lg:hidden"
            >
              <span className="relative block h-5 w-5">
                <Menu
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-[rotate,scale,opacity] duration-200 ease-[var(--ease-out-expo)]",
                    menuOpen ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100",
                  )}
                  aria-hidden
                />
                <X
                  className={cn(
                    "absolute inset-0 h-5 w-5 transition-[rotate,scale,opacity] duration-200 ease-[var(--ease-out-expo)]",
                    menuOpen ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0",
                  )}
                  aria-hidden
                />
              </span>
            </button>
          </div>
        </nav>
      </header>

      {/* Botón flotante de WhatsApp (todas las páginas) */}
      <FloatingWhatsApp />

      {/* Menú móvil a pantalla completa */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="menu"
            id="menu-movil"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={m.nav.mobileMenuAria}
            variants={menuVariants}
            initial="hidden"
            animate="show"
            exit="hidden"
            onKeyDown={trapFocus}
            /* Liquid Glass: el menú es una HOJA de cristal fuerte sobre la página, no un telón opaco.
               El desenfoque a pantalla completa es asumible aquí porque mientras está abierto lo de
               debajo está QUIETO: el scroll está bloqueado y `HeroCanvas` pausa sus animaciones, así
               que el fondo se desenfoca una vez y no en cada fotograma. Con `liquid-glass-strong` el
               texto pasa AA aunque debajo quede la foto más clara de la portada. */
            className="liquid-glass liquid-glass-strong fixed inset-0 z-[45] flex flex-col overflow-y-auto overflow-x-hidden rounded-none border-0 lg:hidden"
          >
            {/* Brasa decorativa */}
            {/* Radial prehorneado en lugar de `bg-pimenton/30 blur-3xl`: desenfocar 64 px una superficie de
                120vw × 288 px obligaba a rasterizarla aparte, ampliarla por el radio del desenfoque y
                recomponerla; un degradado cae suave por sí solo.
                Y es `ember-wash`, no `ember-glow`: el original era RELLENO MACIZO y el desenfoque solo le
                plumeaba el borde, así que un radial de pico y caída rápida dejaba este resplandor —el pie
                del menú móvil, la superficie de marca que más se ve en el teléfono— en un rubor casi
                invisible. `ember-wash` mantiene el alfa hasta el 70 % del radio, que es la forma que
                tenía. Alfa de vuelta al original (0,30): con la caída correcta ya no hay que compensar. */}
            <span
              aria-hidden
              className="ember-wash absolute -bottom-32 left-1/2 h-72 w-[120vw] -translate-x-1/2 rounded-full [--ember-a1:0.3]"
            />
            {/* La firma manuscrita del logo, igual que la marca de agua del pie. */}
            <span aria-hidden className="font-script pointer-events-none absolute right-[-18%] top-[6%] select-none whitespace-nowrap text-[52vw] font-normal leading-[0.8] text-cream/[0.05]">
              Tixola
            </span>

            <div className="container-page relative flex min-h-full flex-col pt-[calc(var(--header-h)+1.5rem)] pb-[calc(var(--mobile-bar-h)+env(safe-area-inset-bottom)+1.5rem)]">
              <motion.p variants={itemVariants} className="font-caps text-[10px] uppercase tracking-[0.35em] text-pimenton-a11y">
                {m.nav.kicker}
              </motion.p>

              <ul className="mt-5 flex flex-col">
                {navItems.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <motion.li key={item.key} variants={itemVariants} className="border-b border-cream/10">
                      <Link
                        href={lp(item.href)}
                        onClick={closeMenu}
                        aria-current={ariaCurrentFor(item.href, active)}
                        className="group flex items-center justify-between gap-4 py-4"
                      >
                        {/* Sin el "01 / 02 / 03" que llevaba delante: en un menú de cuatro entradas la
                            numeración no ordenaba nada que no dijera ya el propio orden de la lista, y le
                            robaba sitio al nombre, que es lo único que se viene a leer aquí. */}
                        <span
                          className={cn(
                            "font-display text-4xl leading-none tracking-[-0.01em] transition-colors sm:text-5xl",
                            active ? "text-gradient-ember italic" : "text-cream group-hover:text-cream-200",
                          )}
                        >
                          {item.label}
                        </span>
                        <ArrowUpRight
                          className="h-6 w-6 shrink-0 text-cream-faint transition-[translate,color] duration-200 ease-[var(--ease-out-expo)] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-pimenton-light"
                          aria-hidden
                        />
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>

              {/* Idioma: fila de 4 chips */}
              <motion.div variants={itemVariants} className="mt-6">
                <LanguageSwitcher variant="chips" onSelect={closeMenu} />
              </motion.div>

              <motion.div variants={itemVariants} className="mt-6 flex flex-col gap-3">
                <NeonButton size="lg" pulse href={lp("/carta")} onClick={closeMenu} className="w-full">
                  {m.common.cta.menu}
                </NeonButton>
                {/* `CallLabel`: en un teléfono de 320 px el botón a ancho completo no tiene sitio para
                    "Llamar al 646 45 72 74" en una línea, y sin el envoltorio el salto caía en medio del
                    número. Con él, si hay que partir, se parte antes del número. */}
                <NeonButton size="md" variant="outline" href={BUSINESS.phone.tel} icon={<Phone aria-hidden />} className="w-full">
                  <CallLabel template={m.common.cta.callNumber} phone={BUSINESS.phone.display} />
                </NeonButton>
              </motion.div>

              <motion.address variants={itemVariants} className="mt-auto flex items-start gap-3 pt-10 text-sm not-italic text-cream-muted">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-pimenton-light" aria-hidden />
                <span>
                  {BUSINESS.address.full}
                  <br />
                  {/* Equivalente localizado de BUSINESS.address.landmark (que está solo en español). */}
                  <span className="text-cream-faint">{m.experience.map.subtitle}</span>
                </span>
              </motion.address>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
