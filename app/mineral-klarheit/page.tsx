import type { Metadata } from "next";
import Image from "next/image";
import { mineralKlarheit } from "@/lib/seite";
import { digitalFinden } from "@/lib/digital";
import { preisText } from "@/lib/shop";

// ---------------------------------------------------------------------------
// Die Seite zu Mineral-Klarheit.
//
// Sie ist zweierlei: das Angebot, auf das der Futter-Check hinausläuft, und
// eine ganz normale Seite, die bei Google gefunden werden kann. Deshalb steht
// sie auf deiner eigenen Adresse und nicht nur als Link zu alfima.
//
// ▸ SEIT DEM 01.09.2026 WIRD AUCH HIER GEKAUFT. Vorher führten die Knöpfe
//   direkt in den Kaufvorgang bei alfima. Jetzt gehen sie auf
//   /kasse/mineral-klarheit, wo Preis, Rabattfeld und die Pflichthinweise
//   stehen, und Stripe kommt erst danach.
//
// ▸ PREIS UND STREICHPREIS STEHEN IM KATALOG, in lib/digital.ts. Stünden sie
//   zusätzlich hier, nennte diese Seite irgendwann einen anderen Betrag als
//   die Kasse, und das fällt niemandem auf, bis sich jemand beschwert.
//
// Die Texte über den Kursinhalt stammen aus deiner eigenen Kursbeschreibung in
// der Akademie, damit hier nichts versprochen wird, was der Kurs nicht hält.
// ---------------------------------------------------------------------------

// Preis und Streichpreis stehen im Katalog, nicht hier. So kann die
// Verkaufsseite gar nicht erst einen anderen Betrag nennen als die Kasse.
const produkt = digitalFinden("mineral-klarheit")!;

const TITEL = "Mineral-Klarheit: verstehen, ob das Mineralfutter zu deinem Pferd passt";
// Der Preis steht auch hier, weil Google ihn im Suchergebnis anzeigt. Er
// wird aus dem Katalog gebaut, damit er nicht irgendwann veraltet dasteht.
const BESCHREIBUNG =
  "Der Kurs mit Rechner: Du liest eine Deklaration nicht mehr nur, du verstehst sie, und rechnest selbst durch, ob ein Mineralfutter zu deinem Pferd passt. " +
  `Zurzeit ${(produkt.preis / 100).toFixed(0)} € statt ${(produkt.statt! / 100).toFixed(0)} €, dauerhafter Zugang.`;

export const metadata: Metadata = {
  alternates: { canonical: "/mineral-klarheit" },
  title: TITEL,
  description: BESCHREIBUNG,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Pferdeliebehealthy",
    title: `${TITEL} | Pferdeliebehealthy`,
    description: BESCHREIBUNG,
    url: "/mineral-klarheit",
    images: [{ url: "/images/yasi-helena.jpg", width: 1122, height: 1402 }],
  },
};

const inhalte = [
  {
    titel: "Was ein Mineralstoff im Körper wirklich tut",
    text: "Nährstoff für Nährstoff: Mengenelemente, Spurenelemente, Vitamine. Und welche Anzeichen im Alltag auf einen Mangel oder eine Überversorgung hindeuten.",
  },
  {
    titel: "Eine Deklaration lesen und verstehen",
    text: "Was die Zahl pro Kilogramm für die tatsächliche Tagesration deines Pferdes bedeutet, welche Bindungsform dahintersteht, und was das für die Aufnahme heißt.",
  },
  {
    titel: "Dein Mineralfutter selbst durchrechnen",
    text: "Mit den echten Daten deines Pferdes statt mit der pauschalen Empfehlung von der Verpackung, für das, was du jetzt fütterst, und für jedes, das du in Betracht ziehst.",
  },
  {
    titel: "Ein Werkzeug, das bleibt",
    text: "Beim nächsten Futterwechsel, beim nächsten Pferd, bei der nächsten gesundheitlichen Veränderung rechnest du einfach neu.",
  },
];

const einblicke = [
  {
    datei: "rechner.webp",
    alt: "Der Mineralfutter-Eignungscheck im Kurs: Eingabefelder für Name, Lebensphase, Gewicht und Nutzung des Pferds",
    text: "Der Mineralfutter-Eignungscheck. Du legst für jedes Pferd ein Profil an, trägst Gewicht, Lebensphase und Arbeitslevel ein, wählst gesundheitliche Besonderheiten aus und kombinierst mehrere Futtermittel zu einer Ration. Das Ergebnis zeigt dir Lücken und Überschüsse, ohne dir ein Produkt zu empfehlen.",
  },
  {
    datei: "naehrstoffe.webp",
    alt: "Die Nährstoffübersicht im Kurs mit aufklappbaren Einträgen zu Calcium, Phosphor, Magnesium und Natrium",
    text: "Jeder Nährstoff einzeln, zum Aufklappen. Mengenelemente, Spurenelemente und Vitamine, dazu ein Verständnischeck und ein Zuordnungsspiel.",
  },
  {
    datei: "start.webp",
    alt: "Die Startseite des Kurses mit Überschrift, Einleitung und einer Tonaufnahme zum Anhören",
    text: "Zu vielen Abschnitten gibt es die Inhalte auch zum Anhören, wenn du lieber nebenher lernst.",
  },
];

export default function MineralKlarheitSeite() {
  return (
    <main>
      {/* ------------------------------------------------------------- Kopf */}
      <section className="bg-ink text-cream px-6 sm:px-8 py-16 sm:py-24">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <span className="block text-[13px] tracking-[0.14em] uppercase font-semibold mb-4 text-rose">
              Dein nächster Schritt
            </span>
            <h1 className="font-serif font-normal text-[34px] sm:text-[50px] leading-[1.1] tracking-tight mb-6">
              Mineral-Klarheit
            </h1>
            <p className="text-[18px] sm:text-[19px] text-cream/90 leading-relaxed mb-4 max-w-xl">
              Der Kurs, nach dem du nie wieder raten musst, ob ein Mineralfutter
              zu deinem Pferd passt. Du rechnest es selbst durch, mit den Daten
              deines Pferdes, nicht mit der Empfehlung von der Verpackung.
            </p>
            <p className="text-[16px] text-cream/70 leading-relaxed mb-8 max-w-xl">
              In deinem eigenen Tempo, mit dauerhaftem Zugang. Du kannst
              jederzeit zurückblättern, wenn sich bei deinem Pferd etwas ändert.
            </p>

            <div className="flex flex-wrap items-center gap-5">
              <a
                href={mineralKlarheit.kauf}
                className="inline-block bg-rose text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-cream transition-colors"
              >
                Für {preisText(produkt.preis)} freischalten
              </a>
              {/* Der frühere Preis gehört neben den Knopf, nicht erst ganz
                  unten auf der Seite. Wer oben abspringt, hat sonst nie
                  erfahren, dass es gerade günstiger ist. */}
              <span className="text-[14px] text-cream/60">
                {produkt.statt && produkt.statt > produkt.preis && (
                  <>
                    <span className="line-through">
                      {preisText(produkt.statt)}
                    </span>
                    {" · "}
                  </>
                )}
                Einmalig · dauerhafter Zugang
              </span>
            </div>
          </div>

          <div className="hidden lg:block">
            <Image
              src="/images/yasi-helena.jpg"
              alt="Yasemin Halac mit ihrer Stute Helena"
              width={1122}
              height={1402}
              priority
              sizes="(min-width: 1024px) 40vw, 0px"
              className="w-full h-auto rounded-[24px]"
            />
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Das Problem */}
      <section className="px-6 sm:px-8 py-16 sm:py-24">
        <div className="max-w-2xl mx-auto">
          <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
            Warum das nötig ist
          </span>
          <h2 className="font-serif font-normal text-[28px] sm:text-[38px] leading-[1.15] tracking-tight mb-6">
            Ein gutes Mineralfutter ist noch kein passendes.
          </h2>
          <div className="text-[16.5px] text-ink-soft leading-relaxed space-y-4">
            <p>
              Auf jedem Eimer stehen Zahlen, und auf jedem steht eine
              Fütterungsempfehlung. Beides sagt dir nichts darüber, ob ausgerechnet
              dein Pferd damit versorgt ist, ein 22-jähriger Wallach mit
              Stoffwechselthema und ein 6-jähriges Sportpferd bekommen dieselbe
              Empfehlung von derselben Verpackung.
            </p>
            <p>
              Genau da entsteht die Lücke, die der Futter-Check bei den meisten
              Pferden findet. Nicht, weil zu wenig gefüttert wird, sondern weil
              das Falsche gefüttert wird, in der falschen Menge, in einer Form,
              die das Pferd schlecht aufnimmt.
            </p>
            <p>
              Du kannst diese Frage an jemanden abgeben. Oder du lernst einmal,
              sie selbst zu beantworten, und musst sie nie wieder abgeben.
            </p>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Der Inhalt */}
      <section className="px-6 sm:px-8 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-12">
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Das lernst du
            </span>
            <h2 className="font-serif font-normal text-[28px] sm:text-[38px] leading-[1.15] tracking-tight">
              Vier Dinge, die danach anders sind.
            </h2>
          </div>

          <ul className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {inhalte.map((i) => (
              <li
                key={i.titel}
                className="bg-white rounded-[18px] border border-line p-7"
              >
                <h3 className="font-serif text-[20px] leading-snug mb-3">
                  {i.titel}
                </h3>
                <p className="text-[14.5px] text-ink-soft leading-relaxed">
                  {i.text}
                </p>
              </li>
            ))}
          </ul>

          <p className="text-[15px] text-ink-soft leading-relaxed mt-8 max-w-2xl">
            Am Ende geht es nicht darum, alle Zahlen auswendig zu können. Es geht
            darum, dass du nie wieder raten musst, ob ein Mineralfutter zu deinem
            Pferd passt.
          </p>
        </div>
      </section>

      {/* ----------------------------------------------------- Einblick */}
      {/* Bildschirmfotos aus dem Kurs selbst. Sie beantworten die Frage, die
          jede Beschreibung offen lässt: Wie sieht das eigentlich aus, was ich
          da kaufe. Besonders der Rechner verkauft sich schlecht mit Worten
          und gut mit einem Bild.

          Die Bilder sind echte Aufnahmen aus dem Kurs, keine Montagen. Wenn
          sich der Kurs ändert, müssen sie neu gemacht werden, sonst zeigen
          sie etwas, das es nicht mehr gibt. */}
      <section className="px-6 sm:px-8 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto">
          <div className="max-w-2xl mb-10">
            <span className="block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Ein Blick hinein
            </span>
            <h2 className="font-serif font-normal text-[28px] sm:text-[38px] leading-[1.15] tracking-tight mb-5">
              So sieht der Kurs von innen aus.
            </h2>
            <p className="text-[16.5px] text-ink-soft leading-relaxed">
              Vierzehn Abschnitte, die du in beliebiger Reihenfolge angehen
              kannst. Links siehst du immer, wo du stehst, und kannst jederzeit
              direkt zum Werkzeug springen.
            </p>
          </div>

          <div className="space-y-10">
            {einblicke.map((e) => (
              <figure key={e.datei}>
                <Image
                  src={`/images/mineral-klarheit/${e.datei}`}
                  alt={e.alt}
                  width={1100}
                  height={820}
                  sizes="(min-width: 1024px) 900px, 100vw"
                  className="w-full h-auto rounded-[18px] border border-line"
                />
                <figcaption className="mt-3 text-[14.5px] text-ink-soft leading-relaxed max-w-2xl">
                  {e.text}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------ Für wen */}
      <section className="px-6 sm:px-8 pb-16 sm:pb-24">
        <div className="max-w-5xl mx-auto bg-cream-deep rounded-[24px] p-8 sm:p-12">
          <div className="max-w-2xl">
            <h2 className="font-serif font-normal text-[26px] sm:text-[34px] leading-[1.15] tracking-tight mb-6">
              Für wen der Kurs gemacht ist
            </h2>
            <div className="text-[16px] text-ink-soft leading-relaxed space-y-4">
              <p>
                Für dich, wenn dein Futter-Check gezeigt hat, dass bei der
                Mineralversorgung eine Lücke sitzt, egal ob du bisher gar kein
                Mineralfutter fütterst oder eines, bei dem du nicht sicher bist.
              </p>
              <p>
                Für dich, wenn du gern selbst verstehst, statt Empfehlungen zu
                folgen. Der Kurs nimmt dir das Rechnen nicht ab, er bringt es dir
                bei, das ist der Unterschied zu einer Beratung.
              </p>
              <p>
                <strong className="text-ink">Nicht</strong> für dich, wenn du
                gerade akut ein krankes Pferd hast und schnell eine konkrete
                Ration brauchst. Dann schreib mir lieber direkt, dafür gibt es
                die Futterberatung 365.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Abschluss */}
      <section className="px-6 sm:px-8 pb-20 sm:pb-28">
        <div className="max-w-5xl mx-auto bg-rose-deep text-cream rounded-[24px] p-8 sm:p-12">
          <div className="max-w-xl">
            <h2 className="font-serif font-normal text-[26px] sm:text-[34px] leading-[1.15] tracking-tight mb-5">
              {preisText(produkt.preis)} statt {preisText(produkt.statt!)}
            </h2>
            <p className="text-[16px] text-cream/85 leading-relaxed mb-8">
              Weniger als ein Eimer Mineralfutter, den du vielleicht gar nicht
              gebraucht hättest. Der Zugang bleibt dir, auch wenn du erst in
              einem halben Jahr dazu kommst.
            </p>
            <a
              href={mineralKlarheit.kauf}
              className="inline-block bg-cream text-ink px-8 py-4 rounded-full text-[15px] font-medium hover:bg-rose transition-colors"
            >
              Jetzt freischalten
            </a>
            <p className="text-[13px] text-cream/65 mt-4">
              Einmalig, kein Abo. Nach dem Kauf bekommst du deinen Zugang
              direkt per Mail.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
