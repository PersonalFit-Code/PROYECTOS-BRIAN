"use client";

import { createPortal } from "react-dom";
import { euros, useAhora } from "./ui";
import { cuentas, ocupacionMedia, useDatosVivos } from "./datos";
import { gastosMes, ingresosMes, porEntrenador, entrenadores, totales } from "@/data/panel-demo";
import { negocio } from "@/data/negocio";
import type { Documento } from "./contexto";

/**
 * Documento para imprimir (informe del mes o factura). Se monta en <body> con un portal, y los
 * estilos de impresión del layout del panel ocultan todo lo demás al imprimir.
 */
export default function Imprimible({ doc }: { doc: Documento }) {
  const ahora = useAhora();
  const { pagos, reservas, solicitudes } = useDatosVivos();
  const c = cuentas(pagos);
  const mes = ahora.toLocaleDateString("es-ES", { month: "long", year: "numeric" });
  const fecha = ahora.toLocaleDateString("es-ES");

  return createPortal(
    <div id="imprimible" className="hidden bg-white p-10 font-sans text-[12px] text-black print:block">
      <header className="flex items-start justify-between border-b-2 border-black pb-4">
        <div>
          <p className="marca text-[30px] leading-none">720 GYM CLUB</p>
          <p className="mt-1">{negocio.direccion.completa}</p>
          <p>
            {negocio.email} · NIF: [pendiente]
          </p>
        </div>
        <div className="text-right">
          <p className="subtitular text-[22px]">{doc.tipo === "informe" ? `Informe de ${mes}` : `Factura ${doc.numero}`}</p>
          <p>Fecha: {fecha}</p>
          <p className="mt-1 italic">Datos de demostración (ficticios)</p>
        </div>
      </header>

      {doc.tipo === "factura" ? (
        <section className="mt-6">
          <p>
            <strong>Cliente:</strong> {doc.cliente} · {doc.plan}
          </p>
          <table className="mt-4 w-full border-collapse">
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-2">Fecha</th>
                <th>Concepto</th>
                <th>Método</th>
                <th className="text-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {doc.lineas.map((l, i) => (
                <tr key={i} className="border-b border-black/20">
                  <td className="py-2">{l.fecha}</td>
                  <td>{l.concepto}</td>
                  <td>{l.metodo}</td>
                  <td className="text-right">{euros(l.importe)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(() => {
            const total = doc.lineas.reduce((a, l) => a + l.importe, 0);
            const base = total / 1.21;
            return (
              <div className="mt-4 ml-auto w-64 space-y-1">
                <p className="flex justify-between">
                  <span>Base imponible</span>
                  <span>{euros(Math.round(base * 100) / 100)}</span>
                </p>
                <p className="flex justify-between">
                  <span>IVA 21 %</span>
                  <span>{euros(Math.round((total - base) * 100) / 100)}</span>
                </p>
                <p className="flex justify-between border-t border-black pt-1 text-[14px] font-bold">
                  <span>Total</span>
                  <span>{euros(total)}</span>
                </p>
              </div>
            );
          })()}
        </section>
      ) : (
        <section className="mt-6 grid gap-6">
          <div className="grid grid-cols-4 gap-4">
            {[
              ["Ingresos", euros(c.ingresos)],
              ["Gastos", euros(c.gastos)],
              ["Beneficio", euros(c.beneficio)],
              ["Margen", `${c.margen.toFixed(1)} %`],
            ].map(([a, b]) => (
              <div key={a} className="border border-black p-3">
                <p className="uppercase">{a}</p>
                <p className="mt-1 text-[18px] font-bold">{b}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <table className="w-full border-collapse">
              <caption className="mb-2 text-left font-bold uppercase">Ingresos por concepto</caption>
              <tbody>
                {[...ingresosMes, ...(c.online ? [{ concepto: "Pagos online (web)", importe: c.online }] : [])].map((x) => (
                  <tr key={x.concepto} className="border-b border-black/20">
                    <td className="py-1.5">{x.concepto}</td>
                    <td className="text-right">{euros(x.importe)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <table className="w-full border-collapse">
              <caption className="mb-2 text-left font-bold uppercase">Gastos por partida</caption>
              <tbody>
                {gastosMes.map((x) => (
                  <tr key={x.concepto} className="border-b border-black/20">
                    <td className="py-1.5">{x.concepto}</td>
                    <td className="text-right">{euros(x.importe)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <table className="w-full border-collapse">
            <caption className="mb-2 text-left font-bold uppercase">Por entrenador</caption>
            <thead>
              <tr className="border-b border-black text-left">
                <th className="py-1.5">Entrenador</th>
                <th>Clientes</th>
                <th>Sesiones del mes</th>
                <th className="text-right">Generado</th>
              </tr>
            </thead>
            <tbody>
              {entrenadores.map((e) => (
                <tr key={e} className="border-b border-black/20">
                  <td className="py-1.5">{e}</td>
                  <td>{porEntrenador[e].clientes}</td>
                  <td>{porEntrenador[e].sesionesMes}</td>
                  <td className="text-right">{euros(Math.round(c.ingresos * porEntrenador[e].peso))}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p>
            Socios activos: {totales.sociosActivos} · Altas: {totales.altasMes} · Bajas: {totales.bajasMes} · Ocupación media de clases: {ocupacionMedia(reservas)} % · Solicitudes desde la web: {solicitudes.length}
          </p>
        </section>
      )}
      <footer className="mt-10 border-t border-black/30 pt-3 text-[10px]">Generado con el panel de gestión de 720 GYM CLUB · {fecha}</footer>
    </div>,
    document.body,
  );
}
