"use client";

import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import EscanerQr from "@/components/panel/EscanerQr";
import CanjearCodigo from "../CanjearCodigo";
import { codigoDeLectura } from "../comun";

/**
 * El escáner a pantalla completa (por encima de la barra del panel): en el mostrador se usa con una
 * mano y la cámara tiene que ser lo más grande posible. Abajo, siempre, el campo para escribir el
 * código: si el QR no se deja leer, no hay que salir de aquí para teclearlo.
 */
export default function PantallaEscaner() {
  const router = useRouter();
  const [aviso, setAviso] = useState<string | null>(null);
  const [abriendo, setAbriendo] = useState<string | null>(null);

  const alLeer = (texto: string) => {
    const code = codigoDeLectura(texto);
    if (!code) {
      setAviso("Ese QR no es de un bono de Andrea Salón. Prueba con el del correo o escribe el código.");
      return;
    }
    // Al quitar el escáner de la pantalla se apaga la cámara antes de cambiar de página.
    setAbriendo(code);
    router.push(`/panel/bonos/${code}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-tinta">
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-[max(env(safe-area-inset-top),0.75rem)] text-white">
        <h1 className="font-display text-xl font-semibold">Escanear bono</h1>
        <Link
          href="/panel/bonos"
          aria-label="Cerrar el escáner"
          className="inline-flex size-11 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
        >
          <X aria-hidden className="size-5" />
        </Link>
      </div>

      {abriendo ? (
        <div className="flex min-h-0 flex-1 items-center justify-center px-6 text-center text-white">
          <p role="status" aria-live="polite" className="text-lg">
            Abriendo el bono <span className="font-mono font-semibold tracking-[0.08em]">{abriendo}</span>…
          </p>
        </div>
      ) : (
        <EscanerQr onCodigo={alLeer} className="min-h-0 flex-1" />
      )}

      <div className="rounded-t-3xl bg-crema px-4 pb-[max(env(safe-area-inset-bottom),1rem)] pt-4">
        <p role="status" aria-live="polite" className={aviso ? "mb-3 rounded-2xl bg-white px-4 py-3 text-sm text-carmin ring-1 ring-carmin/20" : "sr-only"}>
          {aviso}
        </p>
        <CanjearCodigo conEscaner={false} />
      </div>
    </div>
  );
}
