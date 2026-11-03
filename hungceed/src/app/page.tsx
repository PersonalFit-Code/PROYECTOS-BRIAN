import Link from "next/link";
import { ArrowRight, Building2, House, MessageCircle } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Foto from "@/components/ui/Foto";
import Revelar from "@/components/ui/Revelar";
import Garantias from "@/components/tienda/Garantias";
import Marquesina from "@/components/tienda/Marquesina";
import Opiniones from "@/components/tienda/Opiniones";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { CATEGORIAS, PRODUCTOS, SERIES, precioTexto, productoPorSlug, type Serie } from "@/data/catalogo";
import { GYM, TARIFAS } from "@/data/gym";
import { CONFIANZA, NEGOCIO, VENTAJAS } from "@/data/negocio";

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

/**
 * Portada: UN mensaje y el producto estrella al lado, dos entradas (casa / centro), y debajo el
 * catálogo ordenado: categorías, series, el sistema Attachment, lo más elegido, por qué Hungceed,
 * confianza, opiniones (solo con reseñas reales), garantías y el gimnasio.
 */
export default function Portada() {
  const rack = productoPorSlug("jaula-potencia-polea")!;
  /* Solo productos con precio publicado: el bloque que vende no puede decir «consultar». */
  const destacados = PRODUCTOS.filter((p) => p.destacado && p.precio).slice(0, 6);
  const accesorios = ["elevacion-lateral-rack", "extension-cuadriceps-rack", "asiento-hip-thrust", "multipower-smith", "doble-gancho-barra", "enganche-polea-suspension"].map((s) => productoPorSlug(s)!);
  const ordenSeries: Serie[] = ["elite", "pro", "prelude", "attachment"];
  const enlaceSerie = (s: Serie) => (s === "attachment" ? "/categoria/attachment" : `/categoria/maquinas?serie=${s}`);
  const desde = (grupo: string) => Math.min(...TARIFAS.find((g) => g.id === grupo)!.tarifas.map((t) => t.precio));
  const tarifasGym = [
    { titulo: "Musculación", precio: desde("musculacion"), unidad: "al mes", texto: "Acceso libre a la sala." },
    { titulo: "Funcional", precio: desde("funcional"), unidad: "al mes", texto: "Clases en grupo, 4 o 12 sesiones." },
    { titulo: "Entrenador personal", precio: desde("personal"), unidad: "la sesión", texto: "Sesiones 1:1 con plan propio." },
  ];

  return (
    <>
      {/* Portada */}
      <section className="relative isolate overflow-hidden bg-negro pt-[var(--header-h)] text-white">
        <div className="absolute inset-0 -z-10">
          <Foto src={GYM.fotos.portada} alt="" prioridad className="opacity-55 motion-safe:animate-[zoom-lento_12s_var(--ease-out-expo)_both]" />
          <div className="absolute inset-0 bg-gradient-to-r from-negro via-negro/75 to-negro/30" />
        </div>
        <div className="container-page grid items-center gap-10 py-16 lg:min-h-[78svh] lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-20">
          <div>
            <p className="hero-in etiqueta text-rojo" style={{ ["--i" as string]: 0 }}>
              Equipamiento de gimnasio · Marca propia
            </p>
            <h1 className="hero-in titular mt-5 text-[clamp(2.5rem,7vw,5.4rem)] text-balance" style={{ ["--i" as string]: 1 }}>
              Equipa tu gimnasio. <span className="text-rojo">En casa o en el box.</span>
            </h1>
            <p className="hero-in mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg" style={{ ["--i" as string]: 2 }}>
              Racks, máquinas, pesas y accesorios diseñados para encajar entre sí. Ingeniería industrial, sin sobreprecio.
            </p>
            <div className="hero-in mt-9 flex flex-col gap-3 sm:flex-row" style={{ ["--i" as string]: 3 }}>
              <Boton href="#categorias" size="lg" iconRight={<ArrowRight aria-hidden />}>
                Ver el catálogo
              </Boton>
              <Boton href={NEGOCIO.whatsapp} target="_blank" variant="claro" size="lg" icon={<MessageCircle aria-hidden />}>
                Te asesoramos
              </Boton>
            </div>
          </div>

          {/* Producto estrella: lo primero que se ve en una tienda tiene que ser producto. */}
          <Link href={`/producto/${rack.slug}`} className="hero-in group block bg-white text-negro" style={{ ["--i" as string]: 2 }}>
            <div className="relative aspect-[4/3] overflow-hidden sm:aspect-square lg:aspect-[4/3]">
              <Foto src={rack.imagen} alt={rack.nombre} prioridad contener className="p-5 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
              <span className="absolute top-4 left-4 bg-rojo px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-white uppercase">Producto estrella</span>
            </div>
            <div className="flex items-end justify-between gap-4 border-t border-linea p-5">
              <div className="min-w-0">
                <p className="subtitular text-lg sm:text-xl">{rack.nombre}</p>
                <p className="mt-1 text-[13px] text-gris">{rack.resumen}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-2xl font-extrabold">{precioTexto(rack.precio)}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold tracking-[0.12em] text-rojo uppercase">
                  Ver <ArrowRight aria-hidden className="size-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Dos clientes, dos entradas. */}
      <section aria-label="Para quién" className="bg-carbon text-white">
        <div className="container-page grid gap-px bg-white/10 sm:grid-cols-2">
          {[
            { href: "/categoria/racks", icono: House, titulo: "Para tu casa", texto: "Empieza con un rack y crece con la Attachment Series." },
            { href: "/equipa-tu-centro", icono: Building2, titulo: "Para tu gimnasio o box", texto: "Máquinas de uso comercial y presupuesto a medida." },
          ].map((e) => (
            <Link key={e.href} href={e.href} className="group flex items-center gap-4 bg-carbon px-1 py-6 transition-colors hover:bg-negro sm:gap-5 sm:px-6">
              <e.icono aria-hidden className="size-8 shrink-0 text-rojo" strokeWidth={1.6} />
              <span className="min-w-0 flex-1">
                <span className="subtitular block text-lg sm:text-xl">{e.titulo}</span>
                <span className="mt-1 block text-[13px] text-gris-claro">{e.texto}</span>
              </span>
              <ArrowRight aria-hidden className="size-5 shrink-0 text-white/50 transition-[color,transform] group-hover:translate-x-1 group-hover:text-rojo" />
            </Link>
          ))}
        </div>
      </section>

      <Marquesina />

      {/* Categorías */}
      <Revelar as="section" id="categorias" className="container-page scroll-mt-[var(--header-h)] py-20 sm:py-24">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="etiqueta text-rojo">Catálogo</p>
            <h2 className="titular mt-3 text-4xl sm:text-5xl">¿Qué estás montando?</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-gris">Elige qué estás montando y filtra por serie, tipo o precio.</p>
        </div>
        <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CATEGORIAS.map((c) => (
            <li key={c.slug} data-reveal>
              <Link href={`/categoria/${c.slug}`} className="group flex flex-col border border-linea bg-white transition-[border-color,box-shadow] duration-300 hover:border-negro hover:shadow-card">
                <div className="relative aspect-[16/10] overflow-hidden bg-white sm:aspect-[4/3]">
                  <Foto src={c.imagen} alt="" contener className="p-4 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
                </div>
                <div className="flex items-center justify-between gap-3 bg-negro p-4 text-white sm:p-5">
                  <h3 className="subtitular min-w-0 text-lg break-words sm:text-xl">{c.nombre}</h3>
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center bg-rojo transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Revelar>

      {/* Series, numeradas */}
      <section aria-labelledby="series-titulo" className="bg-negro text-white">
        <Revelar className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-[0.8fr_1.2fr]">
          <div data-reveal>
            <p className="etiqueta text-rojo">Series Hungceed</p>
            <h2 id="series-titulo" className="titular mt-3 text-4xl sm:text-5xl">
              Cuatro series.
              <br />
              Un solo sistema.
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-gris-claro">
              Todo está diseñado para integrarse: la Attachment Series convierte cualquier rack Hungceed en un gimnasio completo.
            </p>
          </div>
          <ol className="border-t border-white/15">
            {ordenSeries.map((s, i) => (
              <li key={s} data-reveal className="border-b border-white/15">
                <Link href={enlaceSerie(s)} className="group grid grid-cols-[3rem_1fr_auto] items-center gap-4 py-6 sm:py-7">
                  <span className="text-sm font-bold text-rojo">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="subtitular block text-2xl transition-colors group-hover:text-rojo sm:text-3xl">{SERIES[s].nombre}</span>
                    <span className="mt-1 block text-[13px] text-gris-claro">{SERIES[s].lema}</span>
                  </span>
                  <ArrowRight aria-hidden className="size-5 text-white/50 transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-rojo" />
                </Link>
              </li>
            ))}
          </ol>
        </Revelar>
      </section>

      {/* El sistema Attachment: un rack en el centro y los accesorios alrededor. */}
      <Revelar as="section" aria-labelledby="sistema-titulo" className="container-page py-20 sm:py-24">
        <div data-reveal className="max-w-2xl">
          <p className="etiqueta text-rojo">{SERIES.attachment.nombre}</p>
          <h2 id="sistema-titulo" className="titular mt-3 text-4xl sm:text-5xl">
            Un rack.
            <br />
            Un gimnasio completo.
          </h2>
          <p className="mt-5 text-gris">Empieza con la jaula y añade cada accesorio cuando lo necesites. Todo encaja en los mismos agujeros, sin herramientas.</p>
        </div>
        <div className="mt-12 grid gap-3 lg:grid-cols-[1fr_1.4fr_1fr]">
          <ul className="grid gap-3 sm:grid-cols-2 lg:order-1 lg:grid-cols-1">
            {accesorios.slice(0, 3).map((p) => (
              <AccesorioMini key={p.slug} slug={p.slug} nombre={p.nombre} imagen={p.imagen} precio={precioTexto(p.precio)} />
            ))}
          </ul>
          <Link href={`/producto/${rack.slug}`} data-reveal className="group order-first flex flex-col border-2 border-negro bg-white lg:order-2">
            <div className="relative aspect-square overflow-hidden">
              <Foto src={rack.imagen} alt={rack.nombre} contener className="p-6 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
            </div>
            <div className="flex items-center justify-between gap-4 border-t-2 border-negro p-5">
              <div>
                <p className="subtitular text-xl">{rack.nombre}</p>
                <p className="mt-1 text-[13px] text-gris">El centro del sistema</p>
              </div>
              <p className="text-2xl font-extrabold">{precioTexto(rack.precio)}</p>
            </div>
          </Link>
          <ul className="grid gap-3 sm:grid-cols-2 lg:order-3 lg:grid-cols-1">
            {accesorios.slice(3, 6).map((p) => (
              <AccesorioMini key={p.slug} slug={p.slug} nombre={p.nombre} imagen={p.imagen} precio={precioTexto(p.precio)} />
            ))}
          </ul>
        </div>
        <div data-reveal className="mt-10 flex justify-center">
          <Boton href="/categoria/attachment" variant="secundario" iconRight={<ArrowRight aria-hidden />}>
            Ver toda la Attachment Series
          </Boton>
        </div>
      </Revelar>

      {/* Lo más elegido */}
      <section className="bg-hueso">
        <Revelar className="container-page py-20 sm:py-24">
          <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="etiqueta text-rojo">Lo más elegido</p>
              <h2 className="titular mt-3 text-4xl sm:text-5xl">Empieza por aquí</h2>
            </div>
            <Boton href="/categoria/racks" variant="secundario" iconRight={<ArrowRight aria-hidden />}>
              Ver racks y jaulas
            </Boton>
          </div>
          <ul className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
            {destacados.map((p) => (
              <li key={p.slug} data-reveal className="flex">
                <TarjetaProducto producto={p} className="w-full" />
              </li>
            ))}
          </ul>
        </Revelar>
      </section>

      {/* Por qué Hungceed + frase del CEO + confianza */}
      <Revelar as="section" className="container-page py-20 sm:py-24">
        <div className="grid gap-14 lg:grid-cols-2">
          <div data-reveal>
            <p className="etiqueta text-rojo">Por qué Hungceed</p>
            <h2 className="titular mt-3 text-4xl sm:text-5xl">{NEGOCIO.lema}</h2>
            <blockquote className="mt-10 border-l-4 border-rojo pl-6">
              <p className="text-xl leading-snug font-semibold text-negro sm:text-2xl">«{NEGOCIO.fraseCeo}»</p>
              <footer className="mt-4 text-[12px] font-semibold tracking-[0.14em] text-gris uppercase">{NEGOCIO.ceo}</footer>
            </blockquote>
          </div>
          <ul className="grid gap-px self-start bg-linea sm:grid-cols-2">
            {VENTAJAS.map((v, i) => (
              <li key={v.titulo} data-reveal className="bg-white p-7">
                <span className="text-sm font-bold text-rojo">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-[15px] font-bold tracking-[0.03em] uppercase">{v.titulo}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-gris">{v.texto}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Barra de confianza: cifras a rellenar con los datos reales de Jose. */}
        <ul data-reveal className="mt-14 grid grid-cols-2 gap-px border border-linea bg-linea lg:grid-cols-4">
          {CONFIANZA.map((c) => (
            <li key={c.texto} className="relative bg-negro p-5 pt-8 text-white sm:p-6 sm:pt-9">
              <p className="titular text-3xl text-rojo sm:text-4xl">{c.cifra}</p>
              <p className="mt-2 text-[13px] text-gris-claro">{c.texto}</p>
              {c.pendiente ? <span className="absolute top-2 right-2 border border-white/30 px-1.5 py-0.5 text-[9px] font-bold tracking-[0.12em] text-white/60 uppercase">Dato por confirmar</span> : null}
            </li>
          ))}
        </ul>
      </Revelar>

      <Opiniones />

      {/* Garantías */}
      <section aria-label="Envíos y garantías" className="border-y border-linea">
        <div className="container-page py-2">
          <Garantias />
        </div>
      </section>

      {/* Gimnasio: tarifas a la vista, sin hacer clic. */}
      <section className="bg-negro text-white">
        <Revelar className="container-page grid gap-12 py-20 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div data-reveal className="relative aspect-[4/5] overflow-hidden sm:aspect-[4/3] lg:aspect-[4/5]">
            <Foto src={GYM.fotos.secundaria} alt="Entrenando en Hungceed GYM" />
            <p className="absolute bottom-4 left-4 bg-rojo px-3 py-1.5 text-[11px] font-bold tracking-[0.14em] uppercase">{GYM.localidad}</p>
          </div>
          <div>
            <p data-reveal className="etiqueta text-rojo">
              {GYM.nombre}
            </p>
            <h2 data-reveal className="titular mt-3 text-4xl sm:text-5xl">
              Entrena con nosotros
            </h2>
            <p data-reveal className="mt-5 max-w-lg text-white/75">
              Musculación, funcional, grupos semipersonales y entrenador personal. Tarifas claras y alta online en Virtuagym.
            </p>
            <ul className="mt-10 grid gap-3 sm:grid-cols-3">
              {tarifasGym.map((t) => (
                <li key={t.titulo} data-reveal className="flex flex-col border border-white/15 bg-carbon p-5">
                  <p className="text-[12px] font-bold tracking-[0.12em] text-gris-claro uppercase">{t.titulo}</p>
                  <p className="mt-3 text-[13px] text-gris-claro">Desde</p>
                  <p className="titular text-4xl">{EUR.format(t.precio)}</p>
                  <p className="mt-1 text-[13px] text-gris-claro">{t.unidad}</p>
                  <p className="mt-3 text-[13px] text-white/75">{t.texto}</p>
                  <a
                    href={GYM.virtuagym}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group mt-5 inline-flex min-h-11 items-center justify-center gap-2 bg-rojo text-[12px] font-bold tracking-[0.14em] text-white uppercase transition-colors hover:bg-white hover:text-negro"
                  >
                    Apúntate <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                    <span className="sr-only"> a {t.titulo} (abre Virtuagym)</span>
                  </a>
                </li>
              ))}
            </ul>
            <div data-reveal className="mt-8">
              <Link href="/gym" className="inline-flex items-center gap-2 text-[13px] font-bold tracking-[0.12em] text-white uppercase underline decoration-rojo decoration-2 underline-offset-8 hover:text-rojo">
                Todas las tarifas y bonos <ArrowRight aria-hidden className="size-4" />
              </Link>
            </div>
          </div>
        </Revelar>
      </section>
    </>
  );
}

function AccesorioMini({ slug, nombre, imagen, precio }: { slug: string; nombre: string; imagen: string; precio: string }) {
  return (
    <li data-reveal className="flex">
      <Link href={`/producto/${slug}`} className="group flex w-full items-center gap-3 border border-linea bg-white p-3 transition-colors hover:border-negro">
        <span className="size-20 shrink-0 bg-white">
          <Foto src={imagen} alt="" contener className="p-1 transition-transform duration-500 group-hover:scale-105" />
        </span>
        <span className="min-w-0">
          <span className="block text-[14px] leading-snug font-semibold">{nombre}</span>
          <span className="mt-1 block text-[13px] font-bold text-gris">{precio}</span>
        </span>
      </Link>
    </li>
  );
}
