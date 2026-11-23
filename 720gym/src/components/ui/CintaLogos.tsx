import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import SelloConcepto from "./SelloConcepto";
import { conceptos } from "@/data/conceptos";
import { cn } from "@/lib/utils";

/**
 * «El universo 720»: las marcas propias y los clubes que entrenan en 720, cada uno con su logo
 * real (los que pasó Brais) y enlace a su ficha. Sale de los datos de las fichas, así que no hay
 * que mantenerlo aparte.
 */
const propias = conceptos.filter((c) => !c.club);
const clubes = conceptos.filter((c) => c.club);

function Tarjeta({ href, logo, nombre, marca, texto }: { href: string; logo?: string; nombre: string; marca: string; texto: string }) {
  return (
    <Link href={href} className="tarjeta-vidrio group flex h-full items-center gap-4 rounded-2xl p-4">
      <SelloConcepto logo={logo} nombre={nombre} className="size-16 rounded-2xl transition-transform duration-500 group-hover:scale-105" />
      <span className="min-w-0 flex-1">
        <span className="etiqueta sin-punto block !text-[9.5px] text-white/50">{marca}</span>
        <span className="subtitular mt-1 block text-[17px] leading-tight">{nombre}</span>
        <span className="mt-1 block truncate text-[12px] text-white/55">{texto}</span>
      </span>
      <ArrowUpRight className="size-4 shrink-0 text-white/35 transition-[transform,color] group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white" aria-hidden />
    </Link>
  );
}

export default function CintaLogos({ className }: { className?: string; tono?: "claro" | "oscuro" }) {
  return (
    <section aria-labelledby="titulo-universo" className={cn("relative overflow-hidden bg-negro py-16 text-white sm:py-20", className)}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(45%_60%_at_20%_30%,rgb(255_255_255/0.07),transparent_70%),radial-gradient(40%_60%_at_85%_80%,rgb(255_255_255/0.06),transparent_70%)]" aria-hidden />
      <div className="container-page relative">
        <p className="etiqueta text-white/45">Profesionales y clubes especializados</p>
        <h2 id="titulo-universo" className="titular mt-3 text-titulo-3">
          Todo forma parte de <span className="texto-logo">720</span>
        </h2>

        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {propias.map((c) => (
            <li key={c.slug}>
              <Tarjeta href={c.href} logo={c.logo} nombre={c.nombre} marca={c.marca} texto={c.chips.join(" · ")} />
            </li>
          ))}
        </ul>

        <p className="etiqueta mt-10 text-white/45">Clubes que entrenan en 720</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {clubes.map((c) => (
            <li key={c.slug}>
              <Tarjeta href={c.href} logo={c.logo} nombre={c.club!.nombre} marca={c.titulo} texto={c.chips.join(" · ")} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
