import { formatPrice } from "@/lib/format";
import { totalPrice, type TacoDraft } from "@/lib/price";
import OrderActions from "@/components/builder/OrderActions";
import TacoDetails from "@/components/builder/TacoDetails";
import TacoVisual from "@/components/builder/TacoVisual";

export default function StepSummary({ draft, onRestart }: { draft: TacoDraft; onRestart: () => void }) {
  return (
    <div>
      <TacoVisual draft={draft} className="mb-6 lg:hidden" />
      <div>
        <TacoDetails draft={draft} />
      </div>
      <p className="mt-6 flex items-baseline justify-between border-t border-line pt-4">
        <span className="font-semibold">Total estimado</span>
        <span className="font-display text-5xl text-brand-text">{formatPrice(totalPrice(draft))}</span>
      </p>
      <div className="mt-6">
        <OrderActions draft={draft} />
      </div>
      <button type="button" onClick={onRestart} className="press mt-4 text-sm font-semibold text-fg-muted underline underline-offset-4 hover:text-fg">
        Empezar de nuevo
      </button>
    </div>
  );
}
