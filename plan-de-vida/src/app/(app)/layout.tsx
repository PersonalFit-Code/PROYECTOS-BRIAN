import { BotonCoach } from "@/components/layout/BotonCoach";
import { BotonRapido } from "@/components/layout/BotonRapido";
import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { getAjustes, getCategorias } from "@/lib/datos/consultas";
import { nombreCoach } from "@/lib/marca";
import { getSesion } from "@/lib/sesion";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const sesion = await getSesion();
  const [ajustes, categorias] = await Promise.all([getAjustes(sesion), getCategorias(sesion)]);
  return (
    <div className="flex min-h-dvh">
      <Sidebar nombre={ajustes.display_name} coach={nombreCoach(ajustes)} />
      <main className="relative min-w-0 flex-1">{children}</main>
      <MobileNav coach={nombreCoach(ajustes)} />
      <BotonCoach coach={nombreCoach(ajustes)} />
      <BotonRapido categorias={categorias} />
    </div>
  );
}
