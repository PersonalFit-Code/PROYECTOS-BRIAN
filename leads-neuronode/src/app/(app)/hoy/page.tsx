import { redirect } from "next/navigation";

/** «Hoy» vive ahora en el despacho de Gus. Esto mantiene los enlaces viejos. */
export default function Hoy() {
  redirect("/despacho/guion#escribir");
}
