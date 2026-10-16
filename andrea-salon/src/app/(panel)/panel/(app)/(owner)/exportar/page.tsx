import { Download } from "lucide-react";
import { requireOwner } from "@/lib/panel/sesion";
import { desplazarFechaLocal } from "@/lib/booking";
import { hoyLocal } from "@/lib/panel/columnas";

/**
 * Exportar a CSV (Excel). Formularios GET normales hacia `/api/panel/exportar`: el navegador
 * descarga el fichero. La casilla de notas va desmarcada y explica por qué.
 */
export const dynamic = "force-dynamic";
export const metadata = { title: "Exportar" };

const campo = "mt-1.5 block w-full min-h-12 rounded-2xl border border-carmin/20 bg-white px-4 text-[16px]";

export default async function ExportarPage() {
  // También aquí y no solo en el layout: la página lee con la clave de servicio, y un layout no
  // siempre se vuelve a ejecutar en una navegación parcial.
  await requireOwner();
  const hoy = hoyLocal();
  const inicioMes = `${hoy.slice(0, 8)}01`;
  const diasMes = Number(hoy.slice(8));
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="font-display text-3xl font-semibold">Exportar</h1>
        <p className="mt-1 text-sm text-gris">
          Ficheros CSV que abre Excel (o la gestoría). Son registros de gestión del salón; las facturas oficiales son aparte.
        </p>
      </div>

      {(["cobros", "citas"] as const).map((tipo) => (
        <form key={tipo} action="/api/panel/exportar" method="get" className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
          <input type="hidden" name="tipo" value={tipo} />
          <h2 className="font-display text-xl font-semibold">{tipo === "cobros" ? "Cobros" : "Citas"}</h2>
          <p className="mt-1 text-sm text-gris">
            {tipo === "cobros"
              ? "Cada cobro con fecha, método, importe, propina, profesional y clienta."
              : "Cada cita con estado, servicios, profesional, clienta e importe."}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-semibold">
              Desde
              <input type="date" name="desde" defaultValue={inicioMes} max={hoy} className={campo} required />
            </label>
            <label className="block text-sm font-semibold">
              Días
              <input type="number" name="dias" defaultValue={diasMes} min={1} max={800} className={campo} required />
            </label>
          </div>
          <button type="submit" className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-carmin px-6 font-semibold text-white">
            <Download aria-hidden className="size-4" /> Descargar
          </button>
        </form>
      ))}

      <form action="/api/panel/exportar" method="get" className="rounded-3xl border border-[var(--capa-borde)] bg-white p-5">
        <input type="hidden" name="tipo" value="clientas" />
        <h2 className="font-display text-xl font-semibold">Clientas</h2>
        <p className="mt-1 text-sm text-gris">Todas las fichas activas con contacto, visitas, gasto y consentimiento de publicidad.</p>
        <label className="mt-4 flex items-start gap-3 text-sm">
          <input type="checkbox" name="notas" value="1" className="mt-0.5 size-5 accent-[#2b2a2d]" />
          <span>
            Incluir las notas (alergias, salud). <strong>Solo si de verdad hace falta:</strong> es el dato más delicado que guardáis, y un
            fichero se reenvía con facilidad.
          </span>
        </label>
        <button type="submit" className="mt-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-carmin px-6 font-semibold text-white">
          <Download aria-hidden className="size-4" /> Descargar
        </button>
      </form>
      <p className="text-xs text-gris">Primer día del periodo por defecto: {inicioMes} (hasta hoy, {desplazarFechaLocal(inicioMes, diasMes - 1)}).</p>
    </div>
  );
}
