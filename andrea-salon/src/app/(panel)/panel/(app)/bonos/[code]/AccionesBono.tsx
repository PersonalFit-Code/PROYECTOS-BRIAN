"use client";

import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { eurosACentimos, formatearEuros } from "@/lib/money";
import type { VoucherKind } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";
import { anularBono, canjearBono, reenviarBono, type Resultado } from "../acciones";

/**
 * Lo que se puede hacer con un bono desde su ficha. Canjear pide un segundo toque: no hay botón de
 * deshacer, y un toque sin querer con el móvil en la mano no debería gastar la sesión de nadie.
 */
const campo =
  "block min-h-12 min-w-0 flex-1 rounded-2xl border border-carmin/20 bg-white px-4 text-[16px] text-tinta focus:border-carmin focus:outline-none focus:ring-2 focus:ring-carmin/20";

export default function AccionesBono(p: {
  code: string;
  kind: VoucherKind;
  /** Activo, sin caducar y con algo dentro. */
  usable: boolean;
  sesionesQuedan: number;
  sesionesTotal: number;
  saldoCents: number;
  esDuena: boolean;
  /** Solo un bono activo se puede anular. */
  anulable: boolean;
  email: string | null;
}) {
  const router = useRouter();
  const id = useId();
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [pendiente, empezar] = useTransition();
  const [confirmarCanje, setConfirmarCanje] = useState(false);
  const [confirmarAnular, setConfirmarAnular] = useState(false);
  const [importe, setImporte] = useState("");

  const correr = (f: () => Promise<Resultado>, tras?: () => void) =>
    empezar(async () => {
      const r = await f();
      setMsg(r.ok ? { ok: true, t: r.mensaje ?? "Hecho." } : { ok: false, t: r.error });
      setConfirmarCanje(false);
      setConfirmarAnular(false);
      if (r.ok) {
        tras?.();
        router.refresh();
      }
    });

  return (
    <div className="space-y-4">
      <p
        role="status"
        aria-live="polite"
        className={cn(
          msg ? "rounded-2xl px-4 py-3 text-sm" : "sr-only",
          msg?.ok ? "bg-emerald-50 text-emerald-800" : "bg-white text-carmin ring-1 ring-carmin/20",
        )}
      >
        {msg?.t}
      </p>

      {p.usable && p.kind === "sessions" && (
        <div className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
          {!confirmarCanje ? (
            <button
              type="button"
              onClick={() => setConfirmarCanje(true)}
              className="min-h-14 w-full rounded-full bg-carmin px-6 text-lg font-semibold text-white"
            >
              Canjear una sesión
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-[15px]">
                ¿Canjear una sesión? {p.sesionesQuedan - 1 === 0 ? "Será la última: el bono quedará gastado." : `Quedarán ${p.sesionesQuedan - 1} de ${p.sesionesTotal}.`}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => correr(() => canjearBono({ modo: "sesion", code: p.code }))}
                  className="min-h-12 flex-1 rounded-full bg-carmin px-6 font-semibold text-white disabled:opacity-60"
                >
                  {pendiente ? "Canjeando…" : "Sí, canjear"}
                </button>
                <button type="button" onClick={() => setConfirmarCanje(false)} className="min-h-12 rounded-full bg-white px-6 font-semibold ring-1 ring-carmin/20">
                  No
                </button>
              </div>
            </div>
          )}
          <p className="mt-3 text-xs text-gris">Si es para pagar una cita, cóbrala desde la cita con «Bono»: así se cierra a la vez.</p>
        </div>
      )}

      {p.usable && p.kind === "gift" && (
        <form
          noValidate
          className="space-y-3 rounded-3xl border border-[var(--capa-borde)] bg-white p-5"
          onSubmit={(ev) => {
            ev.preventDefault();
            const cents = eurosACentimos(importe);
            if (cents === null || cents <= 0) return setMsg({ ok: false, t: "Escribe el importe como 12 o 12,50." });
            if (cents > p.saldoCents) return setMsg({ ok: false, t: `No llega: a esta tarjeta le quedan ${formatearEuros(p.saldoCents)}.` });
            correr(() => canjearBono({ modo: "importe", code: p.code, importeCents: cents }), () => setImporte(""));
          }}
        >
          <label htmlFor={`${id}-importe`} className="block text-sm font-semibold">
            Importe a descontar (€)
          </label>
          <div className="flex gap-2">
            <input
              id={`${id}-importe`}
              inputMode="decimal"
              autoComplete="off"
              placeholder={`Hasta ${formatearEuros(p.saldoCents)}`}
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
              className={campo}
            />
            <button type="submit" disabled={pendiente} className="min-h-12 shrink-0 rounded-full bg-carmin px-5 font-semibold text-white disabled:opacity-60">
              {pendiente ? "Descontando…" : "Descontar importe"}
            </button>
          </div>
          <p className="text-xs text-gris">Si es para pagar una cita, cóbrala desde la cita con «Bono»: así se cierra a la vez.</p>
        </form>
      )}

      {p.esDuena && (p.email || p.anulable) && (
        <div className="space-y-3 rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-gris">Solo la dueña</h2>
          <div className="flex flex-wrap gap-2">
            {p.email && (
              <button
                type="button"
                disabled={pendiente}
                onClick={() => correr(() => reenviarBono(p.code))}
                className="min-h-11 rounded-full bg-white px-5 text-sm font-semibold text-carmin ring-1 ring-carmin/30 disabled:opacity-60"
              >
                Reenviar el correo a {p.email}
              </button>
            )}
            {p.anulable && !confirmarAnular && (
              <button
                type="button"
                onClick={() => setConfirmarAnular(true)}
                className="min-h-11 rounded-full bg-white px-5 text-sm font-semibold text-tinta ring-1 ring-carmin/20"
              >
                Anular bono
              </button>
            )}
          </div>
          {confirmarAnular && (
            <div className="rounded-2xl bg-rosa-niebla p-4 text-sm">
              <p>El bono dejará de valer y no se podrá volver a activar desde aquí. El cobro no se devuelve: si hay que devolver dinero, hazlo aparte.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() => correr(() => anularBono(p.code))}
                  className="min-h-11 rounded-full bg-tinta px-5 font-semibold text-white disabled:opacity-60"
                >
                  Sí, anular el bono
                </button>
                <button type="button" onClick={() => setConfirmarAnular(false)} className="min-h-11 rounded-full bg-white px-5 font-semibold ring-1 ring-carmin/20">
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
