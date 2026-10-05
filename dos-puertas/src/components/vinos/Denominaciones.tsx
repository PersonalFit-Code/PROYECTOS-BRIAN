"use client";

import { useRef } from "react";
import { MapPin } from "lucide-react";
import { useMessages } from "@/i18n/LocaleProvider";
import { useReveal } from "@/hooks/useReveal";
import { DENOMINACIONES } from "@/data/denominaciones";

function Uvas({ label, uvas, tone }: { label: string; uvas: readonly string[]; tone: "blanca" | "tinta" }) {
  if (!uvas.length) return null;
  return (
    <div className="mt-3">
      <p className="flex items-center gap-2 text-[11px] font-medium tracking-wide text-cream-faint uppercase">
        <span aria-hidden className={tone === "blanca" ? "size-2 rounded-full bg-oro-light" : "size-2 rounded-full bg-[#9c2a3c] ring-1 ring-[#e0667a]/50"} />
        {label}
      </p>
      <ul className="mt-1.5 flex flex-wrap gap-1.5">
        {uvas.map((u) => (
          <li key={u} className="rounded-full bg-cream/[0.06] px-2.5 py-1 text-[12px] text-cream/85 ring-1 ring-cream/10">
            {u}
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Las cinco denominaciones gallegas, como tarjetas. Las de Ourense llevan su distintivo. */
export default function Denominaciones() {
  const m = useMessages();
  const t = m.vinos;
  const ref = useRef<HTMLUListElement>(null);
  useReveal(ref, 70);
  return (
    <ul ref={ref} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {DENOMINACIONES.map((d) => {
        const it = t.items[d.id];
        return (
          <li key={d.id} data-reveal className="capa flex flex-col rounded-3xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-[28px] leading-tight font-medium">{it.name}</h3>
              {d.ourense ? (
                <span className="mt-1.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-oro/12 px-2.5 py-1 font-caps text-[9px] font-semibold tracking-[0.2em] text-oro-a11y uppercase ring-1 ring-oro/30">
                  <MapPin aria-hidden className="size-3" />
                  {t.ourenseBadge}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-[13px] text-cream-faint">{it.zone}</p>
            <p className="mt-3 text-[14px] leading-relaxed text-cream-muted">{it.text}</p>
            <div className="mt-auto pt-2">
              <Uvas label={t.whites} uvas={d.blancas} tone="blanca" />
              <Uvas label={t.reds} uvas={d.tintas} tone="tinta" />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
