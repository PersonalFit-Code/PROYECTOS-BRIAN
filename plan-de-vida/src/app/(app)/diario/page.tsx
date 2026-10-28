import type { Metadata } from "next";
import Link from "next/link";
import { FormDiario } from "@/components/diario/FormDiario";
import { CARAS_ANIMO } from "@/components/diario/Escala";
import { Pagina } from "@/components/layout/Pagina";
import { Card, Seccion, Titulo, Vacio } from "@/components/ui/basicos";
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
  const actual = entradas.find((e) => e.day === dia) ?? (dia < sumarDias(hoy, -90) ? (await getDiario(s, dia, dia))[0] ?? null : null);
  const porDia = new Map(entradas.map((e) => [e.day, e]));
  const ultimos30 = diasDelRango(sumarDias(hoy, -29), hoy);

  return (
    <Pagina>
      <Titulo emoji="📓" sub="Escribe un poco cada día. En la revisión mensual se cruza con tus hábitos.">
        Diario
      </Titulo>

      <Seccion titulo="Ánimo de los últimos 30 días">
        <div className="flex gap-0.5">
          {ultimos30.map((d) => {
            const e = porDia.get(d);
            return (
              <Link
                key={d}
                href={`/diario?dia=${d}`}
                title={`${fechaCorta(d)}${e?.mood ? ` · ${CARAS_ANIMO[e.mood - 1]}` : ""}`}
                className={cx("h-8 flex-1 rounded-sm", d === dia && "ring-2 ring-accent")}
                style={{ background: e?.mood ? `color-mix(in srgb, var(--ok) ${e.mood * 20}%, var(--hover))` : "var(--hover)" }}
              />
            );
          })}
        </div>
      </Seccion>

      <Card className="mb-8">
        <h2 className="mb-4 font-semibold">{fechaLarga(dia)}</h2>
        <FormDiario key={dia} dia={dia} entrada={actual ?? null} />
      </Card>

      <Seccion titulo="Entradas anteriores">
        {entradas.filter((e) => e.day !== dia).length ? (
          <ul className="space-y-1">
            {entradas
              .filter((e) => e.day !== dia)
              .map((e) => (
                <li key={e.id}>
                  <Link href={`/diario?dia=${e.day}`} className="flex gap-3 rounded-md px-2 py-2 hover:bg-hover">
                    <span className="w-16 shrink-0 text-sm text-muted">{fechaCorta(e.day)}</span>
                    <span>{e.mood ? CARAS_ANIMO[e.mood - 1] : "·"}</span>
                    <span className="truncate text-sm">{e.body?.split("\n")[0] ?? e.gratitude ?? ""}</span>
                  </Link>
                </li>
              ))}
          </ul>
        ) : (
          <Vacio>Tu primera entrada será la de hoy.</Vacio>
        )}
      </Seccion>
    </Pagina>
  );
}
