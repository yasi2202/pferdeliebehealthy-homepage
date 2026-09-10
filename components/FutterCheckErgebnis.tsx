import Link from "next/link";
import { angebotFuer } from "@/lib/futter-check-angebot";
import { preisText } from "@/lib/shop";

// ---------------------------------------------------------------------------
// Das Ergebnis des Futter-Checks auf der Seite: Typ, Yasemins Text, dann die
// Empfehlung.
//
// Zu sehen gibt es das nur über den Bestätigungslink aus der Mail. Auf dem
// Fragebogen selbst steht seit 10.09.2026 kein Ergebnis mehr, es gibt sie nur
// gegen eine echte Adresse. Die Mail zeigt dasselbe, gebaut in
// lib/futter-check-server.ts.
// ---------------------------------------------------------------------------

export default function FutterCheckErgebnis({
  titel,
  text,
  antworten,
}: {
  titel: string | null;
  text: string | null;
  antworten: unknown;
}) {
  const angebot = angebotFuer(titel, antworten);

  // Der Fragebogen trennt Ergebnistext, Tierarzt- und Altershinweis mit einer
  // Leerzeile. Ältere Anmeldungen haben alles in einem Absatz.
  const absaetze = (text ?? "")
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <>
      <div className="rounded-[24px] border border-line bg-white p-7 sm:p-10">
        <span className="mb-3 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
          Dein Fütterungstyp
        </span>
        <h2 className="mb-6 font-serif text-[28px] font-normal leading-tight tracking-tight sm:text-[36px]">
          {titel ?? "Dein Ergebnis"}
        </h2>
        <div className="space-y-4 text-[16.5px] leading-relaxed text-ink-soft">
          {absaetze.map((a, i) => (
            <p key={i}>{a}</p>
          ))}
        </div>
      </div>

      <div className="mt-8 rounded-[24px] bg-ink p-8 text-cream sm:p-10">
        <span className="mb-3 block text-[13px] uppercase tracking-[0.14em] text-cream/70">
          Mein Vorschlag für dich
        </span>
        <h2 className="mb-4 font-serif text-[25px] leading-snug sm:text-[30px]">
          {angebot.haupt.name}
        </h2>
        <p className="mb-7 text-[16px] leading-relaxed text-cream/80">{angebot.haupt.warum}</p>
        <Link
          href={`/${angebot.haupt.slug}`}
          className="inline-block rounded-full bg-rose px-8 py-4 text-[15px] font-medium text-ink transition-colors hover:bg-cream"
        >
          {angebot.haupt.name} ansehen
          {angebot.haupt.preis > 0 && ` · ${preisText(angebot.haupt.preis)}`}
        </Link>
      </div>

      {angebot.neben && (
        <div className="mt-5 rounded-[20px] border border-line bg-cream-deep p-6 sm:p-7">
          <span className="mb-2 block text-[13px] uppercase tracking-[0.12em] text-ink-soft">
            {angebot.neben.titel}
          </span>
          <p className="mb-4 text-[15.5px] leading-relaxed text-ink-soft">{angebot.neben.warum}</p>
          <Link
            href={`/${angebot.neben.slug}`}
            className="text-[15px] text-rose-deep underline underline-offset-2"
          >
            {angebot.neben.name} ansehen · {preisText(angebot.neben.preis)}
          </Link>
        </div>
      )}
    </>
  );
}
