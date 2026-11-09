import type { Metadata } from "next";
import { Suspense } from "react";
import Plan from "./Plan";

export const metadata: Metadata = { title: "Tu plan de 4 semanas", robots: { index: false, follow: false } };

export default function PaginaPlan() {
  return (
    <Suspense>
      <Plan />
    </Suspense>
  );
}
