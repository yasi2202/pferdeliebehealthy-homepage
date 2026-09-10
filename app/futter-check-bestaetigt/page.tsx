import type { Metadata } from "next";
import Link from "next/link";
import {
  bestaetigeAnmeldung,
  sendeErgebnisMail,
  sendeBenachrichtigung,
} from "@/lib/futter-check-server";
import { seitenUrl } from "@/lib/seo";
import FutterCheckErgebnis from "@/components/FutterCheckErgebnis";

// ---------------------------------------------------------------------------
// Das Ziel des Links aus der Bestaetigungsmail, und die Ergebnisseite.
//
// Hier wird der Haken gesetzt, dass die Adresse bestaetigt ist — und erst
// danach gehen die beiden Mails raus, die etwas Werbliches enthalten: das
// Ergebnis an sie und die Benachrichtigung an dich. Vorher darf nichts davon
// verschickt werden.
//
// ▸ SEIT 10.09.2026 STEHT HIER DAS GANZE ERGEBNIS mit Empfehlung. Der
//   Fragebogen zeigt es nicht mehr, es gibt es nur gegen eine echte Adresse.
//   Wer den Link spaeter noch einmal oeffnet, sieht es wieder, bekommt aber
//   keine zweite Mail.
//
// Die Seite gehoert nicht in den Suchindex: sie ergibt ohne den persoenlichen
// Schluessel in der Adresse keinen Sinn.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Dein Futter-Check",
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

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {ergebnis ? (
          <>
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              {ergebnis.frisch ? "Bestätigt" : "Dein Futter-Check"}
            </span>
            <h1 className="font-serif font-normal text-[32px] sm:text-[46px] leading-[1.12] tracking-tight mb-5">
              Danke, {ergebnis.anmeldung.vorname}. Hier ist dein Ergebnis.
            </h1>
            <p className="text-[17px] text-ink-soft leading-relaxed mb-10">
              {ergebnis.frisch
                ? "Eine Kopie liegt gleich in deinem Postfach, zum Nachlesen, wann immer du willst. Falls sie nicht auftaucht, schau kurz im Spam-Ordner nach und verschieb die Mail in den Posteingang, sonst geht später vielleicht etwas unter."
                : "Du hast deine Adresse schon bestätigt. Das Ergebnis liegt auch in deinem Postfach."}
            </p>

            <FutterCheckErgebnis
              titel={ergebnis.anmeldung.ergebnis_titel}
              text={ergebnis.anmeldung.ergebnis_text}
              antworten={ergebnis.anmeldung.antworten}
            />

            <p className="mt-10 text-center font-serif italic text-[15px] text-ink-soft">
              Alles Gute für dich und dein Pferd, Yasi
            </p>
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
              wurde, manche Mail-Programme machen das. Am einfachsten ist es,
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
