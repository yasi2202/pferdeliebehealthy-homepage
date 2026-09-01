"use client";

// ---------------------------------------------------------------------------
// Der Warenkorb als Lade, die von rechts hereinfährt.
//
// Sie liegt in app/layout.tsx und ist damit auf jeder Seite verfügbar. Wer
// auf einer Produktseite etwas hineinlegt, sieht sofort, was drin ist, ohne
// die Seite zu verlassen.
//
// Auf dem Handy nimmt sie die ganze Breite ein, ab sm eine feste Spalte.
// ---------------------------------------------------------------------------

import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { useWarenkorb } from "@/components/WarenkorbProvider";
import { preisText, versandhinweis } from "@/lib/shop";

export default function WarenkorbLade() {
  const {
    zeilen,
    summe,
    anzahl,
    setzeMenge,
    nimmRaus,
    ladeOffen,
    schliesseLade,
  } = useWarenkorb();

  // Escape schliesst die Lade.
  useEffect(() => {
    if (!ladeOffen) {
      return;
    }

    const beiTaste = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        schliesseLade();
      }
    };

    window.addEventListener("keydown", beiTaste);

    return () => window.removeEventListener("keydown", beiTaste);
  }, [ladeOffen, schliesseLade]);

  return (
    <>
      {/* Der dunkle Schleier hinter der Lade. */}
      <div
        onClick={schliesseLade}
        aria-hidden="true"
        className={`fixed inset-0 z-[190] bg-ink/40 transition-opacity duration-300 ${
          ladeOffen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Warenkorb"
        aria-hidden={!ladeOffen}
        className={`fixed right-0 top-0 z-[200] flex h-full w-full flex-col bg-cream shadow-2xl transition-transform duration-300 ease-out sm:w-[420px] ${
          ladeOffen ? "translate-x-0" : "pointer-events-none translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-serif text-[21px]">
            Warenkorb
            {anzahl > 0 && (
              <span className="ml-2 text-[15px] text-ink-soft">({anzahl})</span>
            )}
          </h2>

          <button
            type="button"
            onClick={schliesseLade}
            aria-label="Warenkorb schließen"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink transition-colors hover:bg-cream-deep"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {zeilen.length === 0 ? (
          <div className="flex flex-grow flex-col items-center justify-center gap-5 px-8 text-center">
            <p className="text-[15px] text-ink-soft">
              Dein Warenkorb ist noch leer.
            </p>

            <Link
              href="/shop"
              onClick={schliesseLade}
              className="rounded-full bg-ink px-6 py-3 text-[14px] font-medium text-cream transition-colors hover:bg-rose-deep"
            >
              Zum Shop
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-grow overflow-y-auto px-6 py-5">
              {zeilen.map((z) => (
                <li
                  key={z.slug}
                  className="flex gap-4 border-b border-line py-4 first:pt-0 last:border-b-0"
                >
                  <Link
                    href={`/shop/${z.slug}`}
                    onClick={schliesseLade}
                    className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[12px] bg-cream-deep"
                  >
                    {z.produkt.bilder[0] && (
                      <Image
                        src={z.produkt.bilder[0].datei}
                        alt={z.produkt.bilder[0].alt}
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    )}
                  </Link>

                  <div className="flex flex-grow flex-col">
                    <Link
                      href={`/shop/${z.slug}`}
                      onClick={schliesseLade}
                      className="font-serif text-[16px] leading-snug hover:text-rose-deep"
                    >
                      {z.produkt.kurzname}
                    </Link>

                    <div className="mt-auto flex items-center justify-between pt-2.5">
                      <div className="flex items-center rounded-full border border-line bg-white">
                        <button
                          type="button"
                          onClick={() => setzeMenge(z.slug, z.menge - 1)}
                          aria-label={`Eine ${z.produkt.kurzname} weniger`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-ink"
                        >
                          &minus;
                        </button>

                        <span className="w-6 text-center text-[14px] tabular-nums">
                          {z.menge}
                        </span>

                        <button
                          type="button"
                          onClick={() => setzeMenge(z.slug, z.menge + 1)}
                          aria-label={`Eine ${z.produkt.kurzname} mehr`}
                          className="flex h-8 w-8 items-center justify-center rounded-full text-ink-soft transition-colors hover:text-ink"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-[15px] font-medium tabular-nums">
                          {preisText(z.zwischensumme)}
                        </div>

                        <button
                          type="button"
                          onClick={() => nimmRaus(z.slug)}
                          className="text-[12px] text-ink-soft underline underline-offset-2 transition-colors hover:text-rose-deep"
                        >
                          entfernen
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="border-t border-line bg-white px-6 py-5">
              <div className="flex items-baseline justify-between">
                <span className="text-[15px]">Zwischensumme</span>
                <span className="font-serif text-[22px] tabular-nums">
                  {preisText(summe)}
                </span>
              </div>

              <p className="mt-1.5 text-[12.5px] text-ink-soft">
                Inklusive Mehrwertsteuer. Versandkosten kommen im nächsten
                Schritt dazu. {versandhinweis}
              </p>

              <Link
                href="/kasse"
                onClick={schliesseLade}
                className="mt-4 block rounded-full bg-ink px-6 py-3.5 text-center text-[15px] font-medium text-cream transition-colors hover:bg-rose-deep"
              >
                Zur Kasse
              </Link>

              <button
                type="button"
                onClick={schliesseLade}
                className="mt-3 w-full text-center text-[13.5px] text-ink-soft underline underline-offset-4 transition-colors hover:text-ink"
              >
                Weiter stöbern
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
