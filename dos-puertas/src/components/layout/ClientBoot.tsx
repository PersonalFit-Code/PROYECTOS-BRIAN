"use client";

import { usePerformanceTier } from "@/hooks/usePerformanceTier";

export default function ClientBoot() {
  usePerformanceTier();
  return null;
}
