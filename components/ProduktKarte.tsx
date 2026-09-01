// ---------------------------------------------------------------------------
// Eine Produktkarte für die Übersicht unter /shop.
//
// Bewusst ohne „In den Warenkorb". Bei Futtermitteln lohnt sich der Blick auf
// die Zusammensetzung, und der Weg über die Produktseite ist kurz. Ausserdem
// bleibt die Karte damit eine Serverkomponente und lädt kein JavaScript nach.
// ---------------------------------------------------------------------------

import Link from "next/link";
import Image from "next/image";
import { preisText, type Produkt } from "@/lib/shop";

export default function ProduktKarte({ produkt }: { produkt: Produkt }) {
  return (
    <li>
      <Link
        href={`/shop/${produkt.slug}`}
        className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-line bg-white transition-shadow hover:shadow-md"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-cream-deep">
          {produkt.bilder[0] ? (
            <Image
              src={produkt.bilder[0].datei}
              alt={produkt.bilder[0].alt}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-6 text-center font-serif text-[18px] text-ink-soft">
              {produkt.name}
            </div>
          )}

          {!produkt.vorraetig && (
            <span className="absolute left-4 top-4 rounded-full bg-ink/85 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-cream">
              {produkt.ausverkauftText ?? "Vergriffen"}
            </span>
          )}
        </div>

        <div className="flex flex-grow flex-col p-6">
          <h2 className="font-serif text-[20px] leading-snug">{produkt.name}</h2>

          <p className="mt-2.5 flex-grow text-[14px] leading-relaxed text-ink-soft">
            {produkt.kurz}
          </p>

          <div className="mt-5 flex items-baseline gap-2.5">
            <span className="font-serif text-[22px] tabular-nums">
              {preisText(produkt.preis)}
            </span>

            {produkt.statt && (
              <span className="text-[14px] text-ink-soft line-through tabular-nums">
                {preisText(produkt.statt)}
              </span>
            )}
          </div>

          {produkt.grundpreis && (
            <span className="mt-1 text-[12.5px] text-ink-soft">
              {produkt.grundpreis}
            </span>
          )}

          <span className="mt-4 text-[13.5px] font-medium text-rose-deep transition-colors group-hover:text-ink">
            Ansehen &rarr;
          </span>
        </div>
      </Link>
    </li>
  );
}
