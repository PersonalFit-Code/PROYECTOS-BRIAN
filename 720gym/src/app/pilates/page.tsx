import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import Geometria from "@/components/pilates/Geometria";
import Collage from "@/components/ui/Collage";
import Foto from "@/components/ui/Foto";
import { claseBoton } from "@/components/ui/Boton";
import Horario from "@/components/secciones/Horario";
import Apuntate from "@/components/secciones/Apuntate";
import FraseGigante from "@/components/ui/FraseGigante";
import CintaLogos from "@/components/ui/CintaLogos";
import { pilates, wa } from "@/data/negocio";
import { condicionesPilates, tarifasPilates } from "@/data/tarifas";
import { equipo } from "@/data/equipo";

export const metadata: Metadata = {
  title: "720 Pilates · Pilates Reformer en Ourense",
  description:
    "720 Pilates en Ourense: Reformer, Mat, Wall Unit e Hipopresivos en grupos reducidos y por niveles. Primera clase gratis y sin matrícula.",
  alternates: { canonical: "/pilates" },
};

/* La submarca tiene su propia paleta (su dosier 720 Pilates 2025): el acento pasa a ser su naranja.
   `paleta-pilates` la deja fuera de las reglas del monocromo. */
const paleta = { "--acento": "#F6A33B", "--acento-oscuro": "#E08A1C", "--acento-tinta": "#2E2E30" } as CSSProperties;

const disciplinas = [
  { nombre: "Reformer", texto: "La máquina estrella. Fuerza, control y postura con resistencia de muelles.", foto: "Reformer en uso, plano vertical" },
  { nombre: "Mat", texto: "Pilates de suelo: la base del método, en estilo clásico y contemporáneo.", foto: "Clase de Mat, plano vertical" },
  { nombre: "Wall Unit", texto: "Unidad de pared con muelles y barras para trabajar con apoyo y variedad.", foto: "Wall Unit con alumna, plano vertical" },
  { nombre: "Hipopresivos", texto: "Suelo pélvico y reeducación postural en sesiones de 30 minutos.", foto: "Sesión de hipopresivos, plano vertical" },
];

const ventajas = ["Grupos reducidos", "Prueba gratuita", "Sin matrícula", "Reserva tu plaza"];

export default function PaginaPilates() {
  const bea = equipo.find((p) => p.nombre === "Bea");
  return (
    <div style={paleta} className="paleta-pilates bg-crema text-carbon">
      <section className="relative overflow-hidden pt-[calc(var(--header-h)+3rem)] pb-20 sm:pb-28" aria-labelledby="titulo-pilates">
        <Geometria className="-top-10 -right-40 w-[520px] opacity-80 sm:-right-20 lg:top-10 lg:right-[-60px] lg:w-[620px] lg:opacity-30" />
        <div className="container-page relative grid gap-14 lg:grid-cols-12 lg:items-center lg:gap-10">
          <div className="lg:col-span-6">
            <p className="hero-in flex items-baseline gap-2" style={{ ["--i" as string]: 0 }}>
              <span className="titular text-[40px]">720</span>
              <span className="subtitular text-[20px] tracking-[0.16em] text-pil-menta-osc">PILATES</span>
            </p>
            <h1 id="titulo-pilates" className="hero-in mt-6" style={{ ["--i" as string]: 1 }}>
              <span className="titular block text-[clamp(4.5rem,15vw,11rem)]">Pilates</span>
              <span className="subtitular mt-2 block text-[clamp(1.6rem,3.6vw,2.6rem)] text-carbon/65">en grupos reducidos, en el centro de Ourense.</span>
            </h1>
            <p className="hero-in mt-6 max-w-lg text-[18px] leading-relaxed text-carbon/70" style={{ ["--i" as string]: 2 }}>
              Un estudio con personalidad propia dentro del universo 720, con un equipo de profesionales del Pilates. Reformer, Mat, Wall Unit e Hipopresivos.
            </p>
            <ul className="hero-in mt-8 flex flex-wrap gap-2" style={{ ["--i" as string]: 3 }}>
              {ventajas.map((v) => (
                <li key={v} className="flex items-center gap-1.5 bg-white px-3 py-2 text-[13px] font-semibold">
                  <Check className="size-4 text-pil-menta-osc" aria-hidden /> {v}
                </li>
              ))}
            </ul>
            <div className="hero-in mt-10 flex flex-col gap-3 sm:flex-row" style={{ ["--i" as string]: 4 }}>
              <Link href="/pilates?tipo=prueba&actividad=pilates#apuntate" className={claseBoton("acento", true)}>
                Primera clase gratis
              </Link>
              <a href={wa("Hola, quiero información de 720 Pilates.", pilates.whatsapp)} target="_blank" rel="noopener noreferrer" className={claseBoton("contorno-oscuro", true)}>
                WhatsApp {pilates.whatsappVisible}
              </a>
            </div>
          </div>
          <div className="lg:col-span-6">
            <Collage
              tono="crema"
              fotos={[
                { descripcion: "Sala de Reformer con luz natural, tonos verdosos (como su dosier)" },
                { descripcion: "Bea corrigiendo a una alumna en el Reformer" },
                { descripcion: "Detalle de manos y muelles del Reformer" },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="bg-white py-24 sm:py-32" aria-labelledby="titulo-disciplinas-pilates">
        <div className="container-page">
          <p data-reveal className="etiqueta text-carbon/50">
            <span className="text-pil-menta-osc">01</span> · Disciplinas
          </p>
          <h2 id="titulo-disciplinas-pilates" data-reveal className="titular mt-5 text-[clamp(3rem,9vw,7rem)]">
            Cuatro formas de cuidarte
          </h2>
          <ul className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {disciplinas.map((d, i) => (
              <li key={d.nombre} data-reveal className={i % 2 ? "lg:mt-14" : ""}>
                <Foto descripcion={d.foto} tono="crema" proporcion="aspect-[3/4]" sizes="(min-width:1024px) 22vw, 90vw" />
                <h3 className="titular mt-5 text-[44px]">{d.nombre}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-carbon/65">{d.texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FraseGigante frase="Cada persona, a su ritmo." className="py-20 [&_p]:text-carbon" />

      {bea && (
        <section className="py-20 sm:py-28" aria-labelledby="titulo-equipo-pilates">
          <div className="container-page grid gap-12 lg:grid-cols-12 lg:items-center">
            <div data-reveal className="lg:col-span-5">
              <Foto src={bea.foto} descripcion={bea.fotoDescripcion} tono="crema" proporcion="aspect-[4/5]" />
            </div>
            <div className="lg:col-span-6 lg:col-start-7">
              <p data-reveal className="etiqueta text-carbon/50">
                <span className="text-pil-menta-osc">02</span> · El equipo
              </p>
              <h2 id="titulo-equipo-pilates" data-reveal className="mt-5">
                <span className="titular block text-[clamp(4rem,12vw,9rem)]">{bea.nombre}</span>
                <span className="subtitular mt-1 block text-[28px] text-carbon/60">y el equipo de 720 Pilates</span>
              </h2>
              <p data-reveal className="mt-6 max-w-lg text-[17px] leading-relaxed text-carbon/70">
                {bea.linea} Grupos por niveles para que cada clase sea a tu medida, empieces de cero o lleves años practicando.
              </p>
            </div>
          </div>
        </section>
      )}

      <Horario soloClases={["reformer", "mat", "hipopresivos"]} titulo="Horario de Pilates" tono="crema" id="horario-pilates" />

      <section id="tarifas-pilates" className="bg-white py-24 sm:py-32" aria-labelledby="titulo-tarifas-pilates">
        <div className="container-page">
          <p data-reveal className="etiqueta text-carbon/50">
            <span className="text-pil-menta-osc">03</span> · Tarifas 2025
          </p>
          <h2 id="titulo-tarifas-pilates" data-reveal className="mt-5">
            <span className="subtitular block text-[clamp(1.5rem,3vw,2.25rem)] text-carbon/55">Sin matrícula. Pagas del 1 al 7.</span>
            <span className="titular mt-1 block text-[clamp(3rem,9vw,7rem)]">Elige tu plan</span>
          </h2>
          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tarifasPilates.map((g, i) => (
              <li key={g.grupo} data-reveal className={i === 0 ? "bg-carbon p-7 text-crema" : "bg-crema p-7"}>
                <p className={i === 0 ? "etiqueta text-pil-naranja" : "etiqueta text-pil-menta-osc"}>{i === 0 ? "El más pedido" : "720 Pilates"}</p>
                <h3 className="subtitular mt-4 text-[30px]">{g.grupo}</h3>
                <p className="mt-1 text-[13px] opacity-65">{g.descripcion}</p>
                <ul className="mt-5 divide-y divide-current/10 border-y border-current/10">
                  {g.planes.map((p) => (
                    <li key={p.nombre} className="flex items-baseline justify-between gap-3 py-3">
                      <span className="text-[14px] opacity-80">{p.nombre}</span>
                      <span className="subtitular shrink-0 text-[24px]">
                        {p.precio}
                        <span className="ml-0.5 text-[13px] opacity-60">€/mes</span>
                      </span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/pilates?tipo=inscripcion&actividad=pilates#apuntate`}
                  className={`${claseBoton(i === 0 ? "acento" : "negro")} mt-6 w-full`}
                >
                  Reservar plaza
                </Link>
              </li>
            ))}
          </ul>
          <div data-reveal className="mt-6 grid gap-6 bg-crema p-7 sm:grid-cols-2">
            <p className="flex items-baseline gap-3">
              <span className="subtitular text-[22px]">Sesión suelta</span>
              <span className="titular text-[48px] leading-none">15 €</span>
            </p>
            <ul className="space-y-1 text-[14px] text-carbon/70">
              {condicionesPilates.map((c) => (
                <li key={c}>· {c}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <Apuntate tono="crema" actividadInicial="pilates" titulo="Tu primera clase" />

      <section className="pb-20" aria-label="Contacto de 720 Pilates">
        <div className="container-page flex flex-col gap-4 border-t border-carbon/15 pt-10 text-[15px] text-carbon/70 sm:flex-row sm:justify-between">
          <p>
            720 Pilates · Calle Río Bibei 16, dentro de 720 GYM CLUB
          </p>
          <p className="flex flex-wrap gap-x-6 gap-y-2">
            <a href={wa("Hola, quiero información de 720 Pilates.", pilates.whatsapp)} target="_blank" rel="noopener noreferrer" className="font-semibold text-carbon hover:underline">
              WhatsApp {pilates.whatsappVisible}
            </a>
            <a href={`mailto:${pilates.email}`} className="hover:underline">{pilates.email}</a>
            <a href={pilates.instagram} target="_blank" rel="noopener noreferrer" className="hover:underline">{pilates.instagramUsuario}</a>
          </p>
        </div>
      </section>
      <CintaLogos />
    </div>
  );
}
