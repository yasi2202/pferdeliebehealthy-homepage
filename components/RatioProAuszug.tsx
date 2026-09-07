import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import Link from "next/link";

// ---------------------------------------------------------------------------
// Der Auszug aus einer Rationsberechnung, direkt unter dem Hero.
//
// ▸ WAS ER LEISTET: Er zeigt, wie eine durchgerechnete Ration aussieht,
//   statt sie zu behaupten. Bis zum 07.09.2026 war er als "Auszug einer
//   Gesundheitsakte" beschriftet und damit als Yasemins Arbeit. Seit die
//   Seite auf die Kurse zeigt, ist es ein Auszug aus RatioPro: dasselbe
//   Können, aber als etwas, das die Besucherin selbst tun kann.
//
// ▸ Die Werte unten sind Beispielwerte. Willst du echte (anonymisierte)
//   Zeilen einsetzen, änderst du nur diese Liste.
// ---------------------------------------------------------------------------

const befunde = [
  { name: "Raufutter", wert: "1,2 kg je 100 kg", stand: "unter Bedarf", prozent: 55 },
  { name: "Selen", wert: "0,08 mg/kg TS", stand: "unter Bedarf", prozent: 30 },
  { name: "Zink", wert: "38 mg/kg TS", stand: "knapp", prozent: 72 },
  { name: "Salz", wert: "frei verfügbar", stand: "erfüllt", prozent: 100 },
];

/** Liegt ein echtes Bildschirmfoto bereit?
 *
 *  WOZU DIE PRUEFUNG: Ein echter Auszug aus RatioPro zieht mehr als eine
 *  nachgebaute Balkenliste, aber er muss aus dem laufenden Rechner kommen und
 *  den kann nur Yasemin bedienen. Solange die Datei fehlt, steht hier die
 *  nachgebaute Fassung; sobald sie unter public/images/ratiopro-auszug.png
 *  liegt, erscheint sie von selbst. Kein Umbau noetig, kein leerer Platz in
 *  der Zwischenzeit.
 */
function fotoVorhanden(): boolean {
  try {
    return fs.existsSync(path.join(process.cwd(), "public", "images", "ratiopro-auszug.png"));
  } catch {
    return false;
  }
}

export default function RatioProAuszug() {
  const foto = fotoVorhanden();
  return (
    <section className="px-6 sm:px-8 -mt-10 sm:-mt-14 relative z-10">
      <div className="fade-in max-w-5xl mx-auto bg-white rounded-[24px] border border-line p-8 sm:p-11 shadow-[0_18px_50px_-30px_rgba(59,42,40,0.5)]">
        <div className="flex flex-wrap items-baseline justify-between gap-3 pb-5 mb-8 border-b border-line">
          {/* Bis zum 07.09.2026 stand hier "So sieht meine Arbeit aus ·
              Auszug einer Gesundheitsakte". Das zeigte eine Leistung, die
              Yasemin erbringt. Derselbe Auszug aus RatioPro zeigt dasselbe
              Können, aber als etwas, das die Besucherin selbst tun kann. */}
          <h2 className="text-[12.5px] tracking-[0.14em] uppercase text-rose-deep font-semibold">
            So rechnest du selbst · Auszug aus RatioPro
          </h2>
          <span className="text-[13px] text-ink-soft tabular-nums">Helena, 28 Jahre</span>
        </div>

        {foto ? (
          <Image
            src="/images/ratiopro-auszug.png"
            alt="Auszug aus RatioPro: Bedarfsdeckung einer durchgerechneten Ration"
            width={1600}
            height={900}
            className="w-full h-auto rounded-[14px] border border-line"
            priority
          />
        ) : (
        <div className="grid sm:grid-cols-2 gap-x-12 gap-y-7">
          {befunde.map((b) => (
            <div key={b.name}>
              <div className="flex items-baseline justify-between gap-3 mb-2">
                <span className="text-[15.5px] font-medium">{b.name}</span>
                <span className="text-[13px] text-ink-soft tabular-nums">{b.wert}</span>
              </div>
              <div className="h-1.5 rounded-full bg-cream-deep overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full bg-rose-deep"
                  style={{ width: `${b.prozent}%` }}
                />
              </div>
              <span className="text-[12.5px] text-ink-soft">{b.stand}</span>
            </div>
          ))}
        </div>
        )}

        <p className="text-[13px] text-ink-soft mt-8 pt-6 border-t border-line">
          Beispielwerte zur Veranschaulichung. Genau so rechnest du mit{" "}
          <Link href="/ratiopro" className="text-ink font-medium hover:text-rose-deep">
            RatioPro
          </Link>{" "}
          deine eigene Ration durch: Du trägst ein, was dein Pferd bekommt, und siehst, was gedeckt
          ist und was nicht. Wenn du es lieber abgibst, mache ich es für dich bei{" "}
          <Link href="/pferdeliebe-365" className="text-ink font-medium hover:text-rose-deep">
            Pferdeliebe 365
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
