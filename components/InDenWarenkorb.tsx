"use client";

// ---------------------------------------------------------------------------
// Mengenwähler und Kaufknopf auf der Produktseite.
//
// Nach dem Klick geht die Warenkorb-Lade auf. Das ist die Rückmeldung: die
// Kundin sieht schwarz auf weiss, dass etwas passiert ist, und gleich, was
// jetzt im Korb liegt.
// ---------------------------------------------------------------------------

import { useState } from "react";
import { useWarenkorb } from "@/components/WarenkorbProvider";
import type { Produkt } from "@/lib/shop";

export default function InDenWarenkorb({ produkt }: { produkt: Produkt }) {
  const { legeRein, oeffneLade } = useWarenkorb();
  const [menge, setMenge] = useState(1);

  if (!produkt.vorraetig) {
    return (
      <div className="rounded-full border border-line bg-cream-deep px-6 py-3.5 text-center text-[15px] text-ink-soft">
        {produkt.ausverkauftText ?? "Zurzeit nicht verfügbar"}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center rounded-full border border-line bg-white">
        <button
          type="button"
          onClick={() => setMenge((m) => Math.max(1, m - 1))}
          aria-label="Eines weniger"
          className="flex h-12 w-11 items-center justify-center rounded-l-full text-[18px] text-ink-soft transition-colors hover:text-ink"
        >
          &minus;
        </button>

        <span
          aria-live="polite"
          className="w-8 text-center text-[16px] tabular-nums"
        >
          {menge}
        </span>

        <button
          type="button"
          onClick={() => setMenge((m) => Math.min(99, m + 1))}
          aria-label="Eines mehr"
          className="flex h-12 w-11 items-center justify-center rounded-r-full text-[18px] text-ink-soft transition-colors hover:text-ink"
        >
          +
        </button>
      </div>

      <button
        type="button"
        onClick={() => {
          legeRein(produkt.slug, menge);
          setMenge(1);
          oeffneLade();
        }}
        className="h-12 flex-grow rounded-full bg-ink px-8 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep sm:flex-grow-0"
      >
        In den Warenkorb
      </button>
    </div>
  );
}
