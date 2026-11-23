import { redirect } from "next/navigation";
import { waVisita } from "@/data/negocio";

/** Ya no hay «clase gratis» del gimnasio: los enlaces antiguos llevan a concertar una visita por WhatsApp. */
export default function ClaseGratis() {
  redirect(waVisita());
}
