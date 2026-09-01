"use client";

// ---------------------------------------------------------------------------
// Das Anmeldefeld für den Auswertungsbereich.
//
// Bewusst schmucklos: Diese Seite sieht niemand ausser Yasemin, und sie soll
// nicht aussehen wie ein Teil des Angebots. Wer hier zufällig landet, soll
// nicht neugierig werden.
// ---------------------------------------------------------------------------

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminAnmeldung() {
  const router = useRouter();
  const [passwort, setPasswort] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  const anmelden = async () => {
    if (!passwort || laeuft) return;

    setLaeuft(true);
    setFehler(null);

    try {
      const antwort = await fetch("/api/admin-anmelden", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passwort }),
      });

      if (antwort.ok) {
        // refresh statt push: Die Seite ist dieselbe, nur der Keks ist neu.
        router.refresh();
        return;
      }

      const daten = await antwort.json();
      setFehler(daten.fehler ?? "Das hat nicht gepasst.");
    } catch {
      setFehler("Die Verbindung hat nicht geklappt.");
    }

    setLaeuft(false);
  };

  return (
    <div className="mx-auto max-w-sm rounded-[18px] border border-line bg-white p-7">
      <h1 className="mb-5 font-serif text-[22px]">Auswertung</h1>

      <label className="mb-1.5 block text-[13.5px] text-ink-soft">
        Passwort
      </label>

      <input
        type="password"
        autoFocus
        value={passwort}
        onChange={(e) => {
          setPasswort(e.target.value);
          setFehler(null);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") anmelden();
        }}
        className="w-full rounded-[12px] border border-line bg-white px-4 py-3 text-[15px] outline-none transition-colors focus:border-rose-deep"
      />

      {fehler && (
        <p role="alert" className="mt-3 text-[13.5px] text-ink-soft">
          {fehler}
        </p>
      )}

      <button
        type="button"
        onClick={anmelden}
        disabled={!passwort || laeuft}
        className="mt-5 w-full rounded-full bg-ink px-6 py-3.5 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep disabled:cursor-not-allowed disabled:opacity-40"
      >
        {laeuft ? "Einen Moment…" : "Anmelden"}
      </button>
    </div>
  );
}
