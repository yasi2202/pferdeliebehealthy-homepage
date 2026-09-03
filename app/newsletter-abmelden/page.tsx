import type { Metadata } from "next";
import Link from "next/link";
import { unterschriftStimmt, istAbgemeldet } from "@/lib/newsletter-server";
import NewsletterAbmeldeKnopf from "@/components/NewsletterAbmeldeKnopf";

// ---------------------------------------------------------------------------
// Der Abmeldelink aus der Fusszeile jedes Newsletters.
//
// Hier wird noch nichts gelöscht — es wird gefragt. Der Grund ist unangenehm
// praktisch: Manche Mailprogramme und Virenscanner öffnen alle Links einer
// Mail automatisch, um sie zu prüfen. Würde schon das Öffnen abmelden, wäre
// ein Teil des Verteilers eines Tages spurlos verschwunden, ohne dass
// irgendjemand geklickt hätte.
//
// Gelöscht wird deshalb erst auf einen Knopfdruck. Der Ein-Klick-Knopf, den
// Gmail oben in der Mail anzeigt, geht einen anderen Weg — der schickt ein
// POST an /api/newsletter-abmelden, und dort ist die Rückfrage nicht
// erlaubt. Beides ist richtig so.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Abmelden",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function NewsletterAbmeldenSeite({
  searchParams,
}: {
  searchParams: Promise<{ e?: string; p?: string }>;
}) {
  const { e, p } = await searchParams;

  const email = (e ?? "").trim();
  const echt = Boolean(email && p && unterschriftStimmt(email, p));
  const schonWeg = echt ? await istAbgemeldet(email) : false;

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {echt && !schonWeg ? (
          <>
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Abmelden
            </span>
            <h1 className="font-serif font-normal text-[30px] sm:text-[42px] leading-[1.12] tracking-tight mb-5">
              Möchtest du dich wirklich abmelden?
            </h1>
            <p className="text-[17px] text-ink-soft leading-relaxed mb-3">
              Dann lösche ich <strong className="text-ink">{email}</strong> aus
              meiner Liste und schreibe dir nicht mehr.
            </p>
            <p className="text-[17px] text-ink-soft leading-relaxed mb-8">
              Eintragen kannst du dich jederzeit wieder, es geht dir nichts
              verloren.
            </p>

            <NewsletterAbmeldeKnopf email={email} p={p ?? ""} />

            <p className="text-[14.5px] text-ink-soft leading-relaxed mt-10">
              Oder{" "}
              <Link
                href="/"
                className="text-rose-deep underline underline-offset-2"
              >
                zurück zur Startseite
              </Link>
              .
            </p>
          </>
        ) : (
          <>
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Alles klar
            </span>
            <h1 className="font-serif font-normal text-[30px] sm:text-[42px] leading-[1.12] tracking-tight mb-5">
              {schonWeg
                ? "Du bist bereits abgemeldet."
                : "Diese Adresse steht nicht mehr auf meiner Liste."}
            </h1>
            <p className="text-[17px] text-ink-soft leading-relaxed mb-8">
              {schonWeg
                ? "Von mir kommt keine Post mehr. Falls du es dir anders überlegst, trag dich einfach wieder ein."
                : "Entweder hast du dich schon abgemeldet, oder der Link wurde unterwegs abgeschnitten, manche Mail-Programme machen das. Schreib mir in dem Fall kurz an info@pferdeliebehealthy.de, dann trage ich dich von Hand aus."}
            </p>

            <Link
              href="/"
              className="inline-block bg-ink text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-rose-deep transition-colors"
            >
              Zur Startseite
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
