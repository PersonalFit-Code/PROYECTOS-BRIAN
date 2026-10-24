/** 1–3 guindillas, con texto para lectores de pantalla. */
export default function SpiceMeter({ level }: { level: number }) {
  const label = level >= 3 ? "muy picante" : level === 2 ? "picante" : "suave";
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Nivel de picante ${level} de 3: ${label}`}>
      {[1, 2, 3].map((n) => (
        <span key={n} aria-hidden className={n <= level ? "" : "opacity-20 grayscale"}>
          🌶️
        </span>
      ))}
    </span>
  );
}
