import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { futterCheck } from "@/lib/seite";

// ---------------------------------------------------------------------------
// Die Infoseite zum Futter-Check.
//
// Sie steht unter der Adresse, die bisher der Fragebogen selbst hatte
// (/futter-check) — und behaelt damit die Google-Sichtbarkeit, die dort ueber
// Monate gewachsen ist. Nur der Inhalt ist ein anderer: statt der fuenf
// Fragen erklaert sie, was der Futter-Check ist, und fuehrt zur kostenlosen
// Anmeldung bei alfima. Der Fragebogen liegt dahinter unter
// /futter-check-start und ist aus dem Suchindex genommen.
//
// Alle Knoepfe hier fuehren bewusst zu derselben Adresse. Wer sich fuer den
// Futter-Check interessiert, soll nicht ueberlegen muessen, welcher der
// richtige ist.
// ---------------------------------------------------------------------------

const TITEL = "Der kostenlose Futter-Check für dein Pferd";
const BESCHREIBUNG =
  "In fünf Fragen eine erste ehrliche Einschätzung, ob die Fütterung deines Pferdes wirklich zu seiner Situation passt. Kostenlos, in unter drei Minuten, von Ernährungsberaterin Yasemin Halac.";

export const metadata: Metadata = {
  alternates: { canonical: "/futter-check" },
  title: TITEL,
  description: BESCHREIBUNG,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Pferdeliebehealthy",
    title: `${TITEL} | Pferdeliebehealthy`,
    description: BESCHREIBUNG,
    url: "/futter-check",
    images: [{ url: "/images/yasi-helena.jpg", width: 1122, height: 1402 }],
  },
};

/** Die fuenf Fragen, so wie sie im Fragebogen wirklich gestellt werden.
 *  Wenn du sie dort aenderst, aendere sie bitte auch hier — sonst verspricht
 *  die Seite etwas anderes, als danach kommt. */
const fragen = [
  "Wie alt ist dein Pferd?",
  "Wie sieht die Grundfütterung im Moment aus?",
  "Bekommt dein Pferd aktuell ein Mineralfutter?",
  "Welche Auffälligkeiten fallen dir gerade auf?",
  "Wie würdest du deine Fütterung selbst beschreiben?",
];

const antworten = [
  {
    titel: "Wo dein Pferd wirklich steht",
    text: "Keine Schulnote, sondern eine Einordnung: Was an deiner Fütterung schon trägt, und an welcher Stelle die Lücke sitzt.",
  },
  {
    titel: "Warum das bei deinem Pferd zusammenhängt",
    text: "Alter, Haltung und Auffälligkeiten werden zusammen gelesen, nicht einzeln. Kotwasser bei einem 6-Jährigen bedeutet etwas anderes als bei einer 24-jährigen Stute.",
  },
  {
    titel: "Was der nächste sinnvolle Schritt wäre",
    text: "Konkret und in der Reihenfolge, die bei dir Sinn ergibt — nicht die Produktliste, die gerade jeder empfiehlt.",
  },
];

export default function FutterCheckSeite() {
  return (
    <main>
      {/* ------------------------------------------------------------- Kopf */}
      <section className="bg-rose-deep text-cream px-6 sm:px-8 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <span className="block text-[13px] tracking-[0.14em] uppercase font-semibold mb-4 text-cream/80">
              Kostenlos · unter drei Minuten
            </span>
            <h1 className="font-serif font-normal text-[34px] sm:text-[50px] leading-[1.1] tracking-tight mb-6">
              Der Futter-Check
            </h1>
            <p className="text-[18px] sm:text-[19px] text-cream/90 leading-relaxed mb-4 max-w-xl">
              Fünf Fragen zu deinem Pferd, und danach weißt du, ob seine
              Fütterung wirklich zu seiner Situation passt — oder ob du gerade
              etwas fütterst, das an ihm vorbeigeht.
            </p>
            <p className="text-[16px] text-cream/75 leading-relaxed mb-8 max-w-xl">
              Ich bin Yasemin, Ernährungsberaterin für Pferde. Die Auswertung
              ist die, die ich auch einer Kundin am Telefon geben würde.
            </p>
            <Link
              href={futterCheck.fragebogen}
              prefetch={false}
              className="inline-block bg-cream text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-rose transition-colors"
            >
              Jetzt kostenlos starten
            </Link>
            <p className="text-[13px] text-cream/65 mt-4">
              Anmeldung über meine Kursplattform alfima. Kostet nichts, deine
              Adresse gebe ich nicht weiter.
            </p>
          </div>

          <div className="hidden lg:block">
            <Image
              src="/images/yasi-helena.jpg"
              alt="Yasemin Halac mit ihrer Stute Helena"
              width={1122}
              height={1402}
              priority
              sizes="(min-width: 1024px) 40vw, 0px"
              className="w-full h-auto rounded-[24px]"
            />
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- Was du bekommst */}
      <section className="px-6 sm:px-8 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12">
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Was am Ende herauskommt
            </span>
            <h2 className="font-serif font-normal text-[28px] sm:text-[38px] leading-[1.15] tracking-tight">
              Kein Testergebnis, das dir schmeichelt.
            </h2>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {antworten.map((a) => (
              <li
                key={a.titel}
                className="bg-white rounded-[18px] border border-line p-7"
              >
                <h3 className="font-serif text-[20px] leading-snug mb-3">
                  {a.titel}
                </h3>
                <p className="text-[14.5px] text-ink-soft leading-relaxed">
                  {a.text}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------ Die 5 Fragen */}
      <section className="px-6 sm:px-8 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto bg-cream-deep rounded-[24px] p-8 sm:p-12">
          <div className="grid lg:grid-cols-[1fr_1.1fr] gap-10">
            <div>
              <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
                Das wird gefragt
              </span>
              <h2 className="font-serif font-normal text-[26px] sm:text-[34px] leading-[1.15] tracking-tight mb-5">
                Fünf Fragen, keine Fangfragen.
              </h2>
              <p className="text-[16px] text-ink-soft leading-relaxed">
                Du brauchst nichts vorzubereiten, keine Heuanalyse, keine
                Etiketten. Antworte so, wie es wirklich ist — nicht so, wie es
                sein sollte. Nur dann sagt dir das Ergebnis etwas.
              </p>
            </div>

            <ol className="space-y-4">
              {fragen.map((f, i) => (
                <li key={f} className="flex gap-4 items-baseline">
                  <span className="font-serif text-[20px] text-rose-deep tabular-nums shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-[16px] leading-relaxed">{f}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------- Für wen */}
      <section className="px-6 sm:px-8 pb-16 sm:pb-24">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif font-normal text-[26px] sm:text-[34px] leading-[1.15] tracking-tight mb-6">
            Für wen sich das lohnt
          </h2>
          <div className="text-[16.5px] text-ink-soft leading-relaxed space-y-4">
            <p>
              Für dich, wenn du das Gefühl hast, dass bei deinem Pferd etwas
              nicht ganz rund läuft — Kotwasser, ein schleppender Fellwechsel,
              wenig Energie — und du nicht sicher bist, ob es an der Fütterung
              liegt.
            </p>
            <p>
              Für dich, wenn im Futtereimer über die Jahre einiges
              zusammengekommen ist und du den Überblick verloren hast, was davon
              eigentlich noch etwas bringt.
            </p>
            <p>
              Und auch für dich, wenn gerade alles gut aussieht. Dann zeigt dir
              der Check, ob die Mineralversorgung wirklich zu Alter, Haltung und
              Belastung deines Pferdes passt — oder ob sie eher pauschal gewählt
              ist. Das ist der häufigste blinde Fleck, gerade bei Pferden, denen
              man nichts ansieht.
            </p>
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Abschluss-CTA */}
      <section className="px-6 sm:px-8 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto bg-ink text-cream rounded-[24px] p-8 sm:p-12">
          <div className="max-w-xl">
            <h2 className="font-serif font-normal text-[26px] sm:text-[34px] leading-[1.15] tracking-tight mb-5">
              Dann schauen wir mal, wo dein Pferd steht.
            </h2>
            <p className="text-[16px] text-cream/75 leading-relaxed mb-8">
              Du trägst kurz deinen Namen und deine E-Mail-Adresse ein, danach
              geht es direkt los. Ich schicke dir das Ergebnis zusätzlich ins
              Postfach und melde mich ein paar Tage später noch einmal, um es mit
              dir einzuordnen.
            </p>
            <Link
              href={futterCheck.fragebogen}
              prefetch={false}
              className="inline-block bg-rose text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-cream transition-colors"
            >
              Jetzt kostenlos starten
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
