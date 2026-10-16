"use client";

import { useActionState } from "react";
import { entrar, type EstadoLogin } from "./acciones";

export default function LoginForm() {
  const [estado, accion, pendiente] = useActionState<EstadoLogin, FormData>(entrar, { error: null });
  const campo =
    "mt-1.5 block w-full min-h-12 rounded-2xl border border-carmin/20 bg-white px-4 text-[16px] focus:border-carmin focus:outline-none focus:ring-2 focus:ring-carmin/20";
  return (
    <form action={accion} className="space-y-4">
      <label className="block text-sm font-semibold">
        Correo
        <input name="email" type="email" autoComplete="username" required className={campo} />
      </label>
      <label className="block text-sm font-semibold">
        Contraseña
        <input name="password" type="password" autoComplete="current-password" required className={campo} />
      </label>
      {estado.error && (
        <p role="alert" className="rounded-2xl bg-white px-4 py-3 text-sm text-carmin ring-1 ring-carmin/20">
          {estado.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pendiente}
        className="min-h-12 w-full rounded-full bg-carmin px-6 font-semibold text-white transition-colors hover:bg-carmin-oscuro disabled:opacity-60"
      >
        {pendiente ? "Entrando…" : "Entrar"}
      </button>
    </form>
  );
}
