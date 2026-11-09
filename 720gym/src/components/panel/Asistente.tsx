"use client";

import { useState } from "react";
import { Bot } from "lucide-react";
import { Kpi, NuevoWeb, Tarjeta, TituloBloque, hace, useAhora } from "./ui";
import { useDatosVivos } from "./datos";
import IaGerencia from "./IaGerencia";
import { conversacionesSemilla, preguntasFrecuentes } from "@/data/panel-demo";
import { cn } from "@/lib/utils";

export default function Asistente() {
  const ahora = useAhora();
  const { chats } = useDatosVivos();
  const lista = [
    ...[...chats].reverse().map((c) => ({ id: c.id, cuando: hace(c.inicio, ahora), web: true, resultado: "En curso" as string, mensajes: c.mensajes })),
    ...conversacionesSemilla.map((c) => ({ id: c.id, cuando: c.hace, web: false, resultado: c.resultado as string, mensajes: c.mensajes })),
  ];
  const [abierta, setAbierta] = useState<string | null>(null);
  const actual = lista.find((c) => c.id === (abierta ?? lista[0]?.id));
  const maxFaq = Math.max(...preguntasFrecuentes.map((p) => p.veces));

  return (
    <div className="grid gap-4">
      <IaGerencia />
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi oscura etiqueta="Conversaciones" valor={127 + chats.length} nota="este mes" />
        <Kpi etiqueta="Resueltas sin personal" valor="84 %" nota="sin pasar a WhatsApp" />
        <Kpi etiqueta="Acabaron en reserva o alta" valor="23" nota="18 % de las conversaciones" />
        <Kpi etiqueta="Respuesta" valor="< 3 s" nota="24 h, 365 días" />
      </div>
      <div className="grid gap-4 xl:grid-cols-5">
        <Tarjeta className="xl:col-span-2">
          <TituloBloque>Conversaciones</TituloBloque>
          <ul className="grid gap-1">
            {lista.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setAbierta(c.id)}
                  aria-pressed={actual?.id === c.id}
                  className={cn("w-full p-3 text-left transition", actual?.id === c.id ? "bg-negro text-white" : "bg-pared hover:bg-niebla")}
                >
                  <span className="flex items-center justify-between gap-2 text-[12px] opacity-70">
                    <span>{c.cuando}</span>
                    <span className="font-semibold">{c.resultado}</span>
                  </span>
                  <span className="mt-1 line-clamp-1 block text-[14px] font-semibold">{c.mensajes.find((m) => m.rol === "usuario")?.texto ?? "…"}</span>
                  {c.web && (
                    <span className="mt-2 block">
                      <NuevoWeb />
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </Tarjeta>
        <Tarjeta className="xl:col-span-3">
          <TituloBloque>Conversación</TituloBloque>
          {actual ? (
            <ol className="grid gap-3">
              {actual.mensajes.map((m, i) => (
                <li key={i} className={cn("flex", m.rol === "usuario" ? "justify-end" : "justify-start")}>
                  <span className={cn("max-w-[85%] px-4 py-3 text-[14px] leading-relaxed", m.rol === "usuario" ? "bg-negro text-white" : "bg-pared text-negro")}>
                    {m.rol === "asistente" && (
                      <span className="mb-1 flex items-center gap-1.5 text-[11px] font-semibold opacity-60">
                        <Bot className="size-3.5" aria-hidden /> Asistente 720
                      </span>
                    )}
                    {m.texto}
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-[14px] text-negro/55">Sin conversaciones.</p>
          )}
          <div className="mt-8 border-t border-black/[0.06] pt-5">
            <TituloBloque>Lo que más preguntan</TituloBloque>
            <ul className="space-y-3">
              {preguntasFrecuentes.map((p) => (
                <li key={p.tema}>
                  <div className="flex justify-between text-[13px]">
                    <span className="font-medium">{p.tema}</span>
                    <span className="tabular-nums text-negro/55">{p.veces}</span>
                  </div>
                  <div className="mt-1 h-1.5 bg-niebla">
                    <div className="h-full bg-negro" style={{ width: `${(p.veces / maxFaq) * 100}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Tarjeta>
      </div>
    </div>
  );
}
