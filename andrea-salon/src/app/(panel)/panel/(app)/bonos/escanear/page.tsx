import { requireSesion } from "@/lib/panel/sesion";
import PantallaEscaner from "./PantallaEscaner";

export const dynamic = "force-dynamic";
export const metadata = { title: "Escanear bono" };

/** Escanear el QR de un bono y saltar a su ficha. Todo el trabajo es del navegador (la cámara). */
export default async function EscanearPage() {
  await requireSesion();
  return <PantallaEscaner />;
}
