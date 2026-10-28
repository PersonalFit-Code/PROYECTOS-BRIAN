import type { Metadata } from "next";
import { Cuenta } from "@/components/finanzas/Cuenta";
import { GraficaPatrimonio } from "@/components/finanzas/GraficaPatrimonio";
import { Boton, Campo, Card, Etiqueta, Kpi, Seccion, Selector, Titulo, Vacio } from "@/components/ui/basicos";
import { FormAccion } from "@/components/ui/FormAccion";
import { getCuentas } from "@/lib/datos/consultas";
import { mesDe, hoy, NOMBRES_MES } from "@/lib/fechas";
import { euros, signo } from "@/lib/formato";
import { getSesion } from "@/lib/sesion";
import { patrimonioNeto } from "@/lib/finanzas";
import { n, type AccountKind, type AccountSnapshot } from "@/lib/tipos";
import { crearCuenta } from "../acciones";

export const metadata: Metadata = { title: "Patrimonio" };

const GRUPOS: { kind: AccountKind; titulo: string }[] = [
  { kind: "liquidez", titulo: "💶 Liquidez" },
  { kind: "inversion", titulo: "📈 Inversiones" },
  { kind: "otro", titulo: "🏠 Otros activos" },
  { kind: "deuda", titulo: "💳 Deudas" },
];

export default async function PatrimonioPage() {
  const s = await getSesion();
  const cuentas = await getCuentas(s);
  const { data: fotos } = await s.db.from("account_snapshots").select("account_id, month, balance").eq("user_id", s.userId).order("month");
  const tipoDe = new Map(cuentas.map((c) => [c.id, c.kind]));

  // Neto por mes a partir de las fotos de principio de mes (las cuentas borradas siguen contando en su mes).
  const porMes = new Map<string, number>();
  for (const f of (fotos ?? []) as AccountSnapshot[]) {
    const mes = f.month.slice(0, 7);
    const signoCuenta = tipoDe.get(f.account_id) === "deuda" ? -1 : 1;
    porMes.set(mes, (porMes.get(mes) ?? 0) + signoCuenta * n(f.balance));
  }
  const neto = patrimonioNeto(cuentas);
  porMes.set(mesDe(hoy()), neto);
  const serie = [...porMes].sort(([a], [b]) => a.localeCompare(b)).slice(-12).map(([mes, v]) => ({ mes: `${NOMBRES_MES[Number(mes.slice(5)) - 1].slice(0, 3)} ${mes.slice(2, 4)}`, neto: v }));
  const haceUnAno = serie.length > 1 ? serie[0].neto : null;

  const total = (k: AccountKind) => cuentas.filter((c) => c.kind === k).reduce((a, c) => a + n(c.balance), 0);

  return (
    <>
      <Titulo emoji="🏦" sub="Actualiza los saldos cuando quieras; el día 1 de cada mes se guarda una foto para la gráfica.">
        Patrimonio
      </Titulo>
      <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi etiqueta="Patrimonio neto" valor={euros(neto, false)} tono={neto >= 0 ? "ok" : "bad"} detalle={haceUnAno != null && haceUnAno !== 0 ? `${signo((100 * (neto - haceUnAno)) / Math.abs(haceUnAno))} en el periodo` : undefined} />
        <Kpi etiqueta="Liquidez" valor={euros(total("liquidez"), false)} />
        <Kpi etiqueta="Invertido" valor={euros(total("inversion"), false)} />
        <Kpi etiqueta="Deudas" valor={euros(total("deuda"), false)} tono={total("deuda") > 0 ? "bad" : undefined} />
      </div>

      {serie.length > 1 && (
        <Seccion titulo="Evolución">
          <Card className="p-2">
            <GraficaPatrimonio datos={serie} />
          </Card>
        </Seccion>
      )}

      <div className="grid gap-8 lg:grid-cols-2">
        <div>
          {cuentas.length ? (
            GRUPOS.map((g) => {
              const delGrupo = cuentas.filter((c) => c.kind === g.kind);
              if (!delGrupo.length) return null;
              return (
                <Seccion key={g.kind} titulo={`${g.titulo} · ${euros(total(g.kind), false)}`}>
                  <ul>
                    {delGrupo.map((c) => (
                      <Cuenta key={c.id} cuenta={c} />
                    ))}
                  </ul>
                </Seccion>
              );
            })
          ) : (
            <Vacio>Añade tus cuentas, inversiones y deudas para ver tu patrimonio neto.</Vacio>
          )}
        </div>
        <Seccion titulo="Añadir cuenta">
          <Card>
            <FormAccion accion={crearCuenta} className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <Etiqueta label="Nombre">
                  <Campo name="name" required placeholder="Cuenta nómina, MyInvestor, hipoteca…" />
                </Etiqueta>
              </div>
              <Etiqueta label="Tipo">
                <Selector name="kind" defaultValue="liquidez">
                  <option value="liquidez">Liquidez</option>
                  <option value="inversion">Inversión</option>
                  <option value="otro">Otro activo</option>
                  <option value="deuda">Deuda</option>
                </Selector>
              </Etiqueta>
              <Etiqueta label="Saldo (€)">
                <Campo name="balance" inputMode="decimal" placeholder="0" />
              </Etiqueta>
              <div className="col-span-2">
                <Etiqueta label="Ticker de tu lista de inversión (opcional, para medir pesos)">
                  <Campo name="symbol" placeholder="IWDA.AS" />
                </Etiqueta>
              </div>
              <div className="col-span-2">
                <Boton variante="primario">Añadir</Boton>
              </div>
            </FormAccion>
          </Card>
        </Seccion>
      </div>
    </>
  );
}
