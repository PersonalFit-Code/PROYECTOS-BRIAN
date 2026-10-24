import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-28 text-center">
      <p className="font-display text-8xl text-brand-text">404</p>
      <h1 className="mt-4 font-display text-4xl uppercase">Este taco no está en la carta</h1>
      <p className="mt-4 text-fg-muted">La página que buscas no existe o se ha movido.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="press btn btn-primary">Volver al inicio</Link>
        <Link href="/carta" className="press btn btn-ghost">Ver la carta</Link>
      </div>
    </div>
  );
}
