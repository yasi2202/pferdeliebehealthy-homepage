import Image from "next/image";

// ---------------------------------------------------------------------------
// Der Block „Wer dahintersteht" auf den Verkaufsseiten.
//
// ▸ WARUM
//   Auf den Verkaufsseiten stand bisher nirgends, wer das Angebot gemacht
//   hat. Ein Heft für zwölf Euro kauft man vielleicht trotzdem, einen Kurs
//   für neunundsechzig eher nicht. „Wer sagt das, und warum sollte ich dem
//   glauben" ist die Frage, die jede Checkliste unter Vertrauenselementen
//   führt.
//
// ▸ DIE ZAHLEN SIND DIESELBEN WIE AUF /ausbildung. Dort stehen sie seit
//   jeher: über 500 Einzelberatungen, über 1.000 Kursteilnehmende. Wenn sie
//   sich ändern, ändern sie sich an BEIDEN Stellen, sonst widerspricht sich
//   die Seite selbst.
//
// ▸ WAS HIER BEWUSST NICHT STEHT
//   Keine Berufsbezeichnung außer „Futtermittelberaterin für Pferde".
//   Insbesondere nicht Tierheilpraktikerin: Diese Ausbildung läuft noch, und
//   ein Titel, den man noch nicht führen darf, ist auf einer Verkaufsseite
//   das Letzte, was dort stehen sollte (Stand 02.09.2026).
// ---------------------------------------------------------------------------

export default function WerDahinterSteht() {
  return (
    <section className="px-6 pb-16 sm:px-8 sm:pb-24">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[24px] border border-line bg-white">
        <div className="grid gap-0 sm:grid-cols-[minmax(0,260px)_1fr]">
          <div className="relative aspect-[4/3] w-full sm:aspect-auto sm:min-h-full">
            <Image
              src="/images/yasi-helena.jpg"
              alt="Yasemin mit ihrer Stute Helena"
              fill
              sizes="(min-width: 640px) 260px, 100vw"
              className="object-cover object-[50%_35%]"
            />
          </div>

          <div className="p-8 sm:p-10">
            <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
              Wer dahintersteht
            </span>

            <h2 className="mb-5 font-serif text-[24px] font-normal leading-[1.15] tracking-tight sm:text-[30px]">
              Ich schreibe nichts, was ich nicht selbst gebraucht hätte.
            </h2>

            <div className="space-y-3 text-[15.5px] leading-relaxed text-ink-soft">
              <p>
                Ich bin Yasemin, Futtermittelberaterin für Pferde. Angefangen
                hat alles mit Helena, meiner Stute. Sie ist heute 28 und hat
                PPID. Was ich über Stoffwechsel weiß, weiß ich, weil ich es für
                sie lernen musste.
              </p>
              <p>
                Seitdem sind über 500 Einzelberatungen und über 1.000
                Kursteilnehmende dazugekommen. Was du hier liest, kommt aus
                dieser Arbeit und nicht aus einem Lehrbuch.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
