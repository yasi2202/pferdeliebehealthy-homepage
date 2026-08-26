import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { alleBeitraege, beitragLesen, datumDeutsch } from "@/lib/beitraege";
import { url } from "@/lib/seo";
import { insider } from "@/lib/insider";
import InsiderFormular from "@/components/InsiderFormular";
import NurFuerNichtInsider from "@/components/NurFuerNichtInsider";

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

export default async function BeitragSeite({ params }: Props) {
  const { slug } = await params;
  const beitrag = beitragLesen(slug);
  if (!beitrag) notFound();

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

        {/* Der Text aus der Markdown-Datei. Styling: .beitrag-prose in globals.css */}
        <div
          className="beitrag-prose"
          dangerouslySetInnerHTML={{ __html: beitrag.html }}
        />

        {/* Anmeldung am Ende — wer bis hierher gelesen hat, ist bereit dafür.
            Wer schon dabei ist, sieht den Kasten nicht. */}
        <NurFuerNichtInsider>
        <div className="bg-ink text-cream rounded-[24px] p-8 sm:p-10 mt-16">
          <h2 className="font-serif text-[23px] sm:text-[27px] leading-snug mb-4">
            Solche Beiträge direkt ins Postfach?
          </h2>
          <p className="text-[15px] text-cream/75 max-w-lg mb-7">
            {insider.abschnitt.einleitung}
          </p>
          <InsiderFormular
            quelle={`beitrag-${beitrag.slug}`}
            variante="dunkel"
            knopfText={insider.abschnitt.button}
          />
        </div>
        </NurFuerNichtInsider>
      </article>
    </main>
  );
}
