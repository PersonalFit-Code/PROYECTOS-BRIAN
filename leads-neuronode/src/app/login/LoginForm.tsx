"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Boton, Campo, Card } from "@/components/ui";
import { getBrowserClient } from "@/lib/supabase/client";

/**
 * Login con email y contraseña. No hay registro: los usuarios se crean en el panel de Supabase
 * (Authentication → Add user), así nadie más puede darse de alta.
 */
export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  async function entrar(form: FormData) {
    setCargando(true);
    setError(null);
    const { error } = await getBrowserClient().auth.signInWithPassword({
      email: String(form.get("email")),
      password: String(form.get("password")),
    });
    setCargando(false);
    if (error) {
      setError("Email o contraseña incorrectos.");
      return;
    }
    router.replace("/");
    router.refresh();
  }

  return (
    <Card className="p-5">
      <form action={entrar} className="space-y-4">
        <Campo etiqueta="Email" name="email" type="email" autoComplete="email" required />
        <Campo etiqueta="Contraseña" name="password" type="password" autoComplete="current-password" required />
        {error && (
          <p role="alert" className="text-sm font-bold text-bad">
            {error}
          </p>
        )}
        <Boton variante="primario" className="w-full" disabled={cargando}>
          {cargando ? "Entrando…" : "Entrar"}
        </Boton>
      </form>
    </Card>
  );
}
