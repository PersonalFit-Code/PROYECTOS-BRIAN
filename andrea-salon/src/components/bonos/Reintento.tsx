"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * El webhook de Stripe suele llegar un segundo DESPUÉS de que la clienta vuelva a la web. Mientras
 * el bono no exista, la página se vuelve a pedir al servidor cada 4 s, como mucho tres veces; luego
 * se queda con el «te llega por correo», que es verdad igual.
 */
export default function Reintento({ veces = 3, cadaMs = 4000 }: { veces?: number; cadaMs?: number }) {
  const router = useRouter();
  const [hechos, setHechos] = useState(0);
  useEffect(() => {
    if (hechos >= veces) return;
    const t = window.setTimeout(() => {
      setHechos((n) => n + 1);
      router.refresh();
    }, cadaMs);
    return () => window.clearTimeout(t);
  }, [hechos, veces, cadaMs, router]);
  return null;
}
