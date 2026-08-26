"use client";

import { useState } from "react";

// ---------------------------------------------------------------------------
// Ein Knopf pro Beitrag: "An alle Insider schicken".
//
// Mit Rückfrage davor. Ein Rundversand lässt sich nicht zurücknehmen, und ein
// versehentlicher Klick kostet Yasi Abmeldungen — für so etwas ist ein
// zweiter, bewusster Klick die richtige Bremse.
// ---------------------------------------------------------------------------

type Props = {
  slug: string;
  titel: string;
  /** Wie viele bestätigte Insider es gerade gibt. */
  anzahl: number;
};

export default function VersandKnopf({ slug, titel, anzahl }: Props) {
  const [stand, setStand] = useState<"bereit" | "sicher" | "laeuft" | "fertig" | "fehler">(
    "bereit"
  );
  const [meldung, setMeldung] = useState("");

  async function senden() {
    setStand("laeuft");
    try {
      const res = await fetch("/api/insider/versand", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const antwort = await res.json().catch(() => ({ ok: false }));
      if (antwort.ok) {
        setMeldung(`An ${antwort.empfaenger} Adressen verschickt.`);
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
      <div className="bg-cream-deep rounded-[14px] p-4">
        <p className="text-[14px] leading-relaxed mb-4">
          „{titel}" geht an <strong>{anzahl}</strong>{" "}
          {anzahl === 1 ? "Adresse" : "Adressen"}. Das lässt sich nicht
          zurücknehmen.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={senden}
            className="bg-ink text-cream px-5 py-2.5 rounded-full text-[14px] font-medium hover:bg-rose-deep transition-colors"
          >
            Ja, jetzt verschicken
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
        {stand === "laeuft" ? "Wird verschickt …" : "An alle Insider schicken"}
      </button>
      {stand === "fehler" && (
        <p className="text-[13.5px] text-rose-deep mt-3">{meldung}</p>
      )}
    </div>
  );
}
