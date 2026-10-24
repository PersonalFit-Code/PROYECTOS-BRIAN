"use client";

import { ArrowLeft, ArrowRight, PartyPopper } from "lucide-react";
import { useEffect, useReducer, useRef, useState } from "react";
import { isSizeId, isStyleId } from "@/data/menu";
import { DRAFT_STORAGE_KEY, INITIAL_DRAFT, draftReducer, meatLimit, sanitizeDraft, type DraftAction, type TacoDraft } from "@/lib/price";
import { readStorage, writeStorage } from "@/lib/storage";
import ProgressBar from "@/components/builder/ProgressBar";
import SoundToggle from "@/components/builder/SoundToggle";
import StepStyle from "@/components/builder/StepStyle";
import StepSize from "@/components/builder/StepSize";
import StepMeats from "@/components/builder/StepMeats";
import StepSauces from "@/components/builder/StepSauces";
import StepExtras from "@/components/builder/StepExtras";
import StepSummary from "@/components/builder/StepSummary";
import SummaryPanel from "@/components/builder/SummaryPanel";
import { fireConfetti } from "@/components/builder/confetti";
import { playClick } from "@/components/builder/sound";

const STEPS = [
  { label: "Estilo", title: "¿Clásico o rebozado?" },
  { label: "Tamaño", title: "Elige tu tamaño" },
  { label: "Carnes", title: "Las carnes" },
  { label: "Salsas", title: "Las salsas" },
  { label: "Extras", title: "¿Gratinamos?" },
  { label: "Resumen", title: "Este es tu taco" },
];
const LAST = STEPS.length - 1;

interface BuilderState {
  draft: TacoDraft;
  step: number;
  dir: "next" | "prev";
  /** Ya se leyó el borrador guardado: a partir de aquí se guarda cada cambio. */
  loaded: boolean;
}
type BuilderAction = { type: "draft"; action: DraftAction } | { type: "goto"; step: number } | { type: "init"; draft: TacoDraft; step: number };

function builderReducer(state: BuilderState, a: BuilderAction): BuilderState {
  switch (a.type) {
    case "draft":
      return { ...state, draft: draftReducer(state.draft, a.action) };
    case "goto": {
      const step = Math.max(0, Math.min(LAST, a.step));
      return { ...state, step, dir: step >= state.step ? "next" : "prev" };
    }
    case "init":
      return { ...state, draft: a.draft, step: a.step, loaded: true };
  }
}

/**
 * Configurador «Monta tu taco». Estado en un reducer puro (`lib/price.ts`), persistido en
 * localStorage (`bh_taco_draft`). Si la URL trae `?estilo=&tamano=` (desde la carta), esa base se
 * precarga encima del borrador y se empieza en el paso de carnes.
 */
export default function TacoBuilder() {
  const [{ draft, step, dir, loaded }, send] = useReducer(builderReducer, { draft: INITIAL_DRAFT, step: 0, dir: "next", loaded: false });
  const [sound, setSound] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  // Carga: borrador guardado + base de la URL. Se hace al montar (el HTML estático no los conoce).
  useEffect(() => {
    let saved = null;
    try {
      saved = sanitizeDraft(JSON.parse(readStorage(DRAFT_STORAGE_KEY) ?? "null"));
    } catch {
      saved = null;
    }
    const params = new URLSearchParams(window.location.search);
    const style = params.get("estilo");
    const size = params.get("tamano");
    let next = saved ?? INITIAL_DRAFT;
    if (isStyleId(style)) next = draftReducer(next, { type: "style", style });
    if (isSizeId(size)) next = draftReducer(next, { type: "size", size });
    send({ type: "init", draft: next, step: isStyleId(style) && isSizeId(size) ? 2 : 0 });
  }, []);

  useEffect(() => {
    if (loaded) writeStorage(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  }, [draft, loaded]);

  // Al cambiar de paso, el foco va al título del paso (lectores de pantalla y teclado).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus({ preventScroll: true });
    headingRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [step]);

  const act = (a: DraftAction) => {
    if (sound) playClick();
    send({ type: "draft", action: a });
  };
  const goTo = (i: number) => send({ type: "goto", step: i });
  const finish = (e: React.MouseEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    fireConfetti({ x: r.left + r.width / 2, y: r.top });
    if (sound) playClick("done");
    goTo(LAST);
  };

  const limit = meatLimit(draft.size);
  const meatsMissing = step === 2 && draft.meats.length === 0;

  return (
    <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
      <div className="min-w-0 pb-24 lg:pb-0">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <ProgressBar step={step} labels={STEPS.map((s) => s.label)} onJump={goTo} />
          </div>
          <SoundToggle on={sound} onChange={setSound} />
        </div>

        <section aria-labelledby="step-title" className="mt-8">
          <div key={step} className="step-in" data-dir={dir}>
            <h2 id="step-title" ref={headingRef} tabIndex={-1} className="mb-6 scroll-mt-28 font-display text-4xl uppercase outline-none sm:text-5xl">
              {STEPS[step].title}
            </h2>
            {step === 0 && <StepStyle value={draft.style} onChange={(style) => act({ type: "style", style })} />}
            {step === 1 && <StepSize style={draft.style} value={draft.size} onChange={(size) => act({ type: "size", size })} />}
            {step === 2 && <StepMeats selected={draft.meats} limit={limit} onToggle={(id) => act({ type: "toggleMeat", id })} />}
            {step === 3 && <StepSauces selected={draft.sauces} onToggle={(id) => act({ type: "toggleSauce", id })} />}
            {step === 4 && <StepExtras selected={draft.extras} onToggle={(id) => act({ type: "toggleExtra", id })} />}
            {step === LAST && (
              <StepSummary
                draft={draft}
                onRestart={() => {
                  send({ type: "draft", action: { type: "reset" } });
                  goTo(0);
                }}
              />
            )}
          </div>
        </section>

        {step < LAST && (
          <div className="mt-10 flex items-center justify-between gap-3">
            <button type="button" onClick={() => goTo(step - 1)} disabled={step === 0} className="press btn btn-ghost disabled:invisible">
              <ArrowLeft className="h-5 w-5" aria-hidden /> Atrás
            </button>
            {step === LAST - 1 ? (
              <button type="button" onClick={finish} className="press btn btn-primary">
                <PartyPopper className="h-5 w-5" aria-hidden /> Ver mi taco
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!meatsMissing) goTo(step + 1);
                }}
                aria-disabled={meatsMissing || undefined}
                aria-describedby={meatsMissing ? "meats-required" : undefined}
                className="press btn btn-primary aria-disabled:opacity-50"
              >
                Siguiente <ArrowRight className="h-5 w-5" aria-hidden />
              </button>
            )}
          </div>
        )}
        {meatsMissing && (
          <p id="meats-required" className="mt-3 text-right text-sm text-fg-muted">
            Elige al menos una carne para seguir.
          </p>
        )}
      </div>

      <div>
        <SummaryPanel draft={draft} />
      </div>
    </div>
  );
}
