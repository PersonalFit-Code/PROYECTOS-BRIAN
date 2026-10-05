"use client";

import { useSyncExternalStore } from "react";
import { readConsent, subscribeConsent, type Consent } from "@/lib/consent";

/**
 * La elección de cookies. `undefined` en el servidor y durante la hidratación (aún no se sabe),
 * `null` si la persona todavía no ha elegido, y la elección en cuanto la hay.
 */
export function useConsent(): Consent | null | undefined {
  return useSyncExternalStore(subscribeConsent, readConsent, () => undefined);
}
