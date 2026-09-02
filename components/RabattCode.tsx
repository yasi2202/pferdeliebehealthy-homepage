"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Der Rabattcode zum Antippen: ein Klick kopiert ihn in die Zwischenablage.
// Klappt das nicht (ältere Browser, gesperrte Zwischenablage), bleibt der
// Code lesbar und markierbar — es geht also nie etwas verloren.
// ---------------------------------------------------------------------------

export default function RabattCode({ code }: { code: string }) {
  const [zustand, setZustand] = useState<"bereit" | "kopiert" | "fehler">("bereit");

  async function kopieren() {
    try {
      await navigator.clipboard.writeText(code);
      setZustand("kopiert");
      window.setTimeout(() => setZustand("bereit"), 2000);
    } catch {
      setZustand("fehler");
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={kopieren}
        aria-label={`Rabattcode ${code} kopieren`}
        className="group w-full flex items-center justify-between gap-3 border border-dashed border-rose-deep/60 bg-cream rounded-xl px-4 py-3 transition-colors hover:bg-cream-deep hover:border-rose-deep"
      >
        {/* Lange Codes bekommen eine Stufe kleinere Schrift und weniger
            Sperrung. "PFERDELIEBEHEALTHY" brach sonst mitten im Wort um, und
            ein Rabattcode, der über zwei Zeilen läuft, sieht aus wie zwei
            Codes. */}
        <span
          className={`font-medium text-left break-all ${
            code.length > 16
              ? "text-[13px] tracking-normal"
              : "text-[15px] tracking-[0.06em]"
          }`}
        >
          {code}
        </span>
        <span className="text-[12.5px] font-medium text-rose-deep shrink-0">
          {zustand === "kopiert" ? "kopiert ✓" : "Kopieren"}
        </span>
      </button>

      {/* Höflichkeitsmeldung für Screenreader, ohne optisches Springen */}
      <span aria-live="polite" className="sr-only">
        {zustand === "kopiert" ? `Code ${code} wurde kopiert.` : ""}
      </span>

      {zustand === "fehler" && (
        <p className="text-[12px] text-ink-soft mt-2">
          Kopieren hat nicht geklappt, markier den Code bitte von Hand.
        </p>
      )}
    </>
  );
}
