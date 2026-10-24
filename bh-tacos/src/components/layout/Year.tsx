"use client";

import { useSyncExternalStore } from "react";

/* Año en vivo: el HTML se genera al compilar, así que el año del servidor podría quedarse viejo. */
const noop = () => () => {};
export default function Year() {
  const year = useSyncExternalStore(noop, () => new Date().getFullYear(), () => new Date().getFullYear());
  return <>{year}</>;
}
