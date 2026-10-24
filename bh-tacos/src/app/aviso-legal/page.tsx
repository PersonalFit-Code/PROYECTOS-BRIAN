import type { Metadata } from "next";
import LegalLayout from "@/components/common/LegalLayout";

/* noindex hasta que el cliente ponga el texto legal real. TODO: quitarlo entonces. */
export const metadata: Metadata = {
  title: "Aviso legal | BH Tacos",
  description: "Aviso legal | BH Tacos: información legal del sitio web de BH Tacos, Ourense.",
  alternates: { canonical: "/aviso-legal" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LegalLayout doc="aviso-legal" />;
}
