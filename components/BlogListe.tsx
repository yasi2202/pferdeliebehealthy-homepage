"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { kategorieFarbe } from "@/lib/blog-farben";

// ---------------------------------------------------------------------------
// Die Blogübersicht als Karten.
//
// Warum Karten und nicht die schlichte Liste wie im Insider-Bereich: Dort
// weiss man schon, warum man da ist. Hierher kommt man von Google, mit einer
// Frage im Kopf und ohne jede Bindung. Man muss auf einen Blick sehen, dass
// hier mehr steht als der eine Text, den man gesucht hat.
//
// Der neueste Beitrag steht als breite Karte oben. Ohne diesen Unterschied
// sieht ein Blog mit drei Beitraegen aus wie eine Liste, die nicht fertig
// geworden ist.
//
// Solange ein Beitrag kein Foto hat, traegt eine Farbflaeche mit dem
// Kategorienamen das Bild. Kommt spaeter ein Foto dazu, tritt die Farbe von
// selbst zurueck. Bewusst keine gezeichneten Pferde: lieber Farbe und
// Schrift als eine Illustration, die nach Baukasten aussieht.
// ---------------------------------------------------------------------------

type Eintrag = {
  slug: string;
  titel: string;
  beschreibung: string;
  kategorie: string;
  lesezeit: number;
  bild: string;
  bildText: string;
};

/** Die Bildflaeche einer Karte: Foto, wenn eins da ist, sonst Farbe. */
function Kopfbild({
  beitrag,
  hoehe,
  kategorien,
}: {
  beitrag: Eintrag;
  hoehe: string;
  /** Alle Kategorien des Blogs, fuer die Farbverteilung. */
  kategorien: string[];
}) {
  const farbe = kategorieFarbe(beitrag.kategorie, kategorien);

  if (beitrag.bild) {
    return (
      <div className={`relative ${hoehe} overflow-hidden`}>
        <Image
          src={beitrag.bild}
          alt={beitrag.bildText || beitrag.titel}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative ${hoehe} ${farbe.flaeche} ${farbe.schrift} overflow-hidden flex items-center justify-center`}
      aria-hidden="true"
    >
      {/* Ein feines Punktraster nimmt der Flaeche das Leere, ohne dass eine
          Zeichnung noetig waere. Die Farbe kommt aus der Schriftfarbe, das
          Muster passt sich also jeder Kartenfarbe von selbst an. */}
      <span
        className="absolute inset-0 opacity-[0.18]"
        style={{
          backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
          backgroundSize: "13px 13px",
        }}
      />
      {/* Der Kategoriename als Schmuck, nicht als Inhalt — deshalb ist die
          ganze Flaeche für Vorlesegeräte unsichtbar. */}
      <span className="relative font-serif italic text-[21px] sm:text-[24px] opacity-90 px-6 text-center leading-snug">
        {beitrag.kategorie}
      </span>
    </div>
  );
}

function Marken({ beitrag }: { beitrag: Eintrag }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] tracking-[0.1em] uppercase font-semibold">
      <span className="text-rose-deep">{beitrag.kategorie}</span>
      <span className="text-ink-soft/50">·</span>
      <span className="text-ink-soft tabular-nums">
        {beitrag.lesezeit} Min. Lesezeit
      </span>
    </div>
  );
}

export default function BlogListe({ beitraege }: { beitraege: Eintrag[] }) {
  const [gewaehlt, setGewaehlt] = useState<string>("alle");

  const kategorien = Array.from(new Set(beitraege.map((b) => b.kategorie))).sort(
    (a, b) => a.localeCompare(b, "de")
  );

  const sichtbar =
    gewaehlt === "alle" ? beitraege : beitraege.filter((b) => b.kategorie === gewaehlt);

  // Ein einziger Knopf neben "Alle" ist kein Filter, sondern Deko.
  const filterZeigen = kategorien.length > 1;

  // Der Aufmacher steht nur in der ungefilterten Ansicht gross. Sobald
  // gefiltert wird, sind alle Treffer gleich wichtig.
  const aufmacher = gewaehlt === "alle" ? sichtbar[0] : undefined;
  const weitere = aufmacher ? sichtbar.slice(1) : sichtbar;

  return (
    <>
      {filterZeigen && (
        <h2 className="text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-6">
          Worüber möchtest du lesen?
        </h2>
      )}

      {filterZeigen && (
        <div className="flex flex-wrap gap-2 mb-10">
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

      {aufmacher && (
        <Link
          href={`/blog/${aufmacher.slug}`}
          className="group block mb-6 rounded-[26px] overflow-hidden bg-white border border-line transition-shadow hover:shadow-[0_18px_50px_-24px_rgba(59,42,40,0.35)]"
        >
          <div className="grid sm:grid-cols-2">
            <Kopfbild
              beitrag={aufmacher}
              hoehe="h-52 sm:h-full sm:min-h-[300px]"
              kategorien={kategorien}
            />
            <div className="p-7 sm:p-9 flex flex-col justify-center">
              <span className="inline-block text-[11px] tracking-[0.16em] uppercase text-rose-deep font-semibold mb-3">
                Neuester Beitrag
              </span>
              <h3 className="font-serif text-[26px] sm:text-[31px] leading-[1.18] mb-3 group-hover:text-rose-deep transition-colors">
                {aufmacher.titel}
              </h3>
              <p className="text-[15.5px] text-ink-soft leading-relaxed mb-5">
                {aufmacher.beschreibung}
              </p>
              <Marken beitrag={aufmacher} />
            </div>
          </div>
        </Link>
      )}

      <div className="grid sm:grid-cols-2 gap-6">
        {weitere.map((b) => (
          <Link
            key={b.slug}
            href={`/blog/${b.slug}`}
            className="group flex flex-col rounded-[24px] overflow-hidden bg-white border border-line transition-shadow hover:shadow-[0_18px_50px_-24px_rgba(59,42,40,0.35)]"
          >
            <Kopfbild beitrag={b} hoehe="h-36" kategorien={kategorien} />
            <div className="p-6 sm:p-7 flex flex-col grow">
              <Marken beitrag={b} />
              <h3 className="font-serif text-[21px] sm:text-[23px] leading-snug mt-3 mb-2.5 group-hover:text-rose-deep transition-colors">
                {b.titel}
              </h3>
              <p className="text-[15px] text-ink-soft leading-relaxed grow">
                {b.beschreibung}
              </p>
              <span className="mt-6 text-[14px] font-medium text-rose-deep">
                Lesen →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {sichtbar.length === 0 && (
        <p className="text-[15px] text-ink-soft py-10">
          In dieser Kategorie steht noch nichts.
        </p>
      )}
    </>
  );
}
