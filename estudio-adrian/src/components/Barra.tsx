export default function Barra({ valor, total, className = "" }: { valor: number; total: number; className?: string }) {
  const pct = total > 0 ? Math.round((valor / total) * 100) : 0;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={valor}
      className={`h-2 overflow-hidden rounded-full bg-superficie-2 ${className}`}
    >
      <div className="h-full rounded-full bg-bien transition-[width] duration-500" style={{ width: `${pct}%` }} />
    </div>
  );
}
