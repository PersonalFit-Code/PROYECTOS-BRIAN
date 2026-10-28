/**
 * Silueta de la pantalla que se está cargando. Se muestra al instante al entrar en un apartado
 * (loading.tsx) y se funde con el contenido real cuando llegan los datos.
 *  · lista: cabecera + resumen + bloques desplegables (Hoy, Hábitos, Metas…)
 *  · tarjetas: cabecera grande + rejilla de tarjetas (Inicio)
 * (Finanzas tiene la suya: sus pestañas ya están en pantalla.)
 */
function Bloque({ i = 0 }: { i?: number }) {
  return (
    <div className="glass entrar flex items-center gap-3 rounded-2xl p-4" style={{ ["--i" as string]: i }}>
      <div className="esqueleto size-9 shrink-0 rounded-xl" />
      <div className="esqueleto h-4 flex-1 rounded-lg" style={{ maxWidth: `${55 + ((i * 17) % 30)}%` }} />
      <div className="esqueleto h-4 w-10 rounded-lg" />
    </div>
  );
}

export function Cargando({ tipo = "lista" }: { tipo?: "lista" | "tarjetas" }) {

  if (tipo === "tarjetas") {
    return (
      <div className="carga mx-auto w-full max-w-5xl px-4 pt-4 pb-32 sm:px-8 md:pt-6" aria-busy="true" aria-label="Cargando">
        <div className="esqueleto mb-6 h-56 rounded-3xl" />
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <div key={i} className="glass entrar rounded-2xl p-4" style={{ ["--i" as string]: i }}>
              <div className="esqueleto mb-3 size-10 rounded-xl" />
              <div className="esqueleto mb-2 h-4 w-2/3 rounded-lg" />
              <div className="esqueleto h-3 w-5/6 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="carga mx-auto w-full max-w-3xl px-4 pt-6 pb-32 sm:px-8 md:pb-16 md:pt-10" aria-busy="true" aria-label="Cargando">
      <div className="mb-6 flex items-center gap-4">
        <div className="glass grid size-12 place-items-center rounded-2xl">
          <div className="esqueleto size-6 rounded-lg" />
        </div>
        <div className="flex-1">
          <div className="esqueleto mb-2 h-7 w-40 rounded-lg" />
          <div className="esqueleto h-3.5 w-64 max-w-full rounded-lg" />
        </div>
      </div>
      <div className="glass entrar mb-4 flex items-center gap-3 rounded-2xl px-4 py-4">
        <div className="esqueleto h-3 w-14 rounded" />
        <div className="esqueleto h-2 flex-1 rounded-full" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Bloque key={i} i={i + 1} />
        ))}
      </div>
    </div>
  );
}
