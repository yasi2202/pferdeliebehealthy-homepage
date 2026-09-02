import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  alleKategorien,
  beitraegeNachKategorie,
  alleBlogBeitraege,
} from "@/lib/blog";
import { url } from "@/lib/seo";
import BlogListe from "@/components/BlogListe";

// ---------------------------------------------------------------------------
// Eine eigene Seite je Thema, zum Beispiel /blog/thema/magen-und-darm
//
// Warum das mehr ist als ein Filter: Ein Filter, der im Browser umschaltet,
// existiert für Google nicht. Eine eigene Adresse mit eigener Überschrift und
// eigener Beschreibung dagegen kann selbst in den Suchergebnissen stehen, für
// Suchen wie "Magen und Darm Pferd Fütterung". So machen es die großen
// Fachseiten in dieser Nische auch, und sie ranken damit.
//
// Die Knöpfe über der Beitragsliste sind deshalb echte Links auf diese
// Seiten, kein Umschalten im Browser.
// ---------------------------------------------------------------------------

type Props = { params: Promise<{ kategorie: string }> };

export function generateStaticParams() {
  return alleKategorien().map((k) => ({ kategorie: k.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kategorie } = await params;
  const treffer = beitraegeNachKategorie(kategorie);
  if (!treffer) return { title: "Thema nicht gefunden | Pferdeliebehealthy" };

  return {
    title: `${treffer.name}: Beiträge zur Pferdefütterung`,
    description: `Alle Beiträge zum Thema ${treffer.name}: verständlich erklärt von Ernährungsberaterin Yasemin Halac, frei zu lesen und ohne Anmeldung.`,
    alternates: { canonical: `/blog/thema/${kategorie}` },
  };
}

export default async function ThemenSeite({ params }: Props) {
  const { kategorie } = await params;
  const treffer = beitraegeNachKategorie(kategorie);
  if (!treffer) notFound();

  const kategorien = alleKategorien();
  const alle = alleBlogBeitraege();

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Startseite", item: url("/") },
              { "@type": "ListItem", position: 2, name: "Blog", item: url("/blog") },
              { "@type": "ListItem", position: 3, name: treffer.name },
            ],
          }),
        }}
      />

      <section className="bg-rose-deep px-6 sm:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          {/* Der Weg zurück, sichtbar und nicht nur in den Angaben für
              Google. Wer über eine Suche direkt hier landet, muss sehen,
              wohin er geraten ist. */}
          <nav aria-label="Sie sind hier" className="text-[13.5px] mb-7">
            <Link href="/" className="text-cream/70 hover:text-cream transition-colors">
              Startseite
            </Link>
            <span className="text-cream/40 mx-2">›</span>
            <Link href="/blog" className="text-cream/70 hover:text-cream transition-colors">
              Blog
            </Link>
            <span className="text-cream/40 mx-2">›</span>
            <span className="text-cream">{treffer.name}</span>
          </nav>

          <span className="block text-[13px] tracking-[0.14em] uppercase text-cream/85 font-semibold mb-4">
            {treffer.beitraege.length}{" "}
            {treffer.beitraege.length === 1 ? "Beitrag" : "Beiträge"}
          </span>
          <h1 className="font-serif font-normal text-cream text-[32px] sm:text-[44px] leading-[1.12] tracking-tight">
            {treffer.name}
          </h1>
        </div>
      </section>

      <section className="px-6 sm:px-8 py-12 sm:py-16">
        <div className="max-w-3xl mx-auto">
          <BlogListe
            beitraege={treffer.beitraege}
            kategorien={kategorien}
            alleKategorien={alle.map((b) => b.kategorie)}
            aktiv={kategorie}
          />
        </div>
      </section>
    </main>
  );
}
