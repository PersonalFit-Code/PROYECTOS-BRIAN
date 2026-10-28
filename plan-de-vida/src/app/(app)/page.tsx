import type { Metadata } from "next";
import Link from "next/link";
import { Chat, type MensajeChat } from "@/components/coach/Chat";
import ShaderBackground from "@/components/ui/shader-background";
import { getAjustes, getHabitos, getLogs, getMovimientos } from "@/lib/datos/consultas";
import { hoy as hoyMadrid, inicioDia, mesDe, rangoMes } from "@/lib/fechas";
import { euros } from "@/lib/formato";
import { cumplido, indexar, toca } from "@/lib/habitos/metricas";
import { getSesion } from "@/lib/sesion";
import { n } from "@/lib/tipos";

export const metadata: Metadata = { title: "Inicio" };

export default async function InicioPage({ searchParams }: { searchParams: Promise<{ pregunta?: string }> }) {
  const sp = await searchParams;
  const hoy = hoyMadrid();
  const s = await getSesion();
  const mes = rangoMes(mesDe(hoy));
  const [ajustes, habitos, logs, movimientos, { data: chat }] = await Promise.all([
    getAjustes(s),
    getHabitos(s),
    getLogs(s, hoy, hoy),
    getMovimientos(s, mes.desde, mes.hasta),
    // la conversación de hoy sigue abierta; la de días anteriores queda guardada pero no se muestra
    s.db.from("chat_messages").select("role, content, created_at").eq("user_id", s.userId).gte("created_at", inicioDia(hoy)).order("created_at").limit(30),
  ]);

  const porHabito = indexar(logs);
  const deHoy = habitos.filter((h) => toca(h, hoy) && !h.weekly_target);
  const hechos = deHoy.filter((h) => cumplido(h, porHabito.get(h.id)?.get(hoy))).length;
  const gastado = movimientos.filter((m) => m.kind === "gasto").reduce((a, m) => a + n(m.amount), 0);

  return (
    <div className="relative isolate min-h-dvh overflow-hidden">
      <ShaderBackground className="-z-10" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-black/10 via-transparent to-black/40" />
      <div className="flex min-h-dvh flex-col px-4 pt-6 pb-28 md:pb-10">
        <div className="mx-auto flex w-full max-w-2xl flex-wrap justify-center gap-2 text-xs">
          <Link href="/hoy" className="rounded-full bg-white/10 px-3 py-1 text-white/90 ring-1 ring-white/15 backdrop-blur hover:bg-white/20">
            ✅ {hechos}/{deHoy.length} hábitos hoy
          </Link>
          <Link href="/finanzas" className="rounded-full bg-white/10 px-3 py-1 text-white/90 ring-1 ring-white/15 backdrop-blur hover:bg-white/20">
            💸 {euros(gastado, false)} este mes
          </Link>
        </div>
        <div className="flex flex-1 flex-col justify-center">
          <Chat nombre={ajustes.display_name} iniciales={(chat ?? []) as MensajeChat[]} preguntaInicial={sp.pregunta?.slice(0, 500)} />
        </div>
      </div>
    </div>
  );
}
