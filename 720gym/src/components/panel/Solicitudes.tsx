"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { Estado, Kpi, NuevoWeb, Tarjeta, botonNegro, hace, useAhora } from "./ui";
import { useDatosVivos } from "./datos";
import { solicitudesSemilla } from "@/data/panel-demo";
import { cn } from "@/lib/utils";

const tipoTexto = { prueba: "Clase de prueba", inscripcion: "Inscripción", entrada: "Entrada diaria" } as const;
type EstadoSol = "Nueva" | "Contactada" | "Convertida";

function respuesta(tipo: keyof typeof tipoTexto, nombre: string, actividad?: string, detalle?: string) {
  const n = nombre.split(" ")[0];
  if (tipo === "prueba") return `¡Hola ${n}! Somos 720 GYM CLUB. Te confirmamos tu clase de prueba${actividad ? ` de ${actividad}` : ""}${detalle ? ` (${detalle})` : ""}. Trae ropa cómoda y agua. ¡Te esperamos!`;
  if (tipo === "entrada") return `¡Hola ${n}! Tu entrada diaria en 720 GYM CLUB está lista${detalle ? ` para ${detalle}` : ""}. Calle Río Bibei 16. ¡Buen entreno!`;
  return `¡Hola ${n}! Hemos recibido tu inscripción${detalle ? ` (${detalle})` : ""}. Te contamos los siguientes pasos para empezar en 720 GYM CLUB.`;
}

/** wa.me con el teléfono que dejó el cliente (solo cifras; se antepone 34 si es un móvil español). */
function enlace(telefono: string | undefined, texto: string) {
  const cifras = (telefono ?? "").replace(/\D/g, "");
  const numero = cifras.length === 9 ? `34${cifras}` : cifras;
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

export default function Solicitudes() {
  const ahora = useAhora();
  const { solicitudes } = useDatosVivos();
  const [estados, setEstados] = useState<Record<string, EstadoSol>>({});
  const [filtro, setFiltro] = useState<"Todas" | EstadoSol>("Todas");

  const lista = [
    ...[...solicitudes].reverse().map((s) => ({
      id: s.id,
      tipo: s.tipo,
      nombre: s.nombre,
      telefono: s.telefono,
      actividad: s.actividad,
      detalle: [s.plan, s.fecha, s.hora].filter(Boolean).join(" · "),
      comentario: s.comentario,
      cuando: hace(s.creada, ahora),
      web: true,
      estado: (estados[s.id] ?? "Nueva") as EstadoSol,
    })),
    ...solicitudesSemilla.map((s) => ({
      id: s.id,
      tipo: s.tipo,
      nombre: s.nombre,
      telefono: undefined,
      actividad: s.actividad,
      detalle: s.detalle,
      comentario: undefined,
      cuando: s.hace,
      web: false,
      estado: (estados[s.id] ?? s.estado) as EstadoSol,
    })),
  ];
  const visibles = lista.filter((s) => filtro === "Todas" || s.estado === filtro);
  const convertidas = lista.filter((s) => s.estado === "Convertida").length;

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <Kpi oscura etiqueta="Nuevas" valor={lista.filter((s) => s.estado === "Nueva").length} nota="por contestar" />
        <Kpi etiqueta="Desde la web (demo)" valor={solicitudes.length} nota="formulario único" />
        <Kpi etiqueta="Conversión" valor={`${Math.round((convertidas / lista.length) * 100)} %`} nota="solicitud → socio" />
        <Kpi etiqueta="Tiempo de respuesta" valor="12 min" nota="media (demo)" />
      </div>
      <Tarjeta>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="subtitular text-[20px]">Solicitudes</h3>
          <div className="flex" role="group" aria-label="Filtrar por estado">
            {(["Todas", "Nueva", "Contactada", "Convertida"] as const).map((f) => (
              <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)} className={cn("h-9 px-3 text-[13px] font-semibold", filtro === f ? "bg-negro text-white" : "bg-pared text-negro/65")}>
                {f}
              </button>
            ))}
          </div>
        </div>
        <ul className="grid gap-2">
          {visibles.map((s) => (
            <li key={s.id} className={cn("grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-center", s.web ? "bg-niebla ring-1 ring-negro/15" : "bg-pared")}>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold">{s.nombre}</span>
                  {s.web && <NuevoWeb />}
                  <Estado estado={s.estado} />
                </div>
                <p className="mt-1 text-[13px] text-negro/65">
                  <strong className="font-semibold text-negro">{tipoTexto[s.tipo]}</strong>
                  {s.actividad && ` · ${s.actividad}`}
                  {s.detalle && ` · ${s.detalle}`} · {s.cuando}
                </p>
                {s.comentario && <p className="mt-1 text-[13px] text-negro/55 italic">«{s.comentario}»</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <label>
                  <span className="sr-only">Estado de {s.nombre}</span>
                  <select
                    value={s.estado}
                    onChange={(e) => setEstados((x) => ({ ...x, [s.id]: e.target.value as EstadoSol }))}
                    className="h-10 bg-white px-3 text-[13px] ring-1 ring-black/10 outline-none"
                  >
                    <option>Nueva</option>
                    <option>Contactada</option>
                    <option>Convertida</option>
                  </select>
                </label>
                {s.telefono ? (
                  <a
                    href={enlace(s.telefono, respuesta(s.tipo, s.nombre, s.actividad, s.detalle))}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setEstados((x) => ({ ...x, [s.id]: x[s.id] === "Convertida" ? "Convertida" : "Contactada" }))}
                    className={botonNegro}
                  >
                    <MessageCircle className="size-4" aria-hidden /> Responder por WhatsApp
                  </a>
                ) : (
                  <span className="inline-flex h-10 items-center px-3 text-[12px] text-negro/45">Ejemplo ficticio</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </Tarjeta>
    </div>
  );
}
