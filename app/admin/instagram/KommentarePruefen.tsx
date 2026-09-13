"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Knopf: die Kommentare der letzten Tage jetzt durchsehen und beantworten.
// Die Arbeit macht /api/admin-instagram.
// ---------------------------------------------------------------------------

export default function KommentarePruefen() {
  const router = useRouter();
  const [laeuft, setLaeuft] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  async function pruefen() {
    setLaeuft(true);
    setMeldung(null);
    setFehler(null);

    try {
      const res = await fetch("/api/admin-instagram", { method: "POST" });
      const antwort = await res.json().catch(() => ({}));

      if (antwort.ok) {
        setMeldung(antwort.text ?? "Erledigt.");
      } else {
        setFehler(antwort.fehler ?? "Das hat nicht geklappt.");
      }
      router.refresh();
    } catch {
      setFehler("Keine Verbindung. Versuch es bitte noch einmal.");
    }

    setLaeuft(false);
  }

  return (
    <div>
      <button
        type="button"
        onClick={pruefen}
        disabled={laeuft}
        className="rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep disabled:opacity-40"
      >
        {laeuft ? "Einen Moment …" : "Kommentare jetzt prüfen"}
      </button>
      {meldung && <p className="mt-3 text-[14px] text-ink">{meldung}</p>}
      {fehler && <p className="mt-3 text-[14px] text-rose-deep">{fehler}</p>}
    </div>
  );
}
