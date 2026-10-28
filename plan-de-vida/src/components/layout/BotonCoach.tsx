"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

/** Acceso al coach desde cualquier pantalla (encima del botón +). En escritorio ya está en la barra lateral. */
export function BotonCoach({ coach }: { coach: string }) {
  if (usePathname() === "/coach") return null;
  return (
    <Link
      href="/coach"
      aria-label={`Hablar con ${coach}`}
      className="fixed right-6 bottom-[10.5rem] z-30 grid size-12 place-items-center rounded-full bg-bg/80 text-accent shadow-lg ring-1 ring-accent/30 backdrop-blur-md transition duration-300 hover:scale-105 active:scale-95 md:hidden"
    >
      <Sparkles className="size-5" />
    </Link>
  );
}
