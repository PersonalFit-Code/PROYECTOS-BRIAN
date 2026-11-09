"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays, Check, Dumbbell, Flame, Flower2, Gift, MapPinned, RotateCcw, Sparkles, Sun, UserCheck, Zap } from "lucide-react";
import { BarraDiscos } from "@/components/ui/IconosMarca";
import IconoWhatsApp from "@/components/ui/IconoWhatsApp";
import Contador from "@/components/ui/Contador";
import { eur, planPorId } from "@/data/pagos";
import { wa } from "@/data/negocio";
import { fotos } from "@/data/fotos";
import { cn } from "@/lib/utils";

/**
 * «Tu plan en 30 segundos»: tres toques y la web recomienda un plan con su precio real y la
 * salida directa (alta con el plan ya elegido, clase gratis o WhatsApp con el mensaje escrito).
 * Solo usa precios del catálogo de pagos; donde 720 aún no ha dado precio, lo dice: «pendiente».
 */
type Icono = ComponentType<SVGProps<SVGSVGElement> & { className?: string }>;
type Objetivo = "sala" | "guia" | "pilates" | "fuerza" | "crossgym" | "yoga";
type Dias = "1" | "2" | "3";
type Inicio = "ya" | "probar" | "paso";

const objetivos: { id: Objetivo; texto: string; nota: string; Icono: Icono; actividad: string; href: string }[] = [
  { id: "sala", texto: "Entrenar a mi aire", nota: "Sala, máquinas y peso libre", Icono: Dumbbell as Icono, actividad: "gimnasio", href: "/gimnasio" },
  { id: "guia", texto: "Que me guíen", nota: "Entrenador personal", Icono: UserCheck as Icono, actividad: "personal", href: "/entrenamiento-personal" },
  { id: "pilates", texto: "Pilates y postura", nota: "Reformer en grupo reducido", Icono: Flower2 as Icono, actividad: "pilates", href: "/pilates" },
  { id: "fuerza", texto: "Fuerza de verdad", nota: "Powerlifting", Icono: BarraDiscos, actividad: "powerlifting", href: "/powerlifting" },
  { id: "crossgym", texto: "Sudar en grupo", nota: "CrossGym", Icono: Flame as Icono, actividad: "crossgym", href: "/crossgym" },
  { id: "yoga", texto: "Moverme y soltar", nota: "Yoga", Icono: Sun as Icono, actividad: "yoga", href: "/yoga" },
];
const diasOpc: { id: Dias; texto: string; nota: string }[] = [
  { id: "1", texto: "1 día", nota: "Para empezar suave" },
  { id: "2", texto: "2 días", nota: "El punto dulce" },
  { id: "3", texto: "3 o más", nota: "Voy a por todas" },
];
const inicioOpc: { id: Inicio; texto: string; nota: string; Icono: Icono }[] = [
  { id: "ya", texto: "Ya, hoy mismo", nota: "Alta online en un minuto", Icono: Zap as Icono },
  { id: "probar", texto: "Probando antes", nota: "Una clase gratis primero", Icono: Gift as Icono },
  { id: "paso", texto: "Estoy de paso", nota: "Unos días en Ourense", Icono: MapPinned as Icono },
];

function recomendar(o: Objetivo, d: Dias, i: Inicio): { planId?: string; titulo: string; porque: string[] } {
  if (i === "paso") {
    if (o === "pilates") return { planId: "sesion-suelta", titulo: "Una sesión suelta de Pilates", porque: ["Sin compromiso", "Reservas tu clase y vienes"] };
    return { planId: "entrada-diaria", titulo: "Entrada de un día", porque: ["Sala completa", "La pides online en un minuto"] };
  }
  switch (o) {
    case "sala":
      return { planId: "gimnasio-libre", titulo: "Gimnasio libre", porque: ["Acceso ilimitado los 365 días", "Aforo limitado: nunca masificado", d === "3" ? "Ideal para entrenar a diario" : "Vienes cuando te encaje"] };
    case "guia":
      if (d === "1") return { planId: "valoracion", titulo: "Primera sesión + valoración", porque: ["Entrevista y valoración", "Plan personalizado", "El primer paso para cualquier bono"] };
      if (d === "2") return { planId: "paquete-inicio", titulo: "Paquete Inicio", porque: ["Valoración y plan personalizado", "1 sesión de entrenamiento personal", "1 mes de acceso ilimitado"] };
      return { planId: "bono-10", titulo: "Bono 10 sesiones", porque: ["27 €/sesión", "El bono no caduca", "La cuota del gimnasio va incluida en tus sesiones"] };
    case "pilates":
      return { planId: `reformer-${d}`, titulo: `Reformer ${d === "3" ? "3" : d} ${d === "1" ? "día" : "días"}/semana`, porque: ["Grupo reducido", "Sesiones de 50 min", "Sin matrícula"] };
    default: {
      const n = objetivos.find((x) => x.id === o)!;
      return { titulo: n.nota, porque: ["Empieza con una clase de prueba gratis", "Cuota: pendiente de confirmar con 720"] };
    }
  }
}

const transicion = { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const };

export default function TuPlan() {
  const reducir = useReducedMotion();
  const [paso, setPaso] = useState(0);
  const [obj, setObj] = useState<Objetivo | null>(null);
  const [dias, setDias] = useState<Dias | null>(null);
  const [inicio, setInicio] = useState<Inicio | null>(null);

  const reiniciar = () => {
    setPaso(0);
    setObj(null);
    setDias(null);
    setInicio(null);
  };
  const objetivo = objetivos.find((x) => x.id === obj);
  const resultado = obj && dias && inicio ? recomendar(obj, dias, inicio) : null;
  const plan = resultado?.planId ? planPorId(resultado.planId) : undefined;
  const pruebaPrimero = inicio === "probar" || !plan;
  const mensaje = objetivo
    ? `Hola, he hecho el test de la web: quiero ${objetivo.texto.toLowerCase()} (${objetivo.nota}), ${diasOpc.find((x) => x.id === dias)?.texto ?? ""} a la semana. Me recomienda: ${resultado?.titulo ?? ""}. ¿Me dais información?`
    : "Hola, quiero información sobre 720 GYM CLUB.";

  const opcion = (activo: boolean) =>
    cn(
      "group relative flex w-full items-center gap-3 rounded-2xl p-4 text-left ring-1 transition duration-300 active:scale-[0.97] sm:p-5",
      activo ? "bg-white text-negro ring-white" : "bg-white/[0.05] text-white ring-white/12 hover:-translate-y-0.5 hover:bg-white/[0.1] hover:ring-white/30",
    );

  const pantallas = [
    <div key="0" className="grid gap-2.5 sm:grid-cols-2">
      {objetivos.map(({ id, texto, nota, Icono }) => (
        <button
          key={id}
          type="button"
          className={opcion(obj === id)}
          onClick={() => {
            setObj(id);
            setPaso(1);
          }}
        >
          <span className={cn("grid size-11 shrink-0 place-items-center rounded-xl transition group-hover:rotate-[-6deg] group-hover:scale-110", obj === id ? "bg-negro text-white" : "bg-white/10")}>
            <Icono className="size-5" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="subtitular block text-[16px]">{texto}</span>
            <span className={cn("block text-[12.5px]", obj === id ? "text-negro/60" : "text-white/55")}>{nota}</span>
          </span>
        </button>
      ))}
    </div>,
    <div key="1" className="grid gap-2.5 sm:grid-cols-3">
      {diasOpc.map(({ id, texto, nota }) => (
        <button
          key={id}
          type="button"
          className={cn(opcion(dias === id), "flex-col items-start sm:py-7")}
          onClick={() => {
            setDias(id);
            setPaso(2);
          }}
        >
          <CalendarDays className="size-5 opacity-70" aria-hidden />
          <span className="titular text-[34px] leading-none">{texto}</span>
          <span className={cn("text-[12.5px]", dias === id ? "text-negro/60" : "text-white/55")}>{nota}</span>
        </button>
      ))}
    </div>,
    <div key="2" className="grid gap-2.5 sm:grid-cols-3">
      {inicioOpc.map(({ id, texto, nota, Icono }) => (
        <button
          key={id}
          type="button"
          className={cn(opcion(inicio === id), "flex-col items-start sm:py-7")}
          onClick={() => {
            setInicio(id);
            setPaso(3);
          }}
        >
          <Icono className="size-6 transition group-hover:scale-125" aria-hidden />
          <span className="subtitular text-[17px]">{texto}</span>
          <span className={cn("text-[12.5px]", inicio === id ? "text-negro/60" : "text-white/55")}>{nota}</span>
        </button>
      ))}
    </div>,
    resultado && objetivo ? (
      <div key="3" className="relative">
        {/* Estallido al aparecer el resultado. */}
        {!reducir && (
          <div className="pointer-events-none absolute top-10 left-1/2 -z-0" aria-hidden>
            {Array.from({ length: 14 }, (_, k) => (
              <span key={k} className="chispa" style={{ ["--a" as string]: `${(k * 360) / 14}deg`, ["--d" as string]: `${70 + (k % 3) * 30}px`, animationDelay: `${(k % 4) * 0.03}s` }} />
            ))}
          </div>
        )}
        <div className="relative overflow-hidden rounded-3xl bg-white p-6 text-negro sm:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-[12px] font-semibold tracking-[0.14em] text-negro/50 uppercase">
                <Sparkles className="size-4" aria-hidden /> Tu plan ideal
              </p>
              <p className="titular mt-2 text-[34px] leading-none sm:text-[42px]">{resultado.titulo}</p>
            </div>
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-negro text-white">
              <objetivo.Icono className="size-6" aria-hidden />
            </span>
          </div>
          <p className="mt-5 flex items-baseline gap-2">
            {plan ? (
              <>
                <span className="titular text-[56px] leading-none tabular-nums sm:text-[68px]">
                  <Contador hasta={plan.precio} sufijo=" €" duracion={900} />
                </span>
                <span className="text-[15px] font-semibold text-negro/55">{plan.mensual ? "al mes" : "pago único"}</span>
              </>
            ) : (
              <span className="rounded-full bg-black/[0.06] px-3 py-1.5 text-[14px] font-semibold text-negro/70">Cuota pendiente de confirmar · primera clase gratis</span>
            )}
          </p>
          <ul className="mt-5 grid gap-2">
            {resultado.porque.map((t, k) => (
              <motion.li key={t} initial={reducir ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.25 + k * 0.08 }} className="flex items-center gap-2.5 text-[14.5px]">
                <span className="grid size-5 shrink-0 place-items-center rounded-full bg-negro text-white">
                  <Check className="size-3" aria-hidden />
                </span>
                {t}
              </motion.li>
            ))}
          </ul>
          <div className="mt-7 grid gap-2.5 sm:grid-cols-2">
            {pruebaPrimero ? (
              <Link href={`/clase-gratis?actividad=${objetivo.actividad}`} className="subtitular inline-flex h-[52px] items-center justify-center gap-2 bg-negro px-6 text-[15px] text-white transition hover:gap-3 hover:bg-pizarra">
                Reservar mi clase gratis <ArrowRight className="size-4" aria-hidden />
              </Link>
            ) : (
              <Link href={`/alta?plan=${plan!.id}`} className="subtitular inline-flex h-[52px] items-center justify-center gap-2 bg-negro px-6 text-[15px] text-white transition hover:gap-3 hover:bg-pizarra">
                Inscribirme con este plan <ArrowRight className="size-4" aria-hidden />
              </Link>
            )}
            <a href={wa(mensaje)} target="_blank" rel="noopener noreferrer" className="group inline-flex h-[52px] items-center justify-center gap-2 rounded-full bg-[#25d366] px-5 text-[15px] font-semibold text-white transition hover:scale-[1.02] active:scale-95">
              <IconoWhatsApp className="size-5 transition group-hover:rotate-[-10deg]" /> Pregúntalo por WhatsApp
            </a>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-[13px]">
            {plan && pruebaPrimero ? (
              <Link href={`/alta?plan=${plan.id}`} className="font-semibold underline-offset-4 hover:underline">
                O date de alta ya con {plan.nombre} ({eur(plan.precio)})
              </Link>
            ) : (
              <Link href={objetivo.href} className="font-semibold underline-offset-4 hover:underline">
                Ver todo sobre {objetivo.nota}
              </Link>
            )}
            <button type="button" onClick={reiniciar} className="inline-flex items-center gap-1.5 text-negro/55 hover:text-negro">
              <RotateCcw className="size-3.5" aria-hidden /> Repetir
            </button>
          </div>
        </div>
      </div>
    ) : null,
  ];
  const preguntas = ["¿Qué te apetece?", "¿Cuántos días a la semana?", "¿Cómo quieres empezar?", "Hecho. Esto es lo tuyo"];

  return (
    <section className="relative isolate overflow-hidden bg-negro py-20 text-white sm:py-28" aria-labelledby="titulo-tuplan">
      <div className="absolute inset-0 -z-10" aria-hidden>
        <Image src={fotos.iaDiscos.grande} alt="" fill sizes="100vw" className="object-cover object-[60%_50%] opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-negro via-negro/85 to-negro/40" />
        <div className="absolute inset-0 bg-gradient-to-b from-negro via-transparent to-negro" />
      </div>
      <div className="container-page grid gap-10 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-4">
          <p data-reveal className="etiqueta text-white/55">
            Test rápido
          </p>
          <h2 id="titulo-tuplan" data-reveal className="titular mt-4 text-[clamp(2.3rem,4.4vw,3.4rem)]">
            Tu plan en 30 segundos
          </h2>
          <p data-reveal className="mt-4 max-w-sm text-[15.5px] leading-relaxed text-white/65">
            Tres toques y te decimos qué te encaja, cuánto cuesta y cómo empezar hoy. Sin rellenar nada.
          </p>
          <ol data-reveal className="mt-8 hidden gap-3 lg:grid" aria-label="Pasos">
            {preguntas.slice(0, 3).map((p, k) => (
              <li key={p} className={cn("flex items-center gap-3 text-[14px] transition", paso > k ? "text-white" : paso === k ? "text-white" : "text-white/40")}>
                <span className={cn("grid size-8 place-items-center rounded-full text-[13px] font-semibold ring-1 transition", paso > k ? "bg-white text-negro ring-white" : paso === k ? "ring-white" : "ring-white/25")}>
                  {paso > k ? <Check className="size-4" aria-hidden /> : k + 1}
                </span>
                {p}
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-span-8">
          <div data-reveal className="vidrio rounded-[28px] p-4 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {paso > 0 && paso < 3 && (
                  <button type="button" onClick={() => setPaso(paso - 1)} className="grid size-9 place-items-center rounded-full bg-white/10 transition hover:bg-white/20" aria-label="Volver a la pregunta anterior">
                    <ArrowLeft className="size-4" aria-hidden />
                  </button>
                )}
                <p className="subtitular text-[20px] sm:text-[22px]" aria-live="polite">
                  {preguntas[paso]}
                </p>
              </div>
              <span className="text-[12px] font-semibold text-white/50 tabular-nums">{Math.min(paso + 1, 3)}/3</span>
            </div>
            <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden>
              <div className="h-full rounded-full bg-white transition-[width] duration-500 ease-out" style={{ width: `${((paso + (paso === 3 ? 0 : 0.35)) / 3) * 100}%` }} />
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={paso} initial={reducir ? false : { opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={reducir ? undefined : { opacity: 0, x: -24 }} transition={transicion}>
                {pantallas[paso]}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
