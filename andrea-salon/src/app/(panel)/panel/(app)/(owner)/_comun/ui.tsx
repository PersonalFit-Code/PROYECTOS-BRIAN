"use client";

import { useActionState, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import { cn } from "@/lib/utils";
import { ESTADO_INICIAL, type EstadoAccion } from "./estado";
import { BOTON_PRIMARIO, BOTON_SECUNDARIO } from "./estilos";

export type Accion = (prev: EstadoAccion, form: FormData) => Promise<EstadoAccion>;

/**
 * El resultado de una acción, en una región `aria-live` que existe SIEMPRE (vacía si no hay nada):
 * si apareciera a la vez que el texto, VoiceOver no lo leería.
 */
export function Resultado({ estado, className }: { estado: EstadoAccion; className?: string }) {
  const texto = estado.error ?? (estado.ok ? estado.mensaje : undefined);
  return (
    <p aria-live="polite" role="status" className={cn(texto ? "block" : "sr-only", className)}>
      {texto && (
        <span
          className={cn(
            "block rounded-2xl px-4 py-3 text-sm ring-1",
            estado.error ? "bg-white text-carmin ring-carmin/30" : "bg-rosa-niebla text-tinta ring-carmin/10",
          )}
        >
          {texto}
        </span>
      )}
    </p>
  );
}

/** Botón de envío que se desactiva mientras la acción corre: evita el doble toque en el móvil. */
export function BotonEnviar({
  children,
  pendiente,
  variante = "primario",
  className,
  ...resto
}: {
  children: ReactNode;
  pendiente?: ReactNode;
  variante?: "primario" | "secundario";
  className?: string;
  "aria-label"?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(variante === "primario" ? BOTON_PRIMARIO : BOTON_SECUNDARIO, className)}
      {...resto}
    >
      {pending && pendiente ? pendiente : children}
    </button>
  );
}

/**
 * Un botón suelto que lanza una acción con unos campos ocultos (desactivar, subir, borrar…).
 * `confirmar` pide confirmación antes: lo justo para que un toque sin querer no borre un cierre.
 */
export function BotonAccion({
  accion,
  campos,
  children,
  etiqueta,
  confirmar,
  variante = "secundario",
  className,
  mostrarResultado = true,
}: {
  accion: Accion;
  campos: Record<string, string>;
  children: ReactNode;
  /** Texto para lectores de pantalla cuando el botón es solo un icono. */
  etiqueta?: string;
  confirmar?: string;
  variante?: "primario" | "secundario";
  className?: string;
  mostrarResultado?: boolean;
}) {
  const [estado, ejecutar] = useActionState(accion, ESTADO_INICIAL);
  return (
    <form
      action={ejecutar}
      onSubmit={(e) => {
        if (confirmar && !window.confirm(confirmar)) e.preventDefault();
      }}
      className="contents"
    >
      {Object.entries(campos).map(([nombre, valor]) => (
        <input key={nombre} type="hidden" name={nombre} value={valor} />
      ))}
      <BotonEnviar variante={variante} className={className} aria-label={etiqueta}>
        {children}
      </BotonEnviar>
      {mostrarResultado && estado.error && <Resultado estado={estado} className="basis-full" />}
    </form>
  );
}
