/** Icono del taco francés: el sobre de tortilla prensado con la marca de la plancha. Decorativo. */
export default function TacoIcon({ className = "h-7 w-7" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true" focusable="false">
      <rect x="6" y="11" width="36" height="26" rx="7" fill="#F4A261" />
      <path d="M6 22h36v8a7 7 0 0 1-7 7H13a7 7 0 0 1-7-7z" fill="#E9944B" />
      <path d="M12 19l6 6m4-6l6 6m4-6l6 6" stroke="#B8622A" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M14 37c0 3 2 4 2 6m10-6c0 2 1 3 1 4" stroke="#FFD166" strokeWidth="3" strokeLinecap="round" />
      <circle cx="35" cy="15" r="2" fill="#E63946" />
    </svg>
  );
}
