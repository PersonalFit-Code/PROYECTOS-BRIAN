import { MENU, getStyle } from "@/data/menu";
import type { TacoDraft } from "@/lib/price";
import { cn } from "@/lib/format";
import PhotoSlot from "@/components/common/PhotoSlot";
import Sticker from "@/components/common/Sticker";

/**
 * Vista del taco en el configurador: la foto del estilo elegido y, encima, lo elegido en pegatinas
 * (tamaño, carnes, salsas con su color y gratinados). Cada pegatina entra con @starting-style.
 */
export default function TacoVisual({ draft, className }: { draft: TacoDraft; className?: string }) {
  const meats = draft.meats.map((id) => MENU.meats.find((m) => m.id === id)).filter((m) => m !== undefined);
  const sauces = draft.sauces.map((id) => MENU.sauces.find((s) => s.id === id)).filter((s) => s !== undefined);
  const extras = draft.extras.map((id) => MENU.extras.find((e) => e.id === id)).filter((e) => e !== undefined);
  const style = getStyle(draft.style);
  return (
    <div className={cn("relative", className)}>
      <PhotoSlot
        slot={draft.style === "rebozado" ? "taco-rebozado" : "taco-clasico"}
        className="aspect-[4/3] w-full rounded-2xl"
        sizes="(min-width: 1024px) 30vw, 90vw"
        label={`Taco ${draft.size} ${style.name}`}
      />
      <Sticker tone="gold" rotate={-6} className="enter-up absolute -left-2 -top-3 text-3xl">
        {draft.size}
      </Sticker>
      {draft.style === "rebozado" && (
        <Sticker tone="ink" rotate={5} className="enter-up absolute -right-2 -top-3 text-base">
          Rebozado
        </Sticker>
      )}
      <ul className="absolute inset-x-2 bottom-2 flex flex-wrap gap-1.5" aria-label="Lo que lleva">
        {meats.map((m) => (
          <li key={m.id} className="enter-up rounded-full bg-ink/85 px-2.5 py-1 text-xs font-semibold text-snow">
            {m.name}
          </li>
        ))}
        {sauces.map((s) => (
          <li key={s.id} className="enter-up inline-flex items-center gap-1.5 rounded-full bg-ink/85 px-2.5 py-1 text-xs font-semibold text-snow">
            <span aria-hidden className="h-2.5 w-2.5 rounded-full ring-1 ring-white/50" style={{ background: s.color }} />
            {s.name}
          </li>
        ))}
        {extras.map((e) => (
          <li key={e.id} className="enter-up rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-ink">
            + {e.name}
          </li>
        ))}
      </ul>
    </div>
  );
}
