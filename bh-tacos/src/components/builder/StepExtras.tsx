import { MENU } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import ChoiceChip from "@/components/builder/ChoiceChip";

export default function StepExtras({ selected, onToggle }: { selected: string[]; onToggle: (id: string) => void }) {
  return (
    <fieldset>
      <legend className="mb-5 text-fg-muted">Gratinados y toppings por encima, al gusto. Opcionales.</legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {MENU.extras.map((e) => (
          <ChoiceChip
            key={e.id}
            role="switch"
            label={e.name}
            checked={selected.includes(e.id)}
            blocked={false}
            blockedText=""
            aside={<span className="font-bold">+{formatPrice(e.price)}</span>}
            onToggle={() => onToggle(e.id)}
          />
        ))}
      </div>
    </fieldset>
  );
}
