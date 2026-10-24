import type { Metadata } from "next";
import LegalLayout from "@/components/common/LegalLayout";

/* noindex hasta que el cliente ponga el texto legal real. TODO: quitarlo entonces. */
export const metadata: Metadata = {
  title: "Política de privacidad | BH Tacos",
  description: "Política de privacidad | BH Tacos: información legal del sitio web de BH Tacos, Ourense.",
  alternates: { canonical: "/privacidad" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LegalLayout doc="privacidad" />;
}
