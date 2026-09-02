"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { kategorieFarbe } from "@/lib/blog-farben";

// ---------------------------------------------------------------------------
// Die Beitragsliste, benutzt von /blog und von den Themenseiten.
//
// Zwei Entscheidungen, die man erklären muss:
//
// 1. Die Themenknöpfe sind echte Links auf /blog/thema/..., kein Umschalten
//    im Browser. Ein Filter, der nur im Browser wirkt, existiert für Google
//    nicht; eine eigene Adresse je Thema kann dagegen selbst in den
//    Suchergebnissen stehen. Das kostet einen Seitenwechsel und bringt
//    Sichtbarkeit, die ein Filter nie hätte.
//
// 2. Die Suche läuft dagegen im Browser und ohne Server. Sie durchsucht
//    Titel, Beschreibung und Thema, nicht den ganzen Fließtext: Dafür müsste
//    jeder Beitrag vollständig mitgeladen werden, und das lohnt bei einer
//    Sammlung dieser Größe nicht.
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

type Thema = { name: string; slug: string; anzahl: number };

/** Der Kopf einer Karte: das Foto, wenn eins da ist, sonst ein schmaler
 *  Farbstreifen.
 *
 *  Vorher stand hier eine große Farbfläche mit dem Kategorienamen darin, als
 *  Ersatz für das fehlende Foto. Bei drei Beiträgen sah das nach Absicht aus,
 *  bei einundzwanzig nach Flickenteppich. */
function Kopfbild({
  beitrag,
  hoehe,
  kategorien,
}: {
  beitrag: Eintrag;
  hoehe: string;
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

  return <div className={`h-1.5 ${farbe.strich}`} aria-hidden="true" />;
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

export default function BlogListe({
  beitraege,
  kategorien,
  alleKategorien,
  aktiv,
}: {
  beitraege: Eintrag[];
  /** Alle Themen mit Adresse und Anzahl, für die Knöpfe. */
  kategorien: Thema[];
  /** Die Kategorie jedes Beitrags im ganzen Blog, für die Farbverteilung. */
  alleKategorien: string[];
  /** Adresse des gerade gezeigten Themas. Fehlt sie, stehen alle Beiträge da. */
  aktiv?: string;
}) {
  const [suche, setSuche] = useState("");

  const gesucht = suche.trim().toLowerCase();
  const sichtbar = gesucht
    ? beitraege.filter((b) =>
        `${b.titel} ${b.beschreibung} ${b.kategorie}`.toLowerCase().includes(gesucht)
      )
    : beitraege;

  // Der Aufmacher steht nur in der ungefilterten, ungesuchten Ansicht groß.
  const aufmacher = !aktiv && !gesucht ? sichtbar[0] : undefined;
  const weitere = aufmacher ? sichtbar.slice(1) : sichtbar;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 mb-6">
        <h2 className="text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold">
          Worüber möchtest du lesen?
        </h2>

        <label className="relative">
          <span className="sr-only">Beiträge durchsuchen</span>
          <input
            type="search"
            value={suche}
            onChange={(e) => setSuche(e.target.value)}
            placeholder="Suchen, z. B. Kotwasser"
            className="w-[240px] max-w-full bg-white border border-line rounded-full pl-4 pr-4 py-2 text-[14px] placeholder:text-ink-soft/60 focus:outline-none focus:border-rose-deep transition-colors"
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/blog"
          aria-current={!aktiv ? "page" : undefined}
          className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${
            !aktiv
              ? "bg-ink text-cream"
              : "bg-white border border-line text-ink-soft hover:text-ink hover:border-ink"
          }`}
        >
          Alle Beiträge
        </Link>

        {kategorien.map((k) => (
          <Link
            key={k.slug}
            href={`/blog/thema/${k.slug}`}
            aria-current={aktiv === k.slug ? "page" : undefined}
            className={`px-4 py-2 rounded-full text-[14px] font-medium transition-colors ${
              aktiv === k.slug
                ? "bg-ink text-cream"
                : "bg-white border border-line text-ink-soft hover:text-ink hover:border-ink"
            }`}
          >
            {k.name}
            <span
              className={`ml-1.5 tabular-nums ${
                aktiv === k.slug ? "text-cream/60" : "text-ink-soft/60"
              }`}
            >
              {k.anzahl}
            </span>
          </Link>
        ))}
      </div>

      {aufmacher && (
        <Link
          href={`/blog/${aufmacher.slug}`}
          className="group block mb-6 rounded-[26px] overflow-hidden bg-white border border-line transition-shadow hover:shadow-[0_18px_50px_-24px_rgba(59,42,40,0.35)]"
        >
          <Kopfbild
            beitrag={aufmacher}
            hoehe="h-52 sm:h-64"
            kategorien={alleKategorien}
          />
          <div className="p-8 sm:p-10">
            <span className="inline-block text-[11px] tracking-[0.16em] uppercase text-rose-deep font-semibold mb-3">
              Neuester Beitrag
            </span>
            <h3 className="font-serif text-[27px] sm:text-[33px] leading-[1.16] mb-4 max-w-2xl group-hover:text-rose-deep transition-colors">
              {aufmacher.titel}
            </h3>
            <p className="text-[16px] text-ink-soft leading-relaxed mb-6 max-w-2xl">
              {aufmacher.beschreibung}
            </p>
            <Marken beitrag={aufmacher} />
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
            <Kopfbild beitrag={b} hoehe="h-36" kategorien={alleKategorien} />
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
          {gesucht
            ? `Zu „${suche.trim()}“ steht hier noch nichts. Vielleicht hilft ein anderes Wort, oder du schaust in den Themen oben.`
            : "In diesem Thema steht noch nichts."}
        </p>
      )}
    </>
  );
}
