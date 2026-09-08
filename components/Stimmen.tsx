import { googleBewertung, stimmenZu } from "@/lib/stimmen";

// ---------------------------------------------------------------------------
// Der Stimmen-Abschnitt auf den Verkaufsseiten.
//
// ▸ WARUM ES IHN GIBT
//   Bis zum 02.09.2026 stand auf keiner einzigen Verkaufsseite ein Wort von
//   einer Kundin. In jeder Checkliste für Verkaufsseiten steht Social Proof
//   unter den ersten fünf Punkten, und es war der einzige davon, der hier
//   komplett fehlte.
//
// ▸ WO ER STEHT
//   Kurz vor dem letzten Kaufknopf. Wer bis dorthin gelesen hat, ist am
//   Abwägen; genau da hilft es zu sehen, dass andere schon gekauft haben.
//   Weiter oben würde er den Ablauf Problem → Lösung → Angebot zerschneiden.
//
// ▸ DIE NOTE STEHT ÜBER DEN ZITATEN
//   „4,9 von 5 bei 20 Bewertungen" ist eine nachprüfbare Zahl. Ein Zitat ist
//   eine Meinung. Die Zahl trägt weiter, deshalb kommt sie zuerst.
//
// ▸ DER SATZ „Eine Auswahl" IST PFLICHT, nicht Zierde. Wer Stimmen zeigt und
//   dabei den Eindruck erweckt, das seien alle, wirbt irreführend. Siehe
//   lib/stimmen.ts.
// ---------------------------------------------------------------------------

export default function Stimmen({ slug }: { slug: string }) {
  const liste = stimmenZu(slug);

  // Ohne passende Stimme kein Abschnitt. Eine fremde wäre schlimmer als keine.
  if (liste.length === 0) return null;

  return (
    <section className="px-6 pb-16 sm:px-8 sm:pb-24">
      <div className="mx-auto max-w-3xl">
        <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
          Was Kundinnen sagen
        </span>

        {/* ▸ HIER STAND KURZ „4,9 von 5 aus 20 Bewertungen bei Google",
            darüber fünf Sterne. Beides ist am 02.09.2026 auf Yasemins Wunsch
            raus: Zwanzig sieht nach wenig aus, obwohl die Note hervorragend
            ist.

            Weg ist die Zahl KOMPLETT und nicht nur die Anzahl. Mit einer
            Durchschnittsnote zu werben und zu verschweigen, aus wie vielen
            Bewertungen sie stammt, ist angreifbar: Zur Note gehört die
            Bezugsgröße. Entweder beides oder keines.

            Und die fünf Sterne sind mitgegangen, obwohl sie hübsch aussahen.
            Fünf gefüllte Sterne über Kundenstimmen liest man als „fünf von
            fünf". Das wäre eine Bestnote, die es nicht gibt: Die echte ist
            4,9, und unter den zwanzig Bewertungen ist eine mit drei Sternen.
            Ein Bild, das etwas behauptet, was der Text nicht sagt, ist
            genauso irreführend wie der falsche Satz.

            Was bleibt, sind die Zitate. Die sind echt, wörtlich und
            unangreifbar, und sie wirken ohnehin stärker als jede Zahl.

            ▸ WENN DIE BEWERTUNGEN MEHR WERDEN, kann die Zeile zurück, mit
              Note UND Anzahl. Die Daten stehen weiter in lib/stimmen.ts. */}

        {/* ▸ items-start: JEDE KARTE IST SO HOCH WIE IHR TEXT.
            Vorher zog das Raster beide auf dieselbe Höhe, und der Name klebte
            unten am Rand. Bei zwei ähnlich langen Zitaten fällt das nicht auf,
            bei ungleichen schon: Neben einem sechszeiligen Zitat stand ein
            zweizeiliges mit einem handbreiten Loch darunter, als fehlte da
            etwas. Ungleich hohe Karten sind ehrlicher als ein leerer Kasten. */}
        <div className="grid items-start gap-5 sm:grid-cols-2">
          {liste.map((s) => (
            <figure
              key={s.name}
              className="flex flex-col rounded-[18px] border border-line bg-white p-6 sm:p-7"
            >
              <blockquote className="text-[15px] leading-relaxed text-ink-soft">
                „{s.zitat}“
              </blockquote>

              <figcaption className="mt-5 text-[14px]">
                <span className="font-medium">{s.name}</span>
                <span className="text-ink-soft"> · {s.rolle}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* ▸ HIER STAND „Eine Auswahl aus den Bewertungen im Google-Profil".
            Das stimmte nie ganz: Sieben der Stimmen kommen aus Mails, nicht
            aus Google. Ein Satz, der die Quelle falsch angibt, ist auf einer
            Verkaufsseite genauso angreifbar wie eine falsche Zahl. */}
        <p className="mt-5 text-[13.5px] leading-relaxed text-ink-soft">
          Eine Auswahl aus Bewertungen und Rückmeldungen von Kundinnen,
          wörtlich übernommen und mit dem Vornamen.{" "}
          {googleBewertung.url ? (
            <a
              href={googleBewertung.url}
              target="_blank"
              rel="noopener"
              className="underline decoration-rose-deep/40 underline-offset-4 hover:decoration-rose-deep"
            >
              Alle Bewertungen bei Google ansehen
            </a>
          ) : (
            // ▸ VORHER: „Dort stehen alle, auch die kritischen." Das „dort"
            //   zeigte auf das Google-Profil, das im Satz davor nicht mehr
            //   vorkommt. Der Hinweis bleibt, er sagt jetzt nur selbst, wohin.
            "Im Google-Profil stehen alle, auch die kritischen."
          )}
        </p>
      </div>
    </section>
  );
}
