"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Der Knopf im Adminbereich, der die Bitte um eine Bewertung auslöst.
//
// ▸ WOFÜR
//   Der tägliche Lauf fragt vier Wochen nach dem Kauf. Bei einer Beratung
//   passt das nicht, dort weiß nur Yasemin, wann sie fertig ist. Dieser Knopf
//   verschickt die Mail dann, wenn es passt.
//
// ▸ ER SAGT, WARUM ETWAS NICHT GEHT, statt nur „Fehler" zu zeigen. Die
//   häufigste Antwort wird sein, dass die Kundin beim Kauf nicht zugestimmt
//   hat, Post zu bekommen. Das ist kein Fehler, sondern die Rechtslage, und
//   dann soll dort auch genau das stehen.
//
// ▸ NACH EINEM ERFOLG BLEIBT ER AUS. Zweimal nach einer Bewertung zu fragen
//   macht aus einer Bitte eine Belästigung, deshalb sperrt sich der Knopf
//   selbst, und die Route lehnt einen zweiten Versuch ohnehin ab.
// ---------------------------------------------------------------------------

export default function BewertungKnopf({
  nummer,
  schonGefragt,
}: {
  nummer: string;
  /** Wann schon gefragt wurde, als ISO-Datum. Leer heißt: noch nicht. */
  schonGefragt?: string | null;
}) {
  const [zustand, setZustand] = useState<"bereit" | "laeuft" | "fertig">(
    schonGefragt ? "fertig" : "bereit",
  );
  const [meldung, setMeldung] = useState<string | null>(null);

  if (zustand === "fertig") {
    return (
      <span className="text-[13px] text-ink-soft" title={meldung ?? undefined}>
        gefragt
      </span>
    );
  }

  const senden = async () => {
    setZustand("laeuft");
    setMeldung(null);

    try {
      const antwort = await fetch("/api/admin-bewertungsbitte", {
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
        {zustand === "laeuft" ? "sendet…" : "Bewertung erbitten"}
      </button>

      {meldung && (
        <span className="max-w-[260px] text-right text-[12px] leading-snug text-ink-soft">
          {meldung}
        </span>
      )}
    </span>
  );
}
