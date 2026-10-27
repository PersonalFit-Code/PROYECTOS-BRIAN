import TestCliente from "@/components/TestCliente";
import type { Modo } from "@/lib/progreso";

const MODOS: Modo[] = ["tema", "examen", "fallos"];

export default async function Page({ searchParams }: { searchParams: Promise<{ modo?: string; tema?: string }> }) {
  const { modo, tema } = await searchParams;
  const m = MODOS.includes(modo as Modo) ? (modo as Modo) : "tema";
  return <TestCliente modo={m} temaId={tema} />;
}
