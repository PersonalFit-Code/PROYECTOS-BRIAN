import TestCliente from "@/components/TestCliente";
import type { Modo } from "@/lib/progreso";

const MODOS: Modo[] = ["tema", "examen", "fallos"];

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ modo?: string; tema?: string; correccion?: string; errores?: string }>;
}) {
  const { modo, tema, correccion, errores } = await searchParams;
  const m = MODOS.includes(modo as Modo) ? (modo as Modo) : "tema";
  return (
    <TestCliente
      modo={m}
      temaId={tema}
      correccion={correccion === "estudio" ? "estudio" : "examen"}
      errores={errores === "todas" ? "todas" : "pendientes"}
    />
  );
}
