import Image from "next/image";
import Link from "next/link";
import { preisText } from "@/lib/shop";
import type { DigitalProdukt } from "@/lib/digital";
import type { Verkaufstext } from "@/lib/verkaufstexte";

// ---------------------------------------------------------------------------
// Die gemeinsame Bauweise aller Produktseiten.
//
// ▸ WARUM EINE GEMEINSAME KOMPONENTE UND NICHT SIEBEN EIGENE SEITEN
//   Sieben handgeschriebene Seiten sehen nach kurzer Zeit sieben verschieden
//   aus, weil man beim Bauen der fünften vergisst, wie die zweite aufgebaut
//   war. Und eine Verbesserung, die einem später einfällt, müsste man
//   siebenmal nachziehen. Hier reicht eine Stelle.
//
//   Die Texte selbst stehen in lib/verkaufstexte.ts und sind je Produkt
//   verschieden. Gleich ist nur das Gerüst.
//
// ▸ MINERAL-KLARHEIT BENUTZT DIESE KOMPONENTE NICHT.
//   Diese Seite gab es vorher schon und sie ist von Hand geschrieben. Sie
//   nachträglich in die Vorlage zu pressen hätte sie schlechter gemacht,
//   ohne dass jemand etwas davon hat.
//
// ▸ DER PREIS KOMMT AUS lib/digital.ts, nie aus dem Text. Sonst nennt die
//   Verkaufsseite irgendwann einen anderen Betrag als die Kasse.
// ---------------------------------------------------------------------------

export default function Verkaufsseite({
  produkt,
  text,
}: {
  produkt: DigitalProdukt;
  text: Verkaufstext;
}) {
  const kasse = `/kasse/${produkt.slug}`;
  const rabatt = produkt.statt && produkt.statt > produkt.preis;

  return (
    <main>
      {/* ------------------------------------------------------------- Kopf */}
      <section className="bg-ink px-6 py-16 text-cream sm:px-8 sm:py-24">
        <div className="mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <div>
            <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose">
              {text.augenbraue}
            </span>

            <h1 className="mb-6 font-serif text-[34px] font-normal leading-[1.1] tracking-tight sm:text-[50px]">
              {text.ueberschrift}
            </h1>

            {text.einleitung.map((absatz, i) => (
              <p
                key={i}
                className={
                  i === 0
                    ? "mb-4 max-w-xl text-[18px] leading-relaxed text-cream/90 sm:text-[19px]"
                    : "mb-8 max-w-xl text-[16px] leading-relaxed text-cream/70"
                }
              >
                {absatz}
              </p>
            ))}

            <div className="flex flex-wrap items-center gap-5">
              <Link
                href={kasse}
                className="inline-block rounded-full bg-rose px-8 py-4 text-[15px] font-medium text-ink transition-colors hover:bg-cream"
              >
                Für {preisText(produkt.preis)} freischalten
              </Link>

              {/* Der frühere Preis gehört neben den Knopf, nicht erst ganz
                  unten. Wer oben abspringt, hat sonst nie erfahren, dass es
                  gerade günstiger ist. */}
              <span className="text-[14px] text-cream/60">
                {rabatt && (
                  <>
                    <span className="line-through">
                      {preisText(produkt.statt!)}
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
              className="h-auto w-full rounded-[24px]"
            />
          </div>
        </div>
      </section>

      {/* ----------------------------------------------------- Das Problem */}
      <section className="px-6 py-16 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-2xl">
          <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
            {text.problemAugenbraue}
          </span>

          <h2 className="mb-6 font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
            {text.problemTitel}
          </h2>

          <div className="space-y-4 text-[16.5px] leading-relaxed text-ink-soft">
            {text.problem.map((absatz, i) => (
              <p key={i}>{absatz}</p>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------- Der Inhalt */}
      <section className="px-6 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 max-w-2xl">
            <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
              {text.inhaltAugenbraue}
            </span>
            <h2 className="font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
              {text.inhaltTitel}
            </h2>
          </div>

          <ul className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {text.inhalte.map((i) => (
              <li
                key={i.titel}
                className="rounded-[18px] border border-line bg-white p-7"
              >
                <h3 className="mb-3 font-serif text-[20px] leading-snug">
                  {i.titel}
                </h3>
                <p className="text-[14.5px] leading-relaxed text-ink-soft">
                  {i.text}
                </p>
              </li>
            ))}
          </ul>

          {text.inhaltSchluss && (
            <p className="mt-8 max-w-2xl text-[15px] leading-relaxed text-ink-soft">
              {text.inhaltSchluss}
            </p>
          )}
        </div>
      </section>

      {/* ---------------------------------------------------- Einblicke */}
      {/* Nur bei Produkten, von denen es etwas zu sehen gibt. Bei einem
          E-Book wären Bildschirmfotos nichtssagend, deshalb fehlt der
          Abschnitt dort ganz, statt mit Platzhaltern gefüllt zu werden. */}
      {text.einblicke && text.einblicke.length > 0 && (
        <section className="px-6 pb-16 sm:px-8 sm:pb-24">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 max-w-2xl">
              <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
                Ein Blick hinein
              </span>
              <h2 className="mb-5 font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
                {text.einblickTitel ?? "So sieht es von innen aus."}
              </h2>
              {text.einblickText && (
                <p className="text-[16.5px] leading-relaxed text-ink-soft">
                  {text.einblickText}
                </p>
              )}
            </div>

            <div className="space-y-10">
              {text.einblicke.map((e) => (
                <figure key={e.datei}>
                  <Image
                    src={`/images/${produkt.slug}/${e.datei}`}
                    alt={e.alt}
                    width={1100}
                    height={820}
                    sizes="(min-width: 1024px) 900px, 100vw"
                    className="h-auto w-full rounded-[18px] border border-line"
                  />
                  <figcaption className="mt-3 max-w-2xl text-[14.5px] leading-relaxed text-ink-soft">
                    {e.text}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ------------------------------------------------------------ Für wen */}
      {/* ▸ DER WICHTIGSTE ABSCHNITT, und der, den die meisten weglassen.
          Der letzte Punkt sagt ausdrücklich, für wen das Produkt NICHT ist.
          Das verkauft mehr, nicht weniger: Es nimmt die Sorge, an das
          Falsche zu geraten, und erspart dir Erstattungen und verärgerte
          Mails von Leuten, die etwas anderes erwartet haben. */}
      <section className="px-6 pb-16 sm:px-8 sm:pb-24">
        <div className="mx-auto max-w-5xl rounded-[24px] bg-cream-deep p-8 sm:p-12">
          <div className="max-w-2xl">
            <h2 className="mb-6 font-serif text-[26px] font-normal leading-[1.15] tracking-tight sm:text-[34px]">
              {text.fuerWenTitel}
            </h2>

            <div className="space-y-4 text-[16px] leading-relaxed text-ink-soft">
              {text.fuerWen.map((absatz, i) => {
                // Der letzte Absatz beginnt mit "Nicht für dich". Das erste
                // Wort wird hervorgehoben, sonst überliest man die Verneinung
                // und versteht das Gegenteil.
                const verneint = absatz.startsWith("Nicht ");

                return (
                  <p key={i}>
                    {verneint ? (
                      <>
                        <strong className="text-ink">Nicht</strong>
                        {absatz.slice("Nicht".length)}
                      </>
                    ) : (
                      absatz
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------------- Abschluss */}
      <section className="px-6 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-5xl rounded-[24px] bg-rose-deep p-8 text-cream sm:p-12">
          <div className="max-w-xl">
            <h2 className="mb-5 font-serif text-[26px] font-normal leading-[1.15] tracking-tight sm:text-[34px]">
              {rabatt ? (
                <>
                  {preisText(produkt.preis)} statt {preisText(produkt.statt!)}
                </>
              ) : (
                text.abschlussTitel
              )}
            </h2>

            <p className="mb-8 text-[16px] leading-relaxed text-cream/85">
              {text.abschlussText}
            </p>

            <Link
              href={kasse}
              className="inline-block rounded-full bg-cream px-8 py-4 text-[15px] font-medium text-ink transition-colors hover:bg-rose"
            >
              Jetzt freischalten
            </Link>

            <p className="mt-4 text-[13px] text-cream/65">
              Einmalig, kein Abo. Nach dem Kauf bekommst du deinen Zugang
              direkt per Mail.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
