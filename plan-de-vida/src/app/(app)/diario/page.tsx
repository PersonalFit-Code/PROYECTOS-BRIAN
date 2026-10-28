import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, CalendarHeart, History, PenLine } from "lucide-react";
import { CARAS_ANIMO } from "@/components/diario/Escala";
import { FormDiario } from "@/components/diario/FormDiario";
import { Pagina } from "@/components/layout/Pagina";
import { Titulo, Vacio } from "@/components/ui/basicos";
import { Desplegable } from "@/components/ui/Desplegable";
import { getDiario } from "@/lib/datos/consultas";
import { diasDelRango, fechaCorta, fechaLarga, hoy as hoyMadrid, sumarDias } from "@/lib/fechas";
import { cx } from "@/lib/formato";
import { getSesion } from "@/lib/sesion";

export const metadata: Metadata = { title: "Diario" };

export default async function DiarioPage({ searchParams }: { searchParams: Promise<{ dia?: string }> }) {
  const sp = await searchParams;
  const hoy = hoyMadrid();
  const dia = /^\d{4}-\d{2}-\d{2}$/.test(sp.dia ?? "") && sp.dia! <= hoy ? sp.dia! : hoy;
  const s = await getSesion();
  const entradas = await getDiario(s, sumarDias(hoy, -90), hoy);
  const actual = entradas.find((e) => e.day === dia) ?? (dia < sumarDias(hoy, -90) ? ((await getDiario(s, dia, dia))[0] ?? null) : null);
  const porDia = new Map(entradas.map((e) => [e.day, e]));
  const ultimos30 = diasDelRango(sumarDias(hoy, -29), hoy);
  const anteriores = entradas.filter((e) => e.day !== dia);

  return (
    <Pagina>
      <Titulo icono={<BookOpen />} color="gray" sub="Escribe un poco cada día. En la revisión mensual se cruza con tus hábitos.">
        Diario
      </Titulo>

      <Desplegable icono={<PenLine />} color="blue" titulo={dia === hoy ? "Hoy" : fechaLarga(dia)} resumen={actual ? "Escrito" : "Pendiente"} abierto i={1}>
        <FormDiario key={dia} dia={dia} entrada={actual ?? null} />
      </Desplegable>

      <Desplegable icono={<CalendarHeart />} color="green" titulo="Ánimo de los últimos 30 días" i={2}>
        <div className="grid grid-cols-10 gap-1.5">
          {ultimos30.map((d) => {
            const e = porDia.get(d);
            const Cara = e?.mood ? CARAS_ANIMO[e.mood - 1] : null;
            return (
              <Link
                key={d}
                href={`/diario?dia=${d}`}
                title={fechaCorta(d)}
                className={cx("grid aspect-square place-items-center rounded-xl transition hover:scale-105", d === dia && "ring-2 ring-accent")}
                style={{ background: e?.mood ? `color-mix(in srgb, var(--ok) ${e.mood * 18}%, transparent)` : "var(--hover)" }}
              >
                {Cara && <Cara className="size-4 text-fg/70" />}
              </Link>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-muted">Toca un día para verlo o escribirlo.</p>
      </Desplegable>

      <Desplegable icono={<History />} color="gray" titulo="Entradas anteriores" resumen={`${anteriores.length}`} i={3}>
        {anteriores.length ? (
          <ul className="space-y-1">
            {anteriores.map((e) => {
              const Cara = e.mood ? CARAS_ANIMO[e.mood - 1] : null;
              return (
                <li key={e.id}>
                  <Link href={`/diario?dia=${e.day}`} className="flex items-center gap-3 rounded-xl px-2 py-2 transition hover:bg-hover">
                    <span className="w-14 shrink-0 text-sm text-muted">{fechaCorta(e.day)}</span>
                    {Cara ? <Cara className="size-4 shrink-0 text-muted" /> : <span className="size-4" />}
                    <span className="truncate text-sm">{e.body?.split("\n")[0] ?? e.gratitude ?? ""}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <Vacio>Tu primera entrada será la de hoy.</Vacio>
        )}
      </Desplegable>
    </Pagina>
  );
}
