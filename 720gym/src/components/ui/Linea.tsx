/** Separador fino entre secciones oscuras (en lugar de cintas en movimiento). */
export default function Linea({ claro = false }: { claro?: boolean }) {
  return (
    <div className={claro ? "bg-pared" : "bg-negro"} aria-hidden>
      <div className="container-page">
        <div className={claro ? "h-px bg-negro/10" : "h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"} />
      </div>
    </div>
  );
}
