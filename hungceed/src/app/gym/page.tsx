import type { Metadata } from "next";
import { ArrowRight, Check, Phone } from "lucide-react";
import Boton from "@/components/ui/Boton";
import Foto from "@/components/ui/Foto";
import Revelar from "@/components/ui/Revelar";
import { GYM, TARIFAS, ZONAS } from "@/data/gym";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Hungceed GYM · Tarifas" };

const EUR = new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

/**
 * Página del gimnasio: en vez del recuadro de Virtuagym con su propio scroll y textos en tres
 * idiomas, una página de verdad con tarifas en tarjetas y un «Apúntate» en cada una.
 */
export default function PaginaGym() {
  return (
    <>
      <section className="relative isolate overflow-hidden bg-negro pt-[var(--header-h)] text-white">
        <div className="absolute inset-0 -z-10">
          <Foto src={GYM.fotos.portada} alt="" prioridad className="opacity-40" />
          <div className="absolute inset-0 bg-gradient-to-t from-negro via-negro/70 to-negro/30" />
        </div>
        <div className="container-page py-20 sm:py-28">
          <p className="hero-in etiqueta text-white/80" style={{ ["--i" as string]: 0 }}>
            {GYM.localidad}
          </p>
          <h1 className="hero-in titular mt-4 text-[clamp(2.8rem,9vw,7rem)]" style={{ ["--i" as string]: 1 }}>
            Hungceed GYM
          </h1>
          <p className="hero-in mt-6 max-w-xl text-lg text-white/80" style={{ ["--i" as string]: 2 }}>
            Sala de musculación, entrenamiento funcional, grupos semipersonales y entrenador personal. Elige tu tarifa y apúntate online.
          </p>
          <div className="hero-in mt-9 flex flex-col gap-3 sm:flex-row" style={{ ["--i" as string]: 3 }}>
            <Boton href="#tarifas" size="lg" iconRight={<ArrowRight aria-hidden />}>
              Ver tarifas
            </Boton>
            <Boton href={GYM.telefono.tel} variant="claro" size="lg" icon={<Phone aria-hidden />}>
              {GYM.telefono.display}
            </Boton>
          </div>
        </div>
      </section>

      <Revelar as="section" className="container-page py-20">
        <ul className="grid gap-px bg-linea sm:grid-cols-2 lg:grid-cols-4">
          {ZONAS.map((z, i) => (
            <li key={z.titulo} data-reveal className="bg-white p-7">
              <span className="text-sm font-bold text-rojo">{String(i + 1).padStart(2, "0")}</span>
              <h2 className="mt-3 text-[16px] font-bold tracking-[0.03em] uppercase">{z.titulo}</h2>
              <p className="mt-2 text-[14px] leading-relaxed text-gris">{z.texto}</p>
            </li>
          ))}
        </ul>
      </Revelar>

      <section id="tarifas" className="scroll-mt-[var(--header-h)] bg-hueso">
        <Revelar className="container-page py-20 sm:py-24">
          <div data-reveal>
            <p className="etiqueta text-gris">Tarifas</p>
            <h2 className="titular mt-3 text-4xl sm:text-5xl">Elige y apúntate</h2>
            <p className="mt-4 max-w-xl text-gris">Precios actuales de la tienda del gimnasio. El alta y el pago se hacen en Virtuagym, como ahora.</p>
          </div>

          {/* Índice de grupos para saltar directo. */}
          <ul className="no-scrollbar mt-10 flex gap-2 overflow-x-auto">
            {TARIFAS.map((g) => (
              <li key={g.id} className="shrink-0">
                <a href={`#${g.id}`} className="inline-flex min-h-10 items-center border border-negro/20 bg-white px-4 text-[13px] font-semibold transition-colors hover:border-negro hover:bg-negro hover:text-white">
                  {g.titulo}
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-12 space-y-16">
            {TARIFAS.map((g) => (
              <div key={g.id} id={g.id} className="scroll-mt-[calc(var(--header-h)+1rem)]">
                <div data-reveal className="flex flex-wrap items-baseline justify-between gap-3 border-b-2 border-negro pb-3">
                  <h3 className="subtitular text-2xl sm:text-3xl">{g.titulo}</h3>
                  <p className="text-sm text-gris">{g.descripcion}</p>
                </div>
                <ul className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {g.tarifas.map((t) => (
                    <li
                      key={t.nombre}
                      data-reveal
                      className={cn("relative flex flex-col border bg-white p-4 sm:p-6", t.ahorro ? "border-negro shadow-[0_0_0_1px_var(--color-negro)]" : "border-linea")}
                    >
                      {t.ahorro ? <span className="absolute -top-3 left-4 sm:left-6 bg-rojo px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-white uppercase">Más ahorro</span> : null}
                      <p className="text-[14px] font-semibold text-gris">{t.nombre}</p>
                      <p className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">{EUR.format(t.precio)}</p>
                      <p className="mt-1 text-[13px] text-gris">{t.periodo}</p>
                      <a
                        href={GYM.virtuagym}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={cn(
                          "group mt-6 inline-flex min-h-11 items-center justify-center gap-2 text-[12px] font-bold tracking-[0.14em] uppercase transition-colors",
                          t.ahorro ? "bg-negro text-white hover:bg-carbon" : "border border-negro text-negro hover:bg-negro hover:text-white",
                        )}
                      >
                        Apúntate
                        <ArrowRight aria-hidden className="size-4 transition-transform group-hover:translate-x-1" />
                        <span className="sr-only">
                          {" "}
                          a {g.titulo} {t.nombre} (abre Virtuagym)
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Revelar>
      </section>

      <section className="bg-hueso text-negro">
        <div className="container-page grid gap-10 py-20 lg:grid-cols-2">
          <div>
            <h2 className="titular text-3xl sm:text-4xl">¿Primera vez?</h2>
            <p className="mt-4 max-w-md text-gris">Prueba con un pase de un día por 8 € y decide después qué tarifa te encaja.</p>
            <ul className="mt-6 space-y-2 text-[14px] text-negro">
              {["Alta online en Virtuagym", "Bono fin de semana por 28 €", "Bono 10 días por 40 €"].map((t) => (
                <li key={t} className="flex items-center gap-2.5">
                  <Check aria-hidden className="size-4 text-rojo" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="border border-linea bg-white p-7 text-[14px] leading-relaxed text-gris">
            <p className="font-bold tracking-[0.1em] text-negro uppercase">Pendiente de Jose</p>
            <p className="mt-2">Horario, dirección exacta con mapa y fotos de la sala. Y el enlace de Virtuagym de cada tarifa, para que «Apúntate» abra directamente la elegida.</p>
          </div>
        </div>
      </section>
    </>
  );
}
