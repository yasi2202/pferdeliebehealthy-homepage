import type { Metadata } from "next";
import Link from "next/link";
import ProduktKarte from "@/components/ProduktKarte";
import { kategorien, produkte, versandhinweis } from "@/lib/shop";
import { url } from "@/lib/seo";

export const metadata: Metadata = {
  alternates: { canonical: "/shop" },
  title: "Shop | Pferdeliebehealthy",
  description:
    "Pferdeliebe Pure, Moventa und der Kaltlaser für Pferde. Ergänzungsfutter ohne synthetische Zusätze, direkt von mir.",
  openGraph: {
    title: "Shop | Pferdeliebehealthy",
    description:
      "Ergänzungsfutter ohne synthetische Zusätze, dazu Zubehör.",
    url: "/shop",
    images: [{ url: "/images/shop/pure-1.jpeg" }],
  },
};

export default function ShopSeite() {
  return (
    <main className="px-6 py-14 sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <span className="mb-4 block text-[13px] font-semibold uppercase tracking-[0.14em] text-rose-deep">
            Shop
          </span>

          {/* Überschrift und Einleitung wie im alten Shop: dort heisst die
              Seite schlicht „Shop", der Seitentitel lautet „Natürliche
              Pferdefütterung Produkte bei pferdeliebe healthy". */}
          <h1 className="mb-5 font-serif text-[32px] font-normal leading-[1.12] tracking-tight sm:text-[46px]">
            Natürliche Pferdefütterung
          </h1>

          <p className="text-[17px] text-ink-soft">
            Ergänzungsfuttermittel ohne synthetische Zusätze, dazu Zubehör für
            die tägliche Arbeit mit deinem Pferd.
          </p>
        </div>

        {kategorien.map((k) => {
          const dieser = produkte.filter((p) => p.kategorie === k.schluessel);

          if (dieser.length === 0) {
            return null;
          }

          return (
            <section key={k.schluessel} className="mt-14 sm:mt-16">
              <h2 className="mb-6 font-serif text-[24px] sm:text-[28px]">
                {k.name}
              </h2>

              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {dieser.map((p) => (
                  <ProduktKarte key={p.slug} produkt={p} />
                ))}
              </ul>
            </section>
          );
        })}

        {/* Der Hinweis, den jede Seite mit Futtermitteln braucht. Er steht
            bewusst am Ende und nicht als Warnkasten oben: Wer hier kauft,
            weiss in aller Regel, was ein Ergänzungsfuttermittel ist. */}
        <div className="mt-16 max-w-3xl rounded-[18px] bg-cream-deep p-6 sm:p-7">
          <h2 className="font-serif text-[19px]">Gut zu wissen</h2>

          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            Alle Preise verstehen sich inklusive Mehrwertsteuer und zuzüglich
            Versandkosten. {versandhinweis} Ergänzungsfuttermittel sind kein
            Arzneimittel. Sie ersetzen weder eine tierärztliche Behandlung noch
            eine bedarfsgerechte Grundration aus Heu und Weide. Wenn du unsicher
            bist, ob etwas zu deinem Pferd passt, mach lieber erst den{" "}
            <Link
              href="/futter-check"
              className="text-rose-deep underline underline-offset-4 hover:text-ink"
            >
              Futter-Check
            </Link>
            .
          </p>

          <p className="mt-3 text-[14px] leading-relaxed text-ink-soft">
            Alles zu Bezahlung, Lieferzeiten und Rückgabe steht auf der Seite{" "}
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

      {/* Sagt Google, dass hier eine Produktliste steht. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Shop von Pferdeliebehealthy",
            itemListElement: produkte.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: url(`/shop/${p.slug}`),
              name: p.name,
            })),
          }),
        }}
      />
    </main>
  );
}
