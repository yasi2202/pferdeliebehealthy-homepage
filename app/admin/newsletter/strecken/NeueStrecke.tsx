"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ausloeserKauf, ausloeserWahl } from "@/lib/strecken-ausloeser";

const WAHL = ausloeserWahl();

export default function NeueStrecke() {
  const router = useRouter();
  const [offen, setOffen] = useState(false);
  const [name, setName] = useState("");
  const [ausloeser, setAusloeser] = useState("futter-check");
  const [laeuft, setLaeuft] = useState(false);
  const [fehler, setFehler] = useState<string | null>(null);

  async function anlegen() {
    setLaeuft(true);
    setFehler(null);

    try {
      const res = await fetch("/api/admin-strecken", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ was: "anlegen", name, ausloeser }),
      });
      const antwort = await res.json().catch(() => ({}));

      if (antwort.ok && antwort.id) {
        router.push(`/admin/newsletter/strecken/${antwort.id}`);
        return;
      }
      setFehler(antwort.fehler ?? "Das hat nicht geklappt.");
    } catch {
      setFehler("Keine Verbindung. Versuch es bitte noch einmal.");
    }
    setLaeuft(false);
  }

  if (!offen) {
    return (
      <button
        type="button"
        onClick={() => setOffen(true)}
        className="rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep"
      >
        Neue Strecke anlegen
      </button>
    );
  }

  return (
    <div className="rounded-[18px] border border-line bg-white p-6">
      <label className="mb-2 block text-[13px] uppercase tracking-[0.14em] text-ink-soft">
        Wie soll sie heissen?
      </label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Willkommen bei den Insidern"
        className="mb-5 w-full rounded-[14px] border border-line px-5 py-3 text-[15.5px] outline-none focus:border-rose-deep"
      />

      <label className="mb-2 block text-[13px] uppercase tracking-[0.14em] text-ink-soft">
        Für wen läuft sie los?
      </label>
      <select
        value={ausloeser}
        onChange={(e) => setAusloeser(e.target.value)}
        className="mb-3 w-full rounded-[14px] border border-line bg-white px-4 py-3 text-[15.5px] outline-none focus:border-rose-deep"
      >
        {WAHL.map((g) => (
          <optgroup key={g.gruppe} label={g.gruppe}>
            {g.optionen.map((o) => (
              <option key={o.wert} value={o.wert}>
                {o.text}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <p className="mb-6 text-[13.5px] leading-relaxed text-ink-soft">
        {ausloeserKauf(ausloeser)
          ? "Die Tage zählen ab der Zahlung. Hinein läuft nur, wer zugestimmt hat, Post von dir zu bekommen, beim Kauf oder bei einer Anmeldung. Ohne diese Zustimmung wäre die Mail unerlaubte Werbung."
          : "Die Tage zählen ab der Bestätigung der Adresse."}
      </p>

      <div className="flex flex-wrap gap-2.5">
        <button
          type="button"
          onClick={anlegen}
          disabled={laeuft || name.trim().length < 2}
          className="rounded-full bg-ink px-6 py-3 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep disabled:opacity-40"
        >
          {laeuft ? "Einen Moment …" : "Anlegen"}
        </button>
        <button
          type="button"
          onClick={() => setOffen(false)}
          className="rounded-full border border-line px-6 py-3 text-[15px] text-ink-soft"
        >
          Abbrechen
        </button>
      </div>

      {fehler && <p className="mt-4 text-[14px] text-rose-deep">{fehler}</p>}
    </div>
  );
}
