import type { Metadata } from "next";
import Link from "next/link";
import { alleBeitraege, datumDeutsch } from "@/lib/beitraege";
import { insider } from "@/lib/insider";

export const metadata: Metadata = {
  alternates: { canonical: "/insider" },
  title: "Pferdeliebe Insider | Kostenloses Futterwissen",
  description:
    "Kostenloses Wissen zur Pferdefütterung: was in Rationen wirklich schiefgeht, Zusatzfutter ehrlich eingeordnet und wie du Laborwerte liest.",
};

export default function InsiderSeite() {
  const beitraege = alleBeitraege();

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Kostenlos
        </span>
        <h1 className="font-serif font-normal text-[32px] sm:text-[46px] leading-[1.12] tracking-tight mb-5">
          {insider.name}
        </h1>
        <p className="text-[17px] text-ink-soft max-w-xl">
          {insider.abschnitt.einleitung}
        </p>

        {/* Anmeldung — läuft über alfima, damit die Adresse in deiner Liste landet */}
        <div className="bg-ink text-cream rounded-[24px] p-8 sm:p-10 mt-10">
          <div className="text-[11px] tracking-[0.16em] uppercase text-pfirsich font-semibold mb-3">
            Nichts verpassen
          </div>
          <h2 className="font-serif text-[24px] sm:text-[28px] leading-snug mb-4">
            Neue Beiträge direkt ins Postfach
          </h2>
          <p className="text-[15px] text-cream/75 max-w-lg mb-7">
            Trag dich ein, dann schreibe ich dir, sobald es etwas Neues gibt.
            Du musst dann nicht selbst nachsehen.
          </p>
          <a
            href={insider.anmeldeUrl}
            target="_blank"
            rel="noopener"
            className="inline-block bg-pfirsich text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-cream transition-colors"
          >
            {insider.abschnitt.button}
          </a>
          <p className="text-[13px] text-cream/60 mt-5 max-w-md">
            {insider.abschnitt.kleingedrucktes}
          </p>
        </div>

        {/* Die Beiträge */}
        <div className="mt-16">
          {beitraege.length === 0 ? (
            <div className="border border-dashed border-line rounded-[18px] p-10 text-center">
              <p className="font-serif text-[22px] mb-3">
                Der erste Beitrag ist in Arbeit
              </p>
              <p className="text-[15px] text-ink-soft max-w-md mx-auto">
                Trag dich oben ein, dann bekommst du ihn, sobald er da ist.
              </p>
            </div>
          ) : (
            <>
              <h2 className="text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-8">
                Alle Beiträge
              </h2>
              <ul className="divide-y divide-line border-t border-line">
                {beitraege.map((b) => (
                  <li key={b.slug}>
                    <Link
                      href={`/insider/${b.slug}`}
                      className="group block py-7 transition-colors hover:bg-white/60 -mx-4 px-4 rounded-xl"
                    >
                      {b.datum && (
                        <div className="text-[12.5px] text-ink-soft tabular-nums mb-2">
                          {datumDeutsch(b.datum)}
                        </div>
                      )}
                      <h3 className="font-serif text-[22px] sm:text-[25px] leading-snug group-hover:text-rose-deep transition-colors">
                        {b.titel}
                      </h3>
                      {b.beschreibung && (
                        <p className="text-[15px] text-ink-soft mt-2 max-w-xl">
                          {b.beschreibung}
                        </p>
                      )}
                      <span className="inline-block text-[14px] font-medium text-rose-deep mt-3">
                        Lesen →
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
