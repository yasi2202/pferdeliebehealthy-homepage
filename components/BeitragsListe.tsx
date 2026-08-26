"use client";

import { useState } from "react";
import Link from "next/link";
import type { BeitragKopf } from "@/lib/beitraege";

// Bewusst hier und nicht aus lib/beitraege.ts geholt: jene Datei liest den
// Ordner mit den Beiträgen vom Server und darf deshalb nicht im Browser
// landen. Der Typ oben ist unkritisch — Typen verschwinden beim Bauen.
function datumDeutsch(datum: string): string {
  if (!datum) return "";
  const [j, m, t] = datum.split("-");
  return `${t}.${m}.${j}`;
}

// ---------------------------------------------------------------------------
// Die Liste der Beiträge mit Filterknöpfen darüber.
//
// Gefiltert wird im Browser, nicht über die Adresse. Bei einer überschaubaren
// Zahl Beiträge ist das der bessere Weg: kein Neuladen, kein Warten, und die
// Übersicht bleibt eine einzige Seite, die Google auch als eine sieht.
//
// Die Kategorien kommen aus den Beiträgen selbst. Was in den Dateien steht,
// taucht als Knopf auf — es gibt also keine Liste, die man zusätzlich pflegen
// müsste und die irgendwann nicht mehr zu den Texten passt.
// ---------------------------------------------------------------------------

export default function BeitragsListe({ beitraege }: { beitraege: BeitragKopf[] }) {
  const [gewaehlt, setGewaehlt] = useState<string>("alle");

  const kategorien = Array.from(new Set(beitraege.map((b) => b.kategorie))).sort(
    (a, b) => a.localeCompare(b, "de")
  );

  const sichtbar =
    gewaehlt === "alle" ? beitraege : beitraege.filter((b) => b.kategorie === gewaehlt);

  // Ein einziger Knopf neben "Alle" ist kein Filter, sondern Deko.
  const filterZeigen = kategorien.length > 1;

  return (
    <>
      {filterZeigen && (
        <div className="flex flex-wrap gap-2 mb-9">
          {["alle", ...kategorien].map((k) => {
            const aktiv = gewaehlt === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setGewaehlt(k)}
                aria-pressed={aktiv}
                className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${
                  aktiv
                    ? "bg-ink text-cream"
                    : "bg-white border border-line text-ink-soft hover:text-ink hover:border-ink"
                }`}
              >
                {k === "alle" ? "Alle Beiträge" : k}
              </button>
            );
          })}
        </div>
      )}

      <ul className="divide-y divide-line border-t border-line">
        {sichtbar.map((b) => (
          <li key={b.slug}>
            <Link
              href={`/insider/${b.slug}`}
              className="group block py-7 transition-colors hover:bg-white/60 -mx-4 px-4 rounded-xl"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                {b.datum && (
                  <span className="text-[12.5px] text-ink-soft tabular-nums">
                    {datumDeutsch(b.datum)}
                  </span>
                )}
                <span className="text-[11.5px] tracking-[0.1em] uppercase text-rose-deep font-semibold">
                  {b.kategorie}
                </span>
              </div>

              <h3 className="font-serif text-[22px] sm:text-[25px] leading-snug group-hover:text-rose-deep transition-colors">
                {b.titel}
              </h3>

              {b.beschreibung && (
                <p className="text-[15px] text-ink-soft mt-2 max-w-xl">
                  {b.beschreibung}
                </p>
              )}

              {/* Sagt vor dem Klick, was danach kommt. Ohne diesen Hinweis
                  wirkt die Schranke wie eine Überraschung statt wie eine
                  Bedingung. */}
              <span className="inline-block text-[14px] font-medium text-rose-deep mt-3">
                Für Insider lesen →
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {sichtbar.length === 0 && (
        <p className="text-[15px] text-ink-soft py-10">
          In dieser Kategorie steht noch nichts.
        </p>
      )}
    </>
  );
}
