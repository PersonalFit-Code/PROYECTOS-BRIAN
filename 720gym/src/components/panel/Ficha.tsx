"use client";

import { useState, type FormEvent } from "react";
import { FileText, MessageCircle, RefreshCw, Wallet } from "lucide-react";
import Hoja from "./Hoja";
import { Estado, botonClaro, botonNegro, euros, useAhora } from "./ui";
import { ficha } from "./datos";
import { cambiar, registrarPago, usePanel } from "./almacen";
import { usePanelCtx } from "./contexto";
import { socios, type Metodo } from "@/data/panel-demo";
import { cn } from "@/lib/utils";

const fecha = (iso: string) => new Date(iso).toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
type Modo = "ficha" | "pago" | "factura";

export default function Ficha({ socioId, onCerrar }: { socioId: string; onCerrar: () => void }) {
  const ahora = useAhora();
  const panel = usePanel();
  const { imprimir } = usePanelCtx();
  const s = socios.find((x) => x.id === socioId);
  const [modo, setModo] = useState<Modo>("ficha");
  const [aviso, setAviso] = useState("");
  const [seleccion, setSeleccion] = useState<Record<string, boolean>>({});
  if (!s) return null;
  const f = ficha(s, ahora, panel);
  const restantes = f.bono ? f.bono.sesiones - f.bono.usadas : 0;
  const hoyIso = ahora.toISOString().slice(0, 10);

  function pagar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const importe = Number(String(d.get("importe")).replace(",", "."));
    if (!s || !(importe > 0)) return;
    const cubre = Math.min(importe, f.deuda);
    registrarPago(s.id, {
      importe,
      fecha: String(d.get("fecha") || hoyIso),
      metodo: String(d.get("metodo")) as Metodo,
      concepto: cubre > 0 ? (cubre < importe ? `Pago deuda + a cuenta · ${s.plan}` : `Pago deuda · ${s.plan}`) : `Pago a cuenta · ${s.plan}`,
    });
    setAviso(cubre > 0 ? `Pago de ${euros(importe)} registrado. Cubre ${euros(cubre)} de deuda.` : `Pago de ${euros(importe)} registrado.`);
    setModo("ficha");
  }

  function renovar() {
    if (!s) return;
    cambiar((e) => ({ ...e, renovaciones: { ...e.renovaciones, [s.id]: (e.renovaciones[s.id] ?? 0) + 1 } }));
    setAviso(`Bono renovado: +${f.bono?.sesiones ?? 10} sesiones. Queda pendiente de cobro (${euros(f.bono?.precio ?? s.cuota)}).`);
  }

  function facturar() {
    if (!s) return;
    const lineas = f.pagos.filter((p) => seleccion[p.id]).map((p) => ({ fecha: fecha(p.fecha), concepto: p.concepto, importe: p.importe, metodo: p.metodo }));
    if (!lineas.length) return setAviso("Selecciona al menos un pago para la factura.");
    imprimir({ tipo: "factura", cliente: s.nombre, plan: s.plan, lineas, numero: `720-${ahora.getFullYear()}-${String(Math.floor(ahora.getTime() / 1000) % 10000).padStart(4, "0")}` });
  }

  const totalSel = f.pagos.filter((p) => seleccion[p.id]).reduce((a, p) => a + p.importe, 0);
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(
    f.deuda > 0
      ? `Hola ${s.nombre.split(" ")[0]}, te escribimos de 720 GYM CLUB: tienes ${euros(f.deuda)} pendientes de ${s.plan}. Puedes pagar en recepción, por Bizum o desde la web. ¡Gracias!`
      : `Hola ${s.nombre.split(" ")[0]}, te escribimos de 720 GYM CLUB. ¿Qué tal los entrenos?`,
  )}`;

  return (
    <Hoja
      onCerrar={onCerrar}
      titulo={s.nombre}
      subtitulo={
        <span className="flex flex-wrap items-center gap-2">
          {s.plan} · {euros(s.cuota)} · Entrenador: <strong className="font-semibold text-negro">{f.entrenador}</strong> <Estado estado={f.deuda > 0 ? (s.estado === "Al día" ? "Pendiente" : s.estado) : "Al día"} />
        </span>
      }
    >
      {aviso && (
        <p className="mb-5 bg-negro px-4 py-3 text-[13px] font-semibold text-white" role="status">
          {aviso}
        </p>
      )}

      <div className="grid grid-cols-2 gap-px bg-black/[0.08] sm:grid-cols-4">
        {[
          ["Bono comprado", f.bono ? `${f.bono.sesiones}` : "—"],
          ["Usadas", f.bono ? `${f.bono.usadas}` : `${s.asistencias} visitas`],
          ["Restantes", f.bono ? `${restantes}` : "Ilimitado"],
          ["Deuda", euros(f.deuda)],
        ].map(([a, b]) => (
          <div key={a} className={cn("bg-white p-4", a === "Deuda" && f.deuda > 0 && "bg-negro text-white")}>
            <p className="etiqueta opacity-60">{a}</p>
            <p className="titular mt-2 text-[32px] leading-none">{b}</p>
          </div>
        ))}
      </div>
      {f.bono && (
        <div className="mt-3 h-2 bg-niebla" role="meter" aria-valuemin={0} aria-valuemax={f.bono.sesiones} aria-valuenow={f.bono.usadas} aria-label="Uso del bono">
          <div className="h-full bg-negro" style={{ width: `${(f.bono.usadas / f.bono.sesiones) * 100}%` }} />
        </div>
      )}

      <div className="mt-5 flex flex-wrap gap-2">
        <button type="button" onClick={() => setModo(modo === "pago" ? "ficha" : "pago")} className={botonNegro}>
          <Wallet className="size-4" aria-hidden /> Registrar pago
        </button>
        {f.bono && (
          <button type="button" onClick={renovar} className={botonClaro}>
            <RefreshCw className="size-4" aria-hidden /> Renovar bono
          </button>
        )}
        <button type="button" onClick={() => setModo(modo === "factura" ? "ficha" : "factura")} className={botonClaro}>
          <FileText className="size-4" aria-hidden /> Generar factura
        </button>
        <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={botonClaro}>
          <MessageCircle className="size-4" aria-hidden /> WhatsApp
        </a>
      </div>

      {modo === "pago" && (
        <form onSubmit={pagar} className="mt-5 grid gap-3 bg-pared p-4 sm:grid-cols-4 sm:items-end">
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold">Cantidad (€)</span>
            <input name="importe" inputMode="decimal" defaultValue={f.deuda || s.cuota} className="h-11 w-full bg-white px-3 ring-1 ring-black/10 outline-none focus:ring-negro" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold">Fecha</span>
            <input name="fecha" type="date" defaultValue={hoyIso} className="h-11 w-full bg-white px-3 ring-1 ring-black/10 outline-none focus:ring-negro" />
          </label>
          <label className="block">
            <span className="mb-1 block text-[12px] font-semibold">Método</span>
            <select name="metodo" className="h-11 w-full bg-white px-3 ring-1 ring-black/10 outline-none">
              <option>Efectivo</option>
              <option>Tarjeta</option>
              <option>Bizum</option>
            </select>
          </label>
          <button type="submit" className={cn(botonNegro, "h-11")}>
            Guardar pago
          </button>
          <p className="text-[12px] text-negro/55 sm:col-span-4">El pago cubre primero la deuda pendiente; lo que sobre queda a cuenta.</p>
        </form>
      )}

      {modo === "factura" && (
        <div className="mt-5 bg-pared p-4">
          <p className="text-[13px] font-semibold">Elige los pagos que entran en la factura</p>
          <ul className="mt-3 grid gap-1">
            {f.pagos.map((p) => (
              <li key={p.id}>
                <label className="flex cursor-pointer items-center gap-3 bg-white px-3 py-2.5 text-[13px]">
                  <input type="checkbox" checked={!!seleccion[p.id]} onChange={(e) => setSeleccion((x) => ({ ...x, [p.id]: e.target.checked }))} className="size-4 accent-black" />
                  <span className="flex-1">
                    {fecha(p.fecha)} · {p.concepto} <span className="text-negro/50">· {p.metodo}</span>
                  </span>
                  <span className="font-semibold tabular-nums">{euros(p.importe)}</span>
                </label>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-[14px]">
              Total: <strong className="subtitular text-[22px]">{euros(totalSel)}</strong>
            </span>
            <button type="button" onClick={facturar} className={botonNegro}>
              Ver factura e imprimir
            </button>
          </div>
        </div>
      )}

      <div className="mt-7 grid gap-6 sm:grid-cols-2">
        <section>
          <h3 className="subtitular text-[18px]">Historial de sesiones</h3>
          <ul className="mt-2 divide-y divide-black/[0.06]">
            {f.sesiones.length === 0 && <li className="py-3 text-[13px] text-negro/55">Sin sesiones registradas.</li>}
            {f.sesiones.map((x, i) => (
              <li key={i} className="flex items-center justify-between gap-2 py-2.5 text-[13px]">
                <span>
                  <span className="font-semibold">{fecha(x.fecha)}</span> <span className="text-negro/55">· {x.tipo} · {x.entrenador}</span>
                </span>
                <span className={cn("text-[11px] font-semibold", x.pagada ? "text-negro/55" : "text-negro underline decoration-2")}>{x.pagada ? "Pagada" : "Sin pagar"}</span>
              </li>
            ))}
          </ul>
        </section>
        <section>
          <h3 className="subtitular text-[18px]">Pagos</h3>
          <ul className="mt-2 divide-y divide-black/[0.06]">
            {f.pagos.map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-2 py-2.5 text-[13px]">
                <span>
                  <span className="font-semibold">{fecha(p.fecha)}</span> <span className="text-negro/55">· {p.metodo}</span>
                  {f.registrados.some((r) => r.id === p.id) && <span className="ml-2 bg-negro px-1.5 py-0.5 text-[10px] font-semibold text-white">Registrado ahora</span>}
                  <span className="block text-negro/55">{p.concepto}</span>
                </span>
                <span className="font-semibold tabular-nums">{euros(p.importe)}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Hoja>
  );
}
