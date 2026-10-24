import { MessageCircle, Phone } from "lucide-react";
import { BUSINESS } from "@/content";
import type { TacoDraft } from "@/lib/price";
import { orderMessage, whatsappUrl } from "@/lib/whatsapp";

export default function OrderActions({ draft, compact }: { draft: TacoDraft; compact?: boolean }) {
  return (
    <div className={compact ? "grid grid-cols-2 gap-2" : "grid gap-3 sm:grid-cols-2"}>
      <a className="press btn btn-salsa" href={whatsappUrl(orderMessage(draft))} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="h-5 w-5" aria-hidden /> Pedir por WhatsApp
      </a>
      <a className="press btn btn-primary" href={`tel:${BUSINESS.phone.tel}`}>
        <Phone className="h-5 w-5" aria-hidden /> Llamar para recoger
      </a>
    </div>
  );
}
