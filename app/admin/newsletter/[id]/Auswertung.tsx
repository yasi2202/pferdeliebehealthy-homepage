import Link from "next/link";
import {
  textZuHtml,
  namenEinsetzen,
  newsletterRahmen,
  type Brief,
} from "@/lib/newsletter";
import type { Auswertung as Zahlen } from "@/lib/newsletter-server";

// ---------------------------------------------------------------------------
// Ein Newsletter, der schon raus ist.
//
// ▸ ER LÄSST SICH NICHT MEHR ÄNDERN. Deshalb steht hier kein Editor, sondern
//   das, was rausgegangen ist, und was daraus geworden ist.
//
// ▸ WORAUF DU BEI DEN ZAHLEN ACHTEN SOLLTEST:
//   Die Öffnungsrate ist die unzuverlässigste Zahl im ganzen Programm. Apple
//   Mail lädt seit 2021 die Bilder aller Mails im Voraus, auch der
//   ungelesenen — jede dieser Mails zählt hier als geöffnet. Wer den
//   Bildabruf abgeschaltet hat, taucht umgekehrt nie auf, auch wenn er
//   jedes Wort gelesen hat.
//
//   Die Klickrate ist die ehrliche Zahl. Sie steht deshalb daneben und
//   nicht darunter.
// ---------------------------------------------------------------------------

function datum(wert: string | null): string {
  if (!wert) return "";
  return new Date(wert).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function anteil(teil: number, ganzes: number): string {
  if (ganzes <= 0) return "—";
  return `${Math.round((teil / ganzes) * 100)} %`;
}

export default function Auswertung({
  brief,
  zahlen,
  misst,
}: {
  brief: Brief;
  zahlen: Zahlen;
  misst: boolean;
}) {
  const html = newsletterRahmen(
    textZuHtml(namenEinsetzen(brief.inhalt, "Anna")),
    namenEinsetzen(brief.vorschautext, "Anna"),
    "#"
  );

  return (
    <main className="px-5 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-[1100px]">
        <Link
          href="/admin/newsletter"
          className="mb-6 inline-block text-[14.5px] text-rose-deep underline underline-offset-2"
        >
          ← Alle Newsletter
        </Link>

        <h1 className="font-serif text-[28px] font-normal leading-tight tracking-tight sm:text-[36px]">
          {brief.betreff}
        </h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          Verschickt am {datum(brief.versendet_am)} an {brief.empfaenger}{" "}
          {brief.empfaenger === 1 ? "Adresse" : "Adressen"}
          {brief.uebersprungen > 0 && (
            <> · {brief.uebersprungen} unbrauchbare Adressen übersprungen</>
          )}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,520px)]">
          {/* ------------------------------------------------ Die Zahlen */}
          <div>
            {!misst && (
              <div className="mb-4 rounded-[18px] border border-line bg-white p-6">
                <h2 className="mb-2 font-serif text-[20px]">
                  Gemessen wird gerade nicht
                </h2>
                <p className="text-[14.5px] leading-relaxed text-ink-soft">
                  Deshalb stehen unten Nullen. Das ist kein Fehler: In deiner
                  Datenschutzerklärung steht wörtlich, dass du kein
                  Öffnungs-Tracking einsetzt. Solange dieser Satz dort steht,
                  wäre das Messen ein Widerspruch zu deiner eigenen Zusage.
                </p>
                <p className="mt-3 text-[14.5px] leading-relaxed text-ink-soft">
                  Willst du die Zahlen haben, muss zuerst der Abschnitt
                  „Speicherung und Versand" in der Datenschutzerklärung
                  angepasst und beim Anmeldeformular ein Hinweis ergänzt
                  werden. Danach steht in{" "}
                  <code className="rounded bg-cream-deep px-1.5 py-0.5 text-[13.5px]">
                    lib/newsletter-server.ts
                  </code>{" "}
                  ganz oben ein Schalter, der es einschaltet. Die ganze
                  Anleitung steht als Kommentar daneben.
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-[18px] border border-line bg-white p-6">
                <p className="font-serif text-[38px] leading-none text-ink">
                  {anteil(zahlen.geoeffnet, brief.empfaenger)}
                </p>
                <p className="mt-2 text-[14px] uppercase tracking-wide text-ink-soft">
                  geöffnet
                </p>
                <p className="mt-1 text-[13.5px] text-ink-soft">
                  {zahlen.geoeffnet} von {brief.empfaenger}
                </p>
              </div>

              <div className="rounded-[18px] border border-line bg-white p-6">
                <p className="font-serif text-[38px] leading-none text-ink">
                  {anteil(zahlen.geklickt, brief.empfaenger)}
                </p>
                <p className="mt-2 text-[14px] uppercase tracking-wide text-ink-soft">
                  geklickt
                </p>
                <p className="mt-1 text-[13.5px] text-ink-soft">
                  {zahlen.geklickt} von {brief.empfaenger}
                </p>
              </div>
            </div>

            {misst && (
            <p className="mt-4 rounded-[16px] border border-line bg-white p-5 text-[14.5px] leading-relaxed text-ink-soft">
              <strong className="text-ink">Zur Einordnung:</strong> Bei einem
              Verteiler wie deinem, der sich selbst eingetragen hat, sind 35
              bis 50 Prozent Öffnungen normal und 3 bis 8 Prozent Klicks. Die
              Öffnungsrate ist dabei die unzuverlässigere Zahl — Apple Mail
              lädt Bilder auch bei ungelesenen Mails vor, und wer Bilder
              abgeschaltet hat, taucht nie auf. Die Klicks sind die Wahrheit.
            </p>
            )}

            {zahlen.ziele.length > 0 && (
              <div className="mt-4 rounded-[16px] border border-line bg-white p-5">
                <h2 className="mb-3 font-serif text-[19px]">Worauf geklickt wurde</h2>
                <ul className="space-y-2.5">
                  {zahlen.ziele.map((z) => (
                    <li key={z.ziel} className="text-[14.5px]">
                      <span className="font-semibold text-ink">{z.anzahl}×</span>{" "}
                      <a
                        href={z.ziel}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-rose-deep underline underline-offset-2"
                      >
                        {z.ziel.replace(/^https?:\/\/(www\.)?/, "")}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {zahlen.geklickt === 0 && zahlen.geoeffnet > 0 && (
              <p className="mt-4 rounded-[16px] border border-line bg-white p-5 text-[14.5px] leading-relaxed text-ink-soft">
                Gelesen, aber nicht geklickt. Das heisst meist eines von
                zweien: Der Knopf stand zu weit unten, oder es war nicht klar
                genug, was dahinter wartet.
              </p>
            )}
          </div>

          {/* ------------------------------------------------ Der Text */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <p className="mb-2 text-[13px] uppercase tracking-[0.14em] text-ink-soft">
              Was rausgegangen ist
            </p>
            <iframe
              title="Der versendete Newsletter"
              srcDoc={html}
              className="h-[640px] w-full rounded-[14px] border border-line bg-white"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
