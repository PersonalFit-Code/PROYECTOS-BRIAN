import type { Metadata } from "next";
import Asistente from "@/components/Asistente";

export const metadata: Metadata = { title: "Asistente IA · Estudio Adrián" };

export default async function Page({ searchParams }: { searchParams: Promise<{ pregunta?: string }> }) {
  const { pregunta } = await searchParams;
  return <Asistente preguntaId={pregunta} />;
}
