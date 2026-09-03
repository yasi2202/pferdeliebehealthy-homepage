import type { Metadata } from "next";
import RabattCode from "@/components/RabattCode";
import { empfehlungen, werbehinweis } from "@/lib/empfehlungen";

export const metadata: Metadata = {
  alternates: { canonical: "/empfehlungen" },
  // Ohne „| Pferdeliebehealthy": Das haengt app/layout.tsx von selbst an.
  title: "Rabattcodes auf einen Blick",
  description:
    "Alle Codes, mit denen du bei meinen Partnern sparst: Biohof Elmengrund, PerNaturam, Natusat, CDVet und weitere.",
};

export default function EmpfehlungenSeite() {
  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="max-w-2xl">
          <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
            Partner
          </span>
          <h1 className="font-serif font-normal text-[32px] sm:text-[46px] leading-[1.12] tracking-tight mb-5">
            Rabattcodes auf einen Blick
          </h1>
          <p className="text-[17px] text-ink-soft">
            Alle Codes, mit denen du bei meinen Partnern sparst. Klick auf einen
            Code, um ihn zu kopieren.
          </p>
        </div>

        {/* Werbekennzeichnung — steht bewusst vor dem ersten Code. */}
        <div className="bg-cream-deep rounded-[18px] p-6 sm:p-7 mt-10 mb-12 max-w-2xl">
          <div className="text-[11px] font-semibold tracking-[0.16em] uppercase text-rose-deep mb-2.5">
            Werbung
          </div>
          <p className="text-[14px] text-ink-soft leading-relaxed">{werbehinweis}</p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {empfehlungen.map((e) => (
            <li
              key={e.partner}
              className="bg-white rounded-[18px] border border-line p-6 flex flex-col"
            >
              <div className="flex-grow mb-5">
                <h2 className="font-serif text-[20px] leading-snug">{e.partner}</h2>

                {e.rabatt && (
                  <div className="text-[13px] text-rose-deep font-medium mt-1.5">
                    {e.rabatt}
                  </div>
                )}

                {e.warum && (
                  <p className="text-[14px] text-ink-soft mt-3">{e.warum}</p>
                )}
              </div>

              {/* ▸ OHNE CODE STEHT DA NICHT NICHTS, SONDERN DER WEG DAHIN.
                  Nicht jeder Partner erlaubt, dass sein Rabattcode offen auf
                  einer Seite steht, siehe den Hinweis bei PerNaturam in
                  lib/empfehlungen.ts. Eine leere Stelle sähe aus wie ein
                  Fehler; der Satz sagt, dass es den Code gibt und wie man ihn
                  bekommt. */}
              {e.code ? (
                <RabattCode code={e.code} />
              ) : (
                <p className="mt-4 text-[14px] text-ink-soft">
                  Den Rabattcode bekommst du auf Anfrage,{" "}
                  <a
                    href="/#kontakt"
                    className="text-ink underline decoration-rose-deep/40 underline-offset-4 hover:decoration-rose-deep"
                  >
                    schreib mir kurz
                  </a>
                  .
                </p>
              )}

              {e.url && (
                <a
                  href={e.url}
                  target="_blank"
                  /* sponsored = bezahlter Link, nofollow = keine Empfehlung an
                     Suchmaschinen weitergeben. Fordert Google für Affiliate-
                     Links ausdrücklich. */
                  rel={e.bezahlt ? "sponsored nofollow noopener" : "nofollow noopener"}
                  className="text-[13.5px] font-medium text-rose-deep hover:text-ink transition-colors mt-3"
                >
                  Zum Shop →
                </a>
              )}
            </li>
          ))}
        </ul>

        <p className="text-[13px] text-ink-soft mt-12 pt-8 border-t border-line max-w-2xl">
          Rabattcodes und Konditionen legen die Anbieter fest, nicht ich. Es kann
          also passieren, dass ein Code ausläuft. Wenn dir das auffällt, schreib
          mir kurz, dann nehme ich ihn hier raus.
        </p>
      </div>
    </main>
  );
}
