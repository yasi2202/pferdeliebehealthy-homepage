"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Jemanden von Hand austragen.
//
// ▸ WOFÜR DU DAS BRAUCHST: Viele schreiben dir einfach zurück „bitte keine
//   Mails mehr", statt zu klicken. Diese Bitte musst du befolgen, und zwar
//   zügig. Hier trägst du die Adresse ein, und sie ist draussen.
// ---------------------------------------------------------------------------

export default function VonHandAbmelden() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [laeuft, setLaeuft] = useState(false);
  const [meldung, setMeldung] = useState<string | null>(null);
  const [fehler, setFehler] = useState<string | null>(null);

  async function abmelden() {
    if (!email.trim()) return;

    setLaeuft(true);
    setMeldung(null);
    setFehler(null);

    try {
      const res = await fetch("/api/admin-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ was: "abmelden", email: email.trim() }),
      });
      const antwort = await res.json().catch(() => ({}));

      if (antwort.ok) {
        setMeldung(antwort.text ?? "Erledigt.");
        setEmail("");
        router.refresh();
      } else {
        setFehler(antwort.fehler ?? "Das hat nicht geklappt.");
      }
    } catch {
      setFehler("Keine Verbindung. Versuch es bitte noch einmal.");
    }

    setLaeuft(false);
  }

  return (
    <div className="rounded-[16px] border border-line bg-white p-5">
      <div className="flex flex-wrap gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="adresse@beispiel.de"
          className="min-w-[240px] flex-1 rounded-full border border-line px-5 py-3 text-[15px] outline-none focus:border-rose-deep"
        />
        <button
          type="button"
          onClick={abmelden}
          disabled={laeuft || !email.trim()}
          className="rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep disabled:opacity-40"
        >
          {laeuft ? "Einen Moment …" : "Austragen"}
        </button>
      </div>

      {meldung && <p className="mt-3 text-[14px] text-ink">{meldung}</p>}
      {fehler && <p className="mt-3 text-[14px] text-rose-deep">{fehler}</p>}
    </div>
  );
}
