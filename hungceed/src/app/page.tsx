import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Foto from "@/components/ui/Foto";
import Revelar from "@/components/ui/Revelar";
import Garantias from "@/components/tienda/Garantias";
import Marquesina from "@/components/tienda/Marquesina";
import Opiniones from "@/components/tienda/Opiniones";
import TarjetaProducto from "@/components/tienda/TarjetaProducto";
import { CATEGORIAS, PRODUCTOS, SERIES, productosDe, type Serie } from "@/data/catalogo";
import { GYM } from "@/data/gym";
import { NEGOCIO, VENTAJAS } from "@/data/negocio";

/**
 * Portada: UN mensaje (hoy hay tres titulares compitiendo), dos botones y, debajo, el catálogo
 * ordenado: categorías, series, lo más elegido, por qué Hungceed, opiniones y el gimnasio.
 */
export default function Portada() {
  const destacados = PRODUCTOS.filter((p) => p.destacado);
  const ordenSeries: Serie[] = ["elite", "pro", "prelude", "attachment"];
  const enlaceSerie = (s: Serie) => (s === "attachment" ? "/categoria/attachment" : `/categoria/maquinas?serie=${s}`);
  const cuentaSerie = (s: Serie) => PRODUCTOS.filter((p) => p.serie === s).length;

  return (
    <>
      {/* Portada */}
      <section className="relative isolate overflow-hidden bg-negro pt-[var(--header-h)] text-white">
        <div className="absolute inset-0 -z-10">
          <Foto src={GYM.fotos.portada} alt="" prioridad className="opacity-45 motion-safe:animate-[zoom-lento_12s_var(--ease-out-expo)_both]" />
          <div className="absolute inset-0 bg-gradient-to-r from-negro via-negro/80 to-negro/20" />
        </div>
        <div className="container-page flex min-h-[78svh] flex-col justify-center py-20 lg:min-h-[82svh]">
          <p className="hero-in etiqueta text-rojo" style={{ ["--i" as string]: 0 }}>
            Equipamiento de gimnasio · Marca propia
          </p>
          <h1 className="hero-in titular mt-5 max-w-4xl text-[clamp(2.6rem,8vw,6.5rem)] text-balance" style={{ ["--i" as string]: 1 }}>
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
      </section>

      <Marquesina />

      {/* Categorías */}
      <Revelar as="section" id="categorias" className="container-page scroll-mt-[var(--header-h)] py-20 sm:py-24">
        <div data-reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="etiqueta text-rojo">Catálogo</p>
            <h2 className="titular mt-3 text-4xl sm:text-5xl">¿Qué estás montando?</h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-gris">Seis categorías claras en vez de una lista alfabética. Entra en la tuya y filtra por serie, tipo o precio.</p>
        </div>
        <ul className="mt-12 grid grid-cols-2 gap-3 lg:grid-cols-3">
          {CATEGORIAS.map((c) => (
            <li key={c.slug} data-reveal>
              <Link href={`/categoria/${c.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-hueso sm:aspect-[4/3]">
                <Foto src={c.imagen} alt="" contener className="p-6 pb-24 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 bg-gradient-to-t from-negro via-negro/85 to-transparent p-4 pt-14 text-white sm:p-6">
                  <div>
                    <h3 className="subtitular text-lg sm:text-2xl">{c.nombre}</h3>
                    <p className="mt-1 text-[12px] text-white/70">{productosDe(c.slug).length} productos</p>
                  </div>
                  <span aria-hidden className="grid size-10 shrink-0 place-items-center bg-rojo transition-transform duration-300 group-hover:translate-x-1">
                    <ArrowRight className="size-4" />
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </Revelar>

      {/* Series, numeradas (estructura reciclada de la plantilla) */}
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
                    <span className="mt-1 block text-[13px] text-gris-claro">
                      {SERIES[s].lema} · {cuentaSerie(s)} productos
                    </span>
                  </span>
                  <ArrowRight aria-hidden className="size-5 text-white/50 transition-[color,transform] duration-300 group-hover:translate-x-1 group-hover:text-rojo" />
                </Link>
              </li>
            ))}
          </ol>
        </Revelar>
      </section>

      {/* Lo más elegido */}
      <Revelar as="section" className="container-page py-20 sm:py-24">
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

      {/* Por qué Hungceed + frase del CEO */}
      <section className="bg-hueso">
        <Revelar className="container-page grid gap-14 py-20 sm:py-24 lg:grid-cols-2">
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
        </Revelar>
      </section>

      <Opiniones />

      {/* Garantías */}
      <section aria-label="Envíos y garantías" className="border-y border-linea">
        <div className="container-page py-2">
          <Garantias />
        </div>
      </section>

      {/* Gimnasio */}
      <section className="relative isolate overflow-hidden bg-negro text-white">
        <div className="absolute inset-0 -z-10">
          <Foto src={GYM.fotos.secundaria} alt="" className="opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-r from-negro via-negro/85 to-negro/30" />
        </div>
        <div className="container-page py-24 sm:py-32">
          <p className="etiqueta text-rojo">{GYM.nombre}</p>
          <h2 className="titular mt-4 max-w-2xl text-4xl sm:text-6xl">Entrena con nuestro equipo en {GYM.localidad.split(" (")[0]}</h2>
          <p className="mt-6 max-w-lg text-white/80">Musculación, funcional, grupos semipersonales y entrenador personal. Tarifas claras y alta online en Virtuagym.</p>
          <div className="mt-9">
            <Boton href="/gym" size="lg" iconRight={<ArrowRight aria-hidden />}>
              Ver tarifas
            </Boton>
          </div>
        </div>
      </section>
    </>
  );
}
