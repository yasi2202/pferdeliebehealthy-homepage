"use client";

import { useEffect, useState } from "react";
import { PIXEL, beobachten, gewaehlt, waehlen, widerrufen } from "@/lib/messung";

// ---------------------------------------------------------------------------
// Der Knopf im Datenschutztext, mit dem sich die Einwilligung in die
// Werbemessung zurücknehmen lässt.
//
// Art. 7 Abs. 3 DSGVO verlangt, dass der Widerruf so einfach ist wie die
// Einwilligung. Ein Satz "schreiben Sie uns eine E-Mail" genügt dafür nicht.
//
// Er zeigt außerdem an, was gerade gilt. Sonst weiß niemand, ob der Klick
// von damals überhaupt gewirkt hat.
// ---------------------------------------------------------------------------

export default function EinwilligungWiderruf() {
  const [wahl, setWahl] = useState<"ja" | "nein" | null>(null);
  const [bereit, setBereit] = useState(false);

  useEffect(() => {
    const lesen = () => {
      setWahl(gewaehlt());
      setBereit(true);
    };
    lesen();
    return beobachten(lesen);
  }, []);

  if (!PIXEL || !bereit) return null;

  return (
    <p style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
      <span>
        {wahl === "ja"
          ? "Aktueller Stand: Sie haben eingewilligt."
          : "Aktueller Stand: Es wird nicht gemessen."}
      </span>
      <button
        type="button"
        onClick={() => (wahl === "ja" ? widerrufen() : waehlen("ja"))}
        style={{
          border: "1px solid var(--line)",
          borderRadius: 10,
          padding: "9px 16px",
          fontSize: 15,
          fontWeight: 700,
          fontFamily: "inherit",
          cursor: "pointer",
          background: "var(--white)",
          color: "var(--ink)",
        }}
      >
        {wahl === "ja" ? "Einwilligung widerrufen" : "Doch einwilligen"}
      </button>
    </p>
  );
}
