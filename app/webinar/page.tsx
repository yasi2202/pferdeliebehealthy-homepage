import type { Metadata } from "next";
import { teilen } from "@/lib/seo";
import WebinarFormular, { type TerminAngebot } from "@/components/WebinarFormular";
import { naechsteTermine, terminText, terminNaehe } from "@/lib/webinar";

export const metadata: Metadata = {
  alternates: { canonical: "/webinar" },
  title: "Kostenloses Webinar: Was steckt wirklich in deinem Heu?",
  description:
    "45 Minuten über die Heuernte, zwei echte Laboranalysen im Vergleich und einen Futterplan, der Schritt für Schritt durchgerechnet wird. Kostenlos, mehrmals die Woche.",
  ...teilen({
    titel: "Kostenloses Webinar: Was steckt wirklich in deinem Heu?",
    beschreibung:
      "45 Minuten über die Heuernte, zwei echte Laboranalysen im Vergleich und einen Futterplan, der Schritt für Schritt durchgerechnet wird.",
    pfad: "/webinar",
  }),
};

// Die Terminliste haengt an der Uhrzeit des Aufrufs, darf also nicht in den
// Seiten-Zwischenspeicher.
export const dynamic = "force-dynamic";

export default function WebinarSeite() {
  const termine: TerminAngebot[] = naechsteTermine(7).map((t) => ({
    wert: t.toISOString(),
    text: terminText(t),
    naehe: terminNaehe(t),
  }));

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Kostenloses Webinar · 45 Minuten
        </span>
        <h1 className="font-serif font-normal text-[32px] sm:text-[46px] leading-[1.12] tracking-tight mb-5">
          Was steckt wirklich in deinem Heu?
        </h1>
        <p className="text-[17px] text-ink-soft leading-relaxed max-w-xl mb-10">
          Gerade wechselt das Heu in den Raufen. Das alte wird aufgefüttert, das
          neue kommt dazu, und niemand weiß, was drin ist. In 45 Minuten zeige
          ich dir zwei echte Laboranalysen, rechne einen Futterplan Schritt für
          Schritt durch und zeige dir die drei Fallen, die in fast jeder Ration
          stecken.
        </p>

        <div className="grid gap-8 sm:grid-cols-[1.1fr_1fr] items-start">
          <div>
            <h2 className="font-serif text-[22px] mb-4">Das nimmst du mit</h2>
            <ul className="grid gap-3 text-[16px] leading-relaxed">
              {[
                ["Was in der aktuellen Heuernte steckt", "und warum zwei Ballen aus demselben Jahr völlig verschieden sein können."],
                ["Ein echter Futterplan, durchgerechnet", "eine 28-jährige Stute, die zunehmen soll. Was auffällt und was nur so aussieht."],
                ["Die drei Fallen", "die Weide, die niemand mitrechnet. Prozent statt Gramm. Und der Mangel, den es gar nicht gibt."],
                ["Drei Schritte für danach", "für die du nichts kaufen musst."],
              ].map(([titel, rest]) => (
                <li key={titel} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-deep" />
                  <span>
                    <strong className="font-semibold">{titel}</strong>{" "}
                    <span className="text-ink-soft">{rest}</span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-8 text-[15px] text-ink-soft leading-relaxed">
              Ich bin Yasemin, Ernährungsberaterin für Pferde. Ich rechne diese
              Pläne jeden Tag und zeige dir hier, wie ich dabei vorgehe. Ohne
              Verkaufsdruck: Was du danach tust, entscheidest du.
            </p>
          </div>

          <WebinarFormular termine={termine} />
        </div>
      </div>
    </main>
  );
}
