import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  alleBlogBeitraege,
  blogBeitragLesen,
  verwandteBeitraege,
  datumDeutsch,
  kategorieSlug,
} from "@/lib/blog";
import { kategorieFarbe } from "@/lib/blog-farben";
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
  if (!beitrag) return { title: "Nicht gefunden" };

  const adresse = `/blog/${slug}`;
  const bild = beitrag.bild || "/images/yasi-helena.jpg";

  return {
    // Ohne „| Pferdeliebehealthy": Das haengt app/layout.tsx über
    // `title.template` von selbst an. Stand es hier auch, hiess die Seite
    // bei Google „... | Pferdeliebehealthy | Pferdeliebehealthy".
    title: beitrag.titel,
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
  // Die vollstaendige Kategorienliste, damit die Farben ueberall dieselben sind.
  const kategorien = alleBlogBeitraege().map((b) => b.kategorie);
  const bild = beitrag.bild || "/images/yasi-helena.jpg";

  return (
    <main>
      {/* Sagt Google in seiner eigenen Sprache, was hier steht, von wem es
          ist und wann es zuletzt geprüft wurde. Ohne diese Angaben taucht in
          den Suchtreffern weder Datum noch Autorin auf.

          Autorin und Herausgeberin werden nicht neu beschrieben, sondern über
          ihre Kennung aus app/layout.tsx verknüpft. Damit sieht Google einen
          Beitrag von genau der Person, die auf der Startseite als
          Ernährungsberaterin ausgewiesen ist, statt einer gleichnamigen
          Unbekannten. Bei Gesundheitsthemen zählt genau das.

          Der zweite Block ist der Weg von der Startseite hierher. Google zeigt
          ihn im Suchtreffer anstelle der nackten Adresse. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Article",
                headline: beitrag.titel,
                description: beitrag.beschreibung,
                inLanguage: "de-DE",
                ...(beitrag.datum ? { datePublished: beitrag.datum } : {}),
                ...(beitrag.aktualisiert
                  ? { dateModified: beitrag.aktualisiert }
                  : {}),
                author: { "@id": url("/#yasemin") },
                publisher: { "@id": url("/#unternehmen") },
                isPartOf: { "@id": url("/blog#blog") },
                articleSection: beitrag.kategorie,
                image: url(bild),
                mainEntityOfPage: url(`/blog/${slug}`),
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  {
                    "@type": "ListItem",
                    position: 1,
                    name: "Startseite",
                    item: url("/"),
                  },
                  {
                    "@type": "ListItem",
                    position: 2,
                    name: "Blog",
                    item: url("/blog"),
                  },
                  {
                    "@type": "ListItem",
                    position: 3,
                    name: beitrag.kategorie,
                    item: url(`/blog/thema/${kategorieSlug(beitrag.kategorie)}`),
                  },
                  {
                    "@type": "ListItem",
                    position: 4,
                    name: beitrag.titel,
                  },
                ],
              },
            ],
          }),
        }}
      />

      {/* Kopfbereich in Farbe. Er trennt den Beitrag sichtbar vom Rest der
          Seite, und er gibt dem Titel Raum: Wer über Google kommt, soll im
          ersten Moment sehen, dass er richtig ist. */}
      <section className="bg-rose-deep px-6 sm:px-8 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto">
          <nav aria-label="Sie sind hier" className="text-[13.5px] mb-8">
            <Link href="/" className="text-cream/70 hover:text-cream transition-colors">
              Startseite
            </Link>
            <span className="text-cream/40 mx-2">›</span>
            <Link href="/blog" className="text-cream/70 hover:text-cream transition-colors">
              Blog
            </Link>
            <span className="text-cream/40 mx-2">›</span>
            <Link
              href={`/blog/thema/${kategorieSlug(beitrag.kategorie)}`}
              className="text-cream/70 hover:text-cream transition-colors"
            >
              {beitrag.kategorie}
            </Link>
          </nav>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] tracking-[0.1em] uppercase font-semibold mb-4">
            <span className="text-cream">{beitrag.kategorie}</span>
            <span className="text-cream/40">·</span>
            <span className="text-cream/75 tabular-nums">
              {beitrag.lesezeit} Min. Lesezeit
            </span>
            {beitrag.datum && (
              <>
                <span className="text-cream/40">·</span>
                <span className="text-cream/75 tabular-nums">
                  {datumDeutsch(beitrag.datum)}
                </span>
              </>
            )}
          </div>

          <h1 className="font-serif font-normal text-cream text-[30px] sm:text-[44px] leading-[1.12] tracking-tight mb-5">
            {beitrag.titel}
          </h1>

          {beitrag.beschreibung && (
            <p className="text-[17.5px] text-cream/80 leading-relaxed max-w-xl">
              {beitrag.beschreibung}
            </p>
          )}
        </div>
      </section>

      <article className="px-6 sm:px-8 py-14 sm:py-16">
        <div className="max-w-2xl mx-auto">
          {beitrag.bild && (
            /* Hoehe begrenzt statt Breite: Ein Hochformat wuerde sonst den
               halben Bildschirm fuellen, bevor der erste Satz kommt. Der
               Bildausschnitt wird oben gehalten, dort sitzt bei Nahaufnahmen
               das Motiv. */
            <figure className="mb-12 -mt-24 sm:-mt-28 max-w-md mx-auto">
              <Image
                src={beitrag.bild}
                alt={beitrag.bildText || beitrag.titel}
                width={1600}
                height={1200}
                priority
                sizes="(max-width: 768px) 100vw, 448px"
                className="w-full max-h-[420px] object-cover object-top rounded-[22px] shadow-[0_24px_60px_-30px_rgba(59,42,40,0.5)]"
              />
              {beitrag.bildText && (
                <figcaption className="text-[13.5px] text-ink-soft mt-3">
                  {beitrag.bildText}
                </figcaption>
              )}
            </figure>
          )}

          {/* Das Inhaltsverzeichnis. Erst ab drei Kapiteln, darunter ist es
              keine Hilfe, sondern eine Wiederholung des Textes. Bei langen
              Fachtexten zeigt Google die Sprungmarken teilweise direkt im
              Suchtreffer an. */}
          {beitrag.kapitel.length >= 3 && (
            <nav
              aria-label="Inhalt des Beitrags"
              className="bg-white border border-line rounded-[20px] p-6 sm:p-7 mb-12"
            >
              <h2 className="text-[11px] tracking-[0.16em] uppercase text-rose-deep font-semibold mb-4">
                Inhalt
              </h2>
              <ol className="space-y-2.5">
                {beitrag.kapitel.map((k, i) => (
                  <li key={k.anker} className="flex gap-3">
                    <span className="text-[13px] text-rose-deep font-semibold tabular-nums pt-[3px] shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <a
                      href={`#${k.anker}`}
                      className="text-[15.5px] text-ink hover:text-rose-deep transition-colors"
                    >
                      {k.titel}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* Der Text aus der Markdown-Datei. Styling: .beitrag-prose in globals.css */}
          <div
            className="beitrag-prose"
            dangerouslySetInnerHTML={{ __html: beitrag.html }}
          />

          {beitrag.aktualisiert && (
            <p className="text-[13px] text-ink-soft mt-10">
              Zuletzt fachlich überarbeitet am{" "}
              {datumDeutsch(beitrag.aktualisiert)}.
            </p>
          )}

          {/* Die ausführliche Werbekennzeichnung steht am Fuß des Beitrags.
              Der Hinweis, der rechtlich zählt, steht dagegen direkt an jeder
              Empfehlung: Jeder Partnerkasten trägt "Werbung" in seiner
              obersten Zeile. So ist die Kennzeichnung dort, wo die Werbung
              ist, und der Beitrag beginnt trotzdem mit dem Fachtext statt mit
              einem Kasten Kleingedrucktem. */}
          {beitrag.werbung && (
            <aside className="mt-12 pt-6 border-t border-line">
              <p className="text-[12.5px] text-ink-soft leading-relaxed max-w-xl">
                <strong className="font-semibold text-ink">Werbung:</strong>{" "}
                Dieser Beitrag enthält Empfehlungen von Partnern, teils mit
                Rabattcode. Bestellst du darüber, bekomme ich eine Provision.
                Für dich wird es dadurch nicht teurer, und wo ein Code dabei
                ist, zahlst du weniger. Empfehlen tue ich trotzdem nur, was
                ich selbst einsetze oder geprüft habe.
              </p>
            </aside>
          )}

          {/* Wer das hier geschrieben hat. Das ist keine Höflichkeit: Bei
              Gesundheitsthemen bewertet Google, ob hinter einem Text eine
              nachvollziehbare Person steht, und Leserinnen tun das auch. */}
          <aside className="flex items-start gap-5 mt-14 pt-9 border-t border-line">
            <Image
              src="/images/yasi-portrait.jpg"
              alt="Yasemin Halac"
              width={160}
              height={160}
              sizes="72px"
              className="w-[72px] h-[72px] rounded-full object-cover shrink-0"
            />
            <div>
              <p className="font-serif text-[19px] mb-1.5">Yasemin Halac</p>
              <p className="text-[14.5px] text-ink-soft leading-relaxed">
                Ernährungsberaterin für Pferde im Odenwald. Ich schaue mir an,
                was ein Pferd tatsächlich bekommt, gleiche es mit dem ab, was es
                braucht, und schreibe auf, wo die Lücke ist.{" "}
                <Link
                  href="/#ueber-mich"
                  className="text-rose-deep underline underline-offset-2 hover:text-ink"
                >
                  Mehr über mich
                </Link>
              </p>
            </div>
          </aside>

          {/* Der Angebotshinweis steht nur, wenn in der Beitragsdatei einer
              eingetragen ist. Passt keins, bleibt es leer. */}
          {hinweis && (
            <aside className="bg-cream-deep rounded-[24px] p-7 sm:p-9 mt-10">
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

          {/* Die Einladung in den Insider-Kanal. Sie steht hier, weil der
              beste Moment für die Frage nach der Adresse der ist, in dem
              jemand gerade einen ganzen Fachtext zu Ende gelesen hat. */}
          <NurFuerNichtInsider>
            <aside className="bg-ink text-cream rounded-[24px] p-7 sm:p-9 mt-6">
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
        </div>

        {/* Weiterlesen. Ohne diesen Block liest jede, die über Google kommt,
            genau einen Text und ist wieder weg. Bewusst breiter als der
            Fließtext: Hier endet der Beitrag und die Seite fängt wieder an. */}
        {weitere.length > 0 && (
          <section className="max-w-4xl mx-auto mt-16 sm:mt-20">
            <h2 className="text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-7 text-center">
              Weiterlesen
            </h2>
            <div className="grid sm:grid-cols-3 gap-5">
              {weitere.map((b) => {
                const farbe = kategorieFarbe(b.kategorie, kategorien);
                return (
                  <Link
                    key={b.slug}
                    href={`/blog/${b.slug}`}
                    className="group flex flex-col rounded-[20px] overflow-hidden bg-white border border-line transition-shadow hover:shadow-[0_18px_50px_-24px_rgba(59,42,40,0.35)]"
                  >
                    <div className={`h-1.5 ${farbe.strich}`} aria-hidden="true" />
                    <div className="p-6 flex flex-col grow">
                      <span className="block text-[11px] tracking-[0.1em] uppercase text-rose-deep font-semibold mb-2">
                        {b.kategorie}
                      </span>
                      <span className="font-serif text-[19px] leading-snug group-hover:text-rose-deep transition-colors grow">
                        {b.titel}
                      </span>
                      <span className="mt-4 text-[12.5px] text-ink-soft tabular-nums">
                        {b.lesezeit} Min. Lesezeit
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
