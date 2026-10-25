import { cn } from "@/lib/format";

interface Props {
  kicker?: string;
  title: string;
  text?: string;
  id?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  /** Trozo del título que va en cinta roja (debe aparecer tal cual en `title`). */
  highlight?: string;
}

function withRibbon(title: string, highlight?: string) {
  const i = highlight ? title.indexOf(highlight) : -1;
  if (!highlight || i < 0) return title;
  return (
    <>
      {title.slice(0, i)}
      <span className="ribbon">{highlight}</span>
      {title.slice(i + highlight.length)}
    </>
  );
}

export default function SectionHeading({ kicker, title, text, id, align = "left", as: Tag = "h2", highlight }: Props) {
  return (
    <div className={cn("reveal max-w-3xl", align === "center" && "mx-auto text-center")}>
      {kicker && <p className="kicker mb-3 text-sm">{kicker}</p>}
      <Tag id={id} className="font-display text-4xl uppercase leading-[0.95] tracking-tight text-balance sm:text-5xl lg:text-6xl">
        {withRibbon(title, highlight)}
      </Tag>
      {text && <p className="mt-5 text-lg leading-relaxed text-fg-muted text-pretty">{text}</p>}
    </div>
  );
}
