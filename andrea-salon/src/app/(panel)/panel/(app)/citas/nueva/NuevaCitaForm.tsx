"use client";

import { Search, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import SelectorHueco, { type HuecoPanel } from "@/components/panel/SelectorHueco";
import { formatCents } from "@/lib/format";
import { cn } from "@/lib/utils";
import { buscarClientas, crearCita } from "../acciones";

export interface ServicioForm {
  id: string;
  nombre: string;
  duracionMin: number;
  precioCents: number;
  categoria: string;
}
export interface ProfesionalForm {
  id: string;
  nombre: string;
}

type Clienta = { id: string; nombre: string; telefono: string | null; email: string | null };

const campo = "mt-1.5 block w-full min-h-12 rounded-2xl border border-carmin/20 bg-white px-4 text-[16px] focus:border-carmin focus:outline-none focus:ring-2 focus:ring-carmin/20";

export default function NuevaCitaForm({
  servicios,
  equipo,
  quienHace,
  fechaInicial,
  staffFijo,
}: {
  servicios: ServicioForm[];
  equipo: ProfesionalForm[];
  quienHace: Record<string, string[]>;
  fechaInicial: string;
  /** empleada: solo su agenda */
  staffFijo: string | null;
}) {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState("");
  const [resultados, setResultados] = useState<Clienta[]>([]);
  const [clienta, setClienta] = useState<Clienta | null>(null);
  const [nueva, setNueva] = useState(false);
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [staffId, setStaffId] = useState<string | null>(staffFijo);
  const [hueco, setHueco] = useState<HuecoPanel | null>(null);
  const [fecha, setFecha] = useState(fechaInicial);
  const [horaManual, setHoraManual] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [guardando, empezar] = useTransition();

  const buscando = !clienta && !nueva && busqueda.trim().length >= 2;
  const resultadosVisibles = buscando ? resultados : [];

  useEffect(() => {
    if (!buscando) return;
    const t = window.setTimeout(async () => setResultados(await buscarClientas(busqueda)), 250);
    return () => window.clearTimeout(t);
  }, [busqueda, buscando]);

  const candidatas = useMemo(
    () => equipo.filter((p) => elegidos.every((id) => (quienHace[id] ?? []).includes(p.id))),
    [equipo, elegidos, quienHace],
  );
  const total = elegidos.reduce((t, id) => t + (servicios.find((s) => s.id === id)?.precioCents ?? 0), 0);
  const staffFinal = hueco?.staffId ?? staffId;

  const guardar = (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const f = new FormData(ev.currentTarget);
    setError(null);
    if (!staffFinal) {
      setError("Elige la profesional (o una hora de la lista, que ya la trae).");
      return;
    }
    empezar(async () => {
      const r = await crearCita({
        clientaId: clienta?.id ?? null,
        nombre: String(f.get("nombre") ?? ""),
        telefono: String(f.get("telefono") ?? ""),
        email: String(f.get("email") ?? ""),
        servicios: elegidos,
        staffId: staffFinal,
        inicio: hueco && !horaManual ? hueco.inicio : null,
        fecha: horaManual ? fecha : null,
        horaManual: horaManual || null,
        fuente: (String(f.get("fuente") ?? "phone") as "phone" | "walkin" | "panel"),
        notas: String(f.get("notas") ?? ""),
        avisar: f.get("avisar") === "on",
      });
      if (r.ok && r.datos) router.push(`/panel/citas/${r.datos.id}`);
      else if (!r.ok) setError(r.error);
    });
  };

  const categorias = [...new Set(servicios.map((s) => s.categoria))];

  return (
    <form onSubmit={guardar} className="space-y-6">
      <section className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
        <h2 className="font-display text-xl font-semibold">Clienta</h2>
        {clienta ? (
          <div className="mt-3 flex items-center justify-between rounded-2xl bg-rosa-niebla px-4 py-3">
            <span>
              <span className="font-semibold">{clienta.nombre}</span>
              <span className="block text-sm text-gris">{[clienta.telefono, clienta.email].filter(Boolean).join(" · ")}</span>
            </span>
            <button type="button" onClick={() => setClienta(null)} aria-label="Quitar clienta" className="grid size-11 place-items-center rounded-full hover:bg-white">
              <X aria-hidden className="size-5" />
            </button>
          </div>
        ) : nueva ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold sm:col-span-2">
              Nombre
              <input name="nombre" required minLength={2} className={campo} defaultValue={busqueda} />
            </label>
            <label className="block text-sm font-semibold">
              Móvil
              <input name="telefono" type="tel" inputMode="tel" className={campo} />
            </label>
            <label className="block text-sm font-semibold">
              Correo (para la confirmación)
              <input name="email" type="email" className={campo} />
            </label>
            <button type="button" onClick={() => setNueva(false)} className="text-left text-sm font-semibold text-carmin">
              ← Buscar una clienta que ya existe
            </button>
          </div>
        ) : (
          <div className="mt-3">
            <label className="block text-sm font-semibold">
              Buscar por nombre o teléfono
              <span className="relative mt-1.5 block">
                <Search aria-hidden className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gris" />
                <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className={cn(campo, "mt-0 pl-10")} autoComplete="off" />
              </span>
            </label>
            {resultadosVisibles.length > 0 && (
              <ul className="mt-2 divide-y divide-[var(--capa-borde)] rounded-2xl border border-[var(--capa-borde)]">
                {resultadosVisibles.map((c) => (
                  <li key={c.id}>
                    <button type="button" onClick={() => setClienta(c)} className="flex min-h-12 w-full flex-col items-start px-4 py-2 text-left hover:bg-rosa-niebla">
                      <span className="font-semibold">{c.nombre}</span>
                      <span className="text-xs text-gris">{c.telefono ?? "sin teléfono"}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button type="button" onClick={() => setNueva(true)} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-carmin">
              <UserPlus aria-hidden className="size-4" /> Clienta nueva
            </button>
          </div>
        )}
      </section>

      <section className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
        <h2 className="font-display text-xl font-semibold">Servicios</h2>
        {categorias.map((cat) => (
          <div key={cat} className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-carmin-suave">{cat}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {servicios
                .filter((s) => s.categoria === cat)
                .map((s) => {
                  const on = elegidos.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={on}
                      onClick={() => {
                        setHueco(null);
                        setElegidos(on ? elegidos.filter((x) => x !== s.id) : [...elegidos, s.id]);
                      }}
                      className={cn("min-h-11 rounded-full px-4 text-sm ring-1", on ? "bg-carmin text-white ring-carmin" : "bg-white ring-carmin/20")}
                    >
                      {s.nombre} · {s.duracionMin}′
                    </button>
                  );
                })}
            </div>
          </div>
        ))}
        {elegidos.length > 0 && <p className="mt-4 text-sm text-gris">Total {formatCents(total)}</p>}
      </section>

      <section className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
        <h2 className="font-display text-xl font-semibold">Cuándo y con quién</h2>
        {!staffFijo && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button type="button" onClick={() => { setStaffId(null); setHueco(null); }} aria-pressed={staffId === null} className={cn("min-h-11 rounded-full px-4 text-sm ring-1", staffId === null ? "bg-tinta text-white ring-tinta" : "bg-white ring-carmin/20")}>
              Cualquiera
            </button>
            {candidatas.map((p) => (
              <button key={p.id} type="button" onClick={() => { setStaffId(p.id); setHueco(null); }} aria-pressed={staffId === p.id} className={cn("min-h-11 rounded-full px-4 text-sm ring-1", staffId === p.id ? "bg-tinta text-white ring-tinta" : "bg-white ring-carmin/20")}>
                {p.nombre}
              </button>
            ))}
          </div>
        )}
        <div className="mt-4">
          <SelectorHueco
            servicios={elegidos}
            staffId={staffId}
            fechaInicial={fechaInicial}
            elegido={hueco?.inicio ?? null}
            onElegir={(h, f) => {
              setHueco(h);
              setFecha(f);
              if (h) setHoraManual("");
            }}
          />
        </div>
        <label className="mt-4 block text-sm font-semibold">
          …o a mano (fuera de horario, por ejemplo)
          <input type="time" value={horaManual} onChange={(e) => { setHoraManual(e.target.value); if (e.target.value) setHueco(null); }} className={cn(campo, "max-w-40")} step={300} />
        </label>
        {horaManual && !staffId && <p className="mt-2 text-sm text-carmin">Con hora a mano, elige la profesional.</p>}
      </section>

      <section className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-sm font-semibold">
            Cómo ha pedido la cita
            <select name="fuente" className={campo} defaultValue="phone">
              <option value="phone">Por teléfono</option>
              <option value="walkin">En el salón</option>
              <option value="panel">Otro (Instagram, WhatsApp…)</option>
            </select>
          </label>
          <label className="block text-sm font-semibold">
            Notas de la cita
            <input name="notas" maxLength={500} className={campo} />
          </label>
        </div>
        <label className="mt-4 flex items-start gap-3 text-sm">
          <input name="avisar" type="checkbox" defaultChecked className="mt-0.5 size-5 accent-[#2b2a2d]" />
          Enviarle la confirmación por correo (si tiene)
        </label>
      </section>

      {error && <p role="alert" className="rounded-2xl bg-white px-4 py-3 text-carmin ring-1 ring-carmin/20">{error}</p>}
      <button type="submit" disabled={guardando || elegidos.length === 0 || (!hueco && !horaManual)} className="min-h-12 w-full rounded-full bg-carmin px-6 font-semibold text-white disabled:opacity-50 sm:w-auto">
        {guardando ? "Guardando…" : "Guardar cita"}
      </button>
    </form>
  );
}
