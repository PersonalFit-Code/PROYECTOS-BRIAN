"use client";

import { useState, type FormEvent } from "react";
import { MessageCircle, Send } from "lucide-react";
import Boton from "@/components/ui/Boton";
import { NEGOCIO } from "@/data/negocio";

/**
 * Formulario de presupuesto para gimnasios y boxes. La maqueta no tiene servidor: al enviar, compone
 * el mensaje con lo rellenado y lo abre en WhatsApp (que es por donde Jose atiende). En la web real
 * (WordPress) sería un formulario normal que además llega por correo.
 */
export default function FormularioPresupuesto() {
  const [enviado, setEnviado] = useState(false);

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const v = (k: string) => String(d.get(k) ?? "").trim();
    const lineas = [
      "Hola, quiero un presupuesto para equipar mi centro.",
      `Nombre: ${v("nombre")}`,
      `Centro: ${v("centro")}`,
      `Ciudad: ${v("ciudad")}`,
      v("metros") ? `Metros: ${v("metros")} m²` : "",
      `Qué necesito: ${v("necesidad")}`,
    ].filter(Boolean);
    window.open(`https://wa.me/34621221820?text=${encodeURIComponent(lineas.join("\n"))}`, "_blank", "noopener,noreferrer");
    setEnviado(true);
  };

  const campo = "mt-1.5 block min-h-12 w-full border border-linea bg-white px-4 text-[15px] text-negro placeholder:text-gris-claro focus:border-negro focus:outline-none";

  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <label className="block text-[12px] font-bold tracking-[0.12em] uppercase">
        Nombre
        <input name="nombre" required autoComplete="name" className={campo} />
      </label>
      <label className="block text-[12px] font-bold tracking-[0.12em] uppercase">
        Centro
        <input name="centro" required placeholder="Nombre del gimnasio o box" className={campo} />
      </label>
      <label className="block text-[12px] font-bold tracking-[0.12em] uppercase">
        Ciudad
        <input name="ciudad" required autoComplete="address-level2" className={campo} />
      </label>
      <label className="block text-[12px] font-bold tracking-[0.12em] uppercase">
        Metros cuadrados <span className="font-normal normal-case tracking-normal text-gris">(opcional)</span>
        <input name="metros" inputMode="numeric" pattern="[0-9]*" className={campo} />
      </label>
      <label className="block text-[12px] font-bold tracking-[0.12em] uppercase sm:col-span-2">
        Qué necesitas
        <textarea name="necesidad" required rows={4} placeholder="Racks, máquinas, zona de peso libre, plazos…" className={`${campo} resize-y py-3`} />
      </label>
      <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
        <Boton type="submit" size="lg" icon={<Send aria-hidden />}>
          Pedir presupuesto por WhatsApp
        </Boton>
        <Boton href={NEGOCIO.whatsapp} target="_blank" variant="secundario" size="lg" icon={<MessageCircle aria-hidden />}>
          Prefiero escribir yo
        </Boton>
      </div>
      <p aria-live="polite" className="text-[13px] text-gris sm:col-span-2">
        {enviado ? "Se ha abierto WhatsApp con tu mensaje. Si no se abre, escríbenos al " + NEGOCIO.telefono.display + "." : "Te contestamos por WhatsApp con una propuesta a medida."}
      </p>
    </form>
  );
}
