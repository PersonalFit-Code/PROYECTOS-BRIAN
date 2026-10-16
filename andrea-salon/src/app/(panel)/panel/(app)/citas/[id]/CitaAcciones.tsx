"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import SelectorHueco, { type HuecoPanel } from "@/components/panel/SelectorHueco";
import { eurosACentimos, formatearEuros } from "@/lib/money";
import { cn } from "@/lib/utils";
import CobroConBono from "../../bonos/CobroConBono";
import { cancelarCita, cobrarCita, cobrarConBono, deshacerEstado, guardarNotasCita, marcarFalta, moverCita, type Resultado } from "../acciones";

type Panel = "cobrar" | "mover" | "cancelar" | null;

const campo = "mt-1.5 block w-full min-h-12 rounded-2xl border border-carmin/20 bg-white px-4 text-[16px]";
const aEuros = (c: number) => formatearEuros(c, { conDecimales: true }).replace(/\s?€$/, "").replace(/ /g, "");

export default function CitaAcciones(props: {
  id: string;
  estado: string;
  totalCents: number;
  notas: string;
  servicios: string[];
  staffId: string;
  fecha: string;
  pasada: boolean;
  equipo: { id: string; nombre: string }[];
  tieneCorreo: boolean;
}) {
  const router = useRouter();
  const [abierto, setAbierto] = useState<Panel>(props.estado === "confirmed" && props.pasada ? "cobrar" : null);
  const [mensaje, setMensaje] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendiente, empezar] = useTransition();
  const [metodo, setMetodo] = useState<"card" | "cash" | "bizum" | "voucher">("card");
  const [hueco, setHueco] = useState<HuecoPanel | null>(null);
  const [staffMover, setStaffMover] = useState<string>(props.staffId);

  const correr = (f: () => Promise<Resultado<unknown>>, tras?: (r: Resultado<unknown>) => void) =>
    empezar(async () => {
      const r = await f();
      setMensaje(r.ok ? { ok: true, texto: r.mensaje ?? "Hecho." } : { ok: false, texto: r.error });
      if (r.ok) {
        setAbierto(null);
        tras?.(r);
        router.refresh();
      }
    });

  const viva = props.estado === "confirmed";

  return (
    <div className="space-y-4">
      {mensaje && (
        <p role="status" aria-live="polite" className={cn("rounded-2xl px-4 py-3 text-sm", mensaje.ok ? "bg-emerald-50 text-emerald-800" : "bg-white text-carmin ring-1 ring-carmin/20")}>
          {mensaje.texto}
        </p>
      )}

      {viva && (
        <div className="flex flex-wrap gap-2">
          <Boton activo={abierto === "cobrar"} onClick={() => setAbierto(abierto === "cobrar" ? null : "cobrar")} primario>Cobrar</Boton>
          <Boton activo={abierto === "mover"} onClick={() => setAbierto(abierto === "mover" ? null : "mover")}>Cambiar hora</Boton>
          <Boton activo={abierto === "cancelar"} onClick={() => setAbierto(abierto === "cancelar" ? null : "cancelar")}>Cancelar</Boton>
          {props.pasada && <Boton onClick={() => correr(() => marcarFalta(props.id))} disabled={pendiente}>No vino</Boton>}
        </div>
      )}
      {(props.estado === "no_show" || props.estado === "cancelled") && (
        <Boton onClick={() => correr(() => deshacerEstado(props.id))} disabled={pendiente}>Deshacer: volver a confirmada</Boton>
      )}

      {abierto === "cobrar" && (
        <form
          className="space-y-4 rounded-3xl border border-[var(--capa-borde)] bg-white p-5"
          onSubmit={(ev) => {
            ev.preventDefault();
            const f = new FormData(ev.currentTarget);
            const propina = eurosACentimos(String(f.get("propina") ?? "0") || "0");
            if (metodo === "voucher") {
              // Los campos los pone `CobroConBono`; `bonoListo` solo existe si el bono se ha comprobado y vale.
              const code = String(f.get("bonoListo") ?? "");
              if (!code) return setMensaje({ ok: false, texto: "Escribe o escanea un bono válido antes de cobrar." });
              const hayImporte = f.get("importeBono") !== null;
              const importeBono = hayImporte ? eurosACentimos(String(f.get("importeBono"))) : 0;
              if (importeBono === null || (hayImporte && importeBono <= 0)) return setMensaje({ ok: false, texto: "Escribe el importe a descontar como 25 o 25,50." });
              const textoResto = String(f.get("resto") ?? "").trim();
              const resto = textoResto ? eurosACentimos(textoResto) : 0;
              if (resto === null || resto < 0) return setMensaje({ ok: false, texto: "Escribe lo que paga aparte como 15 o 15,50." });
              const metodoResto = f.get("metodoResto");
              correr(() =>
                cobrarConBono({
                  id: props.id,
                  code,
                  importeCents: importeBono,
                  propinaCents: propina ?? 0,
                  resto: resto > 0 && (metodoResto === "card" || metodoResto === "cash" || metodoResto === "bizum") ? { metodo: metodoResto, importeCents: resto } : null,
                }),
              );
              return;
            }
            const importe = eurosACentimos(String(f.get("importe") ?? ""));
            if (importe === null || importe < 0) return setMensaje({ ok: false, texto: "Escribe el importe como 25 o 25,50." });
            correr(() => cobrarCita({ id: props.id, metodo, importeCents: importe, propinaCents: propina ?? 0, nota: String(f.get("nota") ?? "") }));
          }}
        >
          <fieldset>
            <legend className="text-sm font-semibold">Cómo paga</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {([["card", "Tarjeta"], ["cash", "Efectivo"], ["bizum", "Bizum"], ["voucher", "Bono"]] as const).map(([v, l]) => (
                <button key={v} type="button" aria-pressed={metodo === v} onClick={() => setMetodo(v)} className={cn("min-h-11 rounded-full px-5 text-sm font-semibold ring-1", metodo === v ? "bg-carmin text-white ring-carmin" : "bg-white ring-carmin/20")}>
                  {l}
                </button>
              ))}
            </div>
            {metodo === "voucher" && <CobroConBono totalCents={props.totalCents} />}
          </fieldset>
          <div className="grid gap-3 sm:grid-cols-3">
            {metodo !== "voucher" && (
              <label className="block text-sm font-semibold">
                Importe (€)
                <input name="importe" inputMode="decimal" defaultValue={aEuros(props.totalCents)} className={campo} required />
              </label>
            )}
            <label className="block text-sm font-semibold">
              Propina (€)
              <input name="propina" inputMode="decimal" placeholder="0" className={campo} />
            </label>
            {metodo !== "voucher" && (
              <label className="block text-sm font-semibold">
                Nota
                <input name="nota" maxLength={200} className={campo} />
              </label>
            )}
          </div>
          <p className="text-xs text-gris">Es un registro para la gestión del salón; no es una factura.</p>
          <button type="submit" disabled={pendiente} className="min-h-12 rounded-full bg-carmin px-6 font-semibold text-white disabled:opacity-50">
            {pendiente ? "Guardando…" : "Apuntar cobro y cerrar la cita"}
          </button>
        </form>
      )}

      {abierto === "mover" && (
        <div className="space-y-4 rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
          {props.equipo.length > 1 && (
            <div className="flex flex-wrap gap-2">
              {props.equipo.map((p) => (
                <button key={p.id} type="button" aria-pressed={staffMover === p.id} onClick={() => { setStaffMover(p.id); setHueco(null); }} className={cn("min-h-11 rounded-full px-4 text-sm ring-1", staffMover === p.id ? "bg-tinta text-white ring-tinta" : "bg-white ring-carmin/20")}>
                  {p.nombre}
                </button>
              ))}
            </div>
          )}
          {props.servicios.length > 0 ? (
            <SelectorHueco servicios={props.servicios} staffId={staffMover} fechaInicial={props.fecha} elegido={hueco?.inicio ?? null} onElegir={(h) => setHueco(h)} />
          ) : (
            <p className="text-sm text-gris">Algún servicio de esta cita ya no existe en el catálogo: cancélala y crea otra.</p>
          )}
          <label className="flex items-center gap-3 text-sm">
            <input id="avisar-mover" type="checkbox" defaultChecked={props.tieneCorreo} disabled={!props.tieneCorreo} className="size-5 accent-[#2b2a2d]" />
            Avisarla por correo del cambio
          </label>
          <button
            type="button"
            disabled={!hueco || pendiente}
            onClick={() =>
              hueco &&
              correr(
                () => moverCita({ id: props.id, inicio: hueco.inicio, staffId: hueco.staffId, avisar: (document.getElementById("avisar-mover") as HTMLInputElement | null)?.checked ?? false }),
                (r) => {
                  const nueva = (r.ok && (r.datos as { id: string } | undefined)?.id) || null;
                  if (nueva) router.push(`/panel/citas/${nueva}`);
                },
              )
            }
            className="min-h-12 rounded-full bg-carmin px-6 font-semibold text-white disabled:opacity-50"
          >
            Mover a esta hora
          </button>
        </div>
      )}

      {abierto === "cancelar" && (
        <form
          className="space-y-4 rounded-3xl border border-[var(--capa-borde)] bg-white p-5"
          onSubmit={(ev) => {
            ev.preventDefault();
            const f = new FormData(ev.currentTarget);
            correr(() =>
              cancelarCita({
                id: props.id,
                quien: f.get("quien") === "client" ? "client" : "salon",
                motivo: String(f.get("motivo") ?? ""),
                avisar: f.get("avisar") === "on",
              }),
            );
          }}
        >
          <fieldset className="space-y-2 text-sm">
            <legend className="font-semibold">¿Quién la cancela?</legend>
            <label className="flex items-center gap-3"><input type="radio" name="quien" value="client" defaultChecked className="size-5 accent-[#2b2a2d]" /> La clienta (ha llamado o escrito)</label>
            <label className="flex items-center gap-3"><input type="radio" name="quien" value="salon" className="size-5 accent-[#2b2a2d]" /> El salón</label>
          </fieldset>
          <label className="block text-sm font-semibold">
            Motivo (interno)
            <input name="motivo" maxLength={200} className={campo} />
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input name="avisar" type="checkbox" defaultChecked={props.tieneCorreo} disabled={!props.tieneCorreo} className="size-5 accent-[#2b2a2d]" />
            Enviarle el correo de cancelación
          </label>
          <button type="submit" disabled={pendiente} className="min-h-12 rounded-full bg-tinta px-6 font-semibold text-white disabled:opacity-50">
            Cancelar la cita
          </button>
        </form>
      )}

      <form
        className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5"
        onSubmit={(ev) => {
          ev.preventDefault();
          const f = new FormData(ev.currentTarget);
          correr(() => guardarNotasCita(props.id, String(f.get("notas") ?? "")));
        }}
      >
        <label className="block text-sm font-semibold">
          Notas de esta cita
          <textarea name="notas" defaultValue={props.notas} maxLength={500} rows={3} className={cn(campo, "py-3")} />
        </label>
        <button type="submit" disabled={pendiente} className="mt-3 min-h-11 rounded-full bg-white px-5 text-sm font-semibold text-carmin ring-1 ring-carmin/30">
          Guardar notas
        </button>
      </form>
    </div>
  );
}

function Boton({ children, onClick, activo, primario, disabled }: { children: React.ReactNode; onClick: () => void; activo?: boolean; primario?: boolean; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-expanded={activo}
      className={cn(
        "min-h-12 rounded-full px-5 font-semibold ring-1 disabled:opacity-50",
        primario ? "bg-carmin text-white ring-carmin" : activo ? "bg-tinta text-white ring-tinta" : "bg-white text-tinta ring-carmin/20",
      )}
    >
      {children}
    </button>
  );
}
