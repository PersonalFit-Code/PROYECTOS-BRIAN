"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import ReservationModal from "./ReservationModal";

interface ReservationContextValue {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ReservationContext = createContext<ReservationContextValue | null>(null);

/**
 * Contexto global para abrir el modal de "Reservar Mesa" desde cualquier CTA
 * (Hero, Navbar, barra móvil, carta…). El modal vive en components/ui/ReservationModal.tsx.
 */
export function ReservationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const value = useMemo(() => ({ isOpen, open, close }), [isOpen, open, close]);
  return (
    <ReservationContext.Provider value={value}>
      {children}
      <ReservationModal open={isOpen} onClose={close} />
    </ReservationContext.Provider>
  );
}

export function useReservation() {
  const ctx = useContext(ReservationContext);
  if (!ctx) throw new Error("useReservation debe usarse dentro de <ReservationProvider>");
  return ctx;
}
