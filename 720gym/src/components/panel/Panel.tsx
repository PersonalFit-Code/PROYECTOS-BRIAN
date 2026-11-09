"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { ArrowLeft, Bot, CalendarDays, Delete, Download, Home, Inbox, LogOut, Printer, RotateCcw, Users, Wallet } from "lucide-react";
import Logo from "@/components/ui/Logo";
import Inicio from "./Inicio";
import Contabilidad from "./Contabilidad";
import Socios from "./Socios";
import Calendario from "./Calendario";
import Solicitudes from "./Solicitudes";
import Asistente from "./Asistente";
import Ficha from "./Ficha";
import Imprimible from "./Imprimible";
import { Contexto, type Documento, type Filtro } from "./contexto";
import { exportarCopia, restablecerPanel } from "./almacen";
import { useDatosVivos } from "./datos";
import { borrarDemo } from "@/lib/demo";
import { entrenadores } from "@/data/panel-demo";
import { cn } from "@/lib/utils";

export type Seccion = "inicio" | "clientes" | "calendario" | "contabilidad" | "solicitudes" | "asistente";

const secciones: { id: Seccion; nombre: string; Icono: typeof Home }[] = [
  { id: "inicio", nombre: "Inicio", Icono: Home },
  { id: "clientes", nombre: "Clientes", Icono: Users },
  { id: "calendario", nombre: "Calendario", Icono: CalendarDays },
  { id: "contabilidad", nombre: "Contabilidad", Icono: Wallet },
  { id: "solicitudes", nombre: "Solicitudes", Icono: Inbox },
  { id: "asistente", nombre: "Asistente", Icono: Bot },
];

/*
 * ACCESO DE DEMOSTRACIÓN. El PIN 0720 se enseña en pantalla: esto NO es seguridad, es una puerta
 * para la demo. En producción el panel va detrás de Supabase Auth (cuenta de la gerencia) y los
 * datos en su base de datos con políticas de acceso.
 */
const PIN = "0720";
const CLAVE_ACCESO = "720panel:acceso";
const EVENTO_ACCESO = "720panel-acceso";
function suscribirAcceso(aviso: () => void) {
  window.addEventListener(EVENTO_ACCESO, aviso);
  return () => window.removeEventListener(EVENTO_ACCESO, aviso);
}
function leerAcceso() {
  try {
    return sessionStorage.getItem(CLAVE_ACCESO) === "1";
  } catch {
    return false;
  }
}
function fijarAcceso(si: boolean) {
  try {
    if (si) sessionStorage.setItem(CLAVE_ACCESO, "1");
    else sessionStorage.removeItem(CLAVE_ACCESO);
  } catch {}
  window.dispatchEvent(new Event(EVENTO_ACCESO));
}

function Teclado() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const pulsar = useCallback((d: string) => {
    setError(false);
    setPin((p) => {
      const nuevo = (p + d).slice(0, 4);
      if (nuevo.length === 4) {
        if (nuevo === PIN) window.setTimeout(() => fijarAcceso(true), 160);
        else {
          window.setTimeout(() => {
            setError(true);
            setPin("");
          }, 180);
        }
      }
      return nuevo;
    });
  }, []);
  const borrar = useCallback(() => setPin((p) => p.slice(0, -1)), []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (/^\d$/.test(e.key)) pulsar(e.key);
      else if (e.key === "Backspace") borrar();
    };
    window.addEventListener("keydown", tecla);
    return () => window.removeEventListener("keydown", tecla);
  }, [pulsar, borrar]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center bg-negro px-6 py-12 text-white">
      <Logo className="text-[30px]" />
      <p className="subtitular mt-8 text-[26px]">Panel de gestión</p>
      <p className="mt-2 text-center text-[14px] text-white/60">Acceso exclusivo para la gerencia de 720</p>
      <div className={cn("mt-8 flex gap-4", error && "animate-[temblor_0.35s]")} aria-live="polite" aria-label={`${pin.length} de 4 dígitos`}>
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={cn("size-4 rounded-full ring-1 ring-white/50 transition", i < pin.length && "bg-white ring-white")} />
        ))}
      </div>
      <p className="mt-3 h-5 text-[13px] text-white/70" role="alert">
        {error ? "PIN incorrecto" : ""}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-3">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
          <button key={d} type="button" onClick={() => pulsar(d)} className="titular grid size-[4.5rem] place-items-center rounded-full bg-white/8 text-[32px] transition hover:bg-white/15 active:scale-95 active:bg-white active:text-negro">
            {d}
          </button>
        ))}
        <span aria-hidden />
        <button type="button" onClick={() => pulsar("0")} className="titular grid size-[4.5rem] place-items-center rounded-full bg-white/8 text-[32px] transition hover:bg-white/15 active:scale-95 active:bg-white active:text-negro">
          0
        </button>
        <button type="button" onClick={borrar} className="grid size-[4.5rem] place-items-center rounded-full text-white/70 transition hover:text-white active:scale-95" aria-label="Borrar">
          <Delete className="size-6" />
        </button>
      </div>
      <p className="mt-10 border border-dashed border-white/25 px-4 py-2 text-[12px] text-white/60">
        Demo · PIN: <strong className="tracking-[0.2em] text-white">0720</strong>
      </p>
      <Link href="/" className="mt-6 flex items-center gap-1.5 text-[13px] text-white/55 hover:text-white">
        <ArrowLeft className="size-4" aria-hidden /> Volver a la web
      </Link>
      <style>{`@keyframes temblor{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
    </div>
  );
}

export default function Panel() {
  const dentro = useSyncExternalStore(suscribirAcceso, leerAcceso, () => false);
  const [seccion, setSeccion] = useState<Seccion>("inicio");
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [fichaId, setFichaId] = useState<string | null>(null);
  const [doc, setDoc] = useState<Documento | null>(null);
  const vivos = useDatosVivos();

  /* Imprimir: se monta el documento y, en el siguiente fotograma, se abre el diálogo del navegador. */
  useEffect(() => {
    if (!doc) return;
    const fin = () => setDoc(null);
    window.addEventListener("afterprint", fin);
    const t = window.setTimeout(() => window.print(), 120);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("afterprint", fin);
    };
  }, [doc]);

  const ir = (s: Seccion) => {
    setSeccion(s);
    document.getElementById("panel-raiz")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!dentro) {
    return (
      <div id="panel-raiz" className="fixed inset-0 z-[60] overflow-y-auto">
        <Teclado />
      </div>
    );
  }

  const actual = secciones.find((s) => s.id === seccion)!;

  return (
    <Contexto.Provider value={{ filtro, abrirFicha: setFichaId, imprimir: setDoc }}>
      <div id="panel-raiz" className="fixed inset-0 z-[60] overflow-y-auto bg-pared text-negro">
        {/* Barra lateral (escritorio) */}
        <aside className="fixed inset-y-0 left-0 hidden w-60 flex-col bg-negro px-4 py-6 text-white lg:flex">
          <Link href="/" className="px-2 text-[20px]" aria-label="720 GYM CLUB, ir a la web">
            <Logo />
          </Link>
          <p className="mt-2 px-2 text-[11px] font-semibold tracking-[0.2em] text-white/45 uppercase">Gestión</p>
          <nav className="mt-8 grid gap-1" aria-label="Secciones del panel">
            {secciones.map(({ id, nombre, Icono }) => (
              <button
                key={id}
                type="button"
                onClick={() => ir(id)}
                aria-current={seccion === id ? "page" : undefined}
                className={cn("flex h-11 items-center gap-3 px-3 text-[14px] font-semibold transition", seccion === id ? "bg-white text-negro" : "text-white/70 hover:bg-white/8 hover:text-white")}
              >
                <Icono className="size-[18px]" aria-hidden />
                {nombre}
                {id === "solicitudes" && vivos.solicitudes.length > 0 && <span className="ml-auto grid min-w-5 place-items-center rounded-full bg-white px-1.5 text-[11px] text-negro">{vivos.solicitudes.length}</span>}
              </button>
            ))}
          </nav>
          <div className="mt-auto grid gap-1 border-t border-white/10 pt-4 text-[13px]">
            <Link href="/" className="flex h-10 items-center gap-3 px-3 text-white/60 hover:text-white">
              <ArrowLeft className="size-4" aria-hidden /> Volver a la web
            </Link>
            <button type="button" onClick={() => fijarAcceso(false)} className="flex h-10 items-center gap-3 px-3 text-white/60 hover:text-white">
              <LogOut className="size-4" aria-hidden /> Salir
            </button>
          </div>
        </aside>

        <div className="lg:pl-60">
          {/* Cabecera */}
          <header className="sticky top-0 z-20 border-b border-black/[0.06] bg-pared/95 backdrop-blur">
            <div className="flex items-center justify-between gap-3 bg-negro px-4 py-3 text-white lg:hidden">
              <Link href="/" className="text-[16px]" aria-label="Ir a la web">
                <Logo />
              </Link>
              <button type="button" onClick={() => fijarAcceso(false)} className="flex items-center gap-1.5 text-[12px] text-white/70">
                <LogOut className="size-4" aria-hidden /> Salir
              </button>
            </div>
            <nav className="no-scrollbar flex gap-1 overflow-x-auto bg-negro px-3 pb-3 lg:hidden" aria-label="Secciones del panel">
              {secciones.map(({ id, nombre, Icono }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => ir(id)}
                  aria-current={seccion === id ? "page" : undefined}
                  className={cn("flex h-9 shrink-0 items-center gap-2 px-3 text-[13px] font-semibold", seccion === id ? "bg-white text-negro" : "text-white/70")}
                >
                  <Icono className="size-4" aria-hidden />
                  {nombre}
                </button>
              ))}
            </nav>
            <div className="flex flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
              <div>
                <h1 className="titular text-[34px] sm:text-[40px]">{actual.nombre}</h1>
                <p className="mt-1 inline-flex items-center gap-2 text-[12px] text-negro/55">
                  <span className="bg-negro px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">Demo</span>
                  Datos de demostración (ficticios) · lo que hagas en la web aparece aquí al momento
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex bg-white ring-1 ring-black/10" role="group" aria-label="Filtrar por entrenador">
                  {(["Todos", ...entrenadores] as Filtro[]).map((f) => (
                    <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)} className={cn("h-10 px-3 text-[13px] font-semibold transition", filtro === f ? "bg-negro text-white" : "text-negro/65 hover:text-negro")}>
                      {f}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setDoc({ tipo: "informe" })} className="inline-flex h-10 items-center gap-2 bg-white px-3 text-[13px] font-semibold ring-1 ring-black/10 hover:ring-negro" title="Informe del mes para imprimir">
                  <Printer className="size-4" aria-hidden /> <span className="hidden sm:inline">Informe</span>
                </button>
                <button type="button" onClick={() => exportarCopia({ web: vivos })} className="inline-flex h-10 items-center gap-2 bg-white px-3 text-[13px] font-semibold ring-1 ring-black/10 hover:ring-negro" title="Exportar copia JSON">
                  <Download className="size-4" aria-hidden /> <span className="hidden sm:inline">Copia</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("¿Restablecer la demo? Se borran reservas, solicitudes, chats, pagos y lo apuntado en el panel en este navegador.")) {
                      borrarDemo();
                      restablecerPanel();
                    }
                  }}
                  className="inline-flex h-10 items-center gap-2 px-3 text-[13px] font-semibold text-negro/60 hover:text-negro"
                  title="Restablecer demo"
                >
                  <RotateCcw className="size-4" aria-hidden /> <span className="hidden xl:inline">Restablecer demo</span>
                </button>
              </div>
            </div>
          </header>

          <div className="px-4 pt-2 pb-16 sm:px-6 lg:px-8 [&_.grid>*]:min-w-0">
            {seccion === "inicio" && <Inicio ir={ir} />}
            {seccion === "clientes" && <Socios />}
            {seccion === "calendario" && <Calendario />}
            {seccion === "contabilidad" && <Contabilidad />}
            {seccion === "solicitudes" && <Solicitudes />}
            {seccion === "asistente" && <Asistente />}
          </div>
        </div>

        {fichaId && <Ficha socioId={fichaId} onCerrar={() => setFichaId(null)} />}
      </div>
      {doc && <Imprimible doc={doc} />}
    </Contexto.Provider>
  );
}
