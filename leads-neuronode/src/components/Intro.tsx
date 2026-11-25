/**
 * La intro de neuro·node al abrir la app: el símbolo se dibuja, se enciende el horizonte de luz y
 * aparece el nombre. Solo CSS (globals.css, «Intro»), una vez por sesión, nunca tapa los clics y no
 * existe para quien ha pedido menos movimiento.
 */
export function Intro() {
  return (
    <div className="intro" aria-hidden="true">
      <div className="intro-arco" />
      <svg className="intro-logo" viewBox="0 0 64 64">
        <defs>
          <linearGradient id="intro-g" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0" stopColor="#36ADFB" />
            <stop offset=".5" stopColor="#6447FA" />
            <stop offset="1" stopColor="#7F1EED" />
          </linearGradient>
        </defs>
        <path className="intro-trazo" pathLength={1} d="M19 45V19l26 26V19" fill="none" stroke="url(#intro-g)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle className="intro-nodo" style={{ animationDelay: "0.15s" }} cx="19" cy="45" r="4.5" fill="#36ADFB" />
        <circle className="intro-nodo" style={{ animationDelay: "0.35s" }} cx="19" cy="19" r="4.5" fill="#4F7CF9" />
        <circle className="intro-nodo" style={{ animationDelay: "0.6s" }} cx="45" cy="45" r="4.5" fill="#6447FA" />
        <circle className="intro-nodo" style={{ animationDelay: "0.8s" }} cx="45" cy="19" r="4.5" fill="#7F1EED" />
      </svg>
      <p className="intro-marca">
        neuro<span>·</span>node
      </p>
    </div>
  );
}

/** Se ejecuta antes de pintar: si la intro ya salió en esta sesión, no se vuelve a enseñar. */
export const SCRIPT_INTRO = `try{var k="nn-intro";if(sessionStorage.getItem(k))document.documentElement.setAttribute("data-intro-vista","");else sessionStorage.setItem(k,"1")}catch(e){document.documentElement.setAttribute("data-intro-vista","")}`;
