import type { Metadata } from "next";
import Link from "next/link";
import { teilen } from "@/lib/seo";
import { digitalprodukte } from "@/lib/digital";
import { preisText } from "@/lib/shop";
import {
  empfehlbar,
  provisionBetrag,
  provisionssatz,
  FRIST_TAGE,
  MINDESTAUSZAHLUNG,
  SATZ_GROSS,
  SATZ_KLEIN,
  SCHWELLE,
} from "@/lib/empfehlungsprogramm";
import EmpfehlungAnmeldung from "@/components/EmpfehlungAnmeldung";

// ---------------------------------------------------------------------------
// Die Seite, auf der man sich für das Empfehlungsprogramm bewirbt.
//
// ▸ NICHT VERWECHSELN MIT /empfehlungen
//   Das ist die andere Richtung: Dort stehen die Rabattcodes der Partner, bei
//   denen Yasemin selbst Provision bekommt. Hier bewerben sich Menschen, die
//   Yasemin empfehlen wollen. Die beiden Adressen liegen dicht beieinander,
//   deshalb heisst diese bewusst "weiterempfehlen" und nicht "empfehlen".
//
// ▸ WARUM DIE BEISPIELRECHNUNG AUS DEM KATALOG KOMMT
//   Sie steht nicht als Text in der Seite, sondern wird aus lib/digital.ts
//   und lib/empfehlungsprogramm.ts gerechnet. Ändert sich ein Preis oder ein
//   Satz, stimmt die Tabelle hier automatisch weiter. Eine abgeschriebene
//   Zahl wäre nach dem ersten Preiswechsel falsch, und zwar ausgerechnet auf
//   der Seite, auf der es um Geld geht.
// ---------------------------------------------------------------------------

const titel = "Pferdeliebehealthy weiterempfehlen";
const beschreibung =
  "Empfiehl meine Kurse weiter und bekomm dafür Provision: 20 % auf Angebote unter 100 €, 10 % darüber. Kein Rabattcode, kein Aufwand, ein persönlicher Link.";

export const metadata: Metadata = {
  alternates: { canonical: "/weiterempfehlen" },
  title: `${titel} | Empfehlungsprogramm`,
  description: beschreibung,
  ...teilen({
    titel,
    beschreibung,
    pfad: "/weiterempfehlen",
  }),
};

export default function WeiterempfehlenSeite() {
  // ▸ ALLE ANGEBOTE, NICHT EINE AUSWAHL, und teuerste zuerst.
  //
  //   Die Frage, die jemand auf dieser Seite hat, lautet: lohnt sich das für
  //   mich? Drei Beispielzeilen beantworten sie nicht, sie wecken nur den
  //   Verdacht, die übrigen seien absichtlich weggelassen. Die ganze Tabelle
  //   beantwortet sie, und sie zeigt zugleich, wo es sich wirklich lohnt.
  //
  //   Absteigend sortiert, weil die erste Zeile den Eindruck prägt. Bei
  //   aufsteigender Sortierung stünde dort 1,34 € für das günstigste Heft,
  //   und danach liest kaum jemand weiter.
  //
  //   Gefiltert wird auf das, was gerade wirklich verkauft wird. Deshalb
  //   fehlt die Ausbildung bis zum 01.10.2026 und steht danach von selbst
  //   ganz oben, ohne dass jemand daran denken muss.
  const beispiele = digitalprodukte
    .filter((p) => empfehlbar(p))
    .sort((a, b) => b.preis - a.preis);

  return (
    <main className="px-6 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
          Empfehlungsprogramm
        </span>

        <h1 className="mb-5 font-serif text-[32px] font-normal leading-[1.12] tracking-tight sm:text-[46px]">
          Empfiehl mich weiter, und verdien daran mit
        </h1>

        <p className="max-w-xl text-[17px] leading-relaxed text-ink-soft">
          Du erzählst ohnehin im Stall, wo du dein Wissen über Fütterung
          herhast? Dann bekomm bitte etwas dafür. Du bekommst einen
          persönlichen Link, und für jeden Kauf, der darüber zustande kommt,
          schreibe ich dir Provision gut.
        </p>

        {/* ------------------------------------------------------------- */}

        <h2 className="mb-4 mt-14 font-serif text-[26px] font-normal leading-tight tracking-tight sm:text-[32px]">
          Was du bekommst
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[26rem] border-collapse text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="py-2.5 pr-4 text-[14px] font-semibold text-ink">
                  Angebot
                </th>
                <th className="py-2.5 pr-4 text-[14px] font-semibold text-ink">
                  Preis
                </th>
                <th className="py-2.5 pr-4 text-[14px] font-semibold text-ink">
                  Satz
                </th>
                <th className="py-2.5 text-right text-[14px] font-semibold text-ink">
                  Für dich
                </th>
              </tr>
            </thead>
            <tbody>
              {beispiele.map((p) => {
                const satz = provisionssatz(p);

                return (
                  <tr key={p.slug} className="border-b border-line">
                    <td className="py-3 pr-4 text-[15px] text-ink">
                      {p.kurzname}
                    </td>
                    <td className="py-3 pr-4 text-[15px] text-ink-soft">
                      {preisText(p.preis)}
                      {/* Beim Abo muss "im Monat" dabeistehen. Sonst liest
                          sich die Zeile wie ein Einmalpreis, und die
                          Provision daneben wirkt größer, als sie ist. */}
                      {p.abo ? " im Monat" : ""}
                    </td>
                    <td className="py-3 pr-4 text-[15px] text-ink-soft">
                      {satz} %
                    </td>
                    <td className="py-3 text-right text-[15px] font-semibold text-ink">
                      {preisText(provisionBetrag(p.preis, p.mwst, satz))}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-[14.5px] leading-relaxed text-ink-soft">
          Die Regel dahinter: <strong className="text-ink">{SATZ_KLEIN} %</strong>{" "}
          auf alles unter {preisText(SCHWELLE)},{" "}
          <strong className="text-ink">{SATZ_GROSS} %</strong> auf alles
          darüber. Gerechnet wird auf den Nettobetrag, also ohne die
          Mehrwertsteuer, die ich ans Finanzamt abführe. Das ist im Handel so
          üblich, und ich sage es dir lieber vorher, als dass du dich später
          über eine Zahl wunderst. Bei einem Monatszugang bekommst du die
          Provision einmal, auf den ersten Monat.
        </p>

        {/* ------------------------------------------------------------- */}

        <h2 className="mb-4 mt-14 font-serif text-[26px] font-normal leading-tight tracking-tight sm:text-[32px]">
          So läuft es ab
        </h2>

        <ol className="space-y-5">
          {[
            {
              titel: "Du bewirbst dich",
              text: "Unten das Formular ausfüllen. Ich sehe mir jede Bewerbung selbst an und melde mich, meistens innerhalb weniger Tage. Ich schalte nicht jeden frei, und das ist Absicht: Ich möchte wissen, wo meine Kurse empfohlen werden.",
            },
            {
              titel: "Du bekommst deinen Link",
              text: "Er sieht aus wie pferdeliebehealthy.de/e/DEINNAME und funktioniert überall: in deiner Instagram-Bio, in einer Story, in einer Sprachnachricht an eine Stallfreundin.",
            },
            {
              titel: "Jemand kauft",
              text: `Wer über deinen Link kommt, zahlt den ganz normalen Preis. Es gibt also nichts zu erklären und keinen Code einzutippen. Kauft sie innerhalb von 30 Tagen, zählt es für dich, auch wenn sie erst später zurückkommt.`,
            },
            {
              titel: "Ich zahle aus",
              text: `Jede Provision wird nach ${FRIST_TAGE} Tagen auszahlbar, weil ein Kauf bis dahin noch erstattet werden kann. Ab ${preisText(MINDESTAUSZAHLUNG)} überweise ich, per PayPal oder auf dein Konto, und du bekommst eine Gutschrift dazu.`,
            },
          ].map((schritt, i) => (
            <li key={schritt.titel} className="flex gap-4">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-cream-deep text-[14px] font-semibold text-rose-deep">
                {i + 1}
              </span>
              <div>
                <p className="mb-1 text-[16px] font-semibold text-ink">
                  {schritt.titel}
                </p>
                <p className="text-[15px] leading-relaxed text-ink-soft">
                  {schritt.text}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {/* ------------------------------------------------------------- */}

        <h2 className="mb-4 mt-14 font-serif text-[26px] font-normal leading-tight tracking-tight sm:text-[32px]">
          Was ich von dir erwarte
        </h2>

        <p className="mb-4 text-[15px] leading-relaxed text-ink-soft">
          Wenig, aber das ernst gemeint. Ausführlich steht es in den{" "}
          <Link
            href="/weiterempfehlen/bedingungen"
            className="text-rose-deep underline underline-offset-2"
          >
            Teilnahmebedingungen
          </Link>
          , hier das Wichtigste in drei Punkten.
        </p>

        <ul className="space-y-3">
          {[
            "Kennzeichne deine Empfehlung als Werbung. Ein gut sichtbares „Werbung“ am Beitrag genügt. Das ist keine Förmlichkeit, sondern Pflicht, und im Zweifel haftest du dafür.",
            "Versprich nichts, was ich nicht halte. Meine Kurse heilen kein Pferd. Wer das behauptet, bringt uns beide in Schwierigkeiten.",
            "Kein Bieten auf meinen Namen bei Google, keine Gutschein- und Cashbackportale, keine Spammails. Wer dort landet, verkauft nichts Neues, sondern schneidet nur ab, was ohnehin gekauft worden wäre.",
          ].map((punkt) => (
            <li
              key={punkt}
              className="flex gap-3 text-[15px] leading-relaxed text-ink-soft"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-deep" />
              <span>{punkt}</span>
            </li>
          ))}
        </ul>

        {/* ------------------------------------------------------------- */}

        <h2 className="mb-4 mt-14 font-serif text-[26px] font-normal leading-tight tracking-tight sm:text-[32px]">
          Häufige Fragen
        </h2>

        <div className="space-y-6">
          {[
            {
              frage: "Muss ich die Kurse selbst gekauft haben?",
              antwort:
                "Nein. Aber es hilft. Eine Empfehlung, hinter der jemand steht, der weiß, wovon er redet, verkauft besser als jeder Werbetext.",
            },
            {
              frage: "Bekommt die Käuferin einen Rabatt über meinen Link?",
              antwort:
                "Nein, sie zahlt den normalen Preis. Das hat einen Vorteil für dich: Du musst nichts erklären und niemanden zum Eintippen eines Codes bewegen. Der Link genügt.",
            },
            {
              frage: "Bekomme ich Provision auf meinen eigenen Kauf?",
              antwort:
                "Nein. Das wäre ein verdeckter Rabatt, und einen solchen biete ich nicht an. Käufe auf deine eigene Mailadresse zählen deshalb nicht.",
            },
            {
              frage: "Muss ich die Provision versteuern?",
              antwort:
                "Ja. Provision ist Einkommen, auch wenn es nur ein paar Euro im Monat sind. Wie das bei dir aussieht, hängt von deiner Lage ab. Frag im Zweifel deine Steuerberatung, und schreib mir gern, wenn du dir unsicher bist.",
            },
            {
              frage: "Was passiert, wenn jemand den Kauf zurückgibt?",
              antwort: `Dann entfällt die Provision. Genau dafür sind die ${FRIST_TAGE} Tage da, in denen sie noch nicht auszahlbar ist. Was einmal ausgezahlt ist, fordere ich nicht zurück.`,
            },
            {
              frage: "Kann ich wieder aufhören?",
              antwort:
                "Jederzeit, schreib mir einfach eine Mail. Was du bis dahin verdient hast, bekommst du selbstverständlich noch.",
            },
          ].map((f) => (
            <div key={f.frage}>
              <p className="mb-1.5 text-[16px] font-semibold text-ink">
                {f.frage}
              </p>
              <p className="text-[15px] leading-relaxed text-ink-soft">
                {f.antwort}
              </p>
            </div>
          ))}
        </div>

        {/* ------------------------------------------------------------- */}

        <div className="mt-16 rounded-[22px] bg-cream-deep p-6 sm:p-10">
          <h2 className="mb-2 font-serif text-[26px] font-normal leading-tight tracking-tight sm:text-[32px]">
            Bewirb dich
          </h2>
          <p className="mb-8 max-w-xl text-[15px] leading-relaxed text-ink-soft">
            Ich lese jede Bewerbung selbst. Sag mir vor allem, wo du empfehlen
            möchtest, das ist für mich das Wichtigste.
          </p>

          <EmpfehlungAnmeldung />
        </div>
      </div>
    </main>
  );
}
