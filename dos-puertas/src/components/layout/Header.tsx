"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Phone } from "lucide-react";
import Wordmark from "@/components/ui/Wordmark";
import StatusPill from "@/components/ui/StatusPill";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { BUSINESS } from "@/data/business";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isActive } from "./navItems";

/** Cápsula de cristal flotante. En móvil: marca + estado + llamar (la navegación va en el dock). */
export default function Header() {
  const m = useMessages();
  const lp = useLocalePath();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-2.5 pt-[max(10px,env(safe-area-inset-top))] sm:px-5 sm:pt-4">
      <div
        className={cn(
          "pointer-events-auto mx-auto flex h-[60px] max-w-6xl items-center justify-between gap-3 rounded-full pr-2 pl-5 transition-[background-color,border-color,box-shadow] duration-500",
          scrolled ? "liquid-glass liquid-glass-strong cristal-ancho" : "border border-transparent",
        )}
      >
        <Link href={lp("/")} aria-label={`${BUSINESS.legalName} · ${m.nav.home}`} className="pulsable shrink-0 rounded-md">
          <Wordmark size="sm" />
        </Link>

        <nav aria-label={m.nav.mainLabel} className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActive(pathname, item.path);
            return (
              <Link
                key={item.key}
                href={lp(item.path)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "pulsable rounded-full px-4 py-2.5 text-sm font-medium",
                  active ? "bg-cream/10 text-cream" : "text-cream-muted hover:text-cream",
                )}
              >
                {m.nav[item.key]}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden pr-2 sm:block">
            <StatusPill compact />
          </span>
          <a
            href={`tel:${BUSINESS.phone.e164}`}
            className="pulsable inline-flex size-11 items-center justify-center gap-2 rounded-full bg-oro text-sm font-semibold text-tinta hover:bg-oro-light sm:w-auto sm:px-5"
          >
            <Phone aria-hidden className="size-[18px]" />
            <span className="sr-only sm:not-sr-only">{m.common.call}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
