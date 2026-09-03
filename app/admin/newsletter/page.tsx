import type { Metadata } from "next";
import Link from "next/link";
import { adminEingerichtet, istAngemeldet } from "@/lib/admin-zugang";
import {
  briefeHolen,
  kurzauswertung,
  abmeldungenHolen,
  messungAn,
} from "@/lib/newsletter-server";
import { GRUPPEN, gruppenZaehlen } from "@/lib/newsletter-gruppen";
import NeuerNewsletter from "./NeuerNewsletter";
import VonHandAbmelden from "./VonHandAbmelden";

// ---------------------------------------------------------------------------
// Die Übersicht des Newsletter-Programms.
//
// ▸ WAS HIER OBEN STEHT, IST DIE WICHTIGSTE ZAHL: wie viele Menschen deine
//   nächste Mail erreicht. Nicht wie viele Adressen du hast — wie viele
//   davon bestätigt und nicht abgemeldet sind. Nur die zählen.
//
// ▸ AUSGEWERTET WERDEN NUR DIE LETZTEN ZEHN VERSENDETEN. Für jeden Brief
//   sind zwei Abfragen nötig; bei fünfzig alten Newslettern wäre das
//   Aufmachen dieser Seite sonst spürbar langsam, für Zahlen, die niemand
//   mehr ansieht. Die vollständige Auswertung steht auf der Seite des
//   einzelnen Newsletters.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Newsletter",
  robots: { index: false, follow: false },
};

const MIT_ZAHLEN = 10;

function datum(wert: string | null): string {
  if (!wert) return "";
  return new Date(wert).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function anteil(teil: number, ganzes: number): string {
  if (ganzes <= 0) return "—";
  return `${Math.round((teil / ganzes) * 100)} %`;
}

export default async function NewsletterUebersicht() {
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

  const briefe = await briefeHolen();
  const gruppenZahlen = await gruppenZaehlen();
  const abmeldungen = await abmeldungenHolen();

  if (!briefe) {
    return (
      <main className="px-6 py-20">
        <div className="mx-auto max-w-2xl rounded-[18px] border border-line bg-white p-7">
          <h1 className="mb-3 font-serif text-[22px]">Die Tabellen fehlen noch</h1>
          <p className="mb-4 text-[15px] leading-relaxed text-ink-soft">
            Das Newsletter-Programm braucht sechs Tabellen in Supabase. Sie
            sind noch nicht angelegt, deshalb ist hier nichts zu sehen.
          </p>
          <p className="text-[15px] leading-relaxed text-ink-soft">
            So legst du sie an: Auf supabase.com das Projekt{" "}
            <strong className="text-ink">pferdeliebehealthy-akademie</strong>{" "}
            öffnen, links den <strong className="text-ink">SQL Editor</strong>{" "}
            anklicken, den Inhalt der Datei{" "}
            <code className="rounded bg-cream-deep px-1.5 py-0.5 text-[13.5px]">
              datenbank/newsletter.sql
            </code>{" "}
            einfügen und auf Run drücken. Prüf oben links den Projektnamen,
            bevor du drückst.
          </p>
        </div>
      </main>
    );
  }

  const entwuerfe = briefe.filter((b) => b.status !== "versendet");
  const versendet = briefe
    .filter((b) => b.status === "versendet")
    .sort((a, b) => (b.versendet_am ?? "").localeCompare(a.versendet_am ?? ""));

  // Zahlen nur für die neuesten. Alles ältere bekommt seinen Verlauf auf
  // der eigenen Seite.
  // Solange nicht gemessen wird, wären das nur Nullen — und eine Null neben
  // „geöffnet" liest sich wie „niemand hat sie aufgemacht". Dann lieber gar
  // keine Spalte. Warum nicht gemessen wird, steht auf der Seite des
  // einzelnen Newsletters.
  const zahlen = new Map<string, { geoeffnet: number; geklickt: number }>();
  if (messungAn()) {
    for (const brief of versendet.slice(0, MIT_ZAHLEN)) {
      zahlen.set(brief.id, await kurzauswertung(brief.id));
    }
  }

  return (
    <main className="px-6 py-12 sm:px-8 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-baseline justify-between gap-4">
          <h1 className="font-serif text-[32px] font-normal leading-tight tracking-tight sm:text-[40px]">
            Newsletter
          </h1>

          <nav className="flex flex-wrap gap-5 text-[14.5px]">
            <Link
              href="/admin/newsletter/strecken"
              className="text-rose-deep underline underline-offset-2"
            >
              Mailstrecken
            </Link>
            <Link
              href="/admin"
              className="text-rose-deep underline underline-offset-2"
            >
              Auswertung
            </Link>
            <Link
              href="/admin/adressen"
              className="text-rose-deep underline underline-offset-2"
            >
              Adressen
            </Link>
          </nav>
        </div>

        {/* ------------------------------------------------ Die Gruppen */}
        <div className="mb-8 rounded-[18px] border border-line bg-white p-6 sm:p-7">
          <p className="text-[14px] uppercase tracking-[0.14em] text-ink-soft">
            Dein Verteiler
          </p>

          <div className="mt-4 grid gap-x-8 gap-y-4 sm:grid-cols-2">
            {GRUPPEN.map((g) => (
              <div key={g.schluessel}>
                <p className="font-serif text-[30px] leading-none text-ink">
                  {gruppenZahlen[g.schluessel] < 0
                    ? "—"
                    : gruppenZahlen[g.schluessel]}
                </p>
                <p className="mt-1.5 text-[14.5px] text-ink">{g.name}</p>
                <p className="mt-0.5 text-[13px] text-ink-soft">
                  {g.grundlage === "Einwilligung"
                    ? "hat ausdrücklich zugestimmt"
                    : g.grundlage === "gemischt"
                      ? "die drei zusammen, ohne Doppelte"
                      : "Kundinnen, kein ausdrückliches Ja"}
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 border-t border-line pt-5 text-[14.5px] leading-relaxed text-ink-soft">
            Beim Schreiben wählst du, an welche Gruppe der Newsletter geht.
            Wer nur Kundin ist und sich nie eingetragen hat, darf Post
            bekommen, solange es um deine eigenen, ähnlichen Angebote geht,
            also um Fütterung und Pferdegesundheit. Für ein Gewinnspiel oder
            fremde Werbung reicht das nicht.
            {abmeldungen.length > 0 && (
              <>
                {" "}
                {abmeldungen.length}{" "}
                {abmeldungen.length === 1
                  ? "Adresse steht"
                  : "Adressen stehen"}{" "}
                auf der Sperrliste und sind überall abgezogen.
              </>
            )}
          </p>
        </div>

        {/* ------------------------------------------------ Neu schreiben */}
        <NeuerNewsletter />

        {/* ------------------------------------------------ Entwürfe */}
        {entwuerfe.length > 0 && (
          <section className="mt-10">
            <h2 className="mb-4 font-serif text-[22px]">
              {entwuerfe.length === 1
                ? "Ein Entwurf"
                : `${entwuerfe.length} Entwürfe`}
            </h2>

            <div className="space-y-3">
              {entwuerfe.map((brief) => (
                <Link
                  key={brief.id}
                  href={`/admin/newsletter/${brief.id}`}
                  className="block rounded-[16px] border border-line bg-white p-5 transition-colors hover:border-rose-deep"
                >
                  <p className="font-serif text-[19px] leading-snug text-ink">
                    {brief.betreff.trim() || "Noch ohne Betreff"}
                  </p>
                  <p className="mt-1.5 text-[14px] text-ink-soft">
                    Zuletzt geändert am {datum(brief.geaendert_am)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ------------------------------------------------ Versendete */}
        <section className="mt-10">
          <h2 className="mb-4 font-serif text-[22px]">Verschickt</h2>

          {versendet.length === 0 ? (
            <p className="rounded-[16px] border border-line bg-white p-5 text-[15px] leading-relaxed text-ink-soft">
              Noch nichts verschickt. Das erste Mal ist der schwerste Klick,
              danach wird es Routine.
            </p>
          ) : (
            <div className="space-y-3">
              {versendet.map((brief) => {
                const z = zahlen.get(brief.id);

                return (
                  <Link
                    key={brief.id}
                    href={`/admin/newsletter/${brief.id}`}
                    className="block rounded-[16px] border border-line bg-white p-5 transition-colors hover:border-rose-deep"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                      <div className="min-w-[220px] flex-1">
                        <p className="font-serif text-[19px] leading-snug text-ink">
                          {brief.betreff}
                        </p>
                        <p className="mt-1.5 text-[14px] text-ink-soft">
                          {datum(brief.versendet_am)} · an {brief.empfaenger}{" "}
                          {brief.empfaenger === 1 ? "Adresse" : "Adressen"}
                        </p>
                      </div>

                      {z && (
                        <div className="flex gap-6 text-right">
                          <div>
                            <p className="font-serif text-[22px] leading-none text-ink">
                              {anteil(z.geoeffnet, brief.empfaenger)}
                            </p>
                            <p className="mt-1 text-[12.5px] uppercase tracking-wide text-ink-soft">
                              geöffnet
                            </p>
                          </div>
                          <div>
                            <p className="font-serif text-[22px] leading-none text-ink">
                              {anteil(z.geklickt, brief.empfaenger)}
                            </p>
                            <p className="mt-1 text-[12.5px] uppercase tracking-wide text-ink-soft">
                              geklickt
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ------------------------------------------------ Sperrliste */}
        <section className="mt-12">
          <h2 className="mb-3 font-serif text-[22px]">Abgemeldet</h2>
          <p className="mb-4 text-[15px] leading-relaxed text-ink-soft">
            Wer sich abmeldet, wird aus den Anmeldelisten gelöscht und steht
            hier. Die Sperrliste ist der Grund, warum eine abgemeldete Adresse
            auch dann draussen bleibt, wenn sie durch einen späteren Import
            wieder in der Datenbank landet.
          </p>

          <VonHandAbmelden />

          {abmeldungen.length > 0 && (
            <details className="mt-5 rounded-[16px] border border-line bg-white p-5">
              <summary className="cursor-pointer text-[15px] text-ink">
                Die {abmeldungen.length}{" "}
                {abmeldungen.length === 1 ? "Adresse" : "Adressen"} ansehen
              </summary>
              <ul className="mt-4 space-y-1.5 text-[14px] text-ink-soft">
                {abmeldungen.slice(0, 200).map((a) => (
                  <li key={a.email}>
                    {a.email}
                    <span className="text-ink-soft/70">
                      {" "}
                      · {datum(a.abgemeldet_am)}
                      {a.quelle === "hand" ? " · von dir eingetragen" : ""}
                    </span>
                  </li>
                ))}
              </ul>
            </details>
          )}
        </section>
      </div>
    </main>
  );
}
