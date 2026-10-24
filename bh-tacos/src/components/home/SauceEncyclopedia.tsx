import { HOME } from "@/content";
import { MENU, type Sauce } from "@/data/menu";
import SectionHeading from "@/components/common/SectionHeading";
import SpiceMeter from "@/components/common/SpiceMeter";

/* Las clásicas (mayonesa, ketchup, barbacoa) van juntas en una sola tarjeta, como en la carta. */
function groupSauces(sauces: Sauce[]) {
  const cards: { key: string; name: string; sauce: Sauce; colors: string[] }[] = [];
  for (const s of sauces) {
    const existing = s.group ? cards.find((c) => c.key === s.group) : undefined;
    if (existing) {
      existing.name += ` / ${s.name}`;
      existing.colors.push(s.color);
    } else {
      cards.push({ key: s.group ?? s.id, name: s.group ? `${s.group} (${s.name}` : s.name, sauce: s, colors: [s.color] });
    }
  }
  return cards.map((c) => (c.sauce.group ? { ...c, name: `${c.name})` } : c));
}

export default function SauceEncyclopedia() {
  return (
    <section aria-labelledby="sauces-title" className="bg-bg-alt py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeading id="sauces-title" kicker="Salsas" title={HOME.sauces.title} text={HOME.sauces.intro} />
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {groupSauces(MENU.sauces).map((c, i) => (
            <li key={c.key} className="reveal" style={{ ["--i" as string]: i }}>
              <article className="card lift press flex h-full flex-col overflow-hidden">
                <div className="relative h-24 overflow-hidden" aria-hidden>
                  {c.colors.map((color, k) => (
                    <div key={color} className="absolute inset-y-0" style={{ left: `${(k / c.colors.length) * 100}%`, width: `${100 / c.colors.length}%`, background: color }} />
                  ))}
                  <svg viewBox="0 0 200 30" preserveAspectRatio="none" className="absolute -bottom-px h-8 w-full fill-surface">
                    <path d="M0 30V12c20 10 30-8 50 0s30 14 50 2 30-12 50 0 30 10 50 0v16z" />
                  </svg>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-2xl uppercase leading-tight">{c.name}</h3>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <SpiceMeter level={c.sauce.spice} />
                    <span className="font-semibold text-fg-muted">· {c.sauce.profile}</span>
                  </div>
                  <p className="mt-3 text-fg-muted">{c.sauce.origin}</p>
                  <p className="mt-auto pt-4 text-sm font-semibold text-brand-text">{c.sauce.pairing}</p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
