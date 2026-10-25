/*
 * Confeti discreto, sin librerías: ~70 papelitos en un canvas temporal, 1,4 s y se borra solo.
 * Es una celebración que se ve una vez por pedido (Emil: lo raro puede tener deleite). Con
 * movimiento reducido no se lanza.
 */
const COLORS = ["#F08A24", "#FFD23F", "#8A2E1A", "#2A9D8F", "#F3E7D3"];

export function fireConfetti(origin?: { x: number; y: number }) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.createElement("canvas");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.setAttribute("aria-hidden", "true");
  Object.assign(canvas.style, { position: "fixed", inset: "0", width: "100%", height: "100%", pointerEvents: "none", zIndex: "90" });
  document.body.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }
  ctx.scale(dpr, dpr);
  const ox = origin?.x ?? window.innerWidth / 2;
  const oy = origin?.y ?? window.innerHeight * 0.6;
  const parts = Array.from({ length: 70 }, () => {
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
    const speed = 7 + Math.random() * 7;
    return { x: ox, y: oy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, r: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.4, w: 6 + Math.random() * 5, h: 3 + Math.random() * 4, c: COLORS[Math.floor(Math.random() * COLORS.length)] };
  });
  const start = performance.now();
  const DURATION = 1400;
  const frame = (t: number) => {
    const p = (t - start) / DURATION;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    for (const q of parts) {
      q.vy += 0.32;
      q.vx *= 0.985;
      q.x += q.vx;
      q.y += q.vy;
      q.r += q.vr;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p * p);
      ctx.translate(q.x, q.y);
      ctx.rotate(q.r);
      ctx.fillStyle = q.c;
      ctx.fillRect(-q.w / 2, -q.h / 2, q.w, q.h);
      ctx.restore();
    }
    if (p < 1) requestAnimationFrame(frame);
    else canvas.remove();
  };
  requestAnimationFrame(frame);
}
