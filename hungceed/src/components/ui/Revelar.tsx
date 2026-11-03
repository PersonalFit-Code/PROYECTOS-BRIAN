"use client";

import { useRef, type ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

/** Envoltorio que activa los revelados (`data-reveal`) de lo que tenga dentro. */
export default function Revelar({ children, className, as: Tag = "div", id }: { children: ReactNode; className?: string; as?: "div" | "section"; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useReveal(ref);
  return (
    <Tag ref={ref} className={className} id={id}>
      {children}
    </Tag>
  );
}
