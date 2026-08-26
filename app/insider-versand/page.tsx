import type { Metadata } from "next";
import Link from "next/link";
import { alleBeitraege, datumDeutsch } from "@/lib/beitraege";
import { aktuellerInsider } from "@/lib/insider-zugang";
import { istAdmin, alleVersandvermerke } from "@/lib/insider-versand";
import { supabase } from "@/lib/versand";
import VersandKnopf from "@/components/VersandKnopf";

// ---------------------------------------------------------------------------
// Yasis Versandseite: alle Beiträge, daneben ein Knopf "An alle Insider
// schicken" — und bei denen, die schon raus sind, steht stattdessen, wann und
// an wie viele.
//
// Wer nicht als Yasi angemeldet ist, sieht nichts weiter als einen Hinweis.
// Die Seite steht auch nicht im Suchindex.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Versand",
  robots: { index: false, follow: false },
};

/** Wie viele bestätigte Insider es gerade gibt.
 *
 *  Holt nur die Kennungen, keine Adressen — für eine Zahl auf einer Seite
 *  braucht niemand die Liste selbst im Speicher zu haben. */
async function empfaengerZaehlen(): Promise<number> {
  const res = await supabase("insider_anmeldungen?bestaetigt=eq.true&select=id");
  if (!res.ok) return 0;
  const zeilen = await res.json();
  return Array.isArray(zeilen) ? zeilen.length : 0;
}

export default async function VersandSeite() {
  const angemeldet = await aktuellerInsider();

  if (!istAdmin(angemeldet)) {
    return (
      <main className="py-14 sm:py-20 px-6 sm:px-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif font-normal text-[30px] sm:text-[40px] leading-tight mb-5">
            Diese Seite ist nicht für dich gedacht
          </h1>
          <p className="text-[17px] text-ink-soft leading-relaxed mb-8">
            Hier verschickt Yasi ihre Beiträge an den Verteiler. Wenn du nach
            den Beiträgen selbst suchst, geht es hier entlang.
          </p>
          <Link
            href="/insider"
            className="inline-block bg-ink text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-rose-deep transition-colors"
          >
            Zum Insider-Bereich
          </Link>
        </div>
      </main>
    );
  }

  const beitraege = alleBeitraege();
  const vermerke = await alleVersandvermerke();
  const anzahl = await empfaengerZaehlen();

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Nur für dich
        </span>
        <h1 className="font-serif font-normal text-[32px] sm:text-[44px] leading-[1.12] tracking-tight mb-5">
          Beiträge verschicken
        </h1>
        <p className="text-[17px] text-ink-soft leading-relaxed">
          Dein Verteiler umfasst gerade <strong>{anzahl}</strong>{" "}
          {anzahl === 1 ? "bestätigte Adresse" : "bestätigte Adressen"}. Jede
          Mail enthält einen persönlichen Link, der die Leserin unterwegs
          anmeldet, und einen Abmeldelink.
        </p>

        <div className="bg-cream-deep rounded-[18px] p-6 mt-8">
          <p className="text-[14.5px] text-ink-soft leading-relaxed">
            Jeder Beitrag lässt sich nur einmal verschicken. Willst du einen
            doch noch einmal senden, lösch die Zeile in der Supabase-Tabelle{" "}
            <code className="text-[13.5px]">insider_versand</code> — danach
            geht der Knopf wieder.
          </p>
        </div>

        <ul className="divide-y divide-line border-t border-line mt-10">
          {beitraege.map((b) => {
            const vermerk = vermerke.find((v) => v.slug === b.slug);
            return (
              <li key={b.slug} className="py-7">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                  <span className="text-[12.5px] text-ink-soft tabular-nums">
                    {datumDeutsch(b.datum)}
                  </span>
                  <span className="text-[11.5px] tracking-[0.1em] uppercase text-rose-deep font-semibold">
                    {b.kategorie}
                  </span>
                </div>

                <h2 className="font-serif text-[21px] leading-snug mb-1">
                  <Link
                    href={`/insider/${b.slug}`}
                    className="hover:text-rose-deep transition-colors"
                  >
                    {b.titel}
                  </Link>
                </h2>

                <p className="text-[14.5px] text-ink-soft max-w-xl mb-4">
                  {b.beschreibung}
                </p>

                {vermerk ? (
                  <p className="text-[14px] text-ink-soft">
                    ✓ Verschickt am{" "}
                    {datumDeutsch(vermerk.versendet_am.slice(0, 10))} an{" "}
                    {vermerk.empfaenger}{" "}
                    {vermerk.empfaenger === 1 ? "Adresse" : "Adressen"}
                  </p>
                ) : (
                  <VersandKnopf slug={b.slug} titel={b.titel} anzahl={anzahl} />
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
