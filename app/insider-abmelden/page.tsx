import type { Metadata } from "next";
import Link from "next/link";
import { anmeldungZuToken } from "@/lib/insider-versand";
import AbmeldeKnopf from "@/components/AbmeldeKnopf";

// ---------------------------------------------------------------------------
// Der Abmeldelink aus jeder Rundmail.
//
// Hier wird noch nichts gelöscht — es wird gefragt. Der Grund ist unangenehm
// praktisch: Manche Mailprogramme und Virenscanner öffnen alle Links in einer
// Mail automatisch, um sie zu prüfen. Würde schon das Öffnen abmelden, wäre
// ein Teil des Verteilers eines Tages spurlos verschwunden, ohne dass
// irgendjemand geklickt hätte.
//
// Gelöscht wird deshalb erst auf einen Knopfdruck.
// ---------------------------------------------------------------------------

export const metadata: Metadata = {
  title: "Abmelden",
  robots: { index: false, follow: false },
};

export default async function AbmeldenSeite({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const anmeldung = token ? await anmeldungZuToken(token) : null;

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-2xl mx-auto">
        {anmeldung ? (
          <>
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Abmelden
            </span>
            <h1 className="font-serif font-normal text-[30px] sm:text-[42px] leading-[1.12] tracking-tight mb-5">
              Möchtest du dich wirklich abmelden, {anmeldung.vorname}?
            </h1>
            <p className="text-[17px] text-ink-soft leading-relaxed mb-8">
              Dann lösche ich deine Adresse und schreibe dir nicht mehr. Die
              Beiträge kannst du danach auch nicht mehr lesen — die sind für
              Insider. Eintragen kannst du dich jederzeit wieder.
            </p>

            <AbmeldeKnopf token={anmeldung.token} />
          </>
        ) : (
          <>
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Alles klar
            </span>
            <h1 className="font-serif font-normal text-[30px] sm:text-[42px] leading-[1.12] tracking-tight mb-5">
              Diese Adresse steht nicht mehr auf meiner Liste.
            </h1>
            <p className="text-[17px] text-ink-soft leading-relaxed mb-8">
              Entweder hast du dich schon abgemeldet, oder der Link wurde
              unterwegs abgeschnitten — manche Mail-Programme machen das. In
              beiden Fällen musst du nichts weiter tun.
            </p>
            <Link
              href="/"
              className="inline-block border border-ink text-ink px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-ink hover:text-cream transition-colors"
            >
              Zur Startseite
            </Link>
          </>
        )}
      </div>
    </main>
  );
}
