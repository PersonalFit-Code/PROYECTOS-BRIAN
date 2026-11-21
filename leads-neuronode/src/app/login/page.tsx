import { KeyRound } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = { title: "Entrar" };

const AVISOS: Record<string, string> = {
  llave: "Ese enlace no vale. Comprueba que lo has copiado entero.",
  config: "El acceso no está bien configurado. Avisa a Brian.",
};

/** No hay usuario ni contraseña: se entra con el enlace de acceso del equipo (/entrar/<llave>). */
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ fallo?: string }> }) {
  const { fallo } = await searchParams;
  const aviso = fallo ? AVISOS[fallo] : null;
  return (
    <main className="grid min-h-dvh place-items-center bg-side px-4">
      <div className="w-full max-w-sm text-center">
        <Image src="/logo.svg" alt="" width={56} height={56} className="mx-auto mb-3 rounded-xl border border-line" priority />
        <h1 className="text-2xl font-extrabold tracking-tight">
          Leads neuro<span className="text-brand">·</span>node
        </h1>
        <div className="mt-6 rounded-2xl border border-line bg-bg p-5">
          <KeyRound className="mx-auto mb-2 size-6 text-brand" aria-hidden />
          <p className="font-bold">Abre tu enlace de acceso</p>
          <p className="mt-1 text-muted">Con abrirlo una vez en este navegador, ya entras siempre.</p>
          {aviso && (
            <p role="alert" className="mt-3 text-sm font-bold text-bad">
              {aviso}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
