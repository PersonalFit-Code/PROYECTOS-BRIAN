import { redirect } from "next/navigation";

/** La oficina ahora es la portada. Esto mantiene los enlaces viejos a /oficina. */
export default async function OficinaVieja({ searchParams }: { searchParams: Promise<{ puesto?: string }> }) {
  const { puesto } = await searchParams;
  redirect(puesto ? `/?puesto=${encodeURIComponent(puesto)}` : "/");
}
