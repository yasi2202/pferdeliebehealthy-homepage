import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ausbildung,
  module,
  pruefung,
  verkaufOffen,
} from "@/lib/ausbildung";

// ---------------------------------------------------------------------------
// Die Seite zur Ausbildung Ganzheitliche Pferdefütterung.
//
// Angelegt am 27.08.2026, weil die einzige Seite, die deine Ausbildung
// beschrieben hat, auf der alten WordPress-Adresse lag und dort mit falschen
// Zahlen stand (12 Module, Workbooks). Verbindlich sind die Angaben aus dem
// ZFU-Antrag vom 20.08.2026, und die stehen in lib/ausbildung.ts.
//
// Zwei Dinge, die diese Seite bewusst NICHT tut:
//
//   1. Sie behauptet keine ZFU-Zulassung. Das Verfahren unter Reg.-Nr. 76270
//      läuft noch. Der Hinweis erscheint erst, wenn `verkaufOffen` auf true
//      steht, und der Schalter gehört erst umgelegt, wenn die Zulassung
//      schriftlich vorliegt.
//   2. Sie verkauft nicht, solange das so ist. Statt eines Kaufknopfes führt
//      sie zum kostenlosen Schnupperkurs und zur Vormerkung.
//
// Alles Änderbare steht in lib/ausbildung.ts, nicht hier.
// ---------------------------------------------------------------------------

const TITEL =
  "Ausbildung Ganzheitliche Pferdefütterung — in 12 Monaten zur Ernährungsberaterin für Pferde";
const BESCHREIBUNG =
  "Acht Module, 104 Lektionen, 155 Zeitstunden über zwölf Monate. Mit individueller Abschlussprüfung statt Standardklausur, und der Rationsberechnung RatioPro und der Kundenverwaltung EquiDesk dauerhaft inklusive.";

export const metadata: Metadata = {
  alternates: { canonical: "/ausbildung" },
  title: TITEL,
  description: BESCHREIBUNG,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Pferdeliebehealthy",
    title: `${TITEL} | Pferdeliebehealthy`,
    description: BESCHREIBUNG,
    url: "/ausbildung",
    images: [{ url: "/images/yasi-portrait.jpg", width: 1200, height: 1600 }],
  },
};

/** Modul 4 hat in der Akademie noch keine Lektionen. Ohne Titel wird es
 *  nicht gezeigt, statt eine leere Karte zu hinterlassen. */
const sichtbareModule = module.filter((m) => m.titel !== "");

/** Solange nicht alle Module beschrieben sind, nennt die Überschrift keine
 *  Zahl. Sonst stünde oben „8 Module" und darunter zählte man sieben Karten,
 *  und das fällt genau der Leserin auf, die 899 € ausgeben soll. Sobald du
 *  Modul 4 in lib/ausbildung.ts ergänzt hast, steht die Zahl von selbst
 *  wieder da. */
const alleModuleBeschrieben = sichtbareModule.length === module.length;

export default function AusbildungSeite() {
  return (
    <main>
      {/* ------------------------------------------------------------- Kopf */}
      <section className="bg-ink text-cream px-6 sm:px-8 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.2fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <span className="block text-[13px] tracking-[0.14em] uppercase font-semibold mb-4 text-rose">
              Für deinen Beruf
            </span>
            <h1 className="font-serif font-normal text-[34px] sm:text-[50px] leading-[1.1] tracking-tight mb-6">
              {ausbildung.titel}
            </h1>
            <p className="text-[18px] sm:text-[19px] text-cream/90 leading-relaxed mb-4 max-w-xl">
              Du fütterst dein eigenes Pferd längst durchdacht. Jetzt fragen
              dich andere im Stall, und du merkst: Du willst nicht nur ein
              Gefühl haben, sondern es begründen können.
            </p>
            <p className="text-[16px] text-cream/70 leading-relaxed mb-8 max-w-xl">
              Zwölf Monate Zeit, in deinem Tempo, mit einer Abschlussprüfung,
              die für dich zusammengestellt wird. Danach berätst du selbst, mit
              meiner Rationsberechnung und meiner Kundenverwaltung, die dir
              dauerhaft bleiben.
            </p>

            {/* Die Kennzahlen. Alle vier stehen so im ZFU-Antrag. */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-9 max-w-xl">
              {[
                { zahl: String(ausbildung.module), label: "Module" },
                { zahl: String(ausbildung.lektionen), label: "Lektionen" },
                {
                  zahl: String(ausbildung.zeitstunden),
                  label: "Zeitstunden",
                },
                {
                  zahl: `${ausbildung.dauerMonate}`,
                  label: "Monate Zeit",
                },
              ].map((k) => (
                <div key={k.label} className="pt-4 border-t border-cream/25">
                  <div className="font-serif text-[26px] text-rose tabular-nums leading-none mb-1.5">
                    {k.zahl}
                  </div>
                  <div className="text-[12.5px] text-cream/65">{k.label}</div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-5">
              {verkaufOffen && ausbildung.kauf ? (
                <>
                  <a
                    href={ausbildung.kauf}
                    target="_blank"
                    rel="noopener"
                    className="inline-block bg-rose text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-cream transition-colors"
                  >
                    Für {ausbildung.preis} anmelden
                  </a>
                  <span className="text-[14px] text-cream/60">
                    Oder in Raten: {ausbildung.preisRaten}
                  </span>
                </>
              ) : (
                <>
                  <a
                    href={ausbildung.schnupperkurs}
                    target="_blank"
                    rel="noopener"
                    className="inline-block bg-rose text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-cream transition-colors"
                  >
                    Kostenlos reinschnuppern
                  </a>
                  <span className="text-[14px] text-cream/60">
                    Ohne Anmeldung zur Ausbildung
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="relative aspect-[3/4] rounded-[24px] overflow-hidden">
              <Image
                src="/images/yasi-portrait.jpg"
                alt="Yasemin Halac, Ernährungsberaterin für Pferde"
                fill
                priority
                sizes="(min-width: 1024px) 40vw, 0px"
                className="object-cover object-[50%_12%]"
              />
            </div>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Für wen */}
      <section className="px-6 sm:px-8 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto">
          <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
            Für wen sie gemacht ist
          </span>
          <h2 className="font-serif font-normal text-[28px] sm:text-[38px] leading-[1.15] tracking-tight mb-6">
            Für die Pferdefrau, die es genau wissen will.
          </h2>
          <div className="text-[16.5px] text-ink-soft leading-relaxed space-y-4">
            <p>
              Die meisten, die zu mir kommen, sind keine Anfängerinnen. Sie
              haben ein Pferd mit einem Thema, haben sich jahrelang
              eingelesen, und stehen irgendwann an dem Punkt, an dem
              Blogartikel nicht mehr reichen. Sie wollen ein Blutbild selbst
              lesen können. Sie wollen wissen, warum eine Empfehlung falsch
              ist, und nicht nur ahnen, dass sie es ist.
            </p>
            <p>
              Manche wollen danach beraten, mit eigenen Kundinnen und einer
              Rechnung. Andere wollen einfach nie wieder abhängig sein von
              jemandem, der ihr Pferd nicht kennt. Beides ist ein guter Grund.
            </p>
            <p>
              <strong className="text-ink">Nicht</strong> für dich, wenn du
              schnell ein Zertifikat für die Wand brauchst. Dafür gibt es
              kürzere Lehrgänge, und die sind dann auch ehrlicher zu dir als
              ich es wäre.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Aufbau */}
      <section className="px-6 sm:px-8 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12">
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Der Aufbau
            </span>
            <h2 className="font-serif font-normal text-[28px] sm:text-[38px] leading-[1.15] tracking-tight mb-5">
              {alleModuleBeschrieben
                ? "Acht Module, die aufeinander aufbauen."
                : "Module, die aufeinander aufbauen."}
            </h2>
            <p className="text-[16px] text-ink-soft leading-relaxed">
              Die Reihenfolge ist kein Zufall und auch keine Empfehlung: Die
              nächste Lektion öffnet sich, wenn die davor abgehakt ist. Das
              klingt streng, sorgt aber dafür, dass niemand bei den
              Krankheitsbildern landet, ohne die Verdauung verstanden zu haben.
            </p>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {sichtbareModule.map((m) => (
              <li
                key={m.nummer}
                className="bg-white rounded-[18px] border border-line p-7 flex flex-col"
              >
                <div className="flex items-baseline gap-3 mb-3">
                  <span className="font-serif text-[15px] text-rose-deep tabular-nums">
                    Modul {m.nummer}
                  </span>
                  <span className="text-[12.5px] tracking-[0.12em] uppercase text-ink-soft font-semibold">
                    {m.verb}
                  </span>
                </div>
                <h3 className="font-serif text-[20px] leading-snug mb-3">
                  {m.titel}
                </h3>
                <p className="text-[14.5px] text-ink-soft leading-relaxed">
                  {m.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------- Werkzeuge */}
      {/* Von Yasemin bestätigt am 27.08.2026: RatioPro und EquiDesk sind in
          der Ausbildung enthalten, und zwar DAUERHAFT, ohne Frist und ohne
          Anschlussgebühr. Das ist eine Zusage an jede Käuferin, die du später
          nicht mehr einseitig zurücknehmen kannst — wer zu diesen Bedingungen
          gekauft hat, behält sie. Wenn du das Modell je änderst, gilt die
          Änderung nur für neue Anmeldungen.

          Warum das hier so prominent steht: Keine deiner Wettbewerberinnen
          hat Software. VETogether, Sarah Ullrich und Naturnahes Pferd liefern
          Wissen, du lieferst Wissen plus Werkzeug. Das ist das einzige
          Argument, das keine von ihnen kopieren kann. */}
      <section className="px-6 sm:px-8 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto bg-cream-deep rounded-[24px] p-8 sm:p-12">
          <div className="max-w-2xl mb-9">
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Nicht nur Wissen
            </span>
            <h2 className="font-serif font-normal text-[26px] sm:text-[34px] leading-[1.15] tracking-tight mb-5">
              Meine Werkzeuge gehören dir. Dauerhaft.
            </h2>
            <p className="text-[16px] text-ink-soft leading-relaxed">
              Wissen allein hilft dir am ersten echten Beratungstag wenig. Was
              du dann brauchst, ist etwas, worin du rechnest, und etwas, worin
              deine Kundinnen stehen. Beides bekommst du hier, ohne Aufpreis
              und ohne Frist. Es sind dieselben zwei Programme, mit denen ich
              selbst jeden Tag arbeite.
            </p>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <li className="bg-white rounded-[18px] border border-line p-7">
              <h3 className="font-serif text-[20px] leading-snug mb-3">
                RatioPro, die Rationsberechnung
              </h3>
              <p className="text-[14.5px] text-ink-soft leading-relaxed">
                Der Rechner, mit dem du eine Ration wirklich durchrechnest,
                statt sie zu schätzen. Mit einer Futtermitteldatenbank, die
                mitwächst, weil alle Nutzerinnen daran mitbauen. Einzeln
                kostet er 69 €.
              </p>
            </li>
            <li className="bg-white rounded-[18px] border border-line p-7">
              <h3 className="font-serif text-[20px] leading-snug mb-3">
                EquiDesk, deine Kundenverwaltung
              </h3>
              <p className="text-[14.5px] text-ink-soft leading-relaxed">
                Kundinnen, Pferde, Fotos, Befunde und Unterlagen an einem Ort.
                Damit deine erste eigene Beratung nicht in einer
                Tabellendatei endet.
              </p>
            </li>
          </ul>

          <p className="text-[15px] text-ink-soft leading-relaxed mt-7 max-w-2xl">
            Beides bleibt dir nach der Ausbildung. Nicht für ein Jahr, sondern
            solange du damit arbeiten willst. Das ist mir wichtig, weil eine
            Beraterin ohne Werkzeug wieder von vorn anfängt, und genau das
            wollte ich dir ersparen.
          </p>
        </div>
      </section>

      {/* --------------------------------------------------------- Prüfung */}
      <section className="px-6 sm:px-8 pb-16 sm:pb-24">
        <div className="max-w-2xl mx-auto">
          <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
            Der Abschluss
          </span>
          <h2 className="font-serif font-normal text-[28px] sm:text-[38px] leading-[1.15] tracking-tight mb-6">
            Eine Prüfung, die es nur einmal gibt: deine.
          </h2>
          <div className="text-[16.5px] text-ink-soft leading-relaxed space-y-4">
            <p>
              Es gibt bei mir keine feste Klausur, die alle gleichzeitig
              schreiben. Ich stelle deine Prüfung für dich zusammen: zwei
              Fallbeispiele aus der Praxis, ein Fragenkatalog aus drei deiner
              Module, ein Futterplan und eine Anamnese-Aufgabe.
            </p>
            <p>
              Du bearbeitest sie {pruefung.bearbeitungstage} Tage lang zu
              Hause, mit allen Unterlagen, die du hast. Rückfragen an mich sind
              ausdrücklich erwünscht, denn genau so läuft es später mit einer
              Kundin auch. Innerhalb von {pruefung.korrekturWerktage} Werktagen
              hast du meine Korrektur.
            </p>
            <p>{pruefung.wiederholung}</p>
            <p>
              Am Ende steht dein Zertifikat über den Abschluss
              „{ausbildung.abschluss}“, und damit die Grundlage, dich als
              Ernährungsberaterin für Pferde selbstständig zu machen.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Über mich */}
      <section className="px-6 sm:px-8 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto bg-white rounded-[24px] border border-line p-8 sm:p-12">
          <div className="max-w-2xl">
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Wer dich ausbildet
            </span>
            <h2 className="font-serif font-normal text-[26px] sm:text-[34px] leading-[1.15] tracking-tight mb-6">
              Ich unterrichte nichts, was ich nicht selbst gemacht habe.
            </h2>
            <div className="text-[16px] text-ink-soft leading-relaxed space-y-4">
              <p>
                Ich bin Yasemin, Futtermittelberaterin für Pferde und
                Tierheilpraktikerin in Ausbildung. Pferde habe ich seit 2006,
                Pferdeliebehealthy gibt es seit Februar 2022, hauptberuflich
                mache ich das seit Mai 2025.
              </p>
              <p>
                Angefangen hat alles mit Helena, meiner Stute. Sie ist heute 28
                und hat PPID. Was ich über Stoffwechsel weiß, weiß ich, weil
                ich es für sie lernen musste, nicht weil es im Lehrplan stand.
              </p>
              <p>
                Seitdem sind über 500 Einzelberatungen und über 1.000
                Kursteilnehmende dazugekommen. Die Fälle, die du in Modul 6
                durchrechnest, sind echte Pferde aus dieser Arbeit.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Preis */}
      <section className="px-6 sm:px-8 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto bg-rose-deep text-cream rounded-[24px] p-8 sm:p-12">
          <div className="max-w-xl">
            <div className="flex items-baseline gap-4 mb-5">
              <span className="font-serif text-[34px] sm:text-[42px] leading-none tabular-nums">
                {ausbildung.preis}
              </span>
              <span className="text-[17px] text-cream/50 line-through tabular-nums">
                {ausbildung.preisVorher}
              </span>
            </div>
            <p className="text-[16px] text-cream/85 leading-relaxed mb-4">
              Einmalig, oder in {ausbildung.ratenModelle} zu insgesamt{" "}
              {ausbildung.preisRaten}. Darin enthalten sind alle{" "}
              {ausbildung.module} Module, die Betreuung über{" "}
              {ausbildung.dauerMonate} Monate, deine individuelle
              Abschlussprüfung, das Zertifikat und dauerhaft RatioPro und
              EquiDesk.
            </p>
            <p className="text-[15px] text-cream/70 leading-relaxed mb-8">
              Du brauchst mindestens {ausbildung.mindestbearbeitung}, und du
              hast {ausbildung.dauerMonate} Monate Zeit. Kündigen kannst du
              jederzeit.
            </p>

            {verkaufOffen && ausbildung.kauf ? (
              <>
                <a
                  href={ausbildung.kauf}
                  target="_blank"
                  rel="noopener"
                  className="inline-block bg-cream text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-rose transition-colors"
                >
                  Jetzt anmelden
                </a>
                <p className="text-[13px] text-cream/65 mt-4">
                  Die Anmeldung läuft über meine Kursplattform alfima. Gelernt
                  wird danach auf {ausbildung.plattform}.
                </p>
              </>
            ) : (
              <>
                <div className="flex flex-wrap gap-4">
                  <a
                    href={ausbildung.schnupperkurs}
                    target="_blank"
                    rel="noopener"
                    className="inline-block bg-cream text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-rose transition-colors"
                  >
                    Kostenlos reinschnuppern
                  </a>
                  <a
                    href={`mailto:${ausbildung.mail}?subject=Vormerkung%20Ausbildung%20Ganzheitliche%20Pferdef%C3%BCtterung`}
                    className="inline-block border border-cream/40 px-8 py-4 rounded-full text-[15px] font-medium hover:bg-cream/10 transition-colors"
                  >
                    Für den Start vormerken
                  </a>
                </div>
                <p className="text-[13px] text-cream/65 mt-5">
                  Die Anmeldung öffnet zum 1. Oktober 2026. Bis dahin kannst du
                  dich vormerken lassen und in der Zwischenzeit kostenlos
                  hineinschauen.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Weiteres */}
      <section className="px-6 sm:px-8 pb-20 sm:pb-28">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-[16px] text-ink-soft leading-relaxed">
            Noch nicht so weit? Fang beim{" "}
            <Link
              href="/futter-check"
              className="text-ink font-medium hover:text-rose-deep underline underline-offset-4"
            >
              kostenlosen Futter-Check
            </Link>{" "}
            an, oder lern mit{" "}
            <Link
              href="/mineral-klarheit"
              className="text-ink font-medium hover:text-rose-deep underline underline-offset-4"
            >
              Mineral-Klarheit
            </Link>{" "}
            erst einmal, dein eigenes Mineralfutter durchzurechnen.
          </p>
        </div>
      </section>
    </main>
  );
}
