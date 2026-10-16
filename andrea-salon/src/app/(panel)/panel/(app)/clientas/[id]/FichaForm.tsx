"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { anonimizar, guardarFicha } from "../acciones";

const campo = "mt-1.5 block w-full min-h-12 rounded-2xl border border-carmin/20 bg-white px-4 text-[16px]";

export default function FichaForm(p: {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  notas: string;
  marketing: boolean;
  whatsapp: boolean;
  puedeAnonimizar: boolean;
}) {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; t: string } | null>(null);
  const [pendiente, empezar] = useTransition();
  const [confirmar, setConfirmar] = useState(false);

  return (
    <section className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
      <h2 className="font-display text-xl font-semibold">Ficha</h2>
      <form
        className="mt-3 grid gap-3 sm:grid-cols-2"
        onSubmit={(ev) => {
          ev.preventDefault();
          const f = new FormData(ev.currentTarget);
          empezar(async () => {
            const r = await guardarFicha({
              id: p.id,
              nombre: String(f.get("nombre") ?? ""),
              telefono: String(f.get("telefono") ?? ""),
              email: String(f.get("email") ?? ""),
              notas: String(f.get("notas") ?? ""),
              marketing: f.get("marketing") === "on",
              whatsapp: f.get("whatsapp") === "on",
            });
            setMsg(r.ok ? { ok: true, t: r.mensaje } : { ok: false, t: r.error });
            if (r.ok) router.refresh();
          });
        }}
      >
        <label className="block text-sm font-semibold sm:col-span-2">
          Nombre
          <input name="nombre" defaultValue={p.nombre} required minLength={2} className={campo} />
        </label>
        <label className="block text-sm font-semibold">
          Teléfono
          <input name="telefono" type="tel" defaultValue={p.telefono} className={campo} />
        </label>
        <label className="block text-sm font-semibold">
          Correo
          <input name="email" type="email" defaultValue={p.email} className={campo} />
        </label>
        <label className="block text-sm font-semibold sm:col-span-2">
          Notas (alergias, preferencias) — las ve todo el equipo
          <textarea name="notas" defaultValue={p.notas} rows={3} maxLength={1000} className={cn(campo, "py-3")} />
        </label>
        <label className="flex items-start gap-3 text-sm sm:col-span-2">
          <input name="marketing" type="checkbox" defaultChecked={p.marketing} className="mt-0.5 size-5 accent-[#8e0e33]" />
          Acepta recibir novedades y ofertas
        </label>
        <label className="flex items-start gap-3 text-sm sm:col-span-2">
          <input name="whatsapp" type="checkbox" defaultChecked={p.whatsapp} className="mt-0.5 size-5 accent-[#8e0e33]" />
          Acepta avisos por WhatsApp (para cuando se active)
        </label>
        <div className="sm:col-span-2">
          <button type="submit" disabled={pendiente} className="min-h-12 rounded-full bg-carmin px-6 font-semibold text-white disabled:opacity-50">
            Guardar ficha
          </button>
        </div>
      </form>
      {msg && <p role="status" className={cn("mt-3 text-sm", msg.ok ? "text-emerald-700" : "text-carmin")}>{msg.t}</p>}

      {p.puedeAnonimizar && (
        <div className="mt-6 border-t border-[var(--capa-borde)] pt-4">
          {!confirmar ? (
            <button type="button" onClick={() => setConfirmar(true)} className="min-h-11 text-sm font-semibold text-gris underline underline-offset-2">
              Borrar sus datos personales (derecho de supresión)
            </button>
          ) : (
            <div className="rounded-2xl bg-rosa-niebla p-4 text-sm">
              <p>Se borran nombre, teléfono, correo y notas. Las citas y cobros se quedan sin nombre para las cuentas. No se puede deshacer.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pendiente}
                  onClick={() =>
                    empezar(async () => {
                      const r = await anonimizar(p.id);
                      setMsg(r.ok ? { ok: true, t: r.mensaje } : { ok: false, t: r.error });
                      setConfirmar(false);
                      if (r.ok) router.refresh();
                    })
                  }
                  className="min-h-11 rounded-full bg-tinta px-5 font-semibold text-white"
                >
                  Sí, borrar sus datos
                </button>
                <button type="button" onClick={() => setConfirmar(false)} className="min-h-11 rounded-full bg-white px-5 font-semibold ring-1 ring-carmin/20">
                  No
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
