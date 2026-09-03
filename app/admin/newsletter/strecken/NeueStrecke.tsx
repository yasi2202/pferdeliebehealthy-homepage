"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const AUSLOESER = [
  { wert: "insider", text: "wer sich für den Insider-Kanal einträgt" },
  { wert: "futter-check", text: "wer den Futter-Check macht" },
  { wert: "alle", text: "jede neue Anmeldung, egal woher" },
];

export default function NeueStrecke() {
  const router = useRouter();
  const [offen, setOffen] = useState(false);
  const [name, setName] = useState("");
  const [ausloeser, setAusloeser] = useState("insider");
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
      <div className="mb-6 space-y-2">
        {AUSLOESER.map((a) => (
          <label
            key={a.wert}
            className="flex cursor-pointer items-center gap-3 rounded-[12px] border border-line p-3 text-[15px]"
          >
            <input
              type="radio"
              name="ausloeser"
              value={a.wert}
              checked={ausloeser === a.wert}
              onChange={() => setAusloeser(a.wert)}
              className="accent-rose-deep"
            />
            {a.text}
          </label>
        ))}
      </div>

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
