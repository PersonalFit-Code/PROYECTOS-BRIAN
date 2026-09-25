"use client";

/** STUB — será reemplazado por el agente de Social/Chrome. Mantén la firma { open, onClose }. */
export default function ReservationModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal className="fixed inset-0 z-[100] grid place-items-center bg-black/70" onClick={onClose}>
      <div className="glass rounded-2xl p-8">Reservar (stub)</div>
    </div>
  );
}
