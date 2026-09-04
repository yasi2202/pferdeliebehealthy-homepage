import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { digitalFinden } from "@/lib/digital";
import { preisText } from "@/lib/shop";
import Kauffragen from "@/components/Kauffragen";
import Stimmen from "@/components/Stimmen";
import WerDahinterSteht from "@/components/WerDahinterSteht";

// ---------------------------------------------------------------------------
// Die Verkaufsseite zum Ganzjahresfutterplan.
//
// ▸ SIE ERSETZT DIE ALFIMA-SEITE. Der Beschreibungstext steht wörtlich so in
//   lib/digital.ts, wie er bei alfima stand. Nicht gekürzt, nicht geglättet.
//   Alles darum herum ist neu: Es gibt bei alfima keine Seite, die bei Google
//   gefunden werden könnte, weil dort jede Adresse gleich aussieht.
//
// ▸ WAS ABSICHTLICH FEHLT: der Streichpreis von 99 €, der bei alfima neben
//   den 29 € stand. Ein durchgestrichener Preis darf nur dort stehen, wo
//   tatsächlich auch zu diesem Preis verkauft wurde, sonst ist es Werbung
//   mit einer Ersparnis, die es nicht gibt. Genau deshalb ist er am
//   31.08.2026 auch beim Moventa im Shop entfernt worden. Wenn zu 99 €
//   verkauft wurde und sich das belegen lässt, kann er zurück.
//
// ▸ Der Kaufknopf führt auf die eigene Kasse, nicht direkt zu Stripe.
//   Warum, steht in components/DigitalKasse.tsx.
// ---------------------------------------------------------------------------

const produkt = digitalFinden("ganzjahresfutterplan")!;

const TITEL = "Ganzjahresfutterplan für Pferde, ganzheitlich durchs Jahr";
const BESCHREIBUNG =
  "Zwölf Monatspläne mit Futterplan, Mineralien und Kräutern, abgestimmt auf Fellwechsel, Weidezeit und Witterung. 59 €, dauerhafter Zugang.";

export const metadata: Metadata = {
  alternates: { canonical: "/ganzjahresfutterplan" },
  title: TITEL,
  description: BESCHREIBUNG,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Pferdeliebehealthy",
    title: `${TITEL} | Pferdeliebehealthy`,
    description: BESCHREIBUNG,
    url: "/ganzjahresfutterplan",
    images: [{ url: "/images/vorschau.jpg", width: 1200, height: 630 }],
  },
};

/** Der Kaufknopf. Steht dreimal auf der Seite, deshalb einmal hier. */
function Kaufknopf({ hell = false }: { hell?: boolean }) {
  return (
    <div className="flex flex-wrap items-center gap-5">
      <Link
        href={`/kasse/${produkt.slug}`}
        className={
          hell
            ? "inline-block rounded-full bg-rose px-8 py-4 text-[15px] font-medium text-ink transition-colors hover:bg-cream"
            : "inline-block rounded-full bg-ink px-8 py-4 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep"
        }
      >
        Für {preisText(produkt.preis)} freischalten
      </Link>

      <span
        className={
          hell ? "text-[14px] text-cream/60" : "text-[14px] text-ink-soft"
        }
      >
        Einmalig, kein Abo, dauerhafter Zugang
      </span>
    </div>
  );
}

export default function GanzjahresfutterplanSeite() {
  return (
    <main>
      {/* ------------------------------------------------------------- Kopf */}
      <section className="bg-ink px-6 py-16 text-cream sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div>
            <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose">
              Deine Jahresbegleitung
            </span>

            <h1 className="mb-6 font-serif text-[34px] font-normal leading-[1.1] tracking-tight sm:text-[50px]">
              Ganzjahresfutterplan
            </h1>

            <p className="mb-4 max-w-xl text-[18px] leading-relaxed text-cream/90 sm:text-[19px]">
              Zwölf Monatspläne, die dich vom Fellwechsel bis zur Winterruhe
              begleiten. Du musst nicht jeden Monat neu überlegen, was jetzt
              dran ist. Es steht schon da.
            </p>

            <p className="mb-8 max-w-xl text-[16px] leading-relaxed text-cream/70">
              Die Pläne werden zwei Monate im Voraus bereitgestellt, du hast
              also genug Zeit, alles vorzubereiten.
            </p>

            <Kaufknopf hell />
          </div>

          <div className="hidden lg:block">
            <Image
              src="/images/yasi-helena.jpg"
              alt="Yasemin Halac mit ihrer Stute Helena"
              width={1122}
              height={1402}
              priority
              sizes="(min-width: 1024px) 40vw, 0px"
              className="h-auto w-full rounded-[24px]"
            />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Das Problem */}
      <section className="px-6 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
            Warum ein Jahresplan
          </span>

          <h2 className="mb-6 font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
            Dein Pferd braucht im März etwas anderes als im August.
          </h2>

          <div className="space-y-4 text-[16.5px] leading-relaxed text-ink-soft">
            <p>
              Im Fellwechsel steigt der Bedarf an Spurenelementen und
              Aminosäuren. Auf der Frühjahrsweide ändert sich von einem Tag auf
              den anderen, was im Magen ankommt. Im Winter fehlt das frische
              Grün, und mit ihm ein Teil der Versorgung, den das Heu nicht
              ersetzt.
            </p>
            <p>
              Die meisten füttern trotzdem das ganze Jahr dasselbe. Nicht aus
              Nachlässigkeit, sondern weil jeder Monat eine eigene Recherche
              wäre und niemand die Zeit dafür hat.
            </p>
            <p>
              Genau die Arbeit nimmt dir dieser Plan ab.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ Was drin ist */}
      <section className="bg-cream-deep px-6 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
            Der Inhalt
          </span>

          <h2 className="mb-8 font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
            Was du bekommst
          </h2>

          {/* Der Text stammt wörtlich von der alfima-Seite und steht in
              lib/digital.ts. Wenn er geändert werden soll, dann dort. */}
          <div className="space-y-5">
            {produkt.beschreibung.map((block, i) => {
              if (block.art === "ueberschrift") {
                return (
                  <h3
                    key={i}
                    className="pt-2 font-serif text-[21px] leading-snug"
                  >
                    {block.text}
                  </h3>
                );
              }

              if (block.art === "liste") {
                return (
                  <ul key={i} className="space-y-3">
                    {block.punkte.map((punkt) => (
                      <li
                        key={punkt}
                        className="flex gap-3 text-[16.5px] leading-relaxed text-ink-soft"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-deep"
                        />
                        <span>{punkt}</span>
                      </li>
                    ))}
                  </ul>
                );
              }

              return (
                <p
                  key={i}
                  className={
                    block.betont
                      ? "font-serif text-[19px] leading-relaxed text-ink"
                      : "text-[16.5px] leading-relaxed text-ink-soft"
                  }
                >
                  {block.text}
                </p>
              );
            })}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- Nach dem Kauf */}
      <section className="px-6 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
            Wie es weitergeht
          </span>

          <h2 className="mb-8 font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
            Nach dem Kauf
          </h2>

          <ol className="space-y-6">
            {[
              {
                titel: "Du bekommst zwei Mails",
                text: "Einmal die Bestätigung mit deiner Rechnung, und einmal deinen persönlichen Zugangslink zur Akademie. Beide kommen innerhalb weniger Minuten.",
              },
              {
                titel: "Du klickst den Link und bist drin",
                text: "Kein Passwort ausdenken, kein Konto anlegen. Der Link merkt sich deinen Browser, du musst dich also nicht jedes Mal neu anmelden.",
              },
              {
                titel: "Der Plan bleibt dir",
                text: "Es ist kein Abo. Du zahlst einmal und kannst jederzeit zurückblättern, auch in einem Jahr noch.",
              },
            ].map((schritt, i) => (
              <li key={schritt.titel} className="flex gap-5">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cream-deep font-serif text-[15px]">
                  {i + 1}
                </span>
                <div>
                  <h3 className="mb-1.5 font-serif text-[19px] leading-snug">
                    {schritt.titel}
                  </h3>
                  <p className="text-[16px] leading-relaxed text-ink-soft">
                    {schritt.text}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <p className="mt-10 rounded-[16px] border border-line bg-white p-6 text-[15px] leading-relaxed text-ink-soft">
            Kommt keine Mail an? Sieh bitte kurz im Spam-Ordner nach und
            schreib mir sonst an{" "}
            <a
              href="mailto:info@pferdeliebehealthy.de"
              className="text-rose-deep underline underline-offset-2"
            >
              info@pferdeliebehealthy.de
            </a>
            . Ich schalte dich dann von Hand frei, meistens noch am selben Tag.
          </p>
        </div>
      </section>

      {/* ▸ DIE DREI ABSCHNITTE, DIE ALLE VERKAUFSSEITEN TRAGEN.
          Sie stecken in components/Verkaufsseite.tsx, und diese Seite hier
          benutzt die Vorlage nicht -- deshalb stehen sie einzeln da. Wer an
          einem davon etwas aendert, aendert es in der Komponente, nicht hier.

          Reihenfolge mit Absicht: erst die Fragen wegraeumen, die vom Kauf
          abhalten, dann sagen andere etwas ueber das Angebot, dann stellt
          sich Yasemin vor, dann kommt der Knopf. */}
      <Kauffragen produkt={produkt} />
      <Stimmen slug="ganzjahresfutterplan" />
      <WerDahinterSteht />

      {/* --------------------------------------------------------- Abschluss */}
      <section className="bg-ink px-6 py-16 text-cream sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-6 font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
            Ganzheitlich füttern. Gesund begleiten.
          </h2>

          <p className="mb-8 text-[17px] leading-relaxed text-cream/80">
            Zwölf Monate, die schon durchdacht sind. Du musst nur noch
            nachsehen, was dran ist.
          </p>

          <Kaufknopf hell />
        </div>
      </section>
    </main>
  );
}
