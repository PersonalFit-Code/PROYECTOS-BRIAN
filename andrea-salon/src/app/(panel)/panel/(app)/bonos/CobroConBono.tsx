"use client";

import { ScanLine, X } from "lucide-react";
import { useId, useRef, useState, useTransition } from "react";
import EscanerQr from "@/components/panel/EscanerQr";
import { formatearEuros } from "@/lib/money";
import { cn } from "@/lib/utils";
import { consultarBono } from "./acciones";
import { codigoDeLectura, ESTADO_BONO, type ResumenBono } from "./comun";

/**
 * La parte «Bono» del formulario de cobro de una cita. Vive DENTRO del `<form>` de la cita y no
 * envía nada por su cuenta: deja sus valores en campos con nombre (`bono`, `importeBono`, `resto`,
 * `metodoResto`, `bonoListo`) y es el formulario de la cita quien los lee al cobrar. Así el cobro
 * con bono no necesita otro botón ni otro formulario.
 *
 * En cuanto el código está completo (tecleado o escaneado) se comprueba el bono, para avisar de que
 * está gastado o caducado ANTES de cerrar la cita, y para saber si hay que pedir un importe.
 */
const campo =
  "block min-h-12 w-full min-w-0 rounded-2xl border border-carmin/20 bg-white px-4 text-[16px] text-tinta focus:border-carmin focus:outline-none focus:ring-2 focus:ring-carmin/20";

/** 2550 → "25,50": lo que se escribiría a mano en el campo. */
const aTexto = (c: number) => `${Math.trunc(c / 100)},${String(c % 100).padStart(2, "0")}`;

type MetodoResto = "card" | "cash" | "bizum";

export default function CobroConBono({ totalCents }: { totalCents: number }) {
  const id = useId();
  const dialogo = useRef<HTMLDialogElement>(null);
  /** El último código pedido: si llegan dos respuestas, solo vale la del último. */
  const pedido = useRef<string | null>(null);
  const [codigo, setCodigo] = useState("");
  const [bono, setBono] = useState<ResumenBono | null>(null);
  const [problema, setProblema] = useState<string | null>(null);
  const [comprobando, comprobar] = useTransition();
  const [escaneando, setEscaneando] = useState(false);
  const [avisoEscaner, setAvisoEscaner] = useState<string | null>(null);
  const [importe, setImporte] = useState("");
  const [resto, setResto] = useState("");
  const [metodoResto, setMetodoResto] = useState<MetodoResto>("card");

  const buscar = (texto: string) => {
    const code = codigoDeLectura(texto);
    if (code === pedido.current) return;
    pedido.current = code;
    setBono(null);
    setProblema(null);
    if (!code) return;
    comprobar(async () => {
      const r = await consultarBono(code);
      if (pedido.current !== code) return;
      if (!r.ok) {
        setProblema(r.error);
        return;
      }
      const b = r.datos ?? null;
      setBono(b);
      if (b && !b.usable) setProblema(b.estado === "active" ? "A ese bono no le queda nada." : `Este bono está ${ESTADO_BONO[b.estado].toLowerCase()}: no se puede usar.`);
      if (b?.kind === "gift") {
        // Lo que cubre la tarjeta, y lo que falte, aparte.
        const cubre = Math.min(totalCents, b.balanceCents ?? 0);
        setImporte(aTexto(cubre));
        setResto(totalCents > cubre ? aTexto(totalCents - cubre) : "");
      } else {
        setImporte("");
        setResto("");
      }
    });
  };

  const alEscanear = (texto: string) => {
    const code = codigoDeLectura(texto);
    if (!code) {
      setAvisoEscaner("Ese QR no es de un bono de Andrea Salón.");
      return;
    }
    setCodigo(code);
    setAvisoEscaner(null);
    dialogo.current?.close();
    buscar(code);
  };

  return (
    <div className="mt-3 space-y-3 rounded-2xl bg-crema p-4">
      <label htmlFor={`${id}-codigo`} className="block text-sm font-semibold">
        Código del bono
      </label>
      <div className="flex gap-2">
        <input
          id={`${id}-codigo`}
          name="bono"
          value={codigo}
          onChange={(e) => {
            setCodigo(e.target.value);
            buscar(e.target.value);
          }}
          placeholder="AS-XXXX-XXXX"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          maxLength={200}
          aria-describedby={`${id}-estado`}
          className={cn(campo, "flex-1 uppercase tracking-[0.08em] placeholder:normal-case placeholder:tracking-normal")}
        />
        <button
          type="button"
          onClick={() => {
            setAvisoEscaner(null);
            setEscaneando(true);
            dialogo.current?.showModal();
          }}
          className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-tinta px-4 text-sm font-semibold text-white"
        >
          <ScanLine aria-hidden className="size-5" /> Escanear
        </button>
      </div>

      <div id={`${id}-estado`} role="status" aria-live="polite" className="text-sm">
        {comprobando && <p className="text-gris">Comprobando el bono…</p>}
        {!comprobando && bono && (
          <p className={cn("rounded-2xl px-3 py-2", bono.usable ? "bg-white ring-1 ring-carmin/15" : "bg-white text-carmin ring-1 ring-carmin/30")}>
            <span className="font-semibold">{bono.nombre}</span>
            {bono.paraQuien && ` · para ${bono.paraQuien}`}
            <span className="block">
              {bono.queda} · {bono.caducidad}
            </span>
          </p>
        )}
        {!comprobando && problema && <p className="mt-1 font-semibold text-carmin">{problema}</p>}
      </div>

      {/* El formulario de la cita solo cobra con bono si esto está: el bono existe y se puede usar. */}
      {bono?.usable && <input type="hidden" name="bonoListo" value={bono.code} />}

      {bono?.usable && bono.kind === "gift" && (
        <label className="block text-sm font-semibold">
          Importe a descontar de la tarjeta (€)
          <input
            name="importeBono"
            inputMode="decimal"
            autoComplete="off"
            value={importe}
            onChange={(e) => setImporte(e.target.value)}
            className={cn(campo, "mt-1.5")}
            aria-describedby={`${id}-saldo`}
          />
          <span id={`${id}-saldo`} className="mt-1 block text-xs font-normal text-gris">
            Le quedan {formatearEuros(bono.balanceCents ?? 0)}.
          </span>
        </label>
      )}

      {bono?.usable && (
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Paga algo aparte</legend>
          <p className="text-xs text-gris">
            {bono.kind === "gift" ? "Si el saldo no llega para todo, lo que falta." : "Si hay algo que el bono no cubre (un extra, otro servicio)."} Déjalo vacío si no.
          </p>
          <div className="flex flex-wrap gap-2">
            <label className="min-w-0 flex-1 basis-32">
              <span className="sr-only">Importe aparte (€)</span>
              <input
                name="resto"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0"
                value={resto}
                onChange={(e) => setResto(e.target.value)}
                className={campo}
              />
            </label>
            <input type="hidden" name="metodoResto" value={metodoResto} />
            <div className="flex flex-wrap gap-2">
              {([["card", "Tarjeta"], ["cash", "Efectivo"], ["bizum", "Bizum"]] as const).map(([v, l]) => (
                <button
                  key={v}
                  type="button"
                  aria-pressed={metodoResto === v}
                  onClick={() => setMetodoResto(v)}
                  className={cn("min-h-12 rounded-full px-4 text-sm font-semibold ring-1", metodoResto === v ? "bg-tinta text-white ring-tinta" : "bg-white ring-carmin/20")}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </fieldset>
      )}

      <dialog
        ref={dialogo}
        onClose={() => setEscaneando(false)}
        aria-labelledby={`${id}-titulo`}
        className="fixed inset-0 m-auto h-fit max-h-[90dvh] w-[calc(100%-2rem)] max-w-md overflow-hidden rounded-3xl border-0 bg-white p-0 text-tinta shadow-[var(--shadow-card)] backdrop:bg-tinta/60"
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3">
          <h2 id={`${id}-titulo`} className="font-display text-lg font-semibold">
            Escanear el bono
          </h2>
          <button
            type="button"
            onClick={() => dialogo.current?.close()}
            aria-label="Cerrar el escáner"
            className="inline-flex size-11 items-center justify-center rounded-full hover:bg-rosa-niebla"
          >
            <X aria-hidden className="size-5" />
          </button>
        </div>
        {/* Solo montado con el diálogo abierto: la cámara se enciende al abrir y se apaga al cerrar. */}
        {escaneando && <EscanerQr onCodigo={alEscanear} className="aspect-square w-full" />}
        <p role="status" aria-live="polite" className={avisoEscaner ? "px-4 py-3 text-sm text-carmin" : "sr-only"}>
          {avisoEscaner}
        </p>
        <p className="px-4 pb-4 pt-2 text-xs text-gris">¿No lo lee? Cierra y escribe el código a mano.</p>
      </dialog>
    </div>
  );
}
