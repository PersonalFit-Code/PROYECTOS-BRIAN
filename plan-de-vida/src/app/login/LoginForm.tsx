"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Boton, Campo, Card } from "@/components/ui/basicos";
import { getBrowserClient } from "@/lib/supabase/client";

/**
 * Login con email y contraseña. No hay registro: el usuario se crea una vez en el panel de Supabase
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
    <Card className="space-y-3 p-5">
      <form action={entrar} className="space-y-3">
        <Campo name="email" type="email" autoComplete="email" placeholder="Email" required />
        <Campo name="password" type="password" autoComplete="current-password" placeholder="Contraseña" required />
        {error && <p className="text-sm text-bad">{error}</p>}
        <Boton variante="primario" className="w-full" disabled={cargando}>
          {cargando ? "Entrando…" : "Entrar"}
        </Boton>
      </form>
    </Card>
  );
}
