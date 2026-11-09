"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowLeft, Bell, Bot, CalendarDays, ChartNoAxesCombined, Check, Delete, Download, Home, Inbox, LayoutDashboard, LogOut, Printer, ReceiptText, RotateCcw, Settings2, Sun, Users, Wallet, X } from "lucide-react";
import { ControlVidrio, estiloVidrio } from "@/components/ui/adjustable-glass";
import Resumen from "./Resumen";
import Movimientos from "./Movimientos";
import Informes from "./Informes";
import Notificaciones, { useAvisos } from "./Notificaciones";
import { guardarVidrio, useVidrio } from "./vidrio";
import { fotos } from "@/data/fotos";
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

export type Seccion = "resumen" | "inicio" | "clientes" | "calendario" | "movimientos" | "contabilidad" | "informes" | "solicitudes" | "asistente";

const secciones: { id: Seccion; nombre: string; corto: string; Icono: typeof Home }[] = [
  { id: "resumen", nombre: "Resumen", corto: "Resumen", Icono: LayoutDashboard },
  { id: "inicio", nombre: "Hoy en 720", corto: "Hoy", Icono: Sun },
  { id: "clientes", nombre: "Clientes", corto: "Clientes", Icono: Users },
  { id: "calendario", nombre: "Calendario", corto: "Clases", Icono: CalendarDays },
  { id: "movimientos", nombre: "Movimientos", corto: "Mov.", Icono: ReceiptText },
  { id: "contabilidad", nombre: "Contabilidad", corto: "Caja", Icono: Wallet },
  { id: "informes", nombre: "Informes", corto: "Informes", Icono: ChartNoAxesCombined },
  { id: "solicitudes", nombre: "Solicitudes", corto: "Leads", Icono: Inbox },
  { id: "asistente", nombre: "Asistente", corto: "Chat IA", Icono: Bot },
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
    <div className="relative isolate flex min-h-full flex-col items-center justify-center bg-negro px-6 py-12 text-white">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={fotos.sala.grande} alt="" className="absolute inset-0 -z-10 size-full object-cover opacity-30 grayscale" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-negro/40 via-negro/70 to-negro" aria-hidden />
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

const CLAVE_VISTO = "720panel:visto";

function saludo(h: number) {
  return h < 6 ? "Buenas noches" : h < 14 ? "Buenos días" : h < 21 ? "Buenas tardes" : "Buenas noches";
}

export default function Panel() {
  const dentro = useSyncExternalStore(suscribirAcceso, leerAcceso, () => false);
  const [seccion, setSeccion] = useState<Seccion>("resumen");
  const [filtro, setFiltro] = useState<Filtro>("Todos");
  const [fichaId, setFichaId] = useState<string | null>(null);
  const [doc, setDoc] = useState<Documento | null>(null);
  const [ajuste, setAjuste] = useState(false);
  const [alertas, setAlertas] = useState(false);
  const [menu, setMenu] = useState(false);
  const [aviso, setAviso] = useState("");
  const [vistoHasta, setVistoHasta] = useState(() => {
    try {
      return Number(localStorage.getItem(CLAVE_VISTO)) || 0;
    } catch {
      return 0;
    }
  });
  const vivos = useDatosVivos();
  const vidrio = useVidrio();
  const avisos = useAvisos();
  const contenido = useRef<HTMLDivElement>(null);
  const botonAjuste = useRef<HTMLButtonElement>(null);
  const sinLeer = avisos.filter((a) => a.fecha > vistoHasta).length;
  const hora = new Date().getHours();

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

  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(""), 3200);
    return () => window.clearTimeout(t);
  }, [aviso]);

  /* Revelado de los paneles al cambiar de vista (GSAP, solo si no se pide reducir movimiento). */
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const piezas = contenido.current?.querySelectorAll(".panel-tarjeta, .panel-tarjeta-oscura");
        if (!piezas?.length) return;
        gsap.fromTo(piezas, { y: 14, opacity: 0, filter: "blur(4px)" }, { y: 0, opacity: 1, filter: "blur(0px)", duration: 0.5, stagger: 0.05, ease: "power3.out", clearProps: "transform,opacity,filter" });
      });
      return () => mm.revert();
    },
    { scope: contenido, dependencies: [seccion, dentro], revertOnUpdate: true },
  );

  const cerrarTodo = () => {
    setAjuste(false);
    setAlertas(false);
    setMenu(false);
  };

  const ir = (s: Seccion) => {
    setSeccion(s);
    cerrarTodo();
    document.getElementById("panel-raiz")?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const leerTodo = () => {
    const t = Date.now();
    setVistoHasta(t);
    try {
      localStorage.setItem(CLAVE_VISTO, String(t));
    } catch {}
  };

  if (!dentro) {
    return (
      <div id="panel-raiz" className="fixed inset-0 z-[60] overflow-y-auto">
        <Teclado />
      </div>
    );
  }

  const actual = secciones.find((s) => s.id === seccion)!;
  const pastilla = (id: Seccion) => (id === "solicitudes" && vivos.solicitudes.length > 0 ? vivos.solicitudes.length : 0);

  return (
    <Contexto.Provider value={{ filtro, abrirFicha: setFichaId, imprimir: setDoc, avisar: setAviso }}>
      <div
        id="panel-raiz"
        className="panel-raiz fixed inset-0 z-[60] overflow-y-auto text-negro"
        style={estiloVidrio(vidrio)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            if (ajuste) botonAjuste.current?.focus();
            cerrarTodo();
          }
        }}
      >
        {/* Fondo: la sala en blanco y negro con un velo claro, para que el vidrio tenga algo que difuminar. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={fotos.sala.grande} alt="" className="fixed inset-0 -z-10 size-full object-cover grayscale" />
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(120%_80%_at_20%_0%,rgb(255_255_255/0.55),rgb(233_233_236/0.78)_55%,rgb(210_211_215/0.88))]" aria-hidden />

        <div className="relative mx-auto max-w-[1440px] px-3 pt-3 pb-28 sm:px-5 lg:pb-10">
          {/* Barra superior de vidrio */}
          <header className="panel-vidrio sticky top-3 z-30 flex h-[62px] items-center justify-between gap-3 rounded-[20px] px-3 sm:px-5">
            <button type="button" onClick={() => ir("resumen")} className="flex min-w-0 items-center gap-2.5" aria-label="720 GYM CLUB · ir al resumen">
              <span className="titular grid size-9 shrink-0 place-items-center rounded-xl bg-negro text-[17px] text-white">720</span>
              <span className="hidden h-4 w-px bg-negro/15 sm:block" aria-hidden />
              <span className="hidden text-[13px] font-semibold sm:block">Panel de gestión</span>
              <span className="rounded-full bg-negro px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">Demo</span>
            </button>
            <div className="flex items-center gap-1 sm:gap-2">
              <div className="hidden rounded-full bg-black/[0.06] p-1 md:flex" role="group" aria-label="Filtrar por entrenador">
                {(["Todos", ...entrenadores] as Filtro[]).map((f) => (
                  <button key={f} type="button" aria-pressed={filtro === f} onClick={() => setFiltro(f)} className={cn("h-8 rounded-full px-3 text-[12px] font-semibold transition", filtro === f ? "bg-negro text-white" : "text-negro/60 hover:text-negro")}>
                    {f}
                  </button>
                ))}
              </div>
              <label className="md:hidden">
                <span className="sr-only">Filtrar por entrenador</span>
                <select value={filtro} onChange={(e) => setFiltro(e.target.value as Filtro)} className="h-9 rounded-full bg-black/[0.06] px-3 text-[12px] font-semibold outline-none">
                  {(["Todos", ...entrenadores] as Filtro[]).map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </label>
              <button
                ref={botonAjuste}
                type="button"
                onClick={() => {
                  setAjuste(!ajuste);
                  setAlertas(false);
                  setMenu(false);
                }}
                aria-expanded={ajuste}
                className="flex h-9 items-center gap-2 rounded-full px-2.5 text-[13px] font-semibold transition hover:bg-black/[0.06]"
              >
                <Settings2 className={cn("size-[18px] transition duration-500", ajuste && "rotate-90")} aria-hidden />
                <span className="hidden lg:inline">Ajustar vidrio</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setAlertas(!alertas);
                  setAjuste(false);
                  setMenu(false);
                }}
                aria-expanded={alertas}
                aria-label={sinLeer ? `Notificaciones: ${sinLeer} sin leer` : "Notificaciones"}
                className="relative grid size-9 place-items-center rounded-full transition hover:bg-black/[0.06]"
              >
                <Bell className={cn("size-[18px]", sinLeer > 0 && "animate-[campana_2.4s_ease-in-out_infinite]")} aria-hidden />
                {sinLeer > 0 && <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-negro px-1 text-[9px] font-bold text-white">{sinLeer}</span>}
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setMenu(!menu);
                    setAjuste(false);
                    setAlertas(false);
                  }}
                  aria-expanded={menu}
                  aria-label="Menú de la gerencia"
                  className="grid size-9 place-items-center rounded-full bg-negro text-[13px] font-semibold text-white ring-2 ring-white/70 transition hover:scale-105"
                >
                  G
                </button>
                {menu && (
                  <div className="panel-vidrio panel-flotante pop-entra absolute top-12 right-0 z-50 grid w-60 gap-0.5 rounded-[18px] p-2 text-[13px] font-semibold" role="menu">
                    <p className="px-3 pt-1 pb-2 text-[11px] font-normal text-negro/55">Gerencia · 720 GYM CLUB</p>
                    <button type="button" role="menuitem" onClick={() => (setDoc({ tipo: "informe" }), setMenu(false))} className="flex h-10 items-center gap-3 rounded-xl px-3 hover:bg-white/70">
                      <Printer className="size-4" aria-hidden /> Informe del mes
                    </button>
                    <button type="button" role="menuitem" onClick={() => (exportarCopia({ web: vivos }), setAviso("Copia de seguridad descargada"), setMenu(false))} className="flex h-10 items-center gap-3 rounded-xl px-3 hover:bg-white/70">
                      <Download className="size-4" aria-hidden /> Copia de seguridad
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        if (window.confirm("¿Restablecer la demo? Se borran reservas, solicitudes, chats, pagos y lo apuntado en el panel en este navegador.")) {
                          borrarDemo();
                          restablecerPanel();
                          setAviso("Demo restablecida");
                        }
                        setMenu(false);
                      }}
                      className="flex h-10 items-center gap-3 rounded-xl px-3 hover:bg-white/70"
                    >
                      <RotateCcw className="size-4" aria-hidden /> Restablecer demo
                    </button>
                    <span className="my-1 h-px bg-negro/10" aria-hidden />
                    <Link href="/" className="flex h-10 items-center gap-3 rounded-xl px-3 hover:bg-white/70" role="menuitem">
                      <ArrowLeft className="size-4" aria-hidden /> Volver a la web
                    </Link>
                    <button type="button" role="menuitem" onClick={() => fijarAcceso(false)} className="flex h-10 items-center gap-3 rounded-xl px-3 hover:bg-white/70">
                      <LogOut className="size-4" aria-hidden /> Salir
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          <div className="mt-4 flex items-start gap-4">
            {/* Carril lateral (escritorio) */}
            <nav className="panel-vidrio sticky top-[92px] hidden w-[60px] shrink-0 flex-col gap-1 rounded-[24px] p-1.5 lg:flex" aria-label="Secciones del panel">
              {secciones.map(({ id, nombre, Icono }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => ir(id)}
                  aria-current={seccion === id ? "page" : undefined}
                  aria-label={nombre}
                  className={cn("group relative grid size-12 place-items-center rounded-[18px] transition", seccion === id ? "bg-negro text-white shadow-lg" : "text-negro/65 hover:bg-white/70 hover:text-negro")}
                >
                  <Icono className="size-[19px] transition group-hover:scale-110" strokeWidth={1.8} aria-hidden />
                  {pastilla(id) > 0 && <span className="absolute top-1 right-1 grid min-w-4 place-items-center rounded-full bg-negro px-1 text-[9px] font-bold text-white ring-2 ring-white">{pastilla(id)}</span>}
                  <span className="pointer-events-none absolute left-[calc(100%+12px)] z-10 rounded-lg bg-negro px-2.5 py-1.5 text-[12px] font-semibold whitespace-nowrap text-white opacity-0 shadow-lg transition group-hover:opacity-100 group-focus-visible:opacity-100">{nombre}</span>
                </button>
              ))}
            </nav>

            <main className="panel-vidrio min-w-0 flex-1 rounded-[28px] p-4 sm:p-6 lg:p-8">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[13px] text-negro/60">{seccion === "resumen" ? `${saludo(hora)}, gerencia.` : "720 GYM CLUB · gestión"}</p>
                  <h1 className="titular mt-1 text-[38px] leading-none sm:text-[46px]">{actual.nombre}</h1>
                </div>
                <p className="inline-flex items-center gap-2 self-start rounded-full bg-white/70 px-3 py-1.5 text-[12px] text-negro/60 ring-1 ring-black/5 sm:self-auto">
                  <span className="size-1.5 animate-pulse rounded-full bg-negro" aria-hidden />
                  Datos de demostración (ficticios) · lo que pasa en la web entra al momento
                </p>
              </div>
              <div ref={contenido} key={seccion} className="[&_.grid>*]:min-w-0">
                {seccion === "resumen" && <Resumen ir={ir} />}
                {seccion === "inicio" && <Inicio ir={ir} />}
                {seccion === "clientes" && <Socios />}
                {seccion === "calendario" && <Calendario />}
                {seccion === "movimientos" && <Movimientos />}
                {seccion === "contabilidad" && <Contabilidad />}
                {seccion === "informes" && <Informes />}
                {seccion === "solicitudes" && <Solicitudes />}
                {seccion === "asistente" && <Asistente />}
              </div>
            </main>
          </div>
        </div>

        {/* Dock (móvil y tableta) */}
        <nav className="panel-vidrio no-scrollbar fixed inset-x-3 bottom-3 z-40 flex gap-1 overflow-x-auto rounded-[24px] p-1.5 lg:hidden" aria-label="Secciones del panel">
          {secciones.map(({ id, corto, nombre, Icono }) => (
            <button
              key={id}
              type="button"
              onClick={() => ir(id)}
              aria-current={seccion === id ? "page" : undefined}
              aria-label={nombre}
              className={cn("relative flex min-w-[64px] flex-1 flex-col items-center gap-1 rounded-[18px] px-2 py-2 text-[10px] font-semibold transition active:scale-95", seccion === id ? "bg-negro text-white" : "text-negro/65")}
            >
              <Icono className="size-[19px]" strokeWidth={1.8} aria-hidden />
              {corto}
              {pastilla(id) > 0 && <span className="absolute top-1 right-2 size-2 rounded-full bg-negro ring-2 ring-white" aria-hidden />}
            </button>
          ))}
        </nav>

        {ajuste && (
          <aside className="panel-vidrio panel-flotante pop-entra fixed top-[84px] right-3 z-50 max-h-[calc(100vh-100px)] w-[min(340px,calc(100vw-24px))] overflow-y-auto rounded-[24px] p-5" aria-label="Ajustar vidrio">
            <div className="mb-1 flex items-center justify-between">
              <p className="subtitular text-[17px]">Ajustar vidrio</p>
              <button
                type="button"
                onClick={() => {
                  setAjuste(false);
                  botonAjuste.current?.focus();
                }}
                className="grid size-8 place-items-center rounded-full hover:bg-black/[0.06]"
                aria-label="Cerrar ajustes del vidrio"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <p className="mb-5 text-[12px] text-negro/55">Cambia el material de todo el panel. Se guarda en este navegador.</p>
            <ControlVidrio valor={vidrio} onCambio={guardarVidrio} />
          </aside>
        )}

        {alertas && (
          <Notificaciones
            avisos={avisos}
            vistoHasta={vistoHasta}
            onCerrar={() => setAlertas(false)}
            onLeer={leerTodo}
            onIr={(s) => {
              leerTodo();
              ir(s);
            }}
          />
        )}

        {aviso && (
          <div className="toast-entra fixed bottom-24 left-1/2 z-[70] flex -translate-x-1/2 items-center gap-2 rounded-full bg-negro px-4 py-2.5 text-[13px] font-semibold whitespace-nowrap text-white shadow-xl lg:bottom-8" role="status">
            <span className="grid size-5 place-items-center rounded-full bg-white text-negro">
              <Check className="size-3.5" aria-hidden />
            </span>
            {aviso}
          </div>
        )}

        {fichaId && <Ficha socioId={fichaId} onCerrar={() => setFichaId(null)} />}
      </div>
      {doc && <Imprimible doc={doc} />}
    </Contexto.Provider>
  );
}
