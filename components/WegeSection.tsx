import Link from "next/link";
import { fuerDeinPferd, masterclass } from "@/lib/angebote";
import { ausbildung } from "@/lib/ausbildung";
import { futterCheck } from "@/lib/seite";

// ---------------------------------------------------------------------------
// Die Angebote, nach Zielgruppe getrennt.
//
// Links auf Weiß: alles für das eigene Pferd, Einstieg zuerst.
// Rechts auf Ink: die Masterclass für angehende Beraterinnen.
//
// Jede Seite hat ihren eigenen kostenlosen Einstieg — Futter-Check links,
// Schnupperkurs rechts.
//
// Inhalte: lib/angebote.ts
// ---------------------------------------------------------------------------

export default function WegeSection() {
  // ▸ SEIT DEM 09.09.2026 IST DER SCHNUPPERKURS-KASTEN SELBST EIN LINK.
  //   Vorher stand dort nur Text, und der einzige Knopf der Ausbildungs-Box
  //   führte auf /ausbildung. Wer direkt reinschnuppern wollte, musste sich
  //   erst durchklicken, obwohl der Kasten „Kostenlos reinschnuppern" heißt.
  //
  //   Die Adresse kommt aus lib/ausbildung.ts, also dieselbe, die auch die
  //   beiden Knöpfe auf /ausbildung benutzen. Sie darf NICHT nach
  //   lib/angebote.ts wandern, die Begründung steht dort. Ist sie leer,
  //   bleibt der Kasten stummer Text statt eines toten Links.
  const schnupperkurs = masterclass.schnupperkurs;
  const schnupperUrl = ausbildung.schnupperkurs;

  const schnupperInhalt = (
    <>
      <div className="text-[11px] tracking-[0.14em] uppercase text-pfirsich font-semibold mb-2">
        Kostenlos reinschnuppern
      </div>
      <div className="text-[15.5px] font-medium">{schnupperkurs.name}</div>
      <div className="text-[13.5px] text-cream/70 mt-1">
        {schnupperkurs.untertitel}
      </div>
      {schnupperUrl && (
        <div className="mt-3.5 text-[13.5px] font-medium text-pfirsich underline decoration-pfirsich/50 underline-offset-4 group-hover:decoration-pfirsich">
          Direkt reinschauen
        </div>
      )}
    </>
  );

  const schnupperKlassen =
    "bg-cream/10 border border-cream/20 rounded-xl p-5 mb-7 flex-grow";

  return (
    <section id="wege" className="py-20 sm:py-24">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <span className="fade-in block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
          Die Kurse
        </span>
        <h2 className="fade-in font-serif font-normal text-[26px] sm:text-[38px] leading-tight max-w-3xl">
          Lern es einmal, dann kannst du es immer
        </h2>
        {/* Am 07.09.2026 auf Kurse gedreht. Vorher stand hier "Die Angebote"
            und "Zwei Wege, ein Fundament", was Kurse und Beratung
            gleichgewichtig nebeneinanderstellte. Die Kurse tragen jetzt die
            Überschrift; die Beratung steht weiter in derselben Liste, aber
            als das, was sie ist: der Weg für alle, die es nicht selbst
            machen wollen. */}
        <p className="fade-in text-[17px] text-ink-soft max-w-xl mt-5 mb-14">
          Die einen wollen die Fütterung ihres Pferdes selbst verstehen. Die
          anderen wollen es für andere Pferde können. Und wer lieber abgibt,
          findet unten die Beratung. Anfangen kannst du überall kostenlos.
        </p>

        <div className="grid md:grid-cols-2 gap-7 items-start">
          {/* -------------------------------------------- Für das eigene Pferd */}
          <div className="fade-in bg-white rounded-[18px] border border-line p-9 sm:p-10 flex flex-col">
            <div className="text-[12.5px] tracking-wide uppercase text-rose-deep font-semibold mb-3.5">
              Für dein eigenes Pferd
            </div>
            <h3 className="font-serif text-2xl font-medium leading-snug mb-7">
              Du willst wissen, was bei euch fehlt
            </h3>

            <div className="flex-grow">
              {fuerDeinPferd.map((a, i) => {
                const zeile = (
                  <>
                    <div>
                      <div className="text-[15.5px] font-medium">{a.name}</div>
                      {a.untertitel && (
                        <div className="text-[13.5px] text-ink-soft">{a.untertitel}</div>
                      )}
                    </div>
                    {a.preis && (
                      <span className="text-[14px] text-ink-soft whitespace-nowrap tabular-nums">
                        {a.preis}
                      </span>
                    )}
                  </>
                );

                const klassen = `flex items-baseline justify-between gap-4 py-4 ${
                  i > 0 ? "border-t border-line" : ""
                }`;

                if (!a.url) {
                  return (
                    <div key={a.name} className={klassen}>
                      {zeile}
                    </div>
                  );
                }

                // Angebote auf der eigenen Seite oeffnen im selben Tab, fremde
                // bei alfima in einem neuen. Sonst reisst ein Klick auf
                // Mineral-Klarheit die Besucherin ohne Grund aus der Uebersicht.
                return a.url.startsWith("/") ? (
                  <Link
                    key={a.name}
                    href={a.url}
                    className={`${klassen} group hover:text-rose-deep transition-colors`}
                  >
                    {zeile}
                  </Link>
                ) : (
                  <a
                    key={a.name}
                    href={a.url}
                    target="_blank"
                    rel="noopener"
                    className={`${klassen} group hover:text-rose-deep transition-colors`}
                  >
                    {zeile}
                  </a>
                );
              })}
            </div>

            {/* ▸ DER WEG IN DEN SHOP.
                Die Liste oben zeigt fünf Angebote, im Shop stehen elf. Ohne
                diesen Verweis endet die Startseite bei einer Auswahl, und
                wer den Salzratgeber oder den Darmaufbau sucht, findet sie
                gar nicht. */}
            <Link
              href="/shop"
              className="mt-7 block text-center text-[14.5px] text-ink-soft underline decoration-rose-deep/40 underline-offset-4 hover:text-ink hover:decoration-rose-deep"
            >
              Alle Angebote im Shop ansehen
            </Link>

            <Link
              href={futterCheck.fragebogen}
              prefetch={false}
              className="mt-5 w-full text-center bg-rose-deep text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-ink transition-colors"
            >
              Kostenlos starten: der Futter-Check
            </Link>
          </div>

          {/* ------------------------------------------------- Die Masterclass */}
          {/* Sprungmarke bleibt bewusst "ausbildung": Links von außen, die noch
              auf /#ausbildung zeigen, funktionieren dadurch weiter. */}
          <div
            id="ausbildung"
            className="fade-in bg-ink text-cream rounded-[18px] p-9 sm:p-10 flex flex-col scroll-mt-24"
          >
            <div className="text-[12.5px] tracking-wide uppercase text-rose font-semibold mb-3.5">
              Für deine Karriere
            </div>
            <h3 className="font-serif text-2xl font-medium leading-snug mb-4">
              {masterclass.name}
            </h3>
            <p className="text-[15px] text-cream/75 mb-8 leading-relaxed">
              {masterclass.beschreibung}
            </p>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {masterclass.kennzahlen.map((k) => (
                <div key={k.label} className="pt-4 border-t border-cream/25">
                  <div className="font-serif text-[24px] text-rose tabular-nums">
                    {k.zahl}
                  </div>
                  <div className="text-[12.5px] text-cream/65">{k.label}</div>
                </div>
              ))}
            </div>

            {/* Der kostenlose Einstieg, optisch abgesetzt */}
            {schnupperUrl ? (
              <a
                href={schnupperUrl}
                target="_blank"
                rel="noopener"
                className={`group block transition-colors hover:bg-cream/[0.16] hover:border-cream/40 ${schnupperKlassen}`}
              >
                {schnupperInhalt}
              </a>
            ) : (
              <div className={schnupperKlassen}>{schnupperInhalt}</div>
            )}

            {/* Der Knopf führt seit 27.08.2026 auf die eigene Seite /ausbildung
                und nicht mehr direkt zu alfima. Grund: Dort steht erklärt,
                was die Ausbildung ist, und die Seite kann bei Google gefunden
                werden. Der kostenlose Schnupperkurs steht dort ganz oben. */}
            <Link
              href="/ausbildung"
              className="w-full text-center bg-cream text-ink px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-rose transition-colors"
            >
              Die Ausbildung ansehen
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
