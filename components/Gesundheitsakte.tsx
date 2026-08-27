import Link from "next/link";

// ---------------------------------------------------------------------------
// Der Auszug aus einer Gesundheitsakte — das wiederkehrende Element der Seite.
// Er steht direkt unter dem Hero und zeigt, was die Arbeit tatsächlich ist,
// statt sie zu behaupten.
//
// Die Werte unten sind Beispielwerte. Wenn du echte (anonymisierte) Zeilen
// aus einer deiner Akten einsetzen willst, änderst du nur diese Liste.
// ---------------------------------------------------------------------------

const befunde = [
  { name: "Raufutter", wert: "1,2 kg je 100 kg", stand: "unter Bedarf", prozent: 55 },
  { name: "Selen", wert: "0,08 mg/kg TS", stand: "unter Bedarf", prozent: 30 },
  { name: "Zink", wert: "38 mg/kg TS", stand: "knapp", prozent: 72 },
  { name: "Salz", wert: "frei verfügbar", stand: "erfüllt", prozent: 100 },
];

export default function Gesundheitsakte() {
  return (
    <section className="px-6 sm:px-8 -mt-10 sm:-mt-14 relative z-10">
      <div className="fade-in max-w-5xl mx-auto bg-white rounded-[24px] border border-line p-8 sm:p-11 shadow-[0_18px_50px_-30px_rgba(59,42,40,0.5)]">
        <div className="flex flex-wrap items-baseline justify-between gap-3 pb-5 mb-8 border-b border-line">
          <h2 className="text-[12.5px] tracking-[0.14em] uppercase text-rose-deep font-semibold">
            So sieht meine Arbeit aus · Auszug einer Gesundheitsakte
          </h2>
          <span className="text-[13px] text-ink-soft tabular-nums">Helena, 28 Jahre</span>
        </div>

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

        <p className="text-[13px] text-ink-soft mt-8 pt-6 border-t border-line">
          Beispielwerte zur Veranschaulichung. Genau diese Zeilen bekommst du bei{" "}
          <Link href="#wege" className="text-ink font-medium hover:text-rose-deep">
            Futterberatung 365
          </Link>{" "}
          für dein eigenes Pferd — und lernst sie in der{" "}
          <Link href="/ausbildung" className="text-ink font-medium hover:text-rose-deep">
            Ausbildung
          </Link>{" "}
          selbst zu erstellen.
        </p>
      </div>
    </section>
  );
}
