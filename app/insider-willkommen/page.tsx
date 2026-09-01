import type { Metadata } from "next";
import Link from "next/link";
import { insider } from "@/lib/insider";
import { aktuellerInsider } from "@/lib/insider-zugang";
import InsiderMerken from "@/components/InsiderMerken";

// ---------------------------------------------------------------------------
// Wo man nach dem Klick auf den persönlichen Link landet.
//
// Der Keks ist zu diesem Zeitpunkt schon gesetzt (das passiert in
// app/insider-bestaetigt/route.ts), deshalb kann diese Seite einfach
// nachsehen, wer da ist, und sie mit Namen begrüßen.
//
// Nicht im Suchindex: ohne den vorherigen Klick ergibt sie keinen Sinn.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Willkommen bei den Pferdeliebe Insidern",
  robots: { index: false, follow: false },
};

export default async function InsiderWillkommenSeite({
  searchParams,
}: {
  searchParams: Promise<{ fehler?: string }>;
}) {
  const { fehler } = await searchParams;
  const angemeldet = fehler ? null : await aktuellerInsider();

  if (!angemeldet) {
    return (
      <main className="py-14 sm:py-20 px-6 sm:px-8">
        <div className="max-w-2xl mx-auto">
          <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
            Hm
          </span>
          <h1 className="font-serif font-normal text-[32px] sm:text-[46px] leading-[1.12] tracking-tight mb-5">
            Dieser Link funktioniert nicht mehr.
          </h1>
          <p className="text-[17px] text-ink-soft leading-relaxed mb-8">
            Das passiert, wenn die Adresse im Browser unterwegs abgeschnitten
            wurde, manche Mail-Programme machen das. Trag dich einfach noch
            einmal ein, dann kommt eine frische Mail.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/insider"
              className="inline-block bg-ink text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-rose-deep transition-colors"
            >
              Zum Insider-Bereich
            </Link>
            <a
              href="mailto:info@pferdeliebehealthy.de"
              className="inline-block border border-line text-ink-soft px-7 py-3.5 rounded-full text-[15px] font-medium hover:text-ink hover:border-ink transition-colors"
            >
              Oder schreib mir kurz
            </a>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Blendet die Anmelde-Aufforderungen in diesem Browser aus. */}
        <InsiderMerken />

        <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Angemeldet
        </span>
        <h1 className="font-serif font-normal text-[32px] sm:text-[46px] leading-[1.12] tracking-tight mb-5">
          Willkommen, {angemeldet.vorname}.
        </h1>
        <p className="text-[17px] text-ink-soft leading-relaxed">
          Du bist bei den {insider.name} dabei und kannst ab jetzt alle Beiträge
          lesen. Dieser Browser merkt sich das ein Jahr lang, du musst dich
          also nicht bei jedem Besuch neu anmelden.
        </p>

        <div className="bg-ink text-cream rounded-[24px] p-8 sm:p-10 mt-10">
          <h2 className="font-serif text-[23px] sm:text-[27px] leading-snug mb-4">
            Los geht&rsquo;s
          </h2>
          <p className="text-[15px] text-cream/75 mb-7">
            Fang an, wo es dich am meisten interessiert. Neue Beiträge schicke
            ich dir außerdem ins Postfach, du musst also nicht nachsehen.
          </p>
          <Link
            href="/insider"
            className="inline-block bg-rose text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-cream transition-colors"
          >
            Zu den Beiträgen
          </Link>
        </div>

        <div className="bg-cream-deep rounded-[18px] p-6 sm:p-7 mt-8">
          <h2 className="text-[15px] font-semibold mb-2.5">
            Auf einem anderen Gerät lesen?
          </h2>
          <p className="text-[14px] text-ink-soft leading-relaxed">
            Öffne dort einfach irgendeine Mail von mir und klick auf einen Link
            darin, dann bist du auch dort angemeldet. Ein Passwort brauchst du
            nirgends.
          </p>
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
      </div>
    </main>
  );
}
