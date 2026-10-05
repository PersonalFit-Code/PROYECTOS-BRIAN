"use client";

import { motion } from "framer-motion";
import PinchoArt from "./PinchoArt";
import Sheet from "./Sheet";
import { useMessages } from "@/i18n/LocaleProvider";
import type { Pincho } from "@/data/menu";

/**
 * Ficha de un pincho, con la ilustración viajando desde la tarjeta (`layoutId`). `layoutPrefix`
 * separa las tarjetas de la portada de las de la sección de la barra, que conviven en la página.
 */
export default function PinchoSheet({
  pincho,
  onClose,
  layoutPrefix = "art",
}: {
  pincho: Pincho | null;
  onClose: () => void;
  layoutPrefix?: string;
}) {
  const m = useMessages();
  const item = pincho ? m.barra.items[pincho.id] : null;
  return (
    <Sheet open={!!pincho} onClose={onClose} labelledBy="pincho-title">
      {pincho && item ? (
        <>
          <motion.div layoutId={`${layoutPrefix}-${pincho.id}`} className="mx-auto w-44 sm:w-52">
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
        </>
      ) : null}
    </Sheet>
  );
}
