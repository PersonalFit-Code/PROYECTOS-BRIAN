"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";
import { cn } from "@/lib/cn";
import { NAV_ITEMS, isActive } from "./navItems";

/** Dock flotante de móvil: las cuatro secciones al alcance del pulgar. */
export default function Dock() {
  const m = useMessages();
  const lp = useLocalePath();
  const pathname = usePathname();

  return (
    <nav
      id="dock"
      aria-label={m.nav.dockLabel}
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(12px,env(safe-area-inset-bottom))] md:hidden"
    >
      <ul className="liquid-glass liquid-glass-strong cristal-ancho mx-auto grid h-[var(--dock-h)] max-w-md grid-cols-4 rounded-full p-1.5">
        {NAV_ITEMS.map(({ key, path, icon: Icon }) => {
          const active = isActive(pathname, path);
          return (
            <li key={key} className="flex">
              <Link
                href={lp(path)}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "pulsable flex flex-1 flex-col items-center justify-center gap-0.5 rounded-full text-[11px] font-medium",
                  active ? "bg-oro text-tinta" : "text-cream-muted",
                )}
              >
                <Icon aria-hidden className="size-[19px]" strokeWidth={active ? 2.2 : 1.8} />
                {m.nav[key]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
