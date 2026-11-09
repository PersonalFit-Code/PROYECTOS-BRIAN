import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Panel de gestión",
  robots: { index: false, follow: false },
};

/*
 * Al imprimir (informe del mes o factura) solo sale #imprimible, que el panel monta en <body>.
 * El panel tapa la web pública con su propia capa fija; al imprimir se oculta todo lo demás.
 */
const estilosImpresion = `
@media print {
  @page { margin: 14mm; }
  body { background: #fff !important; }
  body > *:not(#imprimible) { display: none !important; }
  #imprimible { display: block !important; }
}`;

export default function PanelLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <style>{estilosImpresion}</style>
      {children}
    </>
  );
}
