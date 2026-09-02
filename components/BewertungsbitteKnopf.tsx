"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Löst die einmalige Bitte um eine Google-Bewertung an den Verteiler aus.
//
// Mit Rückfrage davor, wie bei jedem Rundversand: Es geht an alle bestätigten
// Adressen auf einmal und lässt sich nicht zurücknehmen.
// ---------------------------------------------------------------------------

export default function BewertungsbitteKnopf({ anzahl }: { anzahl: number }) {
  const [stand, setStand] = useState<"bereit" | "sicher" | "laeuft" | "fertig" | "fehler">(
    "bereit"
  );
  const [meldung, setMeldung] = useState("");

  async function senden() {
    setStand("laeuft");
    try {
      const res = await fetch("/api/insider/bewertung", { method: "POST" });
      const antwort = await res.json().catch(() => ({ ok: false }));
      if (antwort.ok) {
        const uebersprungen = antwort.uebersprungen ?? 0;
        setMeldung(
          `An ${antwort.empfaenger} Adressen verschickt.` +
            (uebersprungen > 0
              ? ` ${uebersprungen} ${uebersprungen === 1 ? "Adresse war" : "Adressen waren"} fehlerhaft und ${uebersprungen === 1 ? "wurde" : "wurden"} übersprungen.`
              : "")
        );
        setStand("fertig");
      } else {
        setMeldung(antwort.fehler ?? "Das hat nicht geklappt.");
        setStand("fehler");
      }
    } catch {
      setMeldung("Ich konnte den Server nicht erreichen.");
      setStand("fehler");
    }
  }

  if (stand === "fertig") {
    return <p className="text-[14px] text-rose-deep font-medium">✓ {meldung}</p>;
  }

  if (stand === "sicher") {
    return (
      <div className="bg-white rounded-[14px] border border-line p-4">
        <p className="text-[14px] leading-relaxed mb-4">
          Die Bitte geht an <strong>{anzahl}</strong>{" "}
          {anzahl === 1 ? "bestätigte Adresse" : "bestätigte Adressen"} und
          lässt sich nur einmal verschicken. Eine zweite Bitte um dieselbe
          Bewertung wäre keine Bitte mehr.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={senden}
            className="bg-ink text-cream px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-rose-deep transition-colors"
          >
            Ja, jetzt fragen
          </button>
          <button
            type="button"
            onClick={() => setStand("bereit")}
            className="border border-line text-ink-soft px-5 py-2.5 rounded-full text-[14px] font-medium hover:text-ink hover:border-ink transition-colors"
          >
            Doch nicht
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={stand === "laeuft"}
        onClick={() => setStand("sicher")}
        className="bg-rose-deep text-cream px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-ink transition-colors disabled:opacity-50"
      >
        {stand === "laeuft" ? "Wird verschickt …" : "Um Bewertungen bitten"}
      </button>
      {stand === "fehler" && (
        <p className="text-[13.5px] text-rose-deep mt-3">{meldung}</p>
      )}
    </div>
  );
}
