import type { Metadata } from "next";
import { Suspense } from "react";
import Alta from "./Alta";

export const metadata: Metadata = {
  title: "Inscríbete",
  description:
    "Date de alta en 720 GYM CLUB (Ourense) en un minuto: elige gimnasio, entrenamiento personal o Pilates y paga online con tarjeta, Apple Pay o Google Pay.",
  alternates: { canonical: "/alta" },
};

export default function PaginaAlta() {
  return (
    <Suspense
      fallback={
        <section className="min-h-[100svh] bg-negro pt-[calc(var(--header-h)+2rem)]">
          <h1 className="container-page titular mt-16 text-[clamp(2.4rem,4.6vw,3.6rem)]">Inscríbete</h1>
        </section>
      }
    >
      <Alta />
    </Suspense>
  );
}
