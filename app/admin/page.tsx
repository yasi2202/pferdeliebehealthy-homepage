import type { Metadata } from "next";
import Link from "next/link";
import AdminAnmeldung from "@/components/AdminAnmeldung";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import { auswerten, zeitraumWahl } from "@/lib/auswertung";
import { supabaseAlle } from "@/lib/versand";
import BewertungKnopf from "@/components/BewertungKnopf";
import ErinnernKnopf from "@/components/ErinnernKnopf";
import { abbrueche } from "@/lib/abbrueche";
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
//
// ▸ DER ZEITRAUM STEHT IN DER ADRESSE, nicht im Browser.
//   Die Knöpfe sind Verweise mit ?zeitraum=letzte-woche. Damit rechnet der
//   Server, die Seite braucht kein eigenes Programm im Browser, und ein
//   Zeitraum lässt sich als Lesezeichen ablegen. Ausgewertet wird ohnehin
//   auf dem Server, ein Umschalten im Browser hätte alle Bestellungen
//   dorthin schicken müssen.
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

/** Ein Knopf der Zeitraumleiste. Ein Verweis, kein Formular. */
function Zeitknopf({
  name,
  schluessel,
  aktiv,
}: {
  name: string;
  schluessel: string;
  aktiv: boolean;
}) {
  return (
    <Link
      href={`/admin?zeitraum=${schluessel}#zeitraum`}
      scroll={false}
      aria-current={aktiv ? "true" : undefined}
      className={
        aktiv
          ? "rounded-full bg-ink px-4 py-2 text-[14px] text-cream"
          : "rounded-full border border-line bg-white px-4 py-2 text-[14px] transition-colors hover:bg-cream-deep"
      }
    >
      {name}
    </Link>
  );
}

export default async function AuswertungSeite({
  searchParams,
}: {
  searchParams: Promise<{ zeitraum?: string }>;
}) {
  const { zeitraum } = await searchParams;

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

  const a = await auswerten(30, zeitraum ?? "alles");
  const wahl = zeitraumWahl();
  const offene = await abbrueche();

  // Die letzten Verkaefe mit Rechnungsnummer, fuer die Ablage. Bewusst nur
  // die letzten fuenfzig: Wer aeltere braucht, nimmt den CSV-Export.
  const rechnungen =
    (await supabaseAlle<{
      nummer: string;
      rechnungsnummer: string | null;
      /** Fuer den Knopf "Bewertung erbitten" in der Tabelle unten. */
      newsletter: boolean;
      bewertung_gebeten_am: string | null;
      bezahlt_am: string | null;
      angelegt_am: string;
      vorname: string;
      nachname: string;
      gesamt: number;
    }>(
      "digitalbestellungen?status=eq.bezahlt&select=nummer,rechnungsnummer,bezahlt_am,angelegt_am,vorname,nachname,gesamt,newsletter,bewertung_gebeten_am&order=bezahlt_am.desc&limit=50",
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
              href="/admin/newsletter"
              className="text-rose-deep underline underline-offset-2"
            >
              Newsletter
            </Link>
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
            <Link
              href="/admin/stall-organizer"
              className="text-rose-deep underline underline-offset-2"
            >
              Stall Organizer
            </Link>
            <Link
              href="/admin/empfehler"
              className="text-rose-deep underline underline-offset-2"
            >
              Empfehlungen
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

        {/* ----------------------------------------------------- Zeitraum */}
        {/* Die Kacheln oben zeigen immer denselben Überblick. Hier lässt
            sich ein Zeitraum aussuchen, auch ein vergangener, und die
            Produkttabelle darunter richtet sich danach. */}
        <div
          id="zeitraum"
          className="mb-10 scroll-mt-6 rounded-[18px] border border-line bg-white p-6 sm:p-7"
        >
          <h2 className="mb-4 font-serif text-[21px]">Zeitraum ansehen</h2>

          <div className="mb-7 flex flex-wrap gap-2">
            {wahl.map((w) => (
              <Zeitknopf
                key={w.schluessel}
                name={w.name}
                schluessel={w.schluessel}
                aktiv={w.schluessel === a.gewaehlt.schluessel}
              />
            ))}
          </div>

          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3">
            <div>
              <div className="text-[13px] uppercase tracking-[0.1em] text-ink-soft">
                {a.gewaehlt.name}
              </div>
              <div className="mt-2 font-serif text-[30px] tabular-nums">
                {preisText(a.gewaehlt.umsatz)}
              </div>
            </div>

            <div>
              <div className="text-[13px] uppercase tracking-[0.1em] text-ink-soft">
                Käufe
              </div>
              <div className="mt-2 font-serif text-[30px] tabular-nums">
                {a.gewaehlt.anzahl}
              </div>
            </div>

            <div>
              <div className="text-[13px] uppercase tracking-[0.1em] text-ink-soft">
                Je Kauf
              </div>
              <div className="mt-2 font-serif text-[30px] tabular-nums">
                {/* Ohne Kauf gibt es keinen Durchschnitt. 0,00 € stünde da
                    wie eine Aussage, dabei ist schlicht nichts passiert. */}
                {a.gewaehlt.anzahl > 0
                  ? preisText(Math.round(a.gewaehlt.umsatz / a.gewaehlt.anzahl))
                  : "–"}
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------ Produkte */}
        <div className="mb-10 rounded-[18px] border border-line bg-white p-6 sm:p-7">
          <h2 className="mb-1 font-serif text-[21px]">
            Was sich verkauft, nach Umsatz
          </h2>

          <p className="mb-5 text-[13.5px] text-ink-soft">
            Zeitraum: {a.gewaehlt.name}
          </p>

          {a.produkte.length === 0 ? (
            <p className="text-[15px] text-ink-soft">
              In diesem Zeitraum wurde nichts gekauft.
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

        {/* ------------------------------------------- Liegengeblieben */}
        {/* Wer angefangen hat zu bestellen und nicht bezahlt hat. Steht
            bewusst NICHT bei den Zahlen oben: Das ist kein Umsatz, das ist
            eine Liste zum Handeln. */}
        {offene.liste.length > 0 && (
          <div className="mb-10 rounded-[18px] border border-line bg-white p-6 sm:p-7">
            <h2 className="mb-1 font-serif text-[21px]">
              Angefangen und nicht bezahlt
            </h2>

            <p className="mb-5 text-[13.5px] leading-relaxed text-ink-soft">
              Die Kasse war offen, das Geld kam nicht an. Ob abgebrochen oder
              an der Karte gescheitert, sieht die Seite nicht, das bleibt bei
              Stripe.
            </p>

            {offene.spalteFehlt && (
              <p className="mb-5 rounded-[12px] border border-rose-deep p-4 text-[13.5px] leading-relaxed">
                Zum Erinnern fehlt noch eine Spalte in der Datenbank. Führ
                einmal <code>datenbank/erinnerung-abbruch.sql</code> im
                SQL-Editor von Supabase aus, im Projekt
                pferdeliebehealthy-akademie. Danach steht hier ein Knopf.
              </p>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-[14.5px]">
                <thead>
                  <tr className="border-b border-line text-left text-[13px] uppercase tracking-[0.08em] text-ink-soft">
                    <th className="pb-2 pr-5 font-normal">Datum</th>
                    <th className="pb-2 pr-5 font-normal">Kundin</th>
                    <th className="pb-2 pr-5 font-normal">Wollte</th>
                    <th className="pb-2 pl-5 text-right font-normal">Betrag</th>
                    <th className="pb-2 pl-5 text-right font-normal">Erinnern</th>
                  </tr>
                </thead>
                <tbody>
                  {offene.liste.map((o) => (
                    <tr key={o.nummer} className="border-b border-line last:border-0">
                      <td className="py-2.5 pr-5 whitespace-nowrap text-ink-soft">
                        {new Date(o.angelegt_am).toLocaleDateString("de-DE")}
                      </td>

                      <td className="py-2.5 pr-5">
                        {o.name}
                        <div className="text-[13px] text-ink-soft">{o.email}</div>
                      </td>

                      <td className="py-2.5 pr-5">
                        {o.produkt}
                        {o.fristHinweis && (
                          <div className="text-[13px] text-rose-deep">
                            {o.fristHinweis}
                          </div>
                        )}
                      </td>

                      <td className="py-2.5 pl-5 text-right tabular-nums whitespace-nowrap">
                        {preisText(o.gesamt)}
                      </td>

                      {/* ▸ DER KNOPF STEHT NUR DA, WO ER HINGEHÖRT.
                          Sonst steht dort der Grund, warum nicht. Ein Knopf,
                          der immer dasselbe absagt, ist schlimmer als
                          keiner. */}
                      <td className="py-2.5 pl-5 text-right whitespace-nowrap">
                        {o.erinnerbar ? (
                          <ErinnernKnopf nummer={o.nummer} name={o.name} />
                        ) : (
                          <span className="text-[13px] text-ink-soft">
                            {o.grund}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-ink-soft">
              Erinnert wird nur, wo beim Bestellen zugestimmt wurde, Post zu
              bekommen. Eine Erinnerung an einen liegengebliebenen Einkauf ist
              Werbung, und die Ausnahme für Bestandskundinnen greift hier
              nicht, weil kein Kauf zustande gekommen ist. Zusatzangebote nach
              einem Kauf bleiben ebenfalls aussen vor: Die sind abgelehnt
              worden, nicht liegengeblieben.
            </p>
          </div>
        )}

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
                    <th className="pb-2 pl-5 text-right font-normal">Bewertung</th>
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
                      {/* ▸ DER KNOPF STEHT NUR DA, WO ER ETWAS BEWIRKEN KANN.
                          Ohne Newsletter-Zustimmung darf die Mail nicht raus,
                          das ist Werbung ohne Einwilligung. Statt eines
                          Knopfes, der immer dasselbe absagt, steht dort dann
                          ein Strich. */}
                      <td className="py-2.5 pl-5 text-right whitespace-nowrap">
                        {r.newsletter ? (
                          <BewertungKnopf
                            nummer={r.nummer}
                            schonGefragt={r.bewertung_gebeten_am}
                          />
                        ) : (
                          <span
                            className="text-[13px] text-ink-soft"
                            title="Beim Kauf nicht zugestimmt, Post zu bekommen"
                          >
                            –
                          </span>
                        )}
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
