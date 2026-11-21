import type { Metadata } from "next";
import { Card, Progreso, Titulo } from "@/components/ui";
import { getSesion } from "@/lib/sesion";
import { DIAS_RETO, OBJETIVO, POR_DIA, SECTORES, SECTOR_TXT, esContactado, esPositivo, type Estado, type Sector } from "@/lib/tipos";

export const metadata: Metadata = { title: "Panel" };

interface Fila {
  dia: number | null;
  estado: Estado;
  comunidad: string;
  sector: Sector;
}

function Cifra({ valor, texto }: { valor: number | string; texto: string }) {
  return (
    <Card>
      <p className="font-[family-name:var(--font-titulo)] text-3xl font-extrabold tabular-nums">{valor}</p>
      <p className="text-sm text-muted">{texto}</p>
    </Card>
  );
}

export default async function Panel() {
  const { db } = await getSesion();
  const { data } = await db.from("negocios").select("dia, estado, comunidad, sector").range(0, 4999);
  const filas = (data ?? []) as Fila[];

  const contactados = filas.filter((f) => esContactado(f.estado));
  const positivos = filas.filter((f) => esPositivo(f.estado));
  const reuniones = filas.filter((f) => f.estado === "reunion").length;
  const tasa = contactados.length ? Math.round((positivos.length / contactados.length) * 100) : 0;

  const agrupar = (clave: (f: Fila) => string) => {
    const m = new Map<string, { total: number; hechos: number }>();
    for (const f of filas) {
      const k = clave(f);
      const x = m.get(k) ?? { total: 0, hechos: 0 };
      x.total++;
      if (esContactado(f.estado)) x.hechos++;
      m.set(k, x);
    }
    return m;
  };
  const porDia = agrupar((f) => String(f.dia ?? 0));
  const porComunidad = [...agrupar((f) => f.comunidad)].sort((a, b) => b[1].total - a[1].total);
  const porSector = agrupar((f) => f.sector);
  const sinDia = porDia.get("0")?.total ?? 0;

  return (
    <>
      <Titulo sub={`El reto: ${OBJETIVO} negocios en ${DIAS_RETO} días.`}>Panel</Titulo>

      <div className="mb-6 rounded-2xl border border-line bg-side p-5">
        <Progreso valor={contactados.length} total={OBJETIVO} etiqueta="Negocios contactados" />
      </div>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Cifra valor={filas.length} texto="negocios cargados" />
        <Cifra valor={positivos.length} texto="con interés" />
        <Cifra valor={reuniones} texto="reuniones" />
        <Cifra valor={`${tasa} %`} texto="de los contactados muestran interés" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-4 text-lg font-bold">Por día</h2>
          <div className="space-y-4">
            {Array.from({ length: DIAS_RETO }, (_, i) => i + 1).map((d) => {
              const x = porDia.get(String(d)) ?? { total: 0, hechos: 0 };
              return <Progreso key={d} valor={x.hechos} total={x.total || POR_DIA} etiqueta={`Día ${d}${x.total ? "" : " (sin cargar)"}`} />;
            })}
          </div>
          {sinDia > 0 && <p className="mt-4 text-sm text-muted">{sinDia} negocios sin día asignado. Se reparten desde Importar.</p>}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-bold">Por comunidad</h2>
            {porComunidad.length === 0 ? (
              <p className="text-muted">Aún no hay negocios cargados.</p>
            ) : (
              <div className="space-y-4">
                {porComunidad.map(([c, x]) => (
                  <Progreso key={c} valor={x.hechos} total={x.total} etiqueta={c} />
                ))}
              </div>
            )}
          </Card>
          <Card className="p-5">
            <h2 className="mb-4 text-lg font-bold">Por sector</h2>
            <div className="space-y-4">
              {SECTORES.filter((s) => porSector.has(s)).map((s) => {
                const x = porSector.get(s)!;
                return <Progreso key={s} valor={x.hechos} total={x.total} etiqueta={SECTOR_TXT[s]} />;
              })}
              {porSector.size === 0 && <p className="text-muted">Aún no hay negocios cargados.</p>}
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
