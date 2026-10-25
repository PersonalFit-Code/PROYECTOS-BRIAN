interface Props {
  step: number;
  labels: string[];
  onJump: (i: number) => void;
}

/** Barra de progreso animada (transform: scaleX, lineal en el tiempo de la transición). */
export default function ProgressBar({ step, labels, onJump }: Props) {
  const pct = (step + 1) / labels.length;
  return (
    <div>
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>
          Paso {step + 1} de {labels.length} · <span className="text-brand-text">{labels[step]}</span>
        </span>
      </div>
      <div
        className="mt-3 h-2 overflow-hidden rounded-full bg-surface-2"
        role="progressbar"
        aria-label="Progreso del configurador"
        aria-valuemin={1}
        aria-valuemax={labels.length}
        aria-valuenow={step + 1}
        aria-valuetext={`Paso ${step + 1} de ${labels.length}: ${labels[step]}`}
      >
        <div className="h-full origin-left rounded-full bg-gradient-to-r from-brand to-cheese transition-transform duration-300 ease-[var(--ease-out)]" style={{ transform: `scaleX(${pct})` }} />
      </div>
      <ol className="no-scrollbar mt-3 flex gap-2 overflow-x-auto text-xs" aria-label="Pasos">
        {labels.map((l, i) => (
          <li key={l}>
            <button
              type="button"
              disabled={i > step}
              onClick={() => onJump(i)}
              aria-current={i === step ? "step" : undefined}
              className={`press whitespace-nowrap rounded-full px-3 py-1.5 font-semibold ${i === step ? "bg-brand text-ink" : i < step ? "bg-surface-2 text-fg" : "text-fg-muted opacity-60"}`}
            >
              {i + 1}. {l}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );
}
