"use client";

// ---------------------------------------------------------------------------
// Das Warenkorb-Symbol in der Kopfzeile.
//
// Steht neben dem Schloss. Solange nichts drin ist, ist es nur ein Symbol.
// Sobald etwas drin liegt, sitzt ein kleiner Kreis mit der Anzahl darauf.
//
// Die Zahl wird erst gezeichnet, wenn der Korb aus dem Browser gelesen ist
// (`bereit`). Sonst käme beim ersten Zeichnen auf dem Server eine andere
// Zahl heraus als danach im Browser, und React meldet das als Fehler.
// ---------------------------------------------------------------------------

import { useWarenkorb } from "@/components/WarenkorbProvider";
import { shopSichtbar } from "@/lib/shop";

export function Korbsymbol({ groesse = 17 }: { groesse?: number }) {
  return (
    <svg
      width={groesse}
      height={groesse}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5.5 8h13l-1.2 11.2a1.6 1.6 0 0 1-1.6 1.4H8.3a1.6 1.6 0 0 1-1.6-1.4Z" />
      <path d="M8.8 8V6.2a3.2 3.2 0 0 1 6.4 0V8" />
    </svg>
  );
}

export default function WarenkorbKnopf({
  hell = false,
  groesse = 17,
}: {
  /** true = die Kopfzeile ist noch durchsichtig über dem Startbild. */
  hell?: boolean;
  groesse?: number;
}) {
  const { anzahl, oeffneLade, bereit } = useWarenkorb();
  const voll = bereit && anzahl > 0;

  // Solange der Shop nicht freigeschaltet ist, wäre ein Warenkorb in der
  // Kopfzeile ein Symbol, das nirgendwohin führt. Er zeigt sich dann nur,
  // wenn wirklich etwas darin liegt -- also nur dem, der den Shop über die
  // direkte Adresse gefunden hat. Der Schalter sitzt in lib/shop.ts.
  if (!shopSichtbar && !voll) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={oeffneLade}
      aria-label={
        voll
          ? `Warenkorb öffnen, ${anzahl} ${anzahl === 1 ? "Artikel" : "Artikel"}`
          : "Warenkorb öffnen"
      }
      title="Warenkorb"
      className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
        hell ? "text-cream hover:bg-white/15" : "text-ink hover:bg-cream-deep"
      }`}
    >
      <Korbsymbol groesse={groesse} />

      {voll && (
        <span
          className={`absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-[5px] text-[11px] font-semibold tabular-nums ${
            hell ? "bg-cream text-ink" : "bg-rose-deep text-white"
          }`}
        >
          {anzahl}
        </span>
      )}
    </button>
  );
}
