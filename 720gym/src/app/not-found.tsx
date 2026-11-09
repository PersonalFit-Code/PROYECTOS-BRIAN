import Link from "next/link";
import { claseBoton } from "@/components/ui/Boton";

export default function NoEncontrada() {
  return (
    <section className="grid min-h-[80svh] place-items-center bg-negro pt-[var(--header-h)] text-center">
      <div className="container-page">
        <p className="titular letras-relleno text-[38vw] leading-none sm:text-[16rem]">404</p>
        <p className="subtitular mt-4 text-[28px]">Esta página no existe. Pero la sala sí.</p>
        <Link href="/" className={`${claseBoton("acento", true)} mt-8`}>
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
