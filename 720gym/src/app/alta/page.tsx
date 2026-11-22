import { redirect } from "next/navigation";
import { waPlan } from "@/data/pagos";

/**
 * Sin pasarela de pago: /alta (y /alta?plan=…) abre WhatsApp con el plan ya escrito.
 * Se mantiene para enlaces antiguos; los botones de la web ya apuntan directamente a WhatsApp.
 */
export default async function PaginaAlta({ searchParams }: { searchParams: Promise<{ plan?: string; nombre?: string }> }) {
  const { plan, nombre } = await searchParams;
  redirect(waPlan(plan, nombre));
}
