import Link from "next/link";
import Image from "next/image";
import { alleBlogBeitraege } from "@/lib/blog";
import { kategorieFarbe } from "@/lib/blog-farben";

// ---------------------------------------------------------------------------
// Der Blog auf der Startseite.
//
// Zwei Aufgaben, und die zweite ist die wichtigere:
//
//  1. Wer auf der Startseite landet, sieht, dass es hier etwas zu lesen gibt,
//     bevor irgendwo ein Preis steht.
//  2. Google findet den Blog überhaupt erst. Suchmaschinen folgen Links, und
//     die Startseite ist die Seite, die am häufigsten besucht wird. Ein Blog,
//     auf den nur das Menü zeigt, wird deutlich langsamer aufgenommen.
//
// Steht kein Beitrag bereit, verschwindet der ganze Abschnitt. Ein leerer
// Kasten auf der Startseite wäre schlechter als gar keiner.
// ---------------------------------------------------------------------------

export default function BlogSection() {
  const alle = alleBlogBeitraege();
  const beitraege = alle.slice(0, 3);
  if (beitraege.length === 0) return null;

  // Alle Kategorien, nicht nur die der drei gezeigten Beitraege: Sonst haette
  // dieselbe Kategorie hier eine andere Farbe als im Blog.
  const kategorien = alle.map((b) => b.kategorie);

  return (
    <section id="blog" className="py-20 sm:py-24 bg-cream-deep">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-4 mb-12">
          <div className="max-w-2xl">
            <span className="fade-in block text-[13px] tracking-[0.14em] uppercase text-rose-deep font-semibold mb-4">
              Frei zu lesen
            </span>
            <h2 className="fade-in font-serif font-normal text-[26px] sm:text-[38px] leading-tight">
              Was mir in echten Rationen begegnet
            </h2>
          </div>

          {/* Der Link steht oben und unten. Oben für die, die zuerst schauen,
              wohin das führt, unten für die, die erst die Titel lesen. */}
          <Link
            href="/blog"
            className="fade-in hidden sm:inline-block text-[15px] font-medium text-rose-deep hover:text-ink transition-colors"
          >
            Alle Beiträge →
          </Link>
        </div>

        <div className="fade-in grid sm:grid-cols-3 gap-6">
          {beitraege.map((b) => {
            const farbe = kategorieFarbe(b.kategorie, kategorien);
            return (
              <Link
                key={b.slug}
                href={`/blog/${b.slug}`}
                className="group flex flex-col rounded-[22px] overflow-hidden bg-cream border border-line transition-shadow hover:shadow-[0_18px_50px_-24px_rgba(59,42,40,0.35)]"
              >
                {b.bild ? (
                  <div className="relative h-36 overflow-hidden">
                    <Image
                      src={b.bild}
                      alt={b.bildText || b.titel}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    />
                  </div>
                ) : (
                  <div className={`h-1.5 ${farbe.strich}`} aria-hidden="true" />
                )}

                <div className="p-6 sm:p-7 flex flex-col grow">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11.5px] tracking-[0.1em] uppercase font-semibold mb-3">
                    <span className="text-rose-deep">{b.kategorie}</span>
                    <span className="text-ink-soft/50">·</span>
                    <span className="text-ink-soft tabular-nums">
                      {b.lesezeit} Min.
                    </span>
                  </div>

                  <h3 className="font-serif text-[20px] sm:text-[22px] leading-snug mb-2.5 group-hover:text-rose-deep transition-colors">
                    {b.titel}
                  </h3>

                  <p className="text-[14.5px] text-ink-soft leading-relaxed grow">
                    {b.beschreibung}
                  </p>

                  <span className="mt-5 text-[14px] font-medium text-rose-deep">
                    Lesen →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <Link
          href="/blog"
          className="fade-in sm:hidden inline-block mt-8 text-[15px] font-medium text-rose-deep"
        >
          Alle Beiträge →
        </Link>
      </div>
    </section>
  );
}
