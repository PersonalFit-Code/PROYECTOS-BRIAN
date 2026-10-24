"use client";

import { useSyncExternalStore } from "react";
import { getConsent, subscribeConsent, type ConsentValue } from "@/lib/consent";

/** `undefined` en el servidor y al hidratar; `null` si aún no ha elegido; si no, la elección. */
export default function useConsent(): ConsentValue | undefined {
  return useSyncExternalStore(subscribeConsent, getConsent, () => undefined);
}
