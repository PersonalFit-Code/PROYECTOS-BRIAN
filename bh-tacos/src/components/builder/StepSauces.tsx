import { MENU } from "@/data/menu";
import ChoiceChip from "@/components/builder/ChoiceChip";
import SpiceMeter from "@/components/common/SpiceMeter";

export default function StepSauces({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  const max = MENU.maxFreeSauces;
  const full = selected.length >= max;
  return (
    <fieldset>
      <legend className="sr-only">Salsas</legend>
      <p aria-live="polite" className="mb-5 inline-flex flex-wrap gap-1 rounded-full bg-surface-2 px-4 py-2 font-semibold">
        Hasta {max} salsas sin coste:{" "}
        <span className={full ? "text-brand-text" : ""}>
          {selected.length}/{max}
        </span>
        {full && <span className="text-fg-muted">· quita una para cambiarla</span>}
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {MENU.sauces.map((s) => {
          const checked = selected.includes(s.id);
          return (
            <ChoiceChip
              key={s.id}
              label={s.name}
              swatch={s.color}
              checked={checked}
              blocked={full && !checked}
              blockedText={`Máximo ${max} salsas. Quita una para elegir otra.`}
              hint={`${s.profile}. ${s.origin} ${s.pairing}`}
              aside={<SpiceMeter level={s.spice} />}
              onToggle={() => onToggle(s.id)}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
