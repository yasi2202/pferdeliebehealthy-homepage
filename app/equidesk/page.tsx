import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { digitalFinden } from "@/lib/digital";
import { preisText } from "@/lib/shop";
import EquiDeskFrist, { FRIST_TEXT } from "@/components/EquiDeskFrist";

// ---------------------------------------------------------------------------
// Die Verkaufsseite zu EquiDesk.
//
// ▸ ZIELGRUPPE SIND BERATERINNEN, NICHT PFERDEBESITZERINNEN.
//   Das ist der Unterschied zu allen anderen Seiten hier. Wer das liest, hat
//   die Ausbildung hinter sich und faengt an, eigene Kundinnen zu betreuen.
//   Deshalb steht hier kein Wort ueber Fuetterung, sondern ueber Zettelwirtschaft.
//
// ▸ DAS BILD ZEIGT ERFUNDENE KUNDINNEN.
//   public/images/equidesk-kundinnen.webp ist ein echter Bildschirmausschnitt
//   aus EquiDesk, aufgenommen mit einem Demokonto, das danach geloescht wurde.
//   Echte Kundendaten haben auf einer Verkaufsseite nichts zu suchen. Wenn das
//   Bild einmal erneuert wird, bitte wieder so.
//
// ▸ DER ABSCHNITT "WAS ES NICHT KANN" BLEIBT STEHEN.
//   Kein Terminkalender, keine App, keine GebueH-Abrechnung. Wer das braucht,
//   soll es vorher wissen und nicht hinterher enttaeuscht sein. Das ist auch
//   der Grund, warum die Vergleichstabelle die Preise der anderen nennt,
//   statt sie schlechtzureden.
//
// ▸ KEIN STREICHPREIS. EquiDesk wurde nie fuer 19 € im Monat verkauft. Es
//   steht deshalb "danach 19 € im Monat", nicht "statt 19 €". Gleiche
//   Begruendung wie beim Moventa im Shop und beim Ganzjahresfutterplan.
// ---------------------------------------------------------------------------

const produkt = digitalFinden("equidesk")!;

const TITEL = "EquiDesk, die Kundenverwaltung für Futterberaterinnen";
const BESCHREIBUNG =
  "Kundinnen, Pferde, Beratungsverlauf, Futterpläne mit Nährstoffrechnung und Rechnungen an einer Stelle. Einmalig 29 € für Testkundinnen, danach 19 € im Monat.";

export const metadata: Metadata = {
  alternates: { canonical: "/equidesk" },
  title: TITEL,
  description: BESCHREIBUNG,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Pferdeliebehealthy",
    title: `${TITEL} | Pferdeliebehealthy`,
    description: BESCHREIBUNG,
    url: "/equidesk",
    images: [{ url: "/images/equidesk-kundinnen.webp", width: 1100, height: 608 }],
  },
};

/** Der Kaufknopf. Steht dreimal auf der Seite, deshalb einmal hier. */
function Kaufknopf({ hell = false }: { hell?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <Link
        href={`/kasse/${produkt.slug}`}
        className={
          hell
            ? "inline-block rounded-full bg-rose px-8 py-4 text-[15px] font-medium text-ink transition-colors hover:bg-cream"
            : "inline-block rounded-full bg-ink px-8 py-4 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep"
        }
      >
        Für {preisText(produkt.preis)} freischalten
      </Link>

      <span className={hell ? "text-[14px] text-cream/60" : "text-[14px] text-ink-soft"}>
        Einmalig, kein Abo, dauerhafter Zugang
      </span>
    </div>
  );
}

/** Die Preise der anderen. Stand September 2026, jeweils der günstigste Einstieg. */
const WETTBEWERB: { name: string; preis: string; fuer: string }[] = [
  { name: "inBehandlung", preis: "ab 62 € / Monat", fuer: "Tierheilpraxis" },
  { name: "Petflare", preis: "ab 49 € / Monat", fuer: "Tierarzt und Tierheilpraxis" },
  { name: "debevet", preis: "ab 48 € / Monat", fuer: "Tierarztpraxis" },
  { name: "AnimalCoach", preis: "ab 349 € / Jahr", fuer: "Tierernährung, vor allem Hund und Katze" },
];

const FEHLT = [
  "Keine App zum Herunterladen. EquiDesk läuft im Browser, du legst dir am Handy eine Verknüpfung auf den Startbildschirm.",
  "Kein Terminkalender mit Online-Buchung. Es gibt die Wiedervorlage, das ist etwas anderes.",
  "Keine Abrechnung nach GebüH. Du schreibst deine Beträge selbst in die Rechnung.",
  "Die Futtermitteldatenbank kommt aus RatioPro. Was dort fehlt, trägst du als Text ein, dann rechnet diese Zeile nicht mit.",
];

export default function EquiDeskSeite() {
  return (
    <main>
      <EquiDeskFrist />

      {/* ------------------------------------------------------------- Kopf */}
      <section className="bg-ink px-6 py-16 text-cream sm:px-8 sm:py-24">
        <div className="mx-auto max-w-3xl">
          <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose">
            Für Futterberaterinnen
          </span>

          <h1 className="mb-6 font-serif text-[34px] font-normal leading-[1.1] tracking-tight sm:text-[50px]">
            EquiDesk
          </h1>

          <p className="mb-4 max-w-xl text-[18px] leading-relaxed text-cream/90 sm:text-[19px]">
            Deine Kundinnen, ihre Pferde, der Beratungsverlauf, die Futterpläne
            mit Nährstoffrechnung und die Rechnungen. Alles an einer Stelle,
            statt verteilt auf Postfach, Word und Handy.
          </p>

          <p className="mb-8 max-w-xl text-[16px] leading-relaxed text-cream/70">
            Einmalig {preisText(produkt.preis)} für Testkundinnen, bis{" "}
            {FRIST_TEXT}. Danach gibt es EquiDesk nur noch als monatlichen
            Zugang für 19 € im Monat.
          </p>

          <Kaufknopf hell />
        </div>
      </section>

      {/* -------------------------------------------------------- Das Problem */}
      <section className="px-6 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
            Warum es das gibt
          </span>

          <h2 className="mb-6 font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
            Die Beratung ist das eine. Der Papierkram ist das andere.
          </h2>

          <div className="space-y-4 text-[16.5px] leading-relaxed text-ink-soft">
            <p>
              Die Anamnese liegt im Postfach, der Futterplan in Word, die Fotos
              auf dem Handy, die Rechnung in einer Tabelle. Und wann du dich bei
              welcher Kundin noch mal melden wolltest, weißt nur du.
            </p>
            <p>
              Solange du drei Kundinnen hast, geht das. Bei fünfzehn nicht mehr.
              Dann rutscht die eine durch, die eigentlich nach vier Wochen eine
              Rückmeldung bekommen sollte.
            </p>
            <p>Genau die Arbeit nimmt dir EquiDesk ab.</p>
          </div>

          <figure className="mt-10">
            <Image
              src="/images/equidesk-kundinnen.webp"
              alt="Die Kundinnenliste in EquiDesk mit Filtern nach Leistung und den Pferden je Kundin"
              width={1100}
              height={608}
              sizes="(min-width: 768px) 672px, 100vw"
              className="h-auto w-full rounded-[16px] border border-rose/40"
            />
            <figcaption className="mt-3 text-center text-[14px] text-ink-soft">
              So sieht deine Kundinnenliste aus. Die gezeigten Namen sind
              erfunden.
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ------------------------------------------------------ Was drin ist */}
      <section className="bg-cream-deep px-6 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
            Der Inhalt
          </span>

          <h2 className="mb-8 font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
            Was du bekommst
          </h2>

          {/* Der Text steht in lib/digital.ts. Wenn er geändert werden soll,
              dann dort, damit Kasse und Seite dasselbe sagen. */}
          <div className="space-y-5">
            {produkt.beschreibung.map((block, i) => {
              if (block.art === "ueberschrift") {
                return (
                  <h3 key={i} className="pt-2 font-serif text-[21px] leading-snug">
                    {block.text}
                  </h3>
                );
              }

              if (block.art === "liste") {
                return (
                  <ul key={i} className="space-y-3">
                    {block.punkte.map((punkt) => (
                      <li
                        key={punkt}
                        className="flex gap-3 text-[16.5px] leading-relaxed text-ink-soft"
                      >
                        <span aria-hidden className="mt-[9px] h-[6px] w-[6px] shrink-0 rounded-full bg-rose-deep" />
                        <span>{punkt}</span>
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p
                  key={i}
                  className={
                    block.betont
                      ? "rounded-[14px] bg-rose/25 px-5 py-4 text-[16.5px] leading-relaxed text-ink"
                      : "text-[16.5px] leading-relaxed text-ink-soft"
                  }
                >
                  {block.text}
                </p>
              );
            })}
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Vergleich */}
      <section className="px-6 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
            Was andere nehmen
          </span>

          <h2 className="mb-6 font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
            Praxissoftware gibt es reichlich. Für Pferdefütterung nicht.
          </h2>

          <p className="mb-8 text-[16.5px] leading-relaxed text-ink-soft">
            Die Programme unten sind für Tierarzt- und Tierheilpraxen gemacht.
            Sie kosten monatlich, und die Rationsberechnung fehlt überall.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-[15.5px]">
              <thead>
                <tr className="border-b border-rose/50 text-left">
                  <th className="py-3 pr-4 font-serif font-normal">Programm</th>
                  <th className="py-3 pr-4 font-serif font-normal">Preis</th>
                  <th className="py-3 font-serif font-normal">Gemacht für</th>
                </tr>
              </thead>
              <tbody className="text-ink-soft">
                {WETTBEWERB.map((w) => (
                  <tr key={w.name} className="border-b border-rose/30">
                    <td className="py-3 pr-4">{w.name}</td>
                    <td className="whitespace-nowrap py-3 pr-4">{w.preis}</td>
                    <td className="py-3">{w.fuer}</td>
                  </tr>
                ))}
                <tr className="bg-rose/20 font-medium text-ink">
                  <td className="rounded-l-[8px] py-3 pl-3 pr-4">EquiDesk</td>
                  <td className="whitespace-nowrap py-3 pr-4">29 € einmalig</td>
                  <td className="rounded-r-[8px] py-3 pr-3">Futterberatung am Pferd</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-[14px] text-ink-soft">
            Preise der Anbieter, Stand September 2026, jeweils der günstigste
            Einstieg. Ein Jahr inBehandlung kostet über 700 €.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------- Was fehlt */}
      <section className="bg-cream-deep px-6 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
            Ehrlich gesagt
          </span>

          <h2 className="mb-8 font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
            Was EquiDesk nicht kann
          </h2>

          <ul className="space-y-4 border-l-2 border-rose-deep pl-6">
            {FEHLT.map((satz) => (
              <li key={satz} className="text-[16.5px] leading-relaxed text-ink-soft">
                {satz}
              </li>
            ))}
          </ul>

          <p className="mt-8 text-[16.5px] leading-relaxed text-ink-soft">
            EquiDesk wird laufend weitergebaut. Was heute fehlt, kann in zwei
            Monaten da sein, aber ich verspreche dir kein Datum.
          </p>
        </div>
      </section>

      {/* --------------------------------------------------------- Abschluss */}
      <section className="bg-ink px-6 py-16 text-cream sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
            Einmalig {preisText(produkt.preis)}
          </h2>

          <p className="mb-8 text-[16.5px] leading-relaxed text-cream/80">
            Das Angebot für Testkundinnen läuft bis {FRIST_TEXT}. Danach gibt es
            EquiDesk nur noch als monatlichen Zugang für 19 € im Monat. Wer
            jetzt zugreift, zahlt einmal und behält es.
          </p>

          <Kaufknopf hell />
        </div>
      </section>
    </main>
  );
}
