import { MENU } from "@/data/menu";
import ChoiceChip from "@/components/builder/ChoiceChip";

interface Props {
  selected: string[];
  limit: number;
  onToggle: (id: string) => void;
}

export default function StepMeats({ selected, limit, onToggle }: Props) {
  const full = selected.length >= limit;
  return (
    <fieldset>
      <legend className="sr-only">Carnes</legend>
      <p aria-live="polite" className="mb-5 inline-flex rounded-full bg-surface-2 px-4 py-2 font-semibold">
        Elige {limit} {limit === 1 ? "carne" : "carnes"}:{" "}
        <span className={full ? "ml-1 text-brand-text" : "ml-1"}>
          {selected.length}/{limit}
        </span>
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {MENU.meats.map((m) => {
          const checked = selected.includes(m.id);
          return (
            <ChoiceChip
              key={m.id}
              label={m.name}
              swatch={m.color}
              checked={checked}
              blocked={full && !checked}
              blockedText="Has alcanzado el máximo"
              onToggle={() => onToggle(m.id)}
            />
          );
        })}
      </div>
    </fieldset>
  );
}
