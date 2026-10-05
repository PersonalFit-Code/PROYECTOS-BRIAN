import { cn } from "@/lib/cn";

/** Marca: «CAFÉ · BAR» en versalitas sobre «DOS PUERTAS» con la letra del rótulo. */
export default function Wordmark({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className={cn("font-caps tracking-[0.32em] text-oro-a11y", size === "lg" ? "text-xs" : "text-[9px]")}>CAFÉ · BAR</span>
      <span
        className={cn(
          "font-rotulo text-gradient-marca uppercase",
          size === "sm" && "text-[22px]",
          size === "md" && "text-[26px]",
          size === "lg" && "text-5xl",
        )}
      >
        Dos Puertas
      </span>
    </span>
  );
}
