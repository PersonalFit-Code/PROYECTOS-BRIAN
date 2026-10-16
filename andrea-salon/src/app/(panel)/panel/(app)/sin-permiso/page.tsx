import Link from "next/link";

export const metadata = { title: "Sin permiso" };

export default function SinPermiso() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="font-display text-3xl font-semibold">Esta sección es de la dueña</h1>
      <p className="mt-3 text-gris">Si necesitas cambiar algo de aquí, pídeselo a Andrea.</p>
      <Link href="/panel" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-carmin px-6 font-semibold text-white">
        Volver a Hoy
      </Link>
    </div>
  );
}
