import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Catalogo from "@/components/tienda/Catalogo";
import { CATEGORIAS, SERIES, categoriaPorSlug, productosDe, type Serie } from "@/data/catalogo";
import { cn } from "@/lib/utils";

export function generateStaticParams() {
  return CATEGORIAS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = categoriaPorSlug((await params).slug);
  return { title: c?.nombre ?? "Categoría" };
}

export default async function PaginaCategoria({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ [k: string]: string | string[] | undefined }> }) {
  const { slug } = await params;
  const categoria = categoriaPorSlug(slug);
  if (!categoria) notFound();
  const sp = await searchParams;
  const serie = typeof sp.serie === "string" && sp.serie in SERIES ? (sp.serie as Serie) : undefined;

  return (
    <>
      <section className="bg-negro pt-[var(--header-h)] text-white">
        <div className="container-page py-12 sm:py-16">
          <nav aria-label="Estás aquí" className="text-[12px] text-gris-claro">
            <Link href="/" className="hover:text-white">
              Inicio
            </Link>{" "}
            / <span className="text-white">{categoria.nombre}</span>
          </nav>
          <h1 className="titular mt-4 text-4xl sm:text-6xl">{categoria.nombre}</h1>
          <p className="mt-4 max-w-2xl text-white/75">{categoria.descripcion}</p>
        </div>
        {/* Saltar entre categorías sin volver al menú. */}
        <div className="border-t border-white/10">
          <ul className="container-page no-scrollbar flex gap-6 overflow-x-auto">
            {CATEGORIAS.map((c) => (
              <li key={c.slug} className="shrink-0">
                <Link
                  href={`/categoria/${c.slug}`}
                  aria-current={c.slug === slug ? "page" : undefined}
                  className={cn(
                    "inline-flex h-12 items-center border-b-[3px] text-[12px] font-semibold tracking-[0.12em] uppercase transition-colors",
                    c.slug === slug ? "border-rojo text-white" : "border-transparent text-white/60 hover:text-white",
                  )}
                >
                  {c.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="container-page py-10 sm:py-14">
        <Catalogo key={serie ?? "todas"} productos={productosDe(categoria.slug)} serieInicial={serie} />
      </section>
    </>
  );
}
