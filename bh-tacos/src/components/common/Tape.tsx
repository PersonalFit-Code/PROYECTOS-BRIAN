import { cn } from "@/lib/format";

/** Trozo de cinta adhesiva para pegar «polaroids» en la página. Decorativo. */
export default function Tape({ className }: { className?: string }) {
  return <span aria-hidden className={cn("tape pointer-events-none absolute z-10 h-7 w-24", className)} />;
}
