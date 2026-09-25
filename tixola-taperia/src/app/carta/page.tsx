import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import { ReservationProvider } from "@/components/ui/ReservationProvider";
import MobileStickyBar from "@/components/ui/MobileStickyBar";
import Footer from "@/components/sections/Footer";
import CartaExplorer from "@/components/carta/CartaExplorer";

export const metadata: Metadata = {
  title: "Carta digital con alérgenos",
  description:
    "Carta interactiva de Tixola Tapería (Ourense): croquetas, tixolas, zamburiñas, pulpo, bacalao en tempura y vinos gallegos. Filtra por categoría, alérgenos y opciones veganas o sin gluten.",
  alternates: { canonical: "/carta" },
};

export default function CartaPage() {
  return (
    <ReservationProvider>
      <Navbar />
      <main id="main" className="relative pt-[var(--header-h)]">
        <CartaExplorer />
      </main>
      <Footer />
      <MobileStickyBar />
    </ReservationProvider>
  );
}
