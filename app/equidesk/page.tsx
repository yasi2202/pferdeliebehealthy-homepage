import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { digitalFinden } from "@/lib/digital";
import { preisText } from "@/lib/shop";
import EquiDeskFrist from "@/components/EquiDeskFrist";
import { FRIST_TEXT, aktionLaeuft } from "@/lib/equidesk-frist";
import Kauffragen from "@/components/Kauffragen";
import Stimmen from "@/components/Stimmen";
import WerDahinterSteht from "@/components/WerDahinterSteht";

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
// ▸ KEIN STREICHPREIS, UND ZWAR IN BEIDE RICHTUNGEN. Solange das einmalige
//   Angebot lief, stand hier "danach 19 € im Monat" statt "statt 19 €".
//   Seit dem Wechsel auf den Monatszugang stehen die 29 € nirgends mehr
//   durchgestrichen daneben: Ein Einmalpreis und ein Monatspreis sind zwei
//   verschiedene Dinge, ihr Vergleich wäre eine Ersparnis, die es nicht gibt.
//   Gleiche Begruendung wie beim Moventa im Shop und beim Ganzjahresfutterplan.
// ---------------------------------------------------------------------------

// ▸ ZWEI PRODUKTE, EINE SEITE, UND DIE UHR ENTSCHEIDET
//   Bis zum Ende der Frist wird das einmalige Angebot für Testkundinnen
//   verkauft, danach der Monatszugang. Die Seite schaltet von selbst um,
//   damit niemand um Mitternacht eine Datei ändern muss und damit hier
//   nie ein Preis steht, den die Kasse nicht mehr annimmt — die weist einen
//   Kauf nach `verkaufBis` nämlich wirklich ab.
//
//   Deshalb steht unten `dynamic = "force-dynamic"`: Eine zwischengespeicherte
//   Seite würde den alten Preis weiterzeigen, und zwar genau in der Nacht,
//   in der es darauf ankommt.
const einmalig = digitalFinden("equidesk")!;
const monatlich = digitalFinden("equidesk-abo")!;

const TITEL = "EquiDesk, die Kundenverwaltung für Futterberaterinnen";

/** Der Beschreibungssatz nennt den Preis, also muss auch er umschalten.
 *  Er steht bei Google und in jeder geteilten Vorschau: Ein Preis, den es
 *  nicht mehr gibt, wäre dort besonders lange sichtbar. */
function beschreibungJetzt(): string {
  const gemeinsam =
    "Kundinnen, Pferde, Beratungsverlauf, Futterpläne mit Nährstoffrechnung " +
    "und Rechnungen an einer Stelle.";

  return aktionLaeuft()
    ? `${gemeinsam} Einmalig 29 € für Testkundinnen, danach 19 € im Monat.`
    : `${gemeinsam} 19 € im Monat, monatlich kündbar.`;
}



export function generateMetadata(): Metadata {
  const beschreibung = beschreibungJetzt();

  return {
    alternates: { canonical: "/equidesk" },
    title: TITEL,
    description: beschreibung,
    openGraph: {
      type: "website",
      locale: "de_DE",
      siteName: "Pferdeliebehealthy",
      title: `${TITEL} | Pferdeliebehealthy`,
      description: beschreibung,
      url: "/equidesk",
      images: [{ url: "/images/equidesk-kundinnen.webp", width: 1100, height: 608 }],
    },
  };
}

/** Der Kaufknopf. Steht dreimal auf der Seite, deshalb einmal hier.
 *
 *  Das Produkt kommt von aussen, weil es zwei gibt: das einmalige Angebot
 *  und den Monatszugang. Welches gerade gilt, entscheidet `aktionLaeuft()`. */
function Kaufknopf({
  produkt,
  hell = false,
}: {
  produkt: typeof einmalig;
  hell?: boolean;
}) {
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
        {produkt.abo
          ? `Für ${preisText(produkt.preis)} im Monat freischalten`
          : `Für ${preisText(produkt.preis)} freischalten`}
      </Link>

      <span className={hell ? "text-[14px] text-cream/60" : "text-[14px] text-ink-soft"}>
        {produkt.abo
          ? "Monatlich kündbar, ohne Mindestlaufzeit"
          : "Einmalig, kein Abo, dauerhafter Zugang"}
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

export const dynamic = "force-dynamic";

export default function EquiDeskSeite() {
  const aktion = aktionLaeuft();
  const produkt = aktion ? einmalig : monatlich;

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
            {aktion ? (
              <>
                Einmalig {preisText(einmalig.preis)} für Testkundinnen, bis{" "}
                {FRIST_TEXT}. Danach gibt es EquiDesk nur noch als monatlichen
                Zugang für {preisText(monatlich.preis)} im Monat.
              </>
            ) : (
              <>
                {preisText(monatlich.preis)} im Monat, monatlich kündbar. Keine
                Mindestlaufzeit, keine Einrichtungsgebühr, und du kommst mit
                einem Klick wieder heraus.
              </>
            )}
          </p>

          <Kaufknopf produkt={produkt} hell />
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
                  <td className="whitespace-nowrap py-3 pr-4">
                    {aktion
                      ? `${preisText(einmalig.preis)} einmalig`
                      : `${preisText(monatlich.preis)} / Monat`}
                  </td>
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

      {/* ▸ DIE DREI ABSCHNITTE, DIE ALLE VERKAUFSSEITEN TRAGEN.
          Sie stecken in components/Verkaufsseite.tsx, und diese Seite hier
          benutzt die Vorlage nicht -- deshalb stehen sie einzeln da. Wer an
          einem davon etwas aendert, aendert es in der Komponente, nicht hier.

          Reihenfolge mit Absicht: erst die Fragen wegraeumen, die vom Kauf
          abhalten, dann sagen andere etwas ueber das Angebot, dann stellt
          sich Yasemin vor, dann kommt der Knopf. */}
      <Kauffragen produkt={produkt} />
      <Stimmen slug="equidesk" />
      <WerDahinterSteht />

      {/* --------------------------------------------------------- Abschluss */}
      <section className="bg-ink px-6 py-16 text-cream sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
            {aktion
              ? `Einmalig ${preisText(einmalig.preis)}`
              : `${preisText(monatlich.preis)} im Monat`}
          </h2>

          <p className="mb-8 text-[16.5px] leading-relaxed text-cream/80">
            {aktion ? (
              <>
                Das Angebot für Testkundinnen läuft bis {FRIST_TEXT}. Danach
                gibt es EquiDesk nur noch als monatlichen Zugang für{" "}
                {preisText(monatlich.preis)} im Monat. Wer jetzt zugreift, zahlt
                einmal und behält es.
              </>
            ) : (
              <>
                Keine Mindestlaufzeit und keine Kündigungsfrist. Du kündigst mit
                einem Klick, ohne dich anzumelden und ohne mir einen Grund zu
                nennen, und der bezahlte Monat läuft noch zu Ende.
              </>
            )}
          </p>

          <Kaufknopf produkt={produkt} hell />
        </div>
      </section>
    </main>
  );
}
