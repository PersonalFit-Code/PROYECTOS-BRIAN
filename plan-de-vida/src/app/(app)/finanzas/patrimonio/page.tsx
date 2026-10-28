import type { Metadata } from "next";
import { Cuenta } from "@/components/finanzas/Cuenta";
import { GraficaPatrimonio } from "@/components/finanzas/GraficaPatrimonio";
import { Banknote, ChartLine, CreditCard, HandCoins, Landmark, Plus, TrendingUp } from "lucide-react";
import { Boton, Campo, Etiqueta, Kpi, Selector, Titulo, Vacio } from "@/components/ui/basicos";
import { Desplegable } from "@/components/ui/Desplegable";
import { Hoja } from "@/components/ui/Hoja";
import { FormAccion } from "@/components/ui/FormAccion";
import { getCuentas } from "@/lib/datos/consultas";
import { mesDe, hoy, NOMBRES_MES } from "@/lib/fechas";
import { euros, signo } from "@/lib/formato";
import { getSesion } from "@/lib/sesion";
import { patrimonioNeto } from "@/lib/finanzas";
import { n, type AccountKind, type AccountSnapshot } from "@/lib/tipos";
import { crearCuenta } from "../acciones";

export const metadata: Metadata = { title: "Patrimonio" };

const GRUPOS: { kind: AccountKind; titulo: string; icono: typeof Banknote; color: string }[] = [
  { kind: "liquidez", titulo: "Liquidez", icono: Banknote, color: "green" },
  { kind: "inversion", titulo: "Inversiones", icono: TrendingUp, color: "blue" },
  { kind: "otro", titulo: "Te deben y otros activos", icono: HandCoins, color: "yellow" },
  { kind: "deuda", titulo: "Deudas", icono: CreditCard, color: "red" },
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
      <Titulo
        icono={<Landmark />}
        color="blue"
        sub="Actualiza los saldos tocando la cifra. El día 1 de cada mes se guarda una foto para la gráfica."
        acciones={
          <Hoja titulo="Añadir cuenta" boton="Añadir cuenta" icono={<Plus />}>
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
                <Boton variante="primario" className="w-full">
                  Añadir
                </Boton>
              </div>
            </FormAccion>
          </Hoja>
        }
      >
        Patrimonio
      </Titulo>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Kpi
          i={0}
          icono={<Landmark />}
          etiqueta="Patrimonio neto"
          valor={euros(neto, false)}
          tono={neto >= 0 ? "ok" : "bad"}
          detalle={haceUnAno != null && haceUnAno !== 0 ? `${signo((100 * (neto - haceUnAno)) / Math.abs(haceUnAno))} en el periodo` : undefined}
        />
        <Kpi i={1} icono={<Banknote />} etiqueta="Liquidez" valor={euros(total("liquidez"), false)} />
        <Kpi i={2} icono={<TrendingUp />} etiqueta="Invertido" valor={euros(total("inversion"), false)} />
        <Kpi i={3} icono={<CreditCard />} etiqueta="Deudas" valor={euros(total("deuda"), false)} tono={total("deuda") > 0 ? "bad" : undefined} />
      </div>

      {serie.length > 1 && (
        <Desplegable icono={<ChartLine />} color="purple" titulo="Evolución" abierto i={4}>
          <GraficaPatrimonio datos={serie} />
        </Desplegable>
      )}

      {cuentas.length ? (
        GRUPOS.map((g, i) => {
          const delGrupo = cuentas.filter((c) => c.kind === g.kind);
          if (!delGrupo.length) return null;
          return (
            <Desplegable key={g.kind} icono={<g.icono />} color={g.color} titulo={g.titulo} resumen={euros(total(g.kind), false)} abierto i={i + 5}>
              <ul>
                {delGrupo.map((c) => (
                  <Cuenta key={c.id} cuenta={c} />
                ))}
              </ul>
            </Desplegable>
          );
        })
      ) : (
        <Vacio>Añade tus cuentas, inversiones y deudas para ver tu patrimonio neto.</Vacio>
      )}
    </>
  );
}
