import type { Metadata } from "next";
import Link from "next/link";
import {
  bestaetigeInsider,
  sendeInsiderWillkommen,
  sendeInsiderBenachrichtigung,
} from "@/lib/insider-server";
import { insider } from "@/lib/insider";
import { seitenUrl } from "@/lib/seo";

// ---------------------------------------------------------------------------
// Das Ziel des Links aus der Insider-Bestaetigungsmail.
//
// Hier wird der Haken gesetzt — und erst danach gehen die beiden Mails raus,
// die etwas Werbliches enthalten: das Willkommen an sie und die
// Benachrichtigung an Yasi. Vorher darf nichts davon verschickt werden.
//
// Nicht im Suchindex: ohne den persoenlichen Schluessel in der Adresse ergibt
// die Seite keinen Sinn.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "E-Mail-Adresse bestätigt",
  robots: { index: false, follow: false },
};

export default async function InsiderBestaetigtSeite({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const ergebnis = token ? await bestaetigeInsider(token) : null;

  // Nur beim ersten Klick verschicken. Wer den Link ein zweites Mal oeffnet,
  // soll nicht alles doppelt bekommen, und Yasi auch nicht.
  if (ergebnis?.frisch) {
    await sendeInsiderWillkommen(ergebnis.anmeldung, seitenUrl);
    await sendeInsiderBenachrichtigung(ergebnis.anmeldung);
  }

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {ergebnis ? (
          <>
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Bestätigt
            </span>
            <h1 className="font-serif font-normal text-[32px] sm:text-[46px] leading-[1.12] tracking-tight mb-5">
              Willkommen, {ergebnis.anmeldung.vorname}.
            </h1>
            <p className="text-[17px] text-ink-soft leading-relaxed">
              Du bist jetzt bei den {insider.name} dabei. Die nächste Ausgabe
              landet in deinem Postfach — schau beim ersten Mal kurz im
              Spam-Ordner nach und verschieb sie in den Posteingang, sonst geht
              später vielleicht etwas unter.
            </p>

            <div className="bg-cream-deep rounded-[18px] p-6 sm:p-7 mt-10">
              <h2 className="text-[15px] font-semibold mb-2.5">
                Bis dahin gibt es schon etwas zu lesen
              </h2>
              <p className="text-[14px] text-ink-soft leading-relaxed mb-5">
                Die bisherigen Beiträge stehen alle auf der Seite. Fang an, wo
                es dich am meisten interessiert.
              </p>
              <Link
                href="/insider"
                className="inline-block bg-ink text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-rose-deep transition-colors"
              >
                Zu den Beiträgen
              </Link>
            </div>

            <div className="mt-8 pt-8 border-t border-line">
              <h2 className="font-serif text-[22px] leading-snug mb-3">
                Und hast du deinen Futter-Check schon gemacht?
              </h2>
              <p className="text-[16px] text-ink-soft leading-relaxed mb-6">
                Fünf Fragen, keine drei Minuten, und danach weißt du, ob die
                Fütterung deines Pferdes wirklich zu seiner Situation passt.
              </p>
              <Link
                href="/futter-check"
                className="inline-block border border-ink text-ink px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-ink hover:text-cream transition-colors"
              >
                Zum Futter-Check
              </Link>
            </div>
          </>
        ) : (
          <>
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Hm
            </span>
            <h1 className="font-serif font-normal text-[32px] sm:text-[46px] leading-[1.12] tracking-tight mb-5">
              Dieser Link funktioniert nicht mehr.
            </h1>
            <p className="text-[17px] text-ink-soft leading-relaxed mb-8">
              Das passiert, wenn die Adresse im Browser unterwegs abgeschnitten
              wurde — manche Mail-Programme machen das. Trag dich einfach noch
              einmal ein, dann kommt eine frische Mail.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/#insider"
                className="inline-block bg-ink text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-rose-deep transition-colors"
              >
                Noch einmal eintragen
              </Link>
              <a
                href="mailto:info@pferdeliebehealthy.de"
                className="inline-block border border-line text-ink-soft px-7 py-3.5 rounded-full text-[15px] font-medium hover:text-ink hover:border-ink transition-colors"
              >
                Oder schreib mir kurz
              </a>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
