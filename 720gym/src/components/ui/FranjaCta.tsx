import Link from "next/link";
import { ArrowRight } from "lucide-react";
import IconoWhatsApp from "@/components/ui/IconoWhatsApp";
import { wa } from "@/data/negocio";
import { cn } from "@/lib/utils";

/**
 * Franja corta de acción entre apartados: una frase y dos salidas (inscribirse y WhatsApp).
 * Sale varias veces por la web con frases distintas para que siempre haya una puerta abierta.
 */
export default function FranjaCta({
  frase,
  detalle,
  boton = "Inscríbete",
  href = "/alta",
  mensaje = "Hola, quiero apuntarme a 720 GYM CLUB. ¿Me dais información?",
  clara = false,
}: {
  frase: string;
  detalle?: string;
  boton?: string;
  href?: string;
  mensaje?: string;
  clara?: boolean;
}) {
  return (
    <aside className={cn("relative overflow-hidden", clara ? "bg-pared text-negro" : "bg-negro text-white")} aria-label="Apúntate">
      <div className="franja-brillo pointer-events-none absolute inset-0" aria-hidden />
      <div className="container-page relative flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between sm:py-7">
        <div data-reveal>
          <p className="subtitular text-[19px] sm:text-[21px]">{frase}</p>
          {detalle && <p className={cn("mt-0.5 text-[13.5px]", clara ? "text-negro/60" : "text-white/60")}>{detalle}</p>}
        </div>
        <div data-reveal className="grid grid-cols-[1fr_auto] gap-2 sm:flex sm:shrink-0">
          <Link href={href} className="boton-venta subtitular inline-flex h-12 items-center justify-center gap-2 px-6 text-[15px]">
            {boton}
          </Link>
          <a
            href={wa(mensaje)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Escríbenos por WhatsApp"
            className="group inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#25d366] px-4 text-[14px] font-semibold text-white transition hover:scale-[1.03] active:scale-95"
          >
            <IconoWhatsApp className="size-5 transition group-hover:rotate-[-10deg]" />
            <span className="hidden sm:inline">WhatsApp</span>
            <ArrowRight className="hidden size-4 transition group-hover:translate-x-0.5 sm:block" aria-hidden />
          </a>
        </div>
      </div>
    </aside>
  );
}
