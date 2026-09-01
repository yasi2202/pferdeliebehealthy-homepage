import type { Metadata } from "next";
import Link from "next/link";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { supabaseAlle, supabaseZaehlen } from "@/lib/versand";

// ---------------------------------------------------------------------------
// Die Adressliste, mit Export für den Newsletter.
//
// ▸ WAS HIER ZU SEHEN IST, IST NUR DIE VORSCHAU. Der Export nimmt immer die
//   vollständige Liste, auch wenn hier nur die neuesten stehen.
//
// ▸ BESTÄTIGT UND UNBESTÄTIGT WERDEN GETRENNT GEZÄHLT, und zwar auffällig.
//   Die Zahl, die zählt, ist die der bestätigten: nur die darfst du
//   anschreiben. Wer beide zusammenrechnet, hält seinen Verteiler für
//   grösser, als er ist, und schreibt irgendwann Leute an, die nie zugestimmt
//   haben.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Adressen",
  robots: { index: false, follow: false },
};

type Adresse = {
  email: string;
  vorname: string | null;
  bestaetigt: boolean;
  erste_anmeldung: string | null;
  woher: string | null;
};

export default async function AdressenSeite() {
  if (!adminEingerichtet() || !(await istAngemeldet())) {
    return (
      <main className="px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <p className="text-[15px] text-ink-soft">
            Bitte zuerst{" "}
            <Link
              href="/admin"
              className="text-rose-deep underline underline-offset-2"
            >
              anmelden
            </Link>
            .
          </p>
        </div>
      </main>
    );
  }

  // Gezählt wird über den Kopf der Antwort, nicht über die Länge der Liste:
  // Supabase liefert höchstens tausend Zeilen, und `.length` wäre dann still
  // falsch.
  const bestaetigt = await supabaseZaehlen("alle_anmeldungen?bestaetigt=is.true");
  const offen = await supabaseZaehlen("alle_anmeldungen?bestaetigt=is.false");

  const neueste =
    (await supabaseAlle<Adresse>(
      "alle_anmeldungen?select=email,vorname,bestaetigt,erste_anmeldung,woher&order=erste_anmeldung.desc&limit=50",
    )) ?? [];

  return (
    <main className="px-6 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-serif text-[32px] font-normal leading-tight tracking-tight sm:text-[40px]">
            Adressen
          </h1>

          <nav className="flex flex-wrap gap-5 text-[14.5px]">
            <Link
              href="/admin"
              className="text-rose-deep underline underline-offset-2"
            >
              Auswertung
            </Link>
            <Link
              href="/admin/rabattcodes"
              className="text-rose-deep underline underline-offset-2"
            >
              Rabattcodes
            </Link>
          </nav>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-[16px] border border-line bg-white p-5">
            <div className="text-[13px] uppercase tracking-[0.1em] text-ink-soft">
              Bestätigt, anschreibbar
            </div>
            <div className="mt-2 font-serif text-[28px] tabular-nums">
              {bestaetigt < 0 ? "?" : bestaetigt}
            </div>
          </div>

          <div className="rounded-[16px] border border-line bg-cream-deep p-5">
            <div className="text-[13px] uppercase tracking-[0.1em] text-ink-soft">
              Noch nicht bestätigt
            </div>
            <div className="mt-2 font-serif text-[28px] tabular-nums">
              {offen < 0 ? "?" : offen}
            </div>
            <div className="mt-1 text-[13px] text-ink-soft">
              Diese darfst du nicht anschreiben.
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------- Export */}
        <div className="mb-10 rounded-[18px] bg-ink p-6 text-cream sm:p-7">
          <h2 className="mb-3 font-serif text-[21px]">
            Für den Newsletter herunterladen
          </h2>

          <p className="mb-6 text-[15px] leading-relaxed text-cream/80">
            Eine CSV-Datei mit allen bestätigten Adressen, Vorname, Datum der
            Anmeldung und Herkunft. Sie öffnet sich in Excel und lässt sich in
            jedes Newsletter-Werkzeug einlesen. Unbestätigte Adressen sind
            nicht enthalten.
          </p>

          {/* Ein normaler Link, kein Knopf mit JavaScript: So kann der
              Browser die Datei selbst speichern, und der Server prüft dabei
              den Keks wie bei jeder anderen Seite. */}
          <a
            href="/api/admin-adressen"
            className="inline-block rounded-full bg-rose px-7 py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-cream"
          >
            CSV herunterladen
          </a>
        </div>

        {/* ---------------------------------------------------- Die neuesten */}
        <div className="rounded-[18px] border border-line bg-white p-6 sm:p-7">
          <h2 className="mb-5 font-serif text-[21px]">Die letzten 50</h2>

          {neueste.length === 0 ? (
            <p className="text-[15px] text-ink-soft">Noch keine Anmeldungen.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[14.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-[13px] uppercase tracking-[0.08em] text-ink-soft">
                    <th className="pb-2 font-normal">Adresse</th>
                    <th className="pb-2 font-normal">Vorname</th>
                    <th className="pb-2 font-normal">Herkunft</th>
                    <th className="pb-2 font-normal">Seit</th>
                  </tr>
                </thead>
                <tbody>
                  {neueste.map((z) => (
                    <tr
                      key={z.email}
                      className={`border-b border-line last:border-0 ${
                        z.bestaetigt ? "" : "opacity-45"
                      }`}
                    >
                      <td className="py-2.5">
                        {z.email}
                        {!z.bestaetigt && (
                          <span className="ml-2 text-[12.5px] text-ink-soft">
                            unbestätigt
                          </span>
                        )}
                      </td>
                      <td className="py-2.5">
                        {z.vorname && z.vorname.toLowerCase() !== "du"
                          ? z.vorname
                          : "–"}
                      </td>
                      <td className="py-2.5 text-[13.5px] text-ink-soft">
                        {z.woher ?? "–"}
                      </td>
                      <td className="py-2.5 text-[13.5px] text-ink-soft">
                        {z.erste_anmeldung
                          ? new Date(z.erste_anmeldung).toLocaleDateString("de-DE")
                          : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
