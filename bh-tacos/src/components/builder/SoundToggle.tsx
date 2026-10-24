import { Volume2, VolumeX } from "lucide-react";

export default function SoundToggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="press inline-flex min-h-11 items-center gap-2 rounded-full border border-line px-3 text-sm font-semibold text-fg-muted"
    >
      {on ? <Volume2 className="h-4 w-4" aria-hidden /> : <VolumeX className="h-4 w-4" aria-hidden />}
      Sonido
    </button>
  );
}
