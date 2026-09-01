"use client";

// ---------------------------------------------------------------------------
// Der Zähler für das Testkundinnen-Angebot.
//
// ▸ DIE FRIST IST FEST, NICHT ROLLEND.
//   Ein Zähler, der bei jeder Besucherin neu bei fünf Tagen anfängt, läuft nie
//   ab. Das ist eine erfundene Knappheit und wäre irreführende Werbung. Hier
//   steht ein Datum, und wenn es vorbei ist, ist es vorbei. Soll das Angebot
//   verlängert werden, wird die Zeile unten geändert, dann stimmt es wieder.
//
// ▸ WAS NACH ABLAUF PASSIERT
//   Der Zähler verschwindet und an seiner Stelle steht, dass das Angebot
//   vorbei ist. Der Kaufknopf bleibt trotzdem bestehen: Wer die Seite später
//   findet, soll nicht ins Leere laufen. Nur der Preis stimmt dann nicht mehr,
//   und genau darauf weist der Satz hin.
//
// ▸ Vor dem ersten Rendern im Browser steht hier nichts. Sonst zeigte der
//   Server eine Zeit an, die eine Sekunde später schon falsch ist, und React
//   beschwert sich über den Unterschied.
// ---------------------------------------------------------------------------

import { useEffect, useState } from "react";

/** Sonntag, 6. September 2026, 23:59:59 deutscher Zeit. */
export const FRIST = "2026-09-06T23:59:59+02:00";

export const FRIST_TEXT = "Sonntag, 6. September 2026, 23:59 Uhr";

type Rest = { tage: number; std: number; min: number; sek: number } | null;

function restBerechnen(): Rest {
  const rest = new Date(FRIST).getTime() - Date.now();
  if (rest <= 0) return null;
  const s = Math.floor(rest / 1000);
  return {
    tage: Math.floor(s / 86400),
    std: Math.floor(s / 3600) % 24,
    min: Math.floor(s / 60) % 60,
    sek: s % 60,
  };
}

function zwei(n: number) {
  return n < 10 ? `0${n}` : String(n);
}

export default function EquiDeskFrist() {
  const [rest, setRest] = useState<Rest>(null);
  const [bereit, setBereit] = useState(false);

  useEffect(() => {
    setRest(restBerechnen());
    setBereit(true);
    const uhr = setInterval(() => setRest(restBerechnen()), 1000);
    return () => clearInterval(uhr);
  }, []);

  if (!bereit) {
    return <div className="min-h-[92px] bg-ink-soft" aria-hidden />;
  }

  if (!rest) {
    return (
      <div className="bg-ink-soft px-6 py-5 text-center text-cream">
        <p className="text-[16px]">
          Das Angebot für Testkundinnen ist am {FRIST_TEXT} abgelaufen.
        </p>
        <p className="mt-1 text-[14px] text-cream/70">
          Schreib mir gerne trotzdem, dann sage ich dir, was gerade möglich ist.
        </p>
      </div>
    );
  }

  const felder: [number | string, string][] = [
    [rest.tage, "Tage"],
    [zwei(rest.std), "Std"],
    [zwei(rest.min), "Min"],
    [zwei(rest.sek), "Sek"],
  ];

  return (
    <div className="bg-ink-soft px-6 py-5 text-cream">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-center">
        <span className="font-serif text-[17px]">
          Das Angebot für Testkundinnen endet in
        </span>

        <span className="flex gap-2">
          {felder.map(([wert, name]) => (
            <span
              key={name}
              className="min-w-[62px] rounded-[10px] bg-cream/15 px-3 py-2"
            >
              <span className="block font-serif text-[24px] leading-tight tabular-nums">
                {wert}
              </span>
              <span className="text-[11px] uppercase tracking-[0.1em] text-rose">
                {name}
              </span>
            </span>
          ))}
        </span>

        <span className="w-full text-[13.5px] text-cream/70">
          bis {FRIST_TEXT}. Danach kostet EquiDesk 19 € im Monat.
        </span>
      </div>
    </div>
  );
}
