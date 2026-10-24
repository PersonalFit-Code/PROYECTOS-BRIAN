import { MENU, type StyleId } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import RadioCards from "@/components/builder/RadioCards";
import TacoPreview from "@/components/common/TacoPreview";

export default function StepStyle({ value, onChange }: { value: StyleId; onChange: (v: StyleId) => void }) {
  return (
    <RadioCards
      label="Estilo del taco"
      value={value}
      onChange={onChange}
      big
      options={MENU.tacoStyles.map((s) => ({
        value: s.id,
        title: s.name,
        description: s.description,
        art: <TacoPreview style={s.id} size="L" meats={["pollo", "picada"]} className="h-36 w-full" />,
        aside: <span className="mr-8 shrink-0 text-sm font-bold text-fg-muted">desde {formatPrice(s.prices.M)}</span>,
      }))}
    />
  );
}
