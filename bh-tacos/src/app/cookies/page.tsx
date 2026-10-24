import type { Metadata } from "next";
import LegalLayout from "@/components/common/LegalLayout";

/* noindex hasta que el cliente ponga el texto legal real. TODO: quitarlo entonces. */
export const metadata: Metadata = {
  title: "Política de cookies | BH Tacos",
  description: "Política de cookies | BH Tacos: información legal del sitio web de BH Tacos, Ourense.",
  alternates: { canonical: "/cookies" },
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LegalLayout doc="cookies" />;
}
