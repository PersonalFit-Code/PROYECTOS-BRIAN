/** Dentro de Finanzas las pestañas ya están en pantalla: la carga solo pinta cifras y bloques. */
export default function Loading() {
  return (
    <div className="carga" aria-busy="true" aria-label="Cargando">
      <div className="mb-6 flex items-center gap-4">
        <div className="glass grid size-12 place-items-center rounded-2xl">
          <div className="esqueleto size-6 rounded-lg" />
        </div>
        <div className="flex-1">
          <div className="esqueleto mb-2 h-7 w-44 rounded-lg" />
          <div className="esqueleto h-3.5 w-72 max-w-full rounded-lg" />
        </div>
      </div>
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="glass entrar rounded-2xl p-3" style={{ ["--i" as string]: i }}>
            <div className="esqueleto mb-2 h-3 w-16 rounded" />
            <div className="esqueleto h-6 w-24 rounded-lg" />
          </div>
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }, (_, i) => (
          <div key={i} className="glass entrar flex items-center gap-3 rounded-2xl p-4" style={{ ["--i" as string]: i + 4 }}>
            <div className="esqueleto size-9 shrink-0 rounded-xl" />
            <div className="esqueleto h-4 flex-1 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
