"use client";

import { ScanLine } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { codigoDeLectura } from "./comun";

/**
 * El campo para escribir el código a mano. Está SIEMPRE a la vista, también junto a la cámara: el
 * QR de un móvil con la pantalla rota o de un papel arrugado no siempre se lee, y la clienta no
 * debería esperar a que la cámara se rinda. Acepta el código con o sin guiones, en minúsculas, o
 * la URL entera pegada del correo.
 */
export default function CanjearCodigo({ conEscaner = true, oscuro = false }: { conEscaner?: boolean; oscuro?: boolean }) {
  const router = useRouter();
  const id = useId();
  const [error, setError] = useState<string | null>(null);
  const [yendo, empezar] = useTransition();

  return (
    <form
      noValidate
      onSubmit={(ev) => {
        ev.preventDefault();
        const code = codigoDeLectura(String(new FormData(ev.currentTarget).get("codigo") ?? ""));
        if (!code) {
          setError("Ese código no tiene buena pinta: son 8 letras y números, como AS-7K3M-Q9ZD.");
          return;
        }
        setError(null);
        empezar(() => router.push(`/panel/bonos/${code}`));
      }}
    >
      <label htmlFor={`${id}-codigo`} className={cn("block text-sm font-semibold", oscuro ? "text-white" : "text-tinta")}>
        Código del bono
      </label>
      <div className="mt-1.5 flex gap-2">
        <input
          id={`${id}-codigo`}
          name="codigo"
          placeholder="AS-XXXX-XXXX"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="characters"
          spellCheck={false}
          enterKeyHint="go"
          maxLength={200}
          aria-invalid={error ? true : undefined}
          aria-describedby={`${id}-error`}
          className="min-h-12 min-w-0 flex-1 rounded-2xl border border-carmin/20 bg-white px-4 text-[16px] uppercase tracking-[0.08em] text-tinta placeholder:normal-case placeholder:tracking-normal focus:border-carmin focus:outline-none focus:ring-2 focus:ring-carmin/20"
        />
        <button type="submit" disabled={yendo} className="min-h-12 shrink-0 rounded-full bg-carmin px-5 font-semibold text-white disabled:opacity-60">
          {yendo ? "Abriendo…" : "Abrir"}
        </button>
      </div>
      <p id={`${id}-error`} role="status" aria-live="polite" className={cn("text-sm", error ? "mt-2" : "sr-only", oscuro ? "text-rosa" : "text-carmin")}>
        {error}
      </p>
      {conEscaner && (
        <Link
          href="/panel/bonos/escanear"
          className="mt-3 flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-tinta px-5 font-semibold text-white sm:w-auto sm:inline-flex"
        >
          <ScanLine aria-hidden className="size-5" /> Escanear QR
        </Link>
      )}
    </form>
  );
}
