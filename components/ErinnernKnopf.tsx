"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Der Knopf im Adminbereich, der an eine liegengebliebene Bestellung
// erinnert.
//
// ▸ ER FRAGT VORHER NACH. Anders als die Bitte um eine Bewertung geht diese
//   Mail an jemanden, der gerade NICHT gekauft hat. Ein Fehlklick wäre
//   peinlich und nicht zurückzuholen, deshalb eine Rückfrage.
//
// ▸ NACH EINEM ERFOLG BLEIBT ER AUS, und die Route lehnt einen zweiten
//   Versuch ohnehin ab. Zweimal an denselben Einkauf zu erinnern ist kein
//   Service mehr.
//
// ▸ ER SAGT, WARUM ETWAS NICHT GEHT. Meistens wird das die fehlende
//   Einwilligung sein. Das ist kein Fehler, sondern die Rechtslage, und dann
//   soll dort auch genau das stehen.
// ---------------------------------------------------------------------------

export default function ErinnernKnopf({
  nummer,
  name,
}: {
  nummer: string;
  /** Nur für die Rückfrage, damit dort steht, wer Post bekommt. */
  name: string;
}) {
  const [zustand, setZustand] = useState<"bereit" | "laeuft" | "fertig">(
    "bereit",
  );
  const [meldung, setMeldung] = useState<string | null>(null);

  if (zustand === "fertig") {
    return <span className="text-[13px] text-ink-soft">erinnert</span>;
  }

  const senden = async () => {
    if (!confirm(`Erinnerung an ${name} verschicken?`)) return;

    setZustand("laeuft");
    setMeldung(null);

    try {
      const antwort = await fetch("/api/admin-erinnerung", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nummer }),
      });

      const daten = await antwort.json();

      if (antwort.ok) {
        setZustand("fertig");
        return;
      }

      setMeldung(daten.fehler ?? "Das hat nicht geklappt.");
      setZustand("bereit");
    } catch {
      setMeldung("Keine Verbindung. Noch einmal versuchen?");
      setZustand("bereit");
    }
  };

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={senden}
        disabled={zustand === "laeuft"}
        className="text-[13.5px] text-rose-deep underline underline-offset-2 disabled:opacity-50"
      >
        {zustand === "laeuft" ? "sendet…" : "erinnern"}
      </button>

      {meldung && (
        <span className="max-w-[280px] text-right text-[12px] leading-snug text-ink-soft">
          {meldung}
        </span>
      )}
    </span>
  );
}
