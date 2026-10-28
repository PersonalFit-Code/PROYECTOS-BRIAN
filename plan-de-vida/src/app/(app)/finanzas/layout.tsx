import { Pestanas } from "@/components/finanzas/Pestanas";
import { Pagina } from "@/components/layout/Pagina";

export default function FinanzasLayout({ children }: { children: React.ReactNode }) {
  return (
    <Pagina ancha>
      <Pestanas />
      {children}
    </Pagina>
  );
}
