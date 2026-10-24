import { BUSINESS } from "@/content";
import { MENU, getStyle } from "@/data/menu";
import { formatPrice } from "@/lib/format";
import { totalPrice, type TacoDraft } from "@/lib/price";

const names = (ids: string[], list: { id: string; name: string }[]) =>
  ids.map((id) => list.find((x) => x.id === id)?.name ?? id).join(" + ") || "Sin elegir";

/** El mensaje del pedido, con el formato acordado con el cliente. */
export function orderMessage(draft: TacoDraft): string {
  return [
    "Hola BH Tacos! Quiero pedir:",
    "",
    `* 1x Taco ${draft.size} ${getStyle(draft.style).name}`,
    `* Carnes: ${names(draft.meats, MENU.meats)}`,
    `* Salsas: ${names(draft.sauces, MENU.sauces)}`,
    `* Extras: ${draft.extras.length ? names(draft.extras, MENU.extras) : "Ninguno"}`,
    `Total estimado: ${formatPrice(totalPrice(draft))}`,
    "Nombre: [pendiente]",
    "Recogida o envío: [pendiente]",
  ].join("\n");
}

export function whatsappUrl(text?: string): string {
  const base = `https://wa.me/${BUSINESS.whatsapp}`;
  return text ? `${base}?text=${encodeURIComponent(text)}` : base;
}

export const GENERIC_ORDER_TEXT = "Hola BH Tacos! Quiero hacer un pedido.";
