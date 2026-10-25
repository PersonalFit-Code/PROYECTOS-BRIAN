import { MENU, type StyleId } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import RadioCards from "@/components/builder/RadioCards";
import PhotoSlot from "@/components/common/PhotoSlot";

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
        art: <PhotoSlot slot={s.id === "rebozado" ? "taco-rebozado" : "taco-clasico"} className="aspect-[16/9] w-full rounded-xl" sizes="(min-width: 640px) 30vw, 90vw" label={s.name} />,
        aside: <span className="mr-8 shrink-0 text-sm font-bold text-fg-muted">desde {formatPrice(s.prices.M)}</span>,
      }))}
    />
  );
}
