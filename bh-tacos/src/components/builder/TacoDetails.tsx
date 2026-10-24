import { MENU, getStyle } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import { basePrice, type TacoDraft } from "@/lib/price";

const names = (ids: string[], list: { id: string; name: string }[]) => ids.map((id) => list.find((x) => x.id === id)?.name ?? id);

/** Lista de lo elegido, con el desglose de precio. */
export default function TacoDetails({ draft }: { draft: TacoDraft }) {
  const rows: [string, string][] = [
    ["Estilo", getStyle(draft.style).name],
    ["Tamaño", draft.size],
    ["Carnes", names(draft.meats, MENU.meats).join(" + ") || "Sin elegir"],
    ["Salsas", names(draft.sauces, MENU.sauces).join(" + ") || "Sin salsa"],
    ["Extras", names(draft.extras, MENU.extras).join(" + ") || "Ninguno"],
  ];
  return (
    <div>
      <dl className="divide-y divide-line text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 py-2">
            <dt className="text-fg-muted">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <dl className="mt-3 space-y-1 rounded-xl bg-surface-2 p-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-fg-muted">Base ({getStyle(draft.style).name} {draft.size})</dt>
          <dd>{formatPrice(basePrice(draft))}</dd>
        </div>
        {draft.extras.map((id) => {
          const e = MENU.extras.find((x) => x.id === id);
          return e ? (
            <div key={id} className="flex justify-between">
              <dt className="text-fg-muted">{e.name}</dt>
              <dd>+{formatPrice(e.price)}</dd>
            </div>
          ) : null;
        })}
        <div className="flex justify-between text-fg-muted">
          <dt>Carnes y salsas</dt>
          <dd>incluidas</dd>
        </div>
      </dl>
    </div>
  );
}
