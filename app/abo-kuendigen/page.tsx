import type { Metadata } from "next";
import Link from "next/link";
import AboKuendigung from "@/components/AboKuendigung";

// ---------------------------------------------------------------------------
// Die Kündigungsseite, vorgeschrieben durch § 312k BGB.
//
// ▸ SIE MUSS VON JEDER SEITE AUS ERREICHBAR SEIN, ohne Anmeldung und ohne
//   Suchen. Deshalb steht der Link in der Fusszeile, gleich neben Impressum
//   und Widerruf, und heisst dort wörtlich "Verträge kündigen". Das Gesetz
//   verlangt eine eindeutige Beschriftung; "Abo verwalten" wäre zu weich.
//
// ▸ SIE GILT FÜR ALLE LAUFENDEN VERTRÄGE, nicht nur für EquiDesk. Im Moment
//   gibt es genau einen, aber der Weg hier fragt Stripe nach allem, was zu
//   der Adresse läuft. Ein zweites Abo bräuchte an dieser Seite also nichts.
//
// ▸ NICHT BEI GOOGLE. Die Seite gehört zur Vertragsabwicklung, nicht in die
//   Suche. Wer sie braucht, findet sie über die Fusszeile oder über den Link
//   in der Kaufbestätigung.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Verträge kündigen",
  description:
    "Hier kündigst du einen laufenden Zugang, ohne Anmeldung und ohne Nachfrage.",
  robots: { index: false, follow: false },
};

export default function AboKuendigenSeite() {
  return (
    <main className="px-6 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
          Kündigen
        </span>

        <h1 className="mb-5 font-serif text-[30px] font-normal leading-[1.12] tracking-tight sm:text-[42px]">
          Verträge hier kündigen
        </h1>

        <p className="mb-4 text-[17px] leading-relaxed text-ink-soft">
          Wenn du einen monatlichen Zugang bei mir hast, kannst du ihn hier
          beenden. Du brauchst dich nicht anzumelden und musst mir keinen Grund
          nennen.
        </p>

        <p className="mb-9 text-[17px] leading-relaxed text-ink-soft">
          Gekündigt wird zum Ende des Monats, den du bezahlt hast. Bis dahin
          bleibt dein Zugang offen, danach wird nichts mehr abgebucht.
        </p>

        <AboKuendigung />

        <p className="mt-10 text-[14.5px] leading-relaxed text-ink-soft">
          Etwas gekauft, das einmalig war, etwa ein E-Book oder einen Kurs? Da
          gibt es nichts zu kündigen, das gehört dir dauerhaft. Zurück zur{" "}
          <Link href="/" className="text-rose-deep underline underline-offset-2">
            Startseite
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
