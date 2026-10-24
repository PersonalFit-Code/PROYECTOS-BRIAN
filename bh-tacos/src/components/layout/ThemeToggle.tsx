"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { writeStorage } from "@/lib/storage";

/* El tema vive en <html data-theme>. El script del layout lo pone antes de pintar, así que aquí
   solo se lee y se cambia (sin parpadeo). */
const EVENT = "bh-theme-change";
const read = () => (document.documentElement.dataset.theme === "light" ? "light" : "dark");
const subscribe = (cb: () => void) => {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
};

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, read, () => "dark");
  const next = theme === "dark" ? "light" : "dark";
  const flip = () => {
    document.documentElement.dataset.theme = next;
    writeStorage("bh_theme", next);
    window.dispatchEvent(new Event(EVENT));
  };
  return (
    <button
      type="button"
      onClick={flip}
      className="press grid h-11 w-11 place-items-center rounded-full border border-line text-fg"
      aria-label={next === "light" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={next === "light" ? "Tema claro" : "Tema oscuro"}
    >
      {theme === "dark" ? <Sun className="h-5 w-5" aria-hidden /> : <Moon className="h-5 w-5" aria-hidden />}
    </button>
  );
}
