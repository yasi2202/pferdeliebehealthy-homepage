import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  alleBlogBeitraege,
  blogBeitragLesen,
  verwandteBeitraege,
  datumDeutsch,
} from "@/lib/blog";
import { url } from "@/lib/seo";
import { insider } from "@/lib/insider";
import InsiderFormular from "@/components/InsiderFormular";
import NurFuerNichtInsider from "@/components/NurFuerNichtInsider";
import { angebotshinweisFinden } from "@/lib/angebote";

type Props = { params: Promise<{ slug: string }> };

/** Sorgt dafür, dass jeder Beitrag beim Bauen als fertige Seite entsteht.
 *  Anders als beim Insider-Bereich gibt es hier keine Zugangsprüfung, die
 *  Seite ist also für alle dieselbe und kann statisch ausgeliefert werden. */
export function generateStaticParams() {
  return alleBlogBeitraege().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const beitrag = blogBeitragLesen(slug);
  if (!beitrag) return { title: "Nicht gefunden | Pferdeliebehealthy" };

  const adresse = `/blog/${slug}`;
  const bild = beitrag.bild || "/images/yasi-helena.jpg";

  return {
    title: `${beitrag.titel} | Pferdeliebehealthy`,
    description: beitrag.beschreibung,
    alternates: { canonical: adresse },
    openGraph: {
      type: "article",
      title: beitrag.titel,
      description: beitrag.beschreibung,
      url: adresse,
      publishedTime: beitrag.datum || undefined,
      modifiedTime: beitrag.aktualisiert || undefined,
      authors: ["Yasemin Halac"],
      images: [{ url: url(bild) }],
    },
    twitter: {
      card: "summary_large_image",
      title: beitrag.titel,
      description: beitrag.beschreibung,
    },
  };
}

export default async function BlogBeitragSeite({ params }: Props) {
  const { slug } = await params;
  const beitrag = blogBeitragLesen(slug);
  if (!beitrag) notFound();

  const hinweis = angebotshinweisFinden(beitrag.angebot);
  const weitere = verwandteBeitraege(slug, beitrag.kategorie);
  const bild = beitrag.bild || "/images/yasi-helena.jpg";

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <article className="max-w-2xl mx-auto">
        {/* Sagt Google in seiner eigenen Sprache, was hier steht, von wem es
            ist und wann es zuletzt geprüft wurde. Ohne diese Angaben taucht
            in den Suchtreffern weder Datum noch Autorin auf. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Article",
              headline: beitrag.titel,
              description: beitrag.beschreibung,
              inLanguage: "de-DE",
              ...(beitrag.datum ? { datePublished: beitrag.datum } : {}),
              ...(beitrag.aktualisiert
                ? { dateModified: beitrag.aktualisiert }
                : {}),
              author: {
                "@type": "Person",
                name: "Yasemin Halac",
                jobTitle: "Ernährungsberaterin für Pferde",
                url: url("/"),
              },
              publisher: {
                "@type": "Organization",
                name: "Pferdeliebehealthy",
                url: url("/"),
              },
              image: url(bild),
              mainEntityOfPage: url(`/blog/${slug}`),
            }),
          }}
        />

        <Link
          href="/blog"
          className="inline-block text-[14px] text-ink-soft hover:text-ink mb-9"
        >
          ← Alle Beiträge
        </Link>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-4">
          {beitrag.datum && (
            <span className="text-[12.5px] tracking-[0.1em] uppercase text-rose-deep font-semibold tabular-nums">
              {datumDeutsch(beitrag.datum)}
            </span>
          )}
          <span className="text-[12.5px] tracking-[0.1em] uppercase text-ink-soft">
            {beitrag.kategorie}
          </span>
        </div>

        <h1 className="font-serif font-normal text-[30px] sm:text-[42px] leading-[1.14] tracking-tight mb-5">
          {beitrag.titel}
        </h1>

        {beitrag.beschreibung && (
          <p className="text-[18px] text-ink-soft leading-relaxed mb-10">
            {beitrag.beschreibung}
          </p>
        )}

        {beitrag.bild && (
          <figure className="mb-10">
            <Image
              src={beitrag.bild}
              alt={beitrag.bildText || beitrag.titel}
              width={1600}
              height={1200}
              sizes="(max-width: 768px) 100vw, 672px"
              className="w-full h-auto rounded-[18px] border border-line"
            />
            {beitrag.bildText && (
              <figcaption className="text-[13.5px] text-ink-soft mt-3">
                {beitrag.bildText}
              </figcaption>
            )}
          </figure>
        )}

        <div className="border-b border-line mb-10" />

        {/* Der Text aus der Markdown-Datei. Styling: .beitrag-prose in globals.css */}
        <div
          className="beitrag-prose"
          dangerouslySetInnerHTML={{ __html: beitrag.html }}
        />

        {beitrag.aktualisiert && (
          <p className="text-[13px] text-ink-soft mt-10">
            Zuletzt überarbeitet am {datumDeutsch(beitrag.aktualisiert)}.
          </p>
        )}

        {/* Der Angebotshinweis steht nur, wenn in der Beitragsdatei einer
            eingetragen ist. Passt keins, bleibt es leer. */}
        {hinweis && (
          <aside className="bg-cream-deep rounded-[24px] p-7 sm:p-9 mt-14">
            <div className="text-[11px] tracking-[0.16em] uppercase text-rose-deep font-semibold mb-3">
              {hinweis.augenbraue}
            </div>
            <h2 className="font-serif text-[22px] sm:text-[26px] leading-snug mb-3">
              {hinweis.name}
            </h2>
            <p className="text-[15px] text-ink-soft leading-relaxed max-w-lg mb-6">
              {hinweis.text}
            </p>
            {hinweis.url.startsWith("/") ? (
              <Link
                href={hinweis.url}
                className="inline-block bg-ink text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-rose-deep transition-colors"
              >
                {hinweis.knopf}
              </Link>
            ) : (
              <a
                href={hinweis.url}
                target="_blank"
                rel="noopener"
                className="inline-block bg-ink text-cream px-7 py-3.5 rounded-full text-[15px] font-medium hover:bg-rose-deep transition-colors"
              >
                {hinweis.knopf}
              </a>
            )}
          </aside>
        )}

        {/* Die Einladung in den Insider-Kanal. Sie steht hier, weil der beste
            Moment für die Frage nach der Adresse der ist, in dem jemand
            gerade einen ganzen Fachtext zu Ende gelesen hat. */}
        <NurFuerNichtInsider>
          <aside className="bg-ink text-cream rounded-[24px] p-7 sm:p-9 mt-10">
            <div className="text-[11px] tracking-[0.16em] uppercase text-pfirsich font-semibold mb-3">
              Kostenlos
            </div>
            <h2 className="font-serif text-[22px] sm:text-[26px] leading-snug mb-3">
              Diese Themen auch ins Postfach?
            </h2>
            <p className="text-[15px] text-cream/75 max-w-lg mb-7">
              {insider.abschnitt.einleitung}
            </p>
            <InsiderFormular
              quelle={`blog-${slug}`}
              variante="dunkel"
              knopfText={insider.abschnitt.button}
            />
            <p className="text-[13px] text-cream/60 mt-5 max-w-md">
              {insider.abschnitt.kleingedrucktes}
            </p>
          </aside>
        </NurFuerNichtInsider>

        {/* Weiterlesen. Ohne diesen Block liest jede, die über Google kommt,
            genau einen Text und ist wieder weg. */}
        {weitere.length > 0 && (
          <section className="mt-16 pt-10 border-t border-line">
            <h2 className="text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-6">
              Weiterlesen
            </h2>
            <ul className="divide-y divide-line border-t border-line">
              {weitere.map((b) => (
                <li key={b.slug}>
                  <Link
                    href={`/blog/${b.slug}`}
                    className="group block py-5 -mx-4 px-4 rounded-xl transition-colors hover:bg-white/60"
                  >
                    <span className="block text-[11.5px] tracking-[0.1em] uppercase text-rose-deep font-semibold mb-1">
                      {b.kategorie}
                    </span>
                    <span className="font-serif text-[19px] leading-snug group-hover:text-rose-deep transition-colors">
                      {b.titel}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </main>
  );
}
