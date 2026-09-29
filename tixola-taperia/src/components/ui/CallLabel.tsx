"use client";

import { useFormat } from "@/i18n/LocaleProvider";

/**
 * Etiqueta "Llamar al 646 45 72 74" con el número INDIVISIBLE.
 *
 * Se interpola la plantilla i18n como siempre (`t(template, { phone })`) y luego se parte el resultado
 * por el número para envolverlo en un `whitespace-nowrap`. Así el texto sigue saliendo íntegro de los
 * mensajes (cualquier idioma, cualquier posición del marcador) y, si no cabe en una línea, la ruptura
 * solo puede darse ANTES del número ("Llamar al" / "646 45 72 74"), nunca en medio ("646 45" / "72 74"),
 * que es ilegible y no parece un teléfono.
 *
 * Vive en su propio fichero porque el mismo botón sale en tres sitios (tarjeta de horario, modal de
 * tarjeta de estado y cajón del menú móvil) y los tres se partían igual: un solo helper, un solo
 * arreglo. Si la
 * plantilla no contuviera el número (no debería pasar), se devuelve el texto tal cual.
 */
export default function CallLabel({ template, phone }: { template: string; phone: string }) {
  const t = useFormat();
  const label = t(template, { phone });
  const at = label.indexOf(phone);
  if (at === -1) return <>{label}</>;
  return (
    <>
      {label.slice(0, at)}
      <span className="whitespace-nowrap tabular-nums">{phone}</span>
      {label.slice(at + phone.length)}
    </>
  );
}
