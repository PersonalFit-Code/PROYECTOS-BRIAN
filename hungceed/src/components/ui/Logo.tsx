import { cn } from "@/lib/utils";

/**
 * Logotipo provisional: «HUNGCEED» en Poppins muy gruesa con la flecha de la marca. Hoy su web usa
 * una captura de pantalla como logo; en cuanto Jose pase el vectorial (SVG), se cambia aquí y nada más.
 */
export default function Logo({ className, claro = true }: { className?: string; claro?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg aria-hidden viewBox="0 0 24 24" className="size-[1.15em] shrink-0 text-rojo" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="square">
        <path d="M5 19 19 5M9 5h10v10" />
      </svg>
      <span className={cn("font-sans font-extrabold tracking-[0.06em] uppercase", claro ? "text-white" : "text-negro")}>Hungceed</span>
    </span>
  );
}
