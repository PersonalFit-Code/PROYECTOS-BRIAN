import type { Metadata } from "next";
import { Suspense } from "react";
import Alta from "./Alta";

export const metadata: Metadata = {
  title: "Inscríbete",
  description: "Date de alta en 720 GYM CLUB en un minuto y paga online de forma segura.",
};

export default function PaginaAlta() {
  return (
    <Suspense fallback={<div className="min-h-[100svh] bg-negro" />}>
      <Alta />
    </Suspense>
  );
}
