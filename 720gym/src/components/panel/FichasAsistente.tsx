"use client";

import { Bot, FileText, Flame, MessageCircle, Siren, Snowflake, ThermometerSun } from "lucide-react";
import { NuevoWeb, Tarjeta, TituloBloque, hace, useAhora } from "./ui";
import { useDatosVivos } from "./datos";
import type { FichaLead } from "@/lib/demo";
import { cn } from "@/lib/utils";

/**
 * Lo que el asistente deja hecho para la gerencia: fichas de clientes potenciales (rellenadas solas
 * con salida estructurada, de más a menos «calientes»), avisos al equipo y planes descargados.
 */
const ejemplos: (FichaLead & { ejemplo: true })[] = [
  { id: "e1", conversacion: "c1", nombre: "Natalia Couto", telefono: "600 000 000", objetivo: "Mejorar la postura y el dolor de espalda", disponibilidad: "Jueves por la tarde", plan_recomendado: "Reformer 1 día/semana", temperatura: "caliente", siguiente_paso: "Confirmar su clase de prueba del jueves y ofrecerle Reformer 1 día", idioma: "español", resumen: "Reservó Reformer el jueves 19:00 desde el chat.", creada: "", ejemplo: true },
  { id: "e2", conversacion: "c3", nombre: "Mark Evans", telefono: "", objetivo: "Entrenar dos semanas mientras está en Ourense", disponibilidad: "Mañanas", plan_recomendado: "Entrada diaria 5 €", temperatura: "templado", siguiente_paso: "Ofrecerle un pase temporal (precio pendiente)", idioma: "inglés", resumen: "Turista; preguntó en inglés por pases de una o dos semanas.", creada: "", ejemplo: true },
];

const temp = {
  caliente: { texto: "Caliente", Icono: Flame, clase: "bg-negro text-white" },
  templado: { texto: "Templado", Icono: ThermometerSun, clase: "bg-black/[0.08] text-negro" },
  frio: { texto: "Frío", Icono: Snowflake, clase: "bg-white text-negro ring-1 ring-black/15" },
} as const;
const orden = { caliente: 0, templado: 1, frio: 2 };
const motivoTexto = { venta_grande: "Venta grande", queja: "Queja", duda_compleja: "Duda", lesion_o_salud: "Salud / lesión", otro: "Otro" } as const;

function wa(telefono: string | undefined, nombre: string | undefined) {
  const c = (telefono ?? "").replace(/\D/g, "");
  if (c.length < 9) return null;
  return `https://wa.me/${c.length === 9 ? `34${c}` : c}?text=${encodeURIComponent(`¡Hola ${nombre?.split(" ")[0] ?? ""}! Soy Brais, de 720 GYM CLUB. Te escribo por lo que hablaste con nuestro asistente.`)}`;
}

export default function FichasAsistente() {
  const ahora = useAhora();
  const { fichas, alertas, planes } = useDatosVivos();
  const lista = [...fichas.map((f) => ({ ...f, ejemplo: false })), ...ejemplos].sort((a, b) => orden[a.temperatura] - orden[b.temperatura]);

  return (
    <div className="grid gap-4 xl:grid-cols-3">
      <Tarjeta className="xl:col-span-2">
        <TituloBloque accion={<span className="text-[12px] text-negro/55">Las rellena el asistente solo</span>}>
          <span className="flex items-center gap-2">
            <Bot className="size-5" aria-hidden /> Clientes potenciales del asistente
          </span>
        </TituloBloque>
        <ul className="grid gap-3">
          {lista.map((f) => {
            const T = temp[f.temperatura];
            const enlace = wa(f.telefono, f.nombre);
            return (
              <li key={f.id} className="rounded-2xl bg-black/[0.035] p-4 transition hover:bg-black/[0.06]">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn("inline-flex h-6 items-center gap-1 rounded-full px-2 text-[11px] font-semibold", T.clase)}>
                    <T.Icono className="size-3.5" aria-hidden /> {T.texto}
                  </span>
                  <p className="text-[15px] font-semibold">{f.nombre || "Sin nombre todavía"}</p>
                  {f.telefono && <span className="text-[12px] text-negro/55">{f.telefono}</span>}
                  <span className="ml-auto text-[11px] text-negro/45">{f.ejemplo ? "ejemplo" : hace(f.creada, ahora)}</span>
                  {!f.ejemplo && <NuevoWeb />}
                </div>
                <p className="mt-2 text-[13.5px]">
                  <strong>Objetivo:</strong> {f.objetivo}
                  {f.plan_recomendado && (
                    <>
                      {" "}
                      · <strong>Le encaja:</strong> {f.plan_recomendado}
                    </>
                  )}
                  {f.disponibilidad && <> · {f.disponibilidad}</>}
                  {f.idioma && f.idioma.toLowerCase() !== "español" && <> · habla {f.idioma}</>}
                </p>
                <p className="mt-1 text-[12.5px] text-negro/60">{f.resumen}</p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[13px] font-semibold">→ {f.siguiente_paso}</p>
                  {enlace && (
                    <a href={enlace} target="_blank" rel="noopener noreferrer" className="inline-flex h-8 items-center gap-1.5 rounded-full bg-[#25d366] px-3 text-[12px] font-semibold text-white">
                      <MessageCircle className="size-3.5" aria-hidden /> Escribirle
                    </a>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </Tarjeta>

      <div className="grid content-start gap-4">
        <Tarjeta oscura>
          <TituloBloque>
            <span className="flex items-center gap-2">
              <Siren className="size-5" aria-hidden /> Avisos al equipo
            </span>
          </TituloBloque>
          {alertas.length === 0 ? (
            <p className="text-[13px] text-white/60">Cuando el asistente detecte una queja, algo de salud o una venta grande, te avisa aquí y por WhatsApp.</p>
          ) : (
            <ul className="grid gap-3">
              {[...alertas].reverse().map((a) => (
                <li key={a.id} className="rounded-2xl bg-white/[0.07] p-3 ring-1 ring-white/10">
                  <p className="flex items-center justify-between gap-2 text-[12px]">
                    <span className={cn("rounded-full px-2 py-0.5 font-semibold", a.urgencia === "alta" ? "bg-white text-negro" : "bg-white/15")}>{motivoTexto[a.motivo] ?? a.motivo}</span>
                    <span className="text-white/50">{hace(a.creada, ahora)}</span>
                  </p>
                  <p className="mt-2 text-[13px] text-white/85">{a.resumen}</p>
                  {(a.nombre || a.telefono) && <p className="mt-1 text-[12px] text-white/55">{[a.nombre, a.telefono].filter(Boolean).join(" · ")}</p>}
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
        <Tarjeta>
          <TituloBloque>
            <span className="flex items-center gap-2">
              <FileText className="size-5" aria-hidden /> Planes descargados
            </span>
          </TituloBloque>
          {planes.length === 0 ? (
            <p className="text-[13px] text-negro/60">El asistente regala un plan de 4 semanas a cambio del teléfono. Cada descarga es un cliente potencial con datos.</p>
          ) : (
            <ul className="grid gap-2">
              {[...planes].reverse().map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-2 text-[13px]">
                  <span>
                    <strong>{p.nombre}</strong> · {p.objetivo}
                  </span>
                  <a href={`/plan?id=${p.id}`} target="_blank" rel="noopener noreferrer" className="shrink-0 text-[12px] font-semibold underline-offset-2 hover:underline">
                    Ver plan
                  </a>
                </li>
              ))}
            </ul>
          )}
        </Tarjeta>
      </div>
    </div>
  );
}
