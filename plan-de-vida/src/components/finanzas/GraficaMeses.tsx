"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { euros } from "@/lib/formato";

/** Ingresos frente a gastos de los últimos meses. */
export function GraficaMeses({ datos }: { datos: { mes: string; ingresos: number; gastos: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <BarChart data={datos} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} width={48} tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v: number) => `${Math.round(v / 100) / 10}k`} />
          <Tooltip
            cursor={{ fill: "var(--hover)" }}
            contentStyle={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12 }}
            formatter={(v) => euros(Number(v))}
          />
          <Bar dataKey="ingresos" name="Ingresos" fill="var(--ok)" radius={[3, 3, 0, 0]} maxBarSize={28} />
          <Bar dataKey="gastos" name="Gastos" fill="var(--bad)" radius={[3, 3, 0, 0]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
