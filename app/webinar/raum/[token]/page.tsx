import type { Metadata } from "next";
import { notFound } from "next/navigation";
import WebinarRaum from "@/components/WebinarRaum";
import { anmeldungZuToken, raumBesuchNotieren } from "@/lib/webinar-server";
import { terminText, raumZustand, DAUER_MINUTEN, EINLASS_MINUTEN } from "@/lib/webinar";

export const metadata: Metadata = {
  title: "Dein Webinar-Platz",
  robots: { index: false, follow: false },
};

// Haengt an der Uhrzeit und am persoenlichen Schluessel, darf also nie in
// einen Zwischenspeicher.
export const dynamic = "force-dynamic";

export default async function RaumSeite({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const anmeldung = await anmeldungZuToken(token);
  if (!anmeldung) notFound();

  const termin = new Date(anmeldung.termin);
  const zustand = raumZustand(termin);

  // Der erste Aufruf ist zugleich der Beleg, dass die Adresse ihr gehoert.
  // Fehler dabei duerfen den Raum nicht aufhalten, deshalb ohne await
  // abgefangen: Wer punktlich davorsitzt, soll nicht auf die Datenbank warten.
  raumBesuchNotieren(
    anmeldung.id,
    zustand.art === "laeuft" ? zustand.sekundeImVideo : 0,
    !anmeldung.raum_geoeffnet_am
  ).catch(() => {});

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <div className="max-w-3xl mx-auto">
        <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Kostenloses Webinar
        </span>
        <h1 className="font-serif font-normal text-[28px] sm:text-[38px] leading-[1.15] tracking-tight mb-8">
          Was steckt wirklich in deinem Heu?
        </h1>

        <WebinarRaum
          terminISO={termin.toISOString()}
          terminText={terminText(termin)}
          vorname={anmeldung.vorname}
          videoId={process.env.WEBINAR_VIMEO_ID ?? null}
          videoHash={process.env.WEBINAR_VIMEO_HASH ?? null}
          dauerMinuten={DAUER_MINUTEN}
          einlassMinuten={EINLASS_MINUTEN}
        />
      </div>
    </main>
  );
}
