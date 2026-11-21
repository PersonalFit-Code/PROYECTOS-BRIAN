import { AtSign, ChevronRight, Globe, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import { EtiquetaEstado } from "@/components/ui";
import { enlaceSeguro, telefonoBonito, webCorta } from "@/lib/formato";
import { SECTOR_TXT, type Negocio } from "@/lib/tipos";

export type NegocioConDolor = Negocio & { diagnosticos: { dolor: string }[] };

/** Fila de un negocio: lo justo para decidir a quién llamar y entrar en su ficha. */
export function TarjetaNegocio({ n }: { n: NegocioConDolor }) {
  const web = enlaceSeguro(n.web);
  const ig = enlaceSeguro(n.instagram);
  const dolor = n.diagnosticos[0]?.dolor ?? n.notas;
  return (
    <li className="rounded-2xl border border-line bg-bg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/negocios/${n.id}`} className="group inline-flex items-center gap-1 font-[family-name:var(--font-titulo)] text-base font-bold hover:text-brand">
            <span className="break-words">{n.nombre}</span>
            <ChevronRight className="size-4 shrink-0 text-muted group-hover:text-brand" aria-hidden />
          </Link>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-muted">
            <span>{n.subsector ?? SECTOR_TXT[n.sector]}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden />
              {[n.localidad, n.provincia].filter(Boolean).join(", ") || n.comunidad}
            </span>
          </p>
        </div>
        <EtiquetaEstado estado={n.estado} />
      </div>
      {dolor && <p className="mt-2 text-sm">{dolor}</p>}
      <div className="mt-3 flex flex-wrap gap-2 text-sm font-bold">
        {n.telefono && (
          <a href={`tel:+34${n.telefono}`} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-soft px-3 text-brand hover:brightness-95">
            <Phone className="size-4" aria-hidden />
            {telefonoBonito(n.telefono)}
          </a>
        )}
        {web && (
          <a href={web} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-3 hover:bg-soft">
            <Globe className="size-4" aria-hidden />
            <span className="max-w-40 truncate">{webCorta(web)}</span>
          </a>
        )}
        {ig && (
          <a href={ig} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-line px-3 hover:bg-soft">
            <AtSign className="size-4" aria-hidden />
            Instagram
          </a>
        )}
      </div>
    </li>
  );
}
