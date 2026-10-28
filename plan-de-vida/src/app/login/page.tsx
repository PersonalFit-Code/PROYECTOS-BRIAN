import type { Metadata } from "next";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-side px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 grid size-12 place-items-center rounded-xl bg-fg text-xl font-bold text-bg">P</div>
          <h1 className="text-2xl font-bold">Plan de vida</h1>
          <p className="mt-1 text-sm text-muted">Metas, dinero, hábitos y diario en un solo sitio.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
