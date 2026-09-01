import type { Metadata } from "next";
import Link from "next/link";
import { preisText } from "@/lib/shop";
import { digitalAnhaenge, digitalLaden } from "@/lib/digital-server";

// ---------------------------------------------------------------------------
// Die Dankeseite nach einem Kauf.
//
// ▸ SIE BEWEIST NICHT, DASS BEZAHLT WURDE. Wie die Angebotsseite kann jede
//   Person diese Adresse aufrufen. Deshalb steht hier kein Zugangslink und
//   kein Inhalt, sondern nur die Bestätigung, dass die Mails unterwegs sind.
//   Den persönlichen Zugangslink verschickt die Akademie, weil nur sie den
//   Schlüssel der Kundin kennt.
//
// ▸ WARUM TROTZDEM DER SCHLÜSSEL GEPRÜFT WIRD: Ohne ihn stünde hier der
//   Name und die gekaufte Leistung einer fremden Person, sobald jemand eine
//   Bestellnummer errät. Ohne Schlüssel gibt es deshalb nur die allgemeine
//   Fassung ohne persönliche Angaben.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Danke für deinen Kauf",
  robots: { index: false, follow: false },
};

type Eigenschaften = {
  params: Promise<{ nummer: string }>;
  searchParams: Promise<{ t?: string }>;
};

export default async function DankeSeite({
  params,
  searchParams,
}: Eigenschaften) {
  const { nummer } = await params;
  const { t } = await searchParams;

  const kauf = await digitalLaden(nummer);
  const darfSehen = Boolean(kauf && t && t === kauf.zugriff_token);

  const teile =
    darfSehen && kauf ? [kauf, ...(await digitalAnhaenge(kauf.nummer))] : [];

  return (
    <main className="px-6 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
          Alles erledigt
        </span>

        <h1 className="mb-4 font-serif text-[32px] font-normal leading-[1.12] tracking-tight sm:text-[40px]">
          {darfSehen && kauf ? `Danke, ${kauf.vorname}.` : "Danke für deinen Kauf."}
        </h1>

        <p className="mb-10 text-[16.5px] leading-relaxed text-ink-soft">
          Deine Zahlung ist angekommen. In den nächsten Minuten bekommst du
          zwei Mails: die Bestätigung mit deiner Rechnung, und deinen
          persönlichen Zugangslink zur Akademie.
        </p>

        {teile.length > 0 && (
          <div className="mb-10 rounded-[18px] border border-line bg-white p-6 sm:p-7">
            <h2 className="mb-5 font-serif text-[21px]">Das hast du gekauft</h2>

            <ul>
              {teile.flatMap((teil) =>
                teil.artikel.map((artikel) => (
                  <li
                    key={`${teil.nummer}-${artikel.slug}`}
                    className="flex justify-between gap-4 border-b border-line py-3 first:pt-0 last:border-0 last:pb-0"
                  >
                    <span className="text-[15px] leading-snug">
                      {artikel.name}
                    </span>
                    <span className="shrink-0 text-[15px] tabular-nums">
                      {preisText(artikel.preis)}
                    </span>
                  </li>
                )),
              )}
            </ul>

            <p className="mt-4 text-[13px] text-ink-soft">
              Bestellnummer {teile.map((teil) => teil.nummer).join(" und ")}
            </p>
          </div>
        )}

        {/* ------------------------------------------------- Insider-Kanal */}
        {/* Steht nach jedem Kauf, so von Yasemin am 01.09.2026 gewünscht.
            Der Text unterscheidet, ob die Kundin das Häkchen in der Kasse
            gesetzt hat: Wer schon eingetragen ist, soll nicht aufgefordert
            werden, sich noch einmal einzutragen. Das wirkt sonst, als hätte
            der Kauf ihre Angabe nicht mitbekommen. */}
        <div className="mb-10 rounded-[18px] bg-ink p-6 text-cream sm:p-8">
          <span className="mb-3 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose">
            Kostenlos dazu
          </span>

          <h2 className="mb-3 font-serif text-[22px] leading-snug sm:text-[26px]">
            Der Pferdeliebe Insider
          </h2>

          {darfSehen && kauf?.newsletter ? (
            <>
              <p className="mb-6 text-[16px] leading-relaxed text-cream/80">
                Du hast beim Kauf zugestimmt, meine Futter-Tipps zu bekommen.
                Das heisst, du bist schon dabei, du musst nichts weiter tun.
                Alle bisherigen Beiträge kannst du jederzeit nachlesen.
              </p>

              <Link
                href="/insider"
                className="inline-block rounded-full bg-rose px-7 py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-cream"
              >
                Beiträge lesen
              </Link>
            </>
          ) : (
            <>
              <p className="mb-6 text-[16px] leading-relaxed text-cream/80">
                Regelmässig Futterwissen ins Postfach, kostenlos und ohne
                Verkaufsdruck. Was gerade saisonal wichtig ist, worauf du bei
                Deklarationen achten solltest, und was ich selbst füttere.
                Abmelden kannst du dich jederzeit mit einem Klick.
              </p>

              <Link
                href="/insider"
                className="inline-block rounded-full bg-rose px-7 py-3.5 text-[15px] font-medium text-ink transition-colors hover:bg-cream"
              >
                Insider werden
              </Link>
            </>
          )}
        </div>

        <div className="rounded-[16px] border border-line bg-cream-deep p-6">
          <h2 className="mb-3 font-serif text-[19px]">
            Es ist keine Mail angekommen?
          </h2>

          <p className="text-[15px] leading-relaxed text-ink-soft">
            Sieh bitte zuerst im Spam-Ordner nach, dort landen die beiden
            manchmal. Wenn sie auch da nicht sind, schreib mir kurz an{" "}
            <a
              href="mailto:info@pferdeliebehealthy.de"
              className="text-rose-deep underline underline-offset-2"
            >
              info@pferdeliebehealthy.de
            </a>
            {darfSehen && kauf ? ` und nenn mir deine Bestellnummer ${kauf.nummer}` : ""}
            . Ich schalte dich dann von Hand frei, meistens noch am selben Tag.
          </p>
        </div>

        <p className="mt-10 text-[15px] text-ink-soft">
          <Link
            href="/"
            className="text-rose-deep underline underline-offset-2"
          >
            Zurück zur Startseite
          </Link>
        </p>
      </div>
    </main>
  );
}
