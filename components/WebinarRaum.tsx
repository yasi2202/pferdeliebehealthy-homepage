"use client";

import { useEffect, useState } from "react";

// ---------------------------------------------------------------------------
// Der Warteraum.
//
// Vor dem Termin ein Countdown, zur vollen Zeit startet das Video von selbst,
// und zwar an der Stelle, an der es gerade waere. Wer zehn Minuten zu spaet
// kommt, sieht nicht den Anfang. Das ist Absicht: Es soll sich wie ein Termin
// anfuehlen und nicht wie eine Konserve, die immer bereitliegt.
//
// Der Zustand wird im Browser jede Sekunde neu gerechnet. Die Uhr des
// Rechners kann falsch gehen, deshalb kommt der Zeitpunkt vom Server und der
// Vergleich laeuft ueber den Abstand, nicht ueber absolute Uhrzeiten.
// ---------------------------------------------------------------------------

type Zustand =
  | { art: "wartet"; sekunden: number }
  | { art: "laeuft"; sekunde: number }
  | { art: "verpasst" }
  | { art: "vorbei" };

function rechne(terminMs: number, dauerMin: number, einlassMin: number): Zustand {
  const sekunden = Math.floor((Date.now() - terminMs) / 1000);
  if (sekunden < 0) return { art: "wartet", sekunden: -sekunden };
  if (sekunden > dauerMin * 60) return { art: "vorbei" };
  if (sekunden > einlassMin * 60) return { art: "verpasst" };
  return { art: "laeuft", sekunde: sekunden };
}

function countdownText(sekunden: number): string {
  const t = Math.floor(sekunden / 86400);
  const s = Math.floor((sekunden % 86400) / 3600);
  const m = Math.floor((sekunden % 3600) / 60);
  const rest = sekunden % 60;
  if (t > 0) return `${t} ${t === 1 ? "Tag" : "Tage"} und ${s} ${s === 1 ? "Stunde" : "Stunden"}`;
  if (s > 0) return `${s}:${String(m).padStart(2, "0")}:${String(rest).padStart(2, "0")}`;
  return `${m}:${String(rest).padStart(2, "0")}`;
}

export default function WebinarRaum({
  terminISO,
  terminText,
  vorname,
  videoId,
  videoHash,
  dauerMinuten,
  einlassMinuten,
}: {
  terminISO: string;
  terminText: string;
  vorname: string | null;
  videoId: string | null;
  videoHash: string | null;
  dauerMinuten: number;
  einlassMinuten: number;
}) {
  const terminMs = new Date(terminISO).getTime();
  const [zustand, setZustand] = useState<Zustand>(() =>
    rechne(terminMs, dauerMinuten, einlassMinuten)
  );
  // Die Einstiegsstelle wird nur einmal festgehalten. Ohne das baut der
  // Player jede Sekunde neu auf, weil sich die Adresse aendert.
  const [startSekunde, setStartSekunde] = useState<number | null>(null);

  useEffect(() => {
    const uhr = setInterval(() => {
      setZustand((vorher) => {
        const neu = rechne(terminMs, dauerMinuten, einlassMinuten);
        if (neu.art === "laeuft" && vorher.art !== "laeuft") {
          setStartSekunde(neu.sekunde);
        }
        return neu;
      });
    }, 1000);
    if (zustand.art === "laeuft" && startSekunde === null) setStartSekunde(zustand.sekunde);
    return () => clearInterval(uhr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [terminMs, dauerMinuten, einlassMinuten]);

  if (zustand.art === "wartet") {
    return (
      <div className="rounded-2xl bg-cream p-8 sm:p-12 text-center">
        <p className="text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          {vorname ? `Schön, dass du da bist, ${vorname}` : "Schön, dass du da bist"}
        </p>
        <h2 className="font-serif text-[26px] sm:text-[32px] mb-2">Gleich geht es los</h2>
        <p className="text-[17px] text-ink-soft mb-8">{terminText}</p>
        <div className="font-serif text-[44px] sm:text-[64px] leading-none text-rose-deep tabular-nums">
          {countdownText(zustand.sekunden)}
        </div>
        <p className="text-[15px] text-ink-soft mt-8 max-w-md mx-auto leading-relaxed">
          Diese Seite startet von selbst, du musst nichts weiter tun. Nimm dir
          etwas zu schreiben mit: Es geht um Zahlen, die du danach bei deinem
          eigenen Pferd nachrechnen kannst.
        </p>
      </div>
    );
  }

  if (zustand.art === "laeuft") {
    if (!videoId) {
      return (
        <div className="rounded-2xl bg-cream p-8 text-center">
          <h2 className="font-serif text-[24px] mb-3">Das Webinar läuft gleich</h2>
          <p className="text-[16px] text-ink-soft">
            Der Film ist noch nicht hinterlegt. Bitte lade die Seite in ein paar
            Minuten neu.
          </p>
        </div>
      );
    }
    const ab = startSekunde ?? zustand.sekunde;
    // Nicht gelistete Vimeo-Videos brauchen den Zusatz h=..., sonst bleibt das
    // Feld schwarz. Ohne controls kann niemand vorspulen, das haelt den Termin
    // zusammen.
    const adresse =
      `https://player.vimeo.com/video/${videoId}` +
      `?autoplay=1&controls=0&title=0&byline=0&portrait=0&dnt=1` +
      (videoHash ? `&h=${encodeURIComponent(videoHash)}` : "") +
      `#t=${ab}s`;
    return (
      <div>
        <div className="rounded-2xl overflow-hidden bg-black aspect-video">
          <iframe
            src={adresse}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
            title="Webinar"
          />
        </div>
        <p className="text-[14px] text-ink-soft mt-4">
          Läuft seit {Math.floor(zustand.sekunde / 60)} Minuten. Wenn der Ton
          fehlt, tippe einmal ins Bild.
        </p>
      </div>
    );
  }

  if (zustand.art === "verpasst") {
    return (
      <div className="rounded-2xl bg-cream p-8 sm:p-12 text-center">
        <h2 className="font-serif text-[26px] mb-3">Das war knapp</h2>
        <p className="text-[17px] text-ink-soft leading-relaxed mb-6 max-w-md mx-auto">
          Der Einstieg ist schon zu weit fortgeschritten, du würdest die Hälfte
          verpassen. Melde dich einfach für den nächsten Termin an, es gibt
          jeden Abend einen.
        </p>
        <a
          href="/webinar"
          className="inline-block rounded-full bg-rose-deep px-7 py-3.5 text-white text-[16px]"
        >
          Neuen Termin wählen
        </a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-cream p-8 sm:p-12 text-center">
      <h2 className="font-serif text-[26px] mb-3">Dieser Termin ist vorbei</h2>
      <p className="text-[17px] text-ink-soft leading-relaxed mb-6 max-w-md mx-auto">
        Das Webinar läuft mehrmals die Woche. Such dir einen neuen Termin aus,
        der Platz ist wieder kostenlos.
      </p>
      <a
        href="/webinar"
        className="inline-block rounded-full bg-rose-deep px-7 py-3.5 text-white text-[16px]"
      >
        Neuen Termin wählen
      </a>
    </div>
  );
}
