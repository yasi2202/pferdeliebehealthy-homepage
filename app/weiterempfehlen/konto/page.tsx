import type { Metadata } from "next";
import Link from "next/link";
import { digitalprodukte } from "@/lib/digital";
import { preisText } from "@/lib/shop";
import {
  empfehlbar,
  empfehlungslink,
  kontostand,
  provisionBetrag,
  provisionssatz,
  FRIST_TAGE,
  MINDESTAUSZAHLUNG,
} from "@/lib/empfehlungsprogramm";
import {
  empfehlerZuToken,
  provisionenZu,
} from "@/lib/empfehlungsprogramm-server";
import EmpfehlungsLink from "@/components/EmpfehlungsLink";

// ---------------------------------------------------------------------------
// Das eigene Konto einer Empfehlerin, aufgerufen mit ihrem Schlüssel:
//     /weiterempfehlen/konto?k=<token>
//
// Kein Passwort, keine Anmeldung. Wer den Link hat, sieht die Zahlen. Das ist
// dasselbe Verfahren wie beim Insider-Bereich, und es ist hier richtig: Zu
// sehen sind die eigenen Verkaufszahlen, keine Kundendaten und keine fremden
// Angaben. Wer den Link verlegt, lässt ihn sich unter /weiterempfehlen neu
// schicken.
//
// ▸ WAS HIER BEWUSST NICHT STEHT: wer gekauft hat. Weder Name noch Adresse
//   noch Mailadresse der Käuferin. Das geht die Empfehlerin nichts an, und
//   es wäre datenschutzrechtlich auch nicht zu rechtfertigen. Sie sieht, dass
//   verkauft wurde, was verkauft wurde und was ihr das bringt.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mein Empfehlungskonto",
  // Gehört nicht in den Suchindex: Die Adresse trägt einen persönlichen
  // Schlüssel, und der hat in keinem Suchergebnis etwas verloren.
  robots: { index: false, follow: false },
};

type Eigenschaften = {
  searchParams: Promise<{ k?: string }>;
};

/** Eine Zahl mit Beschriftung, wie sie oben nebeneinander stehen. */
function Kachel({
  titel,
  wert,
  hinweis,
  betont,
}: {
  titel: string;
  wert: string;
  hinweis?: string;
  betont?: boolean;
}) {
  return (
    <div
      className={`rounded-[16px] p-5 ${
        betont ? "bg-rose-deep text-cream" : "bg-cream-deep"
      }`}
    >
      <p
        className={`mb-1 text-[13px] uppercase tracking-[0.1em] ${
          betont ? "text-cream/70" : "text-ink-soft"
        }`}
      >
        {titel}
      </p>
      <p
        className={`font-serif text-[26px] leading-none ${
          betont ? "text-cream" : "text-ink"
        }`}
      >
        {wert}
      </p>
      {hinweis ? (
        <p
          className={`mt-2 text-[13px] leading-snug ${
            betont ? "text-cream/70" : "text-ink-soft"
          }`}
        >
          {hinweis}
        </p>
      ) : null}
    </div>
  );
}

export default async function EmpfehlungsKonto({ searchParams }: Eigenschaften) {
  const { k } = await searchParams;
  const empfehler = k ? await empfehlerZuToken(k) : null;

  if (!empfehler) {
    return (
      <main className="px-6 py-20">
        <div className="mx-auto max-w-lg text-center">
          <h1 className="mb-4 font-serif text-[28px] font-normal leading-tight">
            Diesen Link kenne ich nicht
          </h1>
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Vielleicht ist er beim Kopieren abgeschnitten worden, das passiert
            leicht. Lass ihn dir{" "}
            <Link
              href="/weiterempfehlen"
              className="text-rose-deep underline underline-offset-2"
            >
              hier noch einmal schicken
            </Link>
            .
          </p>
        </div>
      </main>
    );
  }

  const provisionen = await provisionenZu(empfehler.id);
  const stand = kontostand(provisionen);
  const link = empfehlungslink(empfehler.code);

  const offen = provisionen.filter((p) => p.status !== "storniert");

  return (
    <main className="px-6 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-3xl">
        <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
          Empfehlungskonto
        </span>

        <h1 className="mb-5 font-serif text-[32px] font-normal leading-[1.12] tracking-tight sm:text-[42px]">
          Hallo {empfehler.vorname}
        </h1>

        {/* ------------------------------------------------------------- */}
        {/* Der Status. Nur wer aktiv ist, sieht seinen Link.             */}

        {empfehler.status === "angefragt" ? (
          <div className="rounded-[18px] bg-cream-deep p-6">
            <p className="mb-2 text-[16px] font-semibold text-ink">
              Deine Bewerbung liegt mir vor.
            </p>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              Ich sehe sie mir an und melde mich per Mail. Sobald ich dich
              freigeschaltet habe, steht hier dein persönlicher Link. Bis
              dahin zählt noch nichts, warte also bitte damit, ihn zu teilen.
            </p>
          </div>
        ) : empfehler.status === "gesperrt" ? (
          <div className="rounded-[18px] bg-cream-deep p-6">
            <p className="mb-2 text-[16px] font-semibold text-ink">
              Dein Link ist stillgelegt.
            </p>
            <p className="text-[15px] leading-relaxed text-ink-soft">
              Neue Käufe zählen nicht mehr. Was du bis dahin verdient hast,
              steht unten und bekommst du selbstverständlich noch. Wenn du
              nicht weißt, woran es liegt, schreib mir gern an
              info@pferdeliebehealthy.de.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-[16px] leading-relaxed text-ink-soft">
              Das ist dein Link. Er gilt dauerhaft, du kannst ihn überall
              hinsetzen.
            </p>

            <div className="rounded-[18px] bg-cream-deep p-5">
              <EmpfehlungsLink link={link} />
            </div>
          </>
        )}

        {/* ------------------------------------------------------------- */}

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Kachel
            titel="Auszahlbar"
            wert={preisText(stand.auszahlbar)}
            betont={stand.reif}
            hinweis={
              stand.reif
                ? "Ich überweise das beim nächsten Durchgang, du musst nichts tun."
                : `Ausgezahlt wird ab ${preisText(MINDESTAUSZAHLUNG)}.`
            }
          />

          <Kachel
            titel={`Noch in der Frist`}
            wert={preisText(stand.inFrist)}
            hinweis={`Jede Provision wird nach ${FRIST_TAGE} Tagen auszahlbar, weil ein Kauf bis dahin noch erstattet werden kann.`}
          />

          <Kachel
            titel="Schon ausgezahlt"
            wert={preisText(stand.ausgezahlt)}
          />

          <Kachel
            titel="Klicks auf deinen Link"
            wert={String(empfehler.klicks)}
            hinweis={
              stand.verkaeufe > 0
                ? `Daraus wurden ${stand.verkaeufe} ${stand.verkaeufe === 1 ? "Kauf" : "Käufe"}.`
                : "Noch kein Kauf dabei. Das ist am Anfang normal."
            }
          />
        </div>

        {/* ------------------------------------------------------------- */}

        <h2 className="mb-4 mt-14 font-serif text-[26px] font-normal leading-tight tracking-tight sm:text-[30px]">
          Deine Verkäufe
        </h2>

        {offen.length === 0 ? (
          <p className="text-[15px] leading-relaxed text-ink-soft">
            Hier steht noch nichts. Sobald jemand über deinen Link kauft,
            erscheint der Kauf hier, und ich schicke dir eine Mail.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[26rem] border-collapse text-left">
              <thead>
                <tr className="border-b border-line">
                  <th className="py-2.5 pr-4 text-[14px] font-semibold text-ink">
                    Angebot
                  </th>
                  <th className="py-2.5 pr-4 text-[14px] font-semibold text-ink">
                    Datum
                  </th>
                  <th className="py-2.5 pr-4 text-[14px] font-semibold text-ink">
                    Stand
                  </th>
                  <th className="py-2.5 text-right text-[14px] font-semibold text-ink">
                    Für dich
                  </th>
                </tr>
              </thead>
              <tbody>
                {offen.map((p) => {
                  const faellig = new Date(p.faellig_ab);
                  const wartet =
                    p.status !== "ausgezahlt" && faellig.getTime() > Date.now();

                  return (
                    <tr key={p.id} className="border-b border-line">
                      <td className="py-3 pr-4 text-[15px] text-ink">
                        {p.produkt_name}
                      </td>
                      <td className="py-3 pr-4 text-[14.5px] text-ink-soft">
                        {new Date(p.angelegt_am).toLocaleDateString("de-DE")}
                      </td>
                      <td className="py-3 pr-4 text-[14.5px] text-ink-soft">
                        {p.status === "ausgezahlt"
                          ? "ausgezahlt"
                          : wartet
                            ? `frei ab ${faellig.toLocaleDateString("de-DE")}`
                            : "auszahlbar"}
                      </td>
                      <td className="py-3 text-right text-[15px] font-semibold text-ink">
                        {preisText(p.betrag_cent)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* Die fertigen Links auf einzelne Angebote. Ohne diese Tabelle   */}
        {/* müsste sich jede selbst zusammenbauen, wie ein Ziel angehängt  */}
        {/* wird, und genau das macht dann niemand.                        */}

        {empfehler.status === "aktiv" ? (
          <>
            <h2 className="mb-2 mt-14 font-serif text-[26px] font-normal leading-tight tracking-tight sm:text-[30px]">
              Links auf einzelne Angebote
            </h2>

            <p className="mb-6 max-w-xl text-[15px] leading-relaxed text-ink-soft">
              Dein Link oben führt auf die Startseite. Wenn du ein bestimmtes
              Angebot empfiehlst, nimm lieber den passenden Link von hier: Wer
              direkt dort landet, wo du gerade davon erzählt hast, kauft
              deutlich eher.
            </p>

            <div className="space-y-5">
              {digitalprodukte
                // Nur, was gerade wirklich gekauft werden kann. Warum das
                // eine eigene Prüfung braucht, steht bei `empfehlbar`.
                .filter((p) => empfehlbar(p))
                .map((p) => {
                  const satz = provisionssatz(p);

                  return (
                    <div
                      key={p.slug}
                      className="border-b border-line pb-5 last:border-0"
                    >
                      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p className="text-[16px] font-semibold text-ink">
                          {p.kurzname}
                        </p>
                        <p className="text-[14.5px] text-ink-soft">
                          {preisText(p.preis)}
                          {p.abo ? " im Monat" : ""} · {satz} % ={" "}
                          <span className="font-semibold text-ink">
                            {preisText(provisionBetrag(p.preis, p.mwst, satz))}
                          </span>
                        </p>
                      </div>

                      <p className="mb-2 text-[14.5px] leading-relaxed text-ink-soft">
                        {p.kurz}
                      </p>

                      <EmpfehlungsLink
                        link={empfehlungslink(empfehler.code, p.slug)}
                      />
                    </div>
                  );
                })}
            </div>
          </>
        ) : null}

        <p className="mt-14 text-[14px] leading-relaxed text-ink-soft">
          Fragen? Schreib mir an{" "}
          <a
            href="mailto:info@pferdeliebehealthy.de"
            className="text-rose-deep underline underline-offset-2"
          >
            info@pferdeliebehealthy.de
          </a>
          . Was gilt, steht in den{" "}
          <Link
            href="/weiterempfehlen/bedingungen"
            className="text-rose-deep underline underline-offset-2"
          >
            Teilnahmebedingungen
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
