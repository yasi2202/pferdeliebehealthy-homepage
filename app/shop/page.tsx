import type { Metadata } from "next";
import Link from "next/link";
import ProduktKarte from "@/components/ProduktKarte";
import { kategorien, produkte, shopSichtbar, versandhinweis } from "@/lib/shop";
import { digitalprodukte, type DigitalProdukt } from "@/lib/digital";
import { preisText } from "@/lib/shop";
import { url } from "@/lib/seo";

// ---------------------------------------------------------------------------
// Der Shop: alles, was es zu kaufen gibt.
//
// ▸ WAS SICH AM 01.09.2026 GEÄNDERT HAT
//   Vorher standen hier nur die drei Futtermittel. Die elf digitalen Angebote
//   hatten zwar Verkaufsseiten, waren aber nirgends verlinkt: Wer nicht über
//   Google kam, fand sie nicht. Jetzt stehen sie hier oben, und ein Klick auf
//   eine Kachel führt auf die zugehörige Seite.
//
// ▸ WARUM DIE DIGITALEN OBEN STEHEN
//   Sie sind das, was Yasemin verkauft. Die Futtermittel sind ein Zusatz, und
//   sie sind zurzeit ohnehin ausgeblendet, weil der alte WooCommerce-Shop
//   noch läuft. Der Schalter dafür ist `shopSichtbar` in lib/shop.ts.
//
// ▸ WARUM NACH THEMA GRUPPIERT UND NICHT NUR NACH PREIS
//   Elf Angebote in einer Reihe sind eine Liste, aus der man aussteigt. Wer
//   ein Nachschlagewerk sucht, sucht nicht in den Kursen, und wer klein
//   anfangen will, will nicht zuerst die Ausbildung sehen. Innerhalb jeder
//   Gruppe steht das günstigste oben.
//
// ▸ ALLES KOMMT AUS lib/digital.ts UND lib/shop.ts. Ein neues Produkt
//   erscheint hier von selbst, sobald es dort steht. Es gibt keine zweite
//   Liste, die man vergessen könnte.
// ---------------------------------------------------------------------------

const TITEL = "Shop: Kurse, Werkzeuge und Futtermittel für dein Pferd";
const BESCHREIBUNG =
  "Vom kleinen Ratgeber bis zur Ausbildung: Kurse, Werkzeuge und persönliche Begleitung rund um die natürliche Fütterung deines Pferdes.";

export const metadata: Metadata = {
  alternates: { canonical: "/shop" },
  title: TITEL,
  description: BESCHREIBUNG,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Pferdeliebehealthy",
    title: `${TITEL} | Pferdeliebehealthy`,
    description: BESCHREIBUNG,
    url: "/shop",
    images: [{ url: "/images/yasi-helena.jpg", width: 1122, height: 1402 }],
  },
};

const gruppen = [
  {
    schluessel: "einstieg" as const,
    titel: "Zum Einstieg",
    text: "Kurze Hefte zu einer einzelnen Frage. Schnell gelesen, sofort umsetzbar.",
  },
  {
    schluessel: "kurs" as const,
    titel: "Kurse",
    text: "Wenn du ein Thema wirklich verstehen willst, statt einer Empfehlung zu folgen.",
  },
  {
    schluessel: "werkzeug" as const,
    titel: "Werkzeuge",
    text: "Anwendungen, die du immer wieder benutzt. Einmal zahlen, dauerhaft nutzen.",
  },
  {
    schluessel: "begleitung" as const,
    titel: "Persönliche Begleitung",
    text: "Wenn du nicht allein arbeiten, sondern begleitet werden möchtest.",
  },
];

/** Ob ein Angebot noch nicht buchbar ist. Siehe `verkaufAb` in digital.ts. */
function nochNicht(p: DigitalProdukt): Date | null {
  if (!p.verkaufAb) return null;
  const start = new Date(`${p.verkaufAb}T00:00:00+02:00`);
  return new Date() < start ? start : null;
}

function DigitalKarte({ p }: { p: DigitalProdukt }) {
  const start = nochNicht(p);
  const rabatt = p.statt && p.statt > p.preis;

  return (
    <li>
      <Link
        href={`/${p.slug}`}
        className="flex h-full flex-col rounded-[18px] border border-line bg-white p-7 transition-colors hover:border-rose-deep"
      >
        <h3 className="mb-2 font-serif text-[21px] leading-snug">
          {p.kurzname}
        </h3>

        <p className="mb-5 flex-grow text-[14.5px] leading-relaxed text-ink-soft">
          {p.kurz}
        </p>

        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          {rabatt && (
            <span className="text-[14px] text-ink-soft line-through tabular-nums">
              {preisText(p.statt!)}
            </span>
          )}
          <span className="font-serif text-[22px] tabular-nums">
            {preisText(p.preis)}
          </span>

          {/* Ein Angebot, das noch nicht buchbar ist, gehört trotzdem in die
              Übersicht: Es baut Vorfreude auf. Verschwiegen werden darf der
              Starttermin aber nicht, sonst klickt jemand und stößt an der
              Kasse auf eine Absage. */}
          {start && (
            <span className="text-[13.5px] text-rose-deep">
              ab {start.toLocaleDateString("de-DE")}
            </span>
          )}
        </div>
      </Link>
    </li>
  );
}

export default function ShopSeite() {
  return (
    <main>
      {/* ------------------------------------------------------------- Kopf */}
      <section className="bg-ink px-6 py-16 text-cream sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose">
            Shop
          </span>

          <h1 className="mb-6 max-w-3xl font-serif text-[34px] font-normal leading-[1.1] tracking-tight sm:text-[46px]">
            Such dir aus, wo du anfangen willst.
          </h1>

          <p className="max-w-2xl text-[17px] leading-relaxed text-cream/80 sm:text-[18px]">
            Du musst nicht mit dem Größten beginnen. Die meisten fangen mit
            einem Heft für acht Euro an und merken dabei, welche Frage sie
            eigentlich beschäftigt.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ Digitale Angebote */}
      {gruppen.map((g) => {
        const dieser = digitalprodukte
          .filter((p) => p.gruppe === g.schluessel)
          .sort((a, b) => a.preis - b.preis);

        if (dieser.length === 0) return null;

        return (
          <section key={g.schluessel} className="px-6 py-14 sm:px-8 sm:py-16">
            <div className="mx-auto max-w-6xl">
              <div className="mb-8 max-w-2xl">
                <h2 className="mb-3 font-serif text-[26px] font-normal leading-[1.15] tracking-tight sm:text-[32px]">
                  {g.titel}
                </h2>
                <p className="text-[16px] leading-relaxed text-ink-soft">
                  {g.text}
                </p>
              </div>

              <ul className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                {dieser.map((p) => (
                  <DigitalKarte key={p.slug} p={p} />
                ))}
              </ul>
            </div>
          </section>
        );
      })}

      {/* ---------------------------------------------------- Futtermittel */}
      {/* Nur, wenn der Futtershop freigeschaltet ist. Solange der alte
          WooCommerce-Shop noch läuft, wären es zwei Shops mit getrennten
          Beständen. Der Schalter sitzt in lib/shop.ts. */}
      {shopSichtbar && (
        <>
          {kategorien.map((k) => {
            const dieser = produkte.filter((p) => p.kategorie === k.schluessel);

            if (dieser.length === 0) return null;

            return (
              <section
                key={k.schluessel}
                className="px-6 py-14 sm:px-8 sm:py-16"
              >
                <div className="mx-auto max-w-6xl">
                  <h2 className="mb-8 font-serif text-[26px] font-normal leading-[1.15] tracking-tight sm:text-[32px]">
                    {k.name}
                  </h2>

                  <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {dieser.map((p) => (
                      <ProduktKarte key={p.slug} produkt={p} />
                    ))}
                  </ul>
                </div>
              </section>
            );
          })}

          <section className="px-6 pb-14 sm:px-8">
            <div className="mx-auto max-w-6xl">
              <div className="max-w-3xl rounded-[18px] bg-cream-deep p-6 sm:p-7">
                <h2 className="font-serif text-[19px]">Gut zu wissen</h2>

                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  Alle Preise verstehen sich inklusive Mehrwertsteuer und
                  zuzüglich Versandkosten. {versandhinweis}{" "}
                  Ergänzungsfuttermittel sind kein Arzneimittel. Sie ersetzen
                  weder eine tierärztliche Behandlung noch eine
                  bedarfsgerechte Grundration aus Heu und Weide. Wenn du
                  unsicher bist, ob etwas zu deinem Pferd passt, mach lieber
                  erst den{" "}
                  <Link
                    href="/futter-check"
                    className="text-rose-deep underline underline-offset-4 hover:text-ink"
                  >
                    Futter-Check
                  </Link>
                  .
                </p>

                <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
                  Alles zu Bezahlung, Lieferzeiten und Rückgabe steht auf der
                  Seite{" "}
                  <Link
                    href="/zahlung-und-versand"
                    className="text-rose-deep underline underline-offset-4 hover:text-ink"
                  >
                    Zahlung und Versand
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>
        </>
      )}

      {/* ------------------------------------------------------- Was fehlt */}
      {/* Der Insider kostet nichts und taucht deshalb in keiner Preisgruppe
          auf. Ihn ganz zu verschweigen wäre trotzdem schade. */}
      <section className="px-6 pb-20 sm:px-8 sm:pb-28">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-[24px] bg-cream-deep p-8 sm:p-12">
            <div className="max-w-2xl">
              <h2 className="mb-4 font-serif text-[24px] font-normal leading-[1.15] tracking-tight sm:text-[30px]">
                Und etwas, das nichts kostet.
              </h2>

              <p className="mb-6 text-[16px] leading-relaxed text-ink-soft">
                Der Pferdeliebe Insider ist mein kostenloser Kanal: regelmäßig
                ein Thema aus der Praxis, was in echten Rationen schiefgeht,
                Zusatzfutter ehrlich eingeordnet, Laborwerte lesen lernen.
                Dazu jeden Monat eine Empfehlung mit Rabattcode.
              </p>

              <Link
                href="/insider"
                className="inline-block rounded-full bg-ink px-7 py-3.5 text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep"
              >
                Insider werden
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sagt Google, dass hier eine Produktliste steht. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Shop von Pferdeliebehealthy",
            itemListElement: [
              ...digitalprodukte.map((p, i) => ({
                "@type": "ListItem",
                position: i + 1,
                url: url(`/${p.slug}`),
                name: p.name,
              })),
              ...(shopSichtbar
                ? produkte.map((p, i) => ({
                    "@type": "ListItem",
                    position: digitalprodukte.length + i + 1,
                    url: url(`/shop/${p.slug}`),
                    name: p.name,
                  }))
                : []),
            ],
          }),
        }}
      />
    </main>
  );
}
