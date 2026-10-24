import { MENU, getStyle, type SizeId, type StyleId } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import RadioCards from "@/components/builder/RadioCards";

export default function StepSize({ style, value, onChange }: { style: StyleId; value: SizeId; onChange: (v: SizeId) => void }) {
  const prices = getStyle(style).prices;
  return (
    <RadioCards
      label="Tamaño del taco"
      value={value}
      onChange={onChange}
      columns="sm:grid-cols-3"
      options={MENU.tacoSizes.map((s) => ({
        value: s.id,
        title: s.id,
        description: `${s.meats} ${s.meats === 1 ? "carne" : "carnes"} · ${s.description}`,
        aside: <span className="mr-8 shrink-0 rounded-full bg-gold px-3 py-1 text-sm font-bold text-ink">{formatPrice(prices[s.id])}</span>,
      }))}
    />
  );
}
