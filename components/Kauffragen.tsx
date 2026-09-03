import type { DigitalProdukt } from "@/lib/digital";

// ---------------------------------------------------------------------------
// Die Fragen, die vor dem Kauf im Weg stehen.
//
// ▸ WARUM ES DIESEN ABSCHNITT GIBT
//   Auf keiner Verkaufsseite stand bisher, wie man den Zugang bekommt, wie
//   lange er gilt, womit man zahlen kann und ob eine Rechnung kommt. Genau
//   das sind die Fragen, an denen ein Kauf hängen bleibt, und genau deshalb
//   steht in jeder Checkliste ein FAQ.
//
// ▸ DIE ANTWORTEN WERDEN NICHT GETIPPT, SIE KOMMEN AUS DEN PRODUKTDATEN.
//   Der Zugangstext steht in `leistung` (lib/digital.ts), die Widerrufsfrage
//   hängt an `art`. So kann hier nichts stehen, was der Kasse widerspricht.
//   Wer den Preis oder die Leistung ändert, ändert diesen Abschnitt mit.
//
// ▸ ZUM WIDERRUF, und das ist der heikelste Punkt:
//   - Bei digitalen Inhalten (art „kurs" und „dienstleistung") erlischt das
//     Widerrufsrecht, sobald die Kundin an der Kasse ausdrücklich zustimmt,
//     dass sofort geliefert wird. Das ist § 356 Abs. 5 BGB, und die Kasse
//     holt diese Zustimmung mit einem eigenen Häkchen ein.
//   - Bei der Ausbildung gilt das NICHT. Fernunterricht hat nach dem FernUSG
//     ein eigenes Widerrufsrecht, auf das nicht verzichtet werden kann. Ein
//     Verzicht wäre unwirksam, deshalb steht hier für sie eine andere
//     Antwort. Siehe auch `brauchtVerzicht` in components/DigitalKasse.tsx.
//
//   Wenn sich an dieser Rechtslage etwas ändert, ändert es sich an DREI
//   Stellen: hier, in der Kasse und in der Widerrufsbelehrung.
// ---------------------------------------------------------------------------

type Frage = { frage: string; antwort: string };

function fragenZu(produkt: DigitalProdukt): Frage[] {
  const fernunterricht = produkt.art === "fernunterricht";
  const beratung = produkt.art === "dienstleistung";

  const fragen: Frage[] = [
    {
      frage: "Wie bekomme ich den Zugang?",
      antwort: beratung
        ? "Nach der Buchung bekommst du eine Mail mit dem Fragebogen. Es " +
          "gibt hier keinen sofortigen Zugang zu einem fertigen Produkt, " +
          "denn erst nach deinen Angaben entsteht die Arbeit."
        : "Direkt nach der Zahlung, automatisch. Du bekommst eine Mail mit " +
          "deinem Zugang zur Akademie und findest das Angebot dort unter " +
          "deinen Inhalten. Kein Warten, keine Freischaltung von Hand.",
    },
    {
      frage: "Wie lange kann ich darauf zugreifen?",
      antwort: beratung
        ? "Deine Unterlagen bleiben dauerhaft in deinem Bereich, auch nach " +
          "Ende der Begleitung. Sie laufen nicht ab."
        : "Dauerhaft. Es ist kein Abo, du zahlst einmal. Auch beim nächsten " +
          "Pferd oder in zwei Jahren kannst du wieder nachlesen, " +
          "Verbesserungen inbegriffen.",
    },
    {
      frage: "Womit kann ich bezahlen?",
      antwort:
        "Mit Karte, PayPal oder Klarna. Die Zahlung läuft über Stripe, deine " +
        "Kartendaten sieht niemand außer Stripe, auch ich nicht.",
    },
    {
      frage: "Bekomme ich eine Rechnung?",
      antwort:
        "Ja, automatisch per Mail, mit ausgewiesener Mehrwertsteuer und " +
        "fortlaufender Rechnungsnummer. Für alle, die das absetzen möchten.",
    },
  ];

  // ▸ Die Widerrufsfrage. Zwei Rechtslagen, zwei Antworten.
  fragen.push(
    fernunterricht
      ? {
          frage: "Kann ich widerrufen?",
          antwort:
            "Ja. Für die Ausbildung gilt ein Widerrufsrecht von vierzehn " +
            "Tagen, und darauf kannst du nicht verzichten, auch nicht aus " +
            "Versehen an der Kasse. Das schreibt das Fernunterrichtsgesetz " +
            "so vor, und es gilt unabhängig davon, ob du schon " +
            "hineingeschaut hast.",
        }
      : {
          frage: "Kann ich widerrufen?",
          antwort:
            "An der Kasse stimmst du ausdrücklich zu, dass du sofort " +
            "Zugang bekommen möchtest. Mit dieser Zustimmung erlischt das " +
            "Widerrufsrecht, sobald der Zugang da ist. So ist das bei " +
            "digitalen Inhalten vorgesehen, und deshalb steht auf dieser " +
            "Seite auch so genau, was drin ist und für wen es nicht " +
            "gedacht ist. Wenn etwas nicht funktioniert, schreib mir, dafür " +
            "finden wir immer eine Lösung.",
        },
  );

  return fragen;
}

export default function Kauffragen({ produkt }: { produkt: DigitalProdukt }) {
  const fragen = fragenZu(produkt);

  // -------------------------------------------------------------------------
  // Dieselben Fragen noch einmal, aber fuer Google.
  //
  // Ein FAQPage-Eintrag erlaubt es Google, die Fragen direkt unter dem
  // Suchergebnis aufzuklappen. Das Ergebnis wird dadurch hoeher und faellt
  // mehr auf, ohne dass die Seite selbst anders aussieht.
  //
  // ▸ DIE ANTWORTEN WERDEN NICHT ZWEIMAL GETIPPT. Sie kommen aus derselben
  //   Liste wie der sichtbare Abschnitt. Das ist auch Vorschrift: Google
  //   verlangt, dass ausgezeichnete Fragen wortgleich auf der Seite stehen.
  //   Wer hier eigene Texte einsetzt, riskiert eine Abstrafung.
  // -------------------------------------------------------------------------
  const fragenDaten = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: fragen.map((f) => ({
      "@type": "Question",
      name: f.frage,
      acceptedAnswer: { "@type": "Answer", text: f.antwort },
    })),
  };

  return (
    <section className="px-6 pb-16 sm:px-8 sm:pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(fragenDaten) }}
      />
      <div className="mx-auto max-w-3xl">
        <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
          Bevor du kaufst
        </span>

        <h2 className="mb-8 font-serif text-[26px] font-normal leading-[1.15] tracking-tight sm:text-[34px]">
          Die Fragen, die sonst offen bleiben.
        </h2>

        {/* ▸ ALLE ANTWORTEN STEHEN OFFEN DA, NICHTS IST ZUGEKLAPPT.
            Ein Aufklapp-FAQ sieht aufgeräumter aus, aber wer eine Frage hat,
            überfliegt lieber, als fünfmal zu tippen. Und was zugeklappt ist,
            liest auf dem Handy fast niemand. */}
        <dl className="space-y-6">
          {fragen.map((f) => (
            <div
              key={f.frage}
              className="border-b border-line pb-6 last:border-0 last:pb-0"
            >
              <dt className="mb-2 font-serif text-[19px] leading-snug">
                {f.frage}
              </dt>
              <dd className="text-[15.5px] leading-relaxed text-ink-soft">
                {f.antwort}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
