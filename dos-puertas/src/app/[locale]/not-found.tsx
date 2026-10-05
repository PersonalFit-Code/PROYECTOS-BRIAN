"use client";

import Link from "next/link";
import { useLocalePath, useMessages } from "@/i18n/LocaleProvider";

export default function NotFound() {
  const m = useMessages();
  const lp = useLocalePath();
  return (
    <div className="container-page flex min-h-[70svh] flex-col items-center justify-center pt-28 text-center">
      <p className="font-rotulo text-7xl text-gradient-marca">404</p>
      <h1 className="mt-4 font-display text-3xl font-medium text-balance">{m.notFound.title}</h1>
      <p className="mt-2 text-cream-muted">{m.notFound.text}</p>
      <Link href={lp("/")} className="pulsable mt-8 inline-flex min-h-12 items-center rounded-full bg-oro px-6 font-semibold text-botella">
        {m.notFound.back}
      </Link>
    </div>
  );
}
