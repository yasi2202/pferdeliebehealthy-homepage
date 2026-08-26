import type { Metadata } from "next";
import Link from "next/link";
import {
  bestaetigeAnmeldung,
  sendeErgebnisMail,
  sendeBenachrichtigung,
} from "@/lib/futter-check-server";
import { seitenUrl } from "@/lib/seo";

// ---------------------------------------------------------------------------
// Das Ziel des Links aus der Bestaetigungsmail.
//
// Hier wird der Haken gesetzt, dass die Adresse bestaetigt ist — und erst
// danach gehen die beiden Mails raus, die etwas Werbliches enthalten: das
// Ergebnis an sie und die Benachrichtigung an dich. Vorher darf nichts davon
// verschickt werden.
//
// Die Seite gehoert nicht in den Suchindex: sie ergibt ohne den persoenlichen
// Schluessel in der Adresse keinen Sinn.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "E-Mail-Adresse bestätigt",
  robots: { index: false, follow: false },
};

export default async function BestaetigtSeite({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const ergebnis = token ? await bestaetigeAnmeldung(token) : null;

  // Nur beim ersten Klick verschicken. Wer den Link ein zweites Mal oeffnet
  // — weil er die Mail noch einmal aufmacht — soll nicht alles doppelt
  // bekommen, und du auch nicht.
  if (ergebnis?.frisch) {
    await sendeErgebnisMail(ergebnis.anmeldung, seitenUrl);
    await sendeBenachrichtigung(ergebnis.anmeldung);
  }

  const geklappt = ergebnis !== null;

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {geklappt ? (
          <>
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Bestätigt
            </span>
            <h1 className="font-serif font-normal text-[32px] sm:text-[46px] leading-[1.12] tracking-tight mb-5">
              Danke, {ergebnis.anmeldung.vorname} — das war&rsquo;s schon.
            </h1>
            <p className="text-[17px] text-ink-soft leading-relaxed">
              Dein Ergebnis liegt jetzt in deinem Postfach, zum Nachlesen, wann
              immer du willst. Falls es nicht auftaucht, schau kurz im
              Spam-Ordner nach und verschieb die Mail in den Posteingang —
              sonst geht später vielleicht etwas unter.
            </p>

            <div className="bg-ink text-cream rounded-[24px] p-8 sm:p-10 mt-10">
              <h2 className="font-serif text-[23px] sm:text-[27px] leading-snug mb-4">
                Und der nächste Schritt?
              </h2>
              <p className="text-[15px] text-cream/75 mb-7">
                Dein Ergebnis zeigt dir, wo die größte Lücke liegt. Bei den
                meisten Pferden sitzt sie bei den Mineralstoffen — und genau da
                setzt Mineral-Klarheit an.
              </p>
              <Link
                href="/mineral-klarheit"
                className="inline-block bg-rose text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-cream transition-colors"
              >
                Mineral-Klarheit ansehen
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
              wurde — manche Mail-Programme machen das. Am einfachsten ist es,
              den Futter-Check noch einmal zu starten; deine Antworten sind in
              drei Minuten wieder eingetragen.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/futter-check-start"
                prefetch={false}
                className="inline-block bg-ink text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-rose-deep transition-colors"
              >
                Futter-Check noch einmal starten
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
