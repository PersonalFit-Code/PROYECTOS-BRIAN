import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar" };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-side px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Image src="/logo.svg" alt="" width={56} height={56} className="mx-auto mb-3 rounded-xl border border-line" priority />
          <h1 className="text-2xl font-extrabold tracking-tight">
            Leads neuro<span className="text-brand">·</span>node
          </h1>
          <p className="mt-1 text-muted">Los negocios a contactar, en un solo sitio.</p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
