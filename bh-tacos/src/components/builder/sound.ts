/* Sonido opcional (apagado por defecto): un «clic» corto con WebAudio, sin ficheros de audio. */
let ctx: AudioContext | null = null;

export function playClick(kind: "select" | "done" = "select") {
  try {
    ctx ??= new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "triangle";
    osc.frequency.value = kind === "done" ? 880 : 520;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (kind === "done" ? 0.25 : 0.08));
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch {
    /* sin audio disponible: no pasa nada */
  }
}
