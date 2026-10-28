"use client";

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { euros } from "@/lib/formato";

export function GraficaPatrimonio({ datos }: { datos: { mes: string; neto: number }[] }) {
  return (
    <div className="h-56 w-full">
      <ResponsiveContainer>
        <AreaChart data={datos} margin={{ top: 8, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="neto" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--line)" />
          <XAxis dataKey="mes" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} width={52} tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v: number) => `${Math.round(v / 100) / 10}k`} />
          <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--line)", borderRadius: 8, fontSize: 12 }} formatter={(v) => euros(Number(v))} />
          <Area type="monotone" dataKey="neto" name="Patrimonio neto" stroke="var(--accent)" strokeWidth={2} fill="url(#neto)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
