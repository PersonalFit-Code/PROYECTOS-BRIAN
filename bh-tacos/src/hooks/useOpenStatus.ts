"use client";

import { useEffect, useState } from "react";
import { getOpenStatus, type OpenStatus } from "@/lib/openStatus";

/** Estado en vivo, recalculado cada minuto. `null` hasta montar: el HTML estático no sabe la hora. */
export default function useOpenStatus(): OpenStatus | null {
  const [status, setStatus] = useState<OpenStatus | null>(null);
  useEffect(() => {
    const tick = () => setStatus(getOpenStatus());
    tick();
    const id = window.setInterval(tick, 60_000);
    return () => window.clearInterval(id);
  }, []);
  return status;
}
