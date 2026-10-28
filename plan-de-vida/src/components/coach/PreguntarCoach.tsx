import Link from "next/link";
import { Sparkles } from "lucide-react";
import { cx } from "@/lib/formato";

/** Atajo al coach: abre el chat y le manda la pregunta ya escrita. `children` es el texto del botón. */
export function PreguntarCoach({ pregunta, children, className }: { pregunta: string; children: React.ReactNode; className?: string }) {
  return (
    <Link
      href={`/coach?pregunta=${encodeURIComponent(pregunta)}`}
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-500/15 to-sky-500/15 px-3 py-1.5 text-sm font-medium text-accent ring-1 ring-accent/25 transition hover:from-violet-500/25 hover:to-sky-500/25 active:scale-[0.97]",
        className,
      )}
    >
      <Sparkles className="size-4 shrink-0" />
      <span>{children}</span>
    </Link>
  );
}
