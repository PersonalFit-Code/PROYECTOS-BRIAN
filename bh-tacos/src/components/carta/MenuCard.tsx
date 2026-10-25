import Link from "next/link";
import type { MenuItem } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import Sticker from "@/components/common/Sticker";

export default function MenuCard({ item }: { item: MenuItem }) {
  const href = item.builder ? `/monta-tu-taco?estilo=${item.builder.style}&tamano=${item.builder.size}` : null;
  return (
    <article className="card lift press flex h-full flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-2xl uppercase leading-tight">{item.name}</h3>
        <Sticker rotate={3} className="shrink-0 text-lg">
          {formatPrice(item.price)}
        </Sticker>
      </div>
      <p className="mt-3 flex-1 text-fg-muted">{item.description}</p>
      {href && (
        <Link href={href} className="press btn btn-primary mt-5" aria-label={`Personalizar ${item.name}`}>
          Personalizar
        </Link>
      )}
    </article>
  );
}
