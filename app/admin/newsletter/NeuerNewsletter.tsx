"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { VORLAGEN } from "@/lib/newsletter-vorlagen";

// ---------------------------------------------------------------------------
// Der Anfang eines Newsletters: die Wahl der Vorlage.
//
// ▸ WARUM DAS NICHT NUR EIN KNOPF „NEU" IST: Vor einem leeren Feld zu sitzen
//   ist der häufigste Grund, warum ein Newsletter nicht geschrieben wird.
//   Jede Vorlage hier ist ein fertiges Gerüst, das du überschreibst.
// ---------------------------------------------------------------------------

export default function NeuerNewsletter() {
  const router = useRouter();
  const [offen, setOffen] = useState(false);
  const [laeuft, setLaeuft] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  async function anlegen(vorlage: string) {
    setLaeuft(vorlage);
    setFehler(null);

    try {
      const res = await fetch("/api/admin-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ was: "anlegen", vorlage }),
      });
      const antwort = await res.json().catch(() => ({}));

      if (antwort.ok && antwort.id) {
        router.push(`/admin/newsletter/${antwort.id}`);
        return;
      }
      setFehler(antwort.fehler ?? "Das hat gerade nicht geklappt.");
    } catch {
      setFehler("Keine Verbindung. Versuch es bitte noch einmal.");
    }
    setLaeuft(null);
  }

  if (!offen) {
    return (
      <button
        type="button"
        onClick={() => setOffen(true)}
        className="rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep"
      >
        Neuen Newsletter schreiben
      </button>
    );
  }

  return (
    <div className="rounded-[18px] border border-line bg-white p-6 sm:p-7">
      <div className="mb-5 flex items-baseline justify-between gap-4">
        <h2 className="font-serif text-[22px]">Womit fängst du an?</h2>
        <button
          type="button"
          onClick={() => setOffen(false)}
          className="text-[14px] text-ink-soft underline underline-offset-2"
        >
          Abbrechen
        </button>
      </div>

      <div className="space-y-3">
        {VORLAGEN.map((v) => (
          <button
            key={v.schluessel}
            type="button"
            onClick={() => anlegen(v.schluessel)}
            disabled={laeuft !== null}
            className="block w-full rounded-[14px] border border-line p-4 text-left transition-colors hover:border-rose-deep disabled:opacity-50"
          >
            <p className="font-serif text-[18px] text-ink">
              {laeuft === v.schluessel ? "Einen Moment …" : v.name}
            </p>
            <p className="mt-1 text-[14.5px] leading-relaxed text-ink-soft">
              {v.wofuer}
            </p>
          </button>
        ))}
      </div>

      {fehler && <p className="mt-4 text-[14px] text-rose-deep">{fehler}</p>}
    </div>
  );
}
