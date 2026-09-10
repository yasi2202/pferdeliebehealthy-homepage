"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Ein Link mit einem Knopf zum Kopieren.
//
// Klingt nach Kleinkram, ist aber der wichtigste Knopf im Empfehlungskonto:
// Der Link wird auf dem Handy gebraucht, und dort ist Markieren und Kopieren
// von Hand eine Zumutung. Wer es nicht schafft, teilt den Link nicht, und
// dann verkauft auch niemand etwas.
//
// ▸ WARUM EIN RÜCKFALL AUF document.execCommand DRIN STEHT
//   navigator.clipboard gibt es nur auf verschlüsselten Verbindungen und
//   nicht in jedem älteren Browser. Ohne Rückfall passiert dort beim Drücken
//   gar nichts, ohne Fehlermeldung. Der alte Weg ist hässlich, aber er
//   funktioniert überall.
// ---------------------------------------------------------------------------

export default function EmpfehlungsLink({ link }: { link: string }) {
  const [kopiert, setKopiert] = useState(false);

  async function kopieren() {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(link);
      } else {
        const feld = document.createElement("textarea");
        feld.value = link;
        feld.style.position = "fixed";
        feld.style.opacity = "0";
        document.body.appendChild(feld);
        feld.select();
        document.execCommand("copy");
        document.body.removeChild(feld);
      }

      setKopiert(true);
      setTimeout(() => setKopiert(false), 2500);
    } catch {
      // Klappt es nicht, steht der Link ja weiterhin lesbar da.
      setKopiert(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <code className="min-w-0 flex-1 break-all rounded-[10px] bg-white px-4 py-3.5 text-[15px] text-ink">
        {link}
      </code>

      <button
        type="button"
        onClick={kopieren}
        className="shrink-0 rounded-full bg-rose-deep px-6 py-3.5 text-[15px] font-medium text-cream transition-colors hover:bg-ink"
      >
        {kopiert ? "Kopiert" : "Kopieren"}
      </button>
    </div>
  );
}
