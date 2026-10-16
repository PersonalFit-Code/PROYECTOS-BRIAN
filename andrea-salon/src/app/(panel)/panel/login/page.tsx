import { redirect } from "next/navigation";
import { getSesion, panelSinLogin } from "@/lib/panel/sesion";
import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Entrar" };

/** Sin registro: los usuarios los crea Brian con `scripts/crear-usuario.ts`. */
export default async function LoginPage() {
  if (panelSinLogin() || (await getSesion())) redirect("/panel");
  return (
    <main className="grid min-h-dvh place-items-center px-4">
      <div className="w-full max-w-sm rounded-[32px] border border-[var(--capa-borde)] bg-white/80 p-7 shadow-[var(--shadow-card)]">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-carmin-suave">Panel</p>
        <h1 className="mt-1 font-display text-3xl font-semibold">Andrea Salón</h1>
        <p className="mb-6 mt-2 text-sm text-gris">Agenda, clientas y cobros del salón.</p>
        <LoginForm />
      </div>
    </main>
  );
}
