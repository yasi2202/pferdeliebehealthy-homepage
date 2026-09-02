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

function Sterne() {
  return (
    <span className="flex gap-0.5 text-gold" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <svg key={i} width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.5l2.9 6.2 6.6.9-4.8 4.7 1.2 6.7L12 17.8 6.1 21l1.2-6.7L2.5 9.6l6.6-.9z" />
        </svg>
      ))}
    </span>
  );
}

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

        {/* Die Note zuerst, als Zahl und in Sternen. */}
        <div className="mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line pb-6">
          <Sterne />
          <span className="font-serif text-[22px] tabular-nums">
            {googleBewertung.note} von 5
          </span>
          <span className="text-[14.5px] text-ink-soft">
            aus {googleBewertung.anzahl} Bewertungen bei Google
          </span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {liste.map((s) => (
            <figure
              key={s.name}
              className="flex h-full flex-col rounded-[18px] border border-line bg-white p-6 sm:p-7"
            >
              <blockquote className="flex-grow text-[15px] leading-relaxed text-ink-soft">
                „{s.zitat}"
              </blockquote>

              <figcaption className="mt-5 text-[14px]">
                <span className="font-medium">{s.name}</span>
                <span className="text-ink-soft"> · {s.rolle}</span>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="mt-5 text-[13.5px] leading-relaxed text-ink-soft">
          Eine Auswahl aus den Bewertungen im Google-Profil, wörtlich
          übernommen und mit dem Vornamen der Kundin.{" "}
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
            "Dort stehen alle, auch die kritischen."
          )}
        </p>
      </div>
    </section>
  );
}
