import type { Metadata } from "next";
import Link from "next/link";
import AdminAnmeldung from "@/components/AdminAnmeldung";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { auswerten } from "@/lib/auswertung";
import { supabaseAlle } from "@/lib/versand";
import { preisText } from "@/lib/shop";

// ---------------------------------------------------------------------------
// Die Auswertung: Umsatz, Verkäufe je Produkt, Problemfälle.
//
// ▸ NICHT IM SUCHINDEX, und zwar nicht nur per robots-Angabe, sondern weil
//   ohne Anmeldung schlicht nichts geladen wird. Die Zahlen verlassen den
//   Server gar nicht erst.
//
// ▸ WAS HIER ABSICHTLICH NICHT STEHT
//   Keine Namen einzelner Kundinnen und keine Bestelldetails. Wer wissen
//   will, wer was gekauft hat, sieht in Supabase nach. Eine Auswertung soll
//   Entscheidungen ermöglichen, nicht Personen zeigen.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Auswertung",
  robots: { index: false, follow: false },
};

/** Eine grosse Zahl mit Beschriftung. */
function Kachel({
  titel,
  betrag,
  anzahl,
}: {
  titel: string;
  betrag: number;
  anzahl: number;
}) {
  return (
    <div className="rounded-[16px] border border-line bg-white p-5">
      <div className="text-[13px] uppercase tracking-[0.1em] text-ink-soft">
        {titel}
      </div>
      <div className="mt-2 font-serif text-[28px] tabular-nums">
        {preisText(betrag)}
      </div>
      <div className="mt-1 text-[13.5px] text-ink-soft">
        {anzahl === 1 ? "1 Kauf" : `${anzahl} Käufe`}
      </div>
    </div>
  );
}

export default async function AuswertungSeite() {
  if (!adminEingerichtet()) {
    return (
      <main className="px-6 py-20">
        <div className="mx-auto max-w-lg rounded-[18px] border border-line bg-white p-7">
          <h1 className="mb-3 font-serif text-[22px]">Noch nicht eingerichtet</h1>
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Für diesen Bereich fehlt die Variable <code>ADMIN_PASSWORT</code> in
            den Vercel-Einstellungen des Projekts. Trag dort ein langes,
            zufälliges Passwort ein und veröffentliche einmal neu.
          </p>
        </div>
      </main>
    );
  }

  if (!(await istAngemeldet())) {
    return (
      <main className="px-6 py-20">
        <AdminAnmeldung />
      </main>
    );
  }

  const a = await auswerten();

  // Die letzten Verkaefe mit Rechnungsnummer, fuer die Ablage. Bewusst nur
  // die letzten fuenfzig: Wer aeltere braucht, nimmt den CSV-Export.
  const rechnungen =
    (await supabaseAlle<{
      nummer: string;
      rechnungsnummer: string | null;
      bezahlt_am: string | null;
      angelegt_am: string;
      vorname: string;
      nachname: string;
      gesamt: number;
    }>(
      "digitalbestellungen?status=eq.bezahlt&select=nummer,rechnungsnummer,bezahlt_am,angelegt_am,vorname,nachname,gesamt&order=bezahlt_am.desc&limit=50",
    )) ?? [];

  if (!a.gelesen) {
    return (
      <main className="px-6 py-20">
        <div className="mx-auto max-w-lg rounded-[18px] border border-line bg-white p-7">
          <h1 className="mb-3 font-serif text-[22px]">Keine Verbindung</h1>
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Die Bestellungen liessen sich gerade nicht laden. Das liegt fast
            immer an der Datenbank, nicht an deinen Zahlen. Lad die Seite in
            einer Minute noch einmal.
          </p>
        </div>
      </main>
    );
  }

  // Für den Verlauf: der grösste Tageswert bestimmt die Höhe der Balken.
  const hoechster = Math.max(...a.verlauf.map((v) => v.umsatz), 1);

  return (
    <main className="px-6 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-serif text-[32px] font-normal leading-tight tracking-tight sm:text-[40px]">
            Auswertung
          </h1>

          <nav className="flex flex-wrap gap-5 text-[14.5px]">
            <Link
              href="/admin/rabattcodes"
              className="text-rose-deep underline underline-offset-2"
            >
              Rabattcodes
            </Link>
            <Link
              href="/admin/adressen"
              className="text-rose-deep underline underline-offset-2"
            >
              Adressen
            </Link>
          </nav>
        </div>

        {/* ----------------------------------------------- Problemfaelle */}
        {/* Ganz oben, weil hier jemand bezahlt hat und nicht hineinkommt.
            Das ist der einzige Fall, bei dem sofort etwas zu tun ist. */}
        {a.probleme.length > 0 && (
          <div className="mb-8 rounded-[16px] border-2 border-rose-deep bg-white p-6">
            <h2 className="mb-3 font-serif text-[20px]">
              {a.probleme.length === 1
                ? "Eine Kundin wartet auf ihren Zugang"
                : `${a.probleme.length} Kundinnen warten auf ihren Zugang`}
            </h2>

            <p className="mb-4 text-[14.5px] leading-relaxed text-ink-soft">
              Bezahlt, aber die Freischaltung hat nicht geklappt. Trag den
              Zugang bitte im Adminbereich der Akademie von Hand nach.
            </p>

            <ul className="space-y-2 text-[14px]">
              {a.probleme.map((p) => (
                <li key={p.nummer} className="border-t border-line pt-2">
                  <strong>{p.email}</strong>
                  <span className="text-ink-soft"> · {p.nummer}</span>
                  {p.hinweis && (
                    <div className="text-[13px] text-ink-soft">{p.hinweis}</div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ---------------------------------------------------- Zeitraeume */}
        <div className="mb-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {a.zeitraeume.map((z) => (
            <Kachel
              key={z.name}
              titel={z.name}
              betrag={z.umsatz}
              anzahl={z.anzahl}
            />
          ))}
        </div>

        {/* ------------------------------------------------------- Verlauf */}
        <div className="mb-10 rounded-[18px] border border-line bg-white p-6 sm:p-7">
          <h2 className="mb-1 font-serif text-[21px]">Die letzten 30 Tage</h2>
          <p className="mb-6 text-[13.5px] text-ink-soft">
            Höchster Tag: {preisText(hoechster)}
          </p>

          <div className="flex h-32 items-end gap-[3px]">
            {a.verlauf.map((v) => (
              <div
                key={v.tag}
                title={`${v.tag}: ${preisText(v.umsatz)} aus ${v.anzahl} Käufen`}
                className="flex-1 rounded-t-[3px] bg-rose transition-colors hover:bg-rose-deep"
                style={{
                  // Mindestens ein Pixel, damit man auch leere Tage sieht und
                  // nicht rätselt, ob die Anzeige kaputt ist.
                  height: `${Math.max((v.umsatz / hoechster) * 100, 1)}%`,
                }}
              />
            ))}
          </div>

          <div className="mt-2 flex justify-between text-[12px] text-ink-soft">
            <span>{a.verlauf[0]?.tag}</span>
            <span>{a.verlauf[a.verlauf.length - 1]?.tag}</span>
          </div>
        </div>

        {/* ------------------------------------------------------ Produkte */}
        <div className="mb-10 rounded-[18px] border border-line bg-white p-6 sm:p-7">
          <h2 className="mb-5 font-serif text-[21px]">
            Was sich verkauft, nach Umsatz
          </h2>

          {a.produkte.length === 0 ? (
            <p className="text-[15px] text-ink-soft">
              Noch keine bezahlten Käufe.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[14.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-[13px] uppercase tracking-[0.08em] text-ink-soft">
                    <th className="pb-2 font-normal">Produkt</th>
                    <th className="pb-2 text-right font-normal">Verkauft</th>
                    <th className="pb-2 text-right font-normal">davon Angebot</th>
                    <th className="pb-2 text-right font-normal">Umsatz</th>
                  </tr>
                </thead>
                <tbody>
                  {a.produkte.map((p) => (
                    <tr key={p.slug} className="border-b border-line last:border-0">
                      <td className="py-2.5">{p.name}</td>
                      <td className="py-2.5 text-right tabular-nums">{p.anzahl}</td>
                      <td className="py-2.5 text-right tabular-nums text-ink-soft">
                        {p.alsAngebot > 0 ? p.alsAngebot : "–"}
                      </td>
                      <td className="py-2.5 text-right tabular-nums">
                        {preisText(p.umsatz)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
            Die Spalte „davon Angebot" zählt die Käufe über ein Anschluss- oder
            Ersatzangebot nach einem anderen Kauf. Daran siehst du, welches
            Produkt sich allein verkauft und welches nur im Windschatten.
          </p>
        </div>

        {/* -------------------------------------------------- Die Rechnungen */}
        {/* Die letzten Verkäufe mit einem Weg zur einzelnen Rechnung. Die
            Mail geht an die Kundin, du brauchst dasselbe Papier aber auch
            für deine Ablage. */}
        {rechnungen.length > 0 && (
          <div className="mb-10 rounded-[18px] border border-line bg-white p-6 sm:p-7">
            <h2 className="mb-1 font-serif text-[21px]">Deine Rechnungen</h2>

            <p className="mb-5 text-[13.5px] leading-relaxed text-ink-soft">
              Zum Ansehen und als PDF speichern. Im Browser mit Strg und P
              drucken, dort „Als PDF speichern" wählen.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-[14.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-[13px] uppercase tracking-[0.08em] text-ink-soft">
                    <th className="pb-2 pr-5 font-normal">Rechnung</th>
                    <th className="pb-2 pr-5 font-normal">Datum</th>
                    <th className="pb-2 pr-5 font-normal">Kundin</th>
                    <th className="pb-2 pl-5 text-right font-normal">Betrag</th>
                    <th className="pb-2 pl-5 text-right font-normal"></th>
                  </tr>
                </thead>
                <tbody>
                  {rechnungen.map((r) => (
                    <tr key={r.nummer} className="border-b border-line last:border-0">
                      <td className="py-2.5 pr-5 tabular-nums">
                        {r.rechnungsnummer ?? "–"}
                      </td>
                      <td className="py-2.5 pr-5 whitespace-nowrap text-ink-soft">
                        {new Date(r.bezahlt_am ?? r.angelegt_am).toLocaleDateString("de-DE")}
                      </td>
                      <td className="py-2.5 pr-5">
                        {r.vorname} {r.nachname}
                      </td>
                      <td className="py-2.5 pl-5 text-right tabular-nums whitespace-nowrap">
                        {preisText(r.gesamt)}
                      </td>
                      <td className="py-2.5 pl-5 text-right whitespace-nowrap">
                        <Link
                          href={`/admin/rechnung/${r.nummer}`}
                          className="text-[13.5px] text-rose-deep underline underline-offset-2"
                        >
                          ansehen
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ------------------------------------------------ Für die Steuer */}
        <div className="mb-10 rounded-[18px] bg-ink p-6 text-cream sm:p-7">
          <h2 className="mb-3 font-serif text-[21px]">Für deine Buchhaltung</h2>

          <p className="mb-6 text-[15px] leading-relaxed text-cream/80">
            Alle bezahlten Verkäufe als Tabelle, mit Rechnungsnummer, Datum,
            Brutto, Netto und dem enthaltenen Steuerbetrag. Das ist die Datei,
            die dein Steuerbüro einlesen kann.
          </p>

          <a
            href="/api/admin-bestellungen"
            className="inline-block rounded-full bg-rose px-7 py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-cream"
          >
            Verkäufe als CSV
          </a>

          <p className="mt-5 text-[13px] leading-relaxed text-cream/60">
            Das ist ein Journal, also die Liste aller Vorgänge. Die einzelnen
            Rechnungen sind die Mails, die deine Kundinnen bekommen haben. Für
            die laufende Buchhaltung reicht diese Liste, für eine Prüfung
            solltest du auch die Rechnungen selbst vorlegen können.
          </p>
        </div>

        {/* ------------------------------------------------------- Fusszeile */}
        <div className="rounded-[18px] border border-line bg-cream-deep p-6">
          <div className="grid grid-cols-1 gap-4 text-[14.5px] sm:grid-cols-3">
            <div>
              <div className="text-ink-soft">Umsatz insgesamt</div>
              <div className="font-serif text-[20px] tabular-nums">
                {preisText(a.gesamtUmsatz)}
              </div>
            </div>
            <div>
              <div className="text-ink-soft">Käufe insgesamt</div>
              <div className="font-serif text-[20px] tabular-nums">
                {a.gesamtAnzahl}
              </div>
            </div>
            <div>
              <div className="text-ink-soft">Gewährte Rabatte</div>
              <div className="font-serif text-[20px] tabular-nums">
                {preisText(a.rabattSumme)}
              </div>
            </div>
          </div>

          <p className="mt-5 text-[13px] leading-relaxed text-ink-soft">
            Gezählt werden nur bezahlte Bestellungen, digitale wie physische.
            Beim Versand ist das Porto herausgerechnet, das ist kein Ertrag.
            Abgebrochene Bestellungen zählen nicht mit.
          </p>
        </div>
      </div>
    </main>
  );
}
