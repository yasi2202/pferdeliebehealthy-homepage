import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProduktBilder from "@/components/ProduktBilder";
import InDenWarenkorb from "@/components/InDenWarenkorb";
import ProduktKarte from "@/components/ProduktKarte";
import {
  preisText,
  produkte,
  produktFinden,
  versandhinweis,
} from "@/lib/shop";
import { url } from "@/lib/seo";

// Alle Produktseiten werden beim Bauen fertig erzeugt. Sie ändern sich nur,
// wenn lib/shop.ts geändert wird -- es gibt also nichts, was zur Laufzeit
// nachgeladen werden müsste.
export function generateStaticParams() {
  return produkte.map((p) => ({ slug: p.slug }));
}

type Eigenschaften = { params: Promise<{ slug: string }> };

export async function generateMetadata({
  params,
}: Eigenschaften): Promise<Metadata> {
  const { slug } = await params;
  const produkt = produktFinden(slug);

  if (!produkt) {
    return { title: "Nicht gefunden" };
  }

  return {
    alternates: { canonical: `/shop/${produkt.slug}` },
    title: produkt.name,
    description: produkt.kurz,
    openGraph: {
      type: "website",
      title: produkt.name,
      description: produkt.kurz,
      url: `/shop/${produkt.slug}`,
      ...(produkt.bilder[0] ? { images: [{ url: produkt.bilder[0].datei }] } : {}),
    },
  };
}

export default async function ProduktSeite({ params }: Eigenschaften) {
  const { slug } = await params;
  const produkt = produktFinden(slug);

  if (!produkt) {
    notFound();
  }

  const weitere = produkte.filter((p) => p.slug !== produkt.slug).slice(0, 3);

  return (
    <main className="px-6 py-10 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Sie sind hier" className="mb-8 text-[13.5px] text-ink-soft">
          <Link href="/shop" className="hover:text-ink">
            Shop
          </Link>
          <span className="mx-2">/</span>
          <span>{produkt.kurzname}</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          <ProduktBilder bilder={produkt.bilder} name={produkt.name} />

          <div>
            <h1 className="font-serif text-[28px] font-normal leading-[1.15] tracking-tight sm:text-[38px]">
              {produkt.name}
            </h1>

            <div className="mt-5 flex items-baseline gap-3">
              <span className="font-serif text-[30px] tabular-nums">
                {preisText(produkt.preis)}
              </span>

              {produkt.statt && (
                <span className="text-[17px] text-ink-soft line-through tabular-nums">
                  {preisText(produkt.statt)}
                </span>
              )}
            </div>

            <p className="mt-1.5 text-[13px] text-ink-soft">
              Inklusive Mehrwertsteuer, zuzüglich{" "}
              <Link
                href="/zahlung-und-versand"
                className="underline underline-offset-4 hover:text-ink"
              >
                Versandkosten
              </Link>
              {produkt.grundpreis && ` · ${produkt.grundpreis}`}
              {produkt.inhalt && ` · ${produkt.inhalt}`}
            </p>

            <div className="mt-7">
              <InDenWarenkorb produkt={produkt} />
            </div>

            <p className="mt-4 text-[13px] text-ink-soft">
              Lieferzeit: {produkt.lieferzeit}. {versandhinweis}
            </p>

            {/* Die Beschreibung, Baustein für Baustein in der Gliederung des
                alten Shops: Absätze, Zwischenüberschriften, Listen. */}
            <div className="mt-8 border-t border-line pt-8">
              {produkt.beschreibung.map((block, i) => {
                if (block.art === "ueberschrift") {
                  return (
                    <h2
                      key={i}
                      className="mb-3 mt-7 font-serif text-[20px] first:mt-0"
                    >
                      {block.text}
                    </h2>
                  );
                }

                if (block.art === "liste") {
                  return (
                    <ul key={i} className="mb-5 mt-1 space-y-2">
                      {block.punkte.map((punkt) => (
                        <li key={punkt} className="flex gap-3 text-[15.5px]">
                          <span aria-hidden="true" className="text-rose-deep">
                            &bull;
                          </span>
                          <span>{punkt}</span>
                        </li>
                      ))}
                    </ul>
                  );
                }

                return (
                  <p
                    key={i}
                    className={`mb-4 text-[16px] leading-relaxed last:mb-0 ${
                      block.betont ? "font-medium" : ""
                    }`}
                  >
                    {block.text}
                  </p>
                );
              })}
            </div>

            {produkt.angaben && (
              <div className="mt-8 border-t border-line">
                {produkt.angaben.map((a) => (
                  <details
                    key={a.titel}
                    className="group border-b border-line py-4"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between font-serif text-[17px] marker:content-none">
                      {a.titel}

                      <span
                        aria-hidden="true"
                        className="text-[20px] font-light text-ink-soft transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>

                    <p className="mt-3 whitespace-pre-line text-[14.5px] leading-relaxed text-ink-soft">
                      {a.text}
                    </p>
                  </details>
                ))}
              </div>
            )}

          </div>
        </div>

        {weitere.length > 0 && (
          <section className="mt-20 border-t border-line pt-12">
            <h2 className="mb-6 font-serif text-[24px] sm:text-[28px]">
              Vielleicht auch etwas für dich
            </h2>

            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {weitere.map((p) => (
                <ProduktKarte key={p.slug} produkt={p} />
              ))}
            </ul>
          </section>
        )}
      </div>

      {/* Produktdaten für Google. Damit kann in den Suchergebnissen der Preis
          und die Verfügbarkeit direkt unter dem Treffer stehen. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: produkt.name,
            description: produkt.kurz,
            ...(produkt.bilder.length > 0
              ? { image: produkt.bilder.map((b) => url(b.datei)) }
              : {}),
            brand: { "@type": "Brand", name: "Pferdeliebehealthy" },
            offers: {
              "@type": "Offer",
              url: url(`/shop/${produkt.slug}`),
              priceCurrency: "EUR",
              price: (produkt.preis / 100).toFixed(2),
              availability: produkt.vorraetig
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              seller: { "@type": "Organization", name: "Pferdeliebehealthy" },
            },
          }),
        }}
      />
    </main>
  );
}
