import type { ReactNode } from "react";
import PanelShell from "@/components/panel/PanelShell";
import { panelSinLogin, requireSesion } from "@/lib/panel/sesion";
import { salir } from "../login/acciones";

/** Todo lo que cuelga de aquí exige sesión. El login queda fuera del grupo para no dar vueltas. */
export const dynamic = "force-dynamic";

export default async function PanelAppLayout({ children }: { children: ReactNode }) {
  const s = await requireSesion();
  return (
    <PanelShell rol={s.role} nombre={s.nombre} salir={salir} sinLogin={panelSinLogin()}>
      {children}
    </PanelShell>
  );
}
