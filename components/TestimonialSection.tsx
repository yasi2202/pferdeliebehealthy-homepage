import { stimmenStartseite } from "@/lib/stimmen";

// ---------------------------------------------------------------------------
// Kundenstimmen auf der Startseite.
//
// ▸ DIE STIMMEN STEHEN NICHT MEHR HIER, SONDERN IN lib/stimmen.ts.
//   Bis zum 02.09.2026 stand hier eine einzige, fest eingetippt. Inzwischen
//   gibt es dreizehn, und sie werden auch auf den Verkaufsseiten gebraucht.
//   Zweimal dieselbe Liste zu pflegen geht immer schief: Eine wird aktuell
//   gehalten, die andere vergisst man.
//
// ▸ WELCHE HIER STEHEN, entscheidet `stimmenStartseite()`. Handverlesen und
//   gemischt: ein Ergebnis, ein Vergleich, jemand aus der Ausbildung, jemand
//   über die Betreuung.
//
// ▸ NEUE STIMME? In lib/stimmen.ts eintragen, wörtlich und nur mit Vornamen,
//   und erst nachdem die Kundin zugestimmt hat.
// ---------------------------------------------------------------------------

export default function TestimonialSection() {
  const stimmen = stimmenStartseite();
  const einzeln = stimmen.length === 1;

  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <span className="fade-in block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Stimmen
        </span>
        <h2 className="fade-in font-serif font-normal text-[26px] sm:text-[38px] leading-tight max-w-3xl">
          Was Kundinnen mir danach geschrieben haben
        </h2>

        <div
          className={`fade-in mt-14 grid gap-6 ${
            einzeln ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2"
          }`}
        >
          {stimmen.map((s) => (
            <figure
              key={s.name}
              className="bg-cream-deep rounded-[18px] p-9 sm:p-12 flex flex-col"
            >
              <blockquote
                className={`font-serif italic leading-snug flex-grow ${
                  einzeln ? "text-[22px] max-w-2xl" : "text-[19px]"
                }`}
              >
                <span className="text-rose-deep">„</span>
                {s.zitat}
                <span className="text-rose-deep">“</span>
              </blockquote>
              <figcaption className="text-sm text-ink-soft mt-6">
                {s.name} · {s.rolle}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
