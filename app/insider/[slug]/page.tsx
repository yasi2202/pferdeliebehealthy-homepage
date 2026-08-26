import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { alleBeitraege, beitragLesen, datumDeutsch } from "@/lib/beitraege";
import { url } from "@/lib/seo";
import InsiderSchranke from "@/components/InsiderSchranke";
import { aktuellerInsider } from "@/lib/insider-zugang";

type Props = { params: Promise<{ slug: string }> };

/** Sorgt dafür, dass jeder Beitrag beim Bauen als fertige Seite entsteht. */
export function generateStaticParams() {
  return alleBeitraege().map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const beitrag = beitragLesen(slug);
  if (!beitrag) return { title: "Nicht gefunden | Pferdeliebehealthy" };

  const adresse = `/insider/${slug}`;

  return {
    title: `${beitrag.titel} | Pferdeliebe Insider`,
    description: beitrag.beschreibung,
    alternates: { canonical: adresse },
    openGraph: {
      type: "article",
      title: beitrag.titel,
      description: beitrag.beschreibung,
      url: adresse,
      publishedTime: beitrag.datum || undefined,
      authors: ["Yasemin Halac"],
      images: [{ url: url("/images/yasi-helena.jpg"), width: 1122, height: 1402 }],
    },
    twitter: {
      card: "summary_large_image",
      title: beitrag.titel,
      description: beitrag.beschreibung,
    },
  };
}

/** Der Anriss für alle, die noch nicht angemeldet sind.
 *
 *  Geschnitten wird an `</p>`, nicht nach einer Zeichenzahl. Ein Schnitt
 *  mitten im Text würde offene Formatierungen hinterlassen, und der Browser
 *  müsste raten, wie er sie schliesst — meist auf Kosten des restlichen
 *  Seitenaufbaus.
 *
 *  Wie viel gezeigt wird, hängt von der Länge ab: höchstens ein Drittel des
 *  Beitrags, höchstens zwei Absätze. Eine feste Zahl wäre bei einem kurzen
 *  Beitrag der halbe Text — und wer die Antwort schon vor der Schranke
 *  bekommt, trägt sich nicht mehr ein. */
function anriss(html: string): string {
  const teile = html.split("</p>");
  const absaetze = teile.length - 1;
  if (absaetze <= 1) return html;

  const zeigen = Math.max(1, Math.min(2, Math.floor(absaetze / 3)));
  if (zeigen >= absaetze) return html;

  return teile.slice(0, zeigen).join("</p>") + "</p>";
}

export default async function BeitragSeite({ params }: Props) {
  const { slug } = await params;
  const beitrag = beitragLesen(slug);
  if (!beitrag) notFound();

  // Auf dem Server geprüft, bevor die Seite gebaut wird: Der volle Text
  // verlässt den Server gar nicht erst, wenn niemand angemeldet ist.
  const angemeldet = await aktuellerInsider();

  return (
    <main className="py-14 sm:py-20 px-6 sm:px-8">
      <article className="max-w-2xl mx-auto">
        <Link
          href="/insider"
          className="inline-block text-[14px] text-ink-soft hover:text-ink mb-9"
        >
          ← Alle Insider-Beiträge
        </Link>

        {beitrag.datum && (
          <div className="text-[12.5px] tracking-[0.1em] uppercase text-rose-deep font-semibold mb-4 tabular-nums">
            {datumDeutsch(beitrag.datum)}
          </div>
        )}

        <h1 className="font-serif font-normal text-[30px] sm:text-[42px] leading-[1.14] tracking-tight mb-5">
          {beitrag.titel}
        </h1>

        {beitrag.beschreibung && (
          <p className="text-[18px] text-ink-soft leading-relaxed mb-10 pb-10 border-b border-line">
            {beitrag.beschreibung}
          </p>
        )}

        {angemeldet ? (
          <>
            {/* Der Text aus der Markdown-Datei. Styling: .beitrag-prose in globals.css */}
            <div
              className="beitrag-prose"
              dangerouslySetInnerHTML={{ __html: beitrag.html }}
            />

            <p className="text-[13.5px] text-ink-soft mt-14 pt-7 border-t border-line">
              Du liest als Insider, {angemeldet.vorname}. Schön, dass du da
              bist.
            </p>
          </>
        ) : (
          <>
            {/* Der Anriss läuft nach unten aus, statt hart abzubrechen. Ein
                harter Schnitt liest sich wie ein Fehler, ein auslaufender
                Text wie eine Tür. */}
            <div className="relative">
              <div
                className="beitrag-prose"
                dangerouslySetInnerHTML={{ __html: anriss(beitrag.html) }}
              />
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-cream pointer-events-none" />
            </div>

            <InsiderSchranke />
          </>
        )}
      </article>
    </main>
  );
}
