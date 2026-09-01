"use client";

// ---------------------------------------------------------------------------
// Die Bilder auf der Produktseite: ein grosses, darunter die kleinen zum
// Umschalten. Bei nur einem Bild fallen die kleinen weg.
//
// Die Bilder liegen unter public/images/shop/ und sind aus dem alten Shop
// übernommen. Sie sind teils gross (bis 1,8 MB) -- next/image rechnet sie
// beim Ausliefern automatisch auf die passende Grösse herunter, deshalb ist
// hier überall next/image im Einsatz und nirgends ein blankes <img>.
// ---------------------------------------------------------------------------

import Image from "next/image";
import { useState } from "react";
import type { Bild } from "@/lib/shop";

export default function ProduktBilder({
  bilder,
  name,
}: {
  bilder: Bild[];
  name: string;
}) {
  const [aktiv, setAktiv] = useState(0);

  if (bilder.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-[20px] bg-cream-deep">
        <span className="px-8 text-center font-serif text-[19px] text-ink-soft">
          {name}
        </span>
      </div>
    );
  }

  const gross = bilder[Math.min(aktiv, bilder.length - 1)];

  return (
    <div>
      <div className="relative aspect-square w-full overflow-hidden rounded-[20px] bg-cream-deep">
        <Image
          src={gross.datei}
          alt={gross.alt}
          fill
          sizes="(max-width: 1024px) 100vw, 45vw"
          priority
          className="object-cover"
        />
      </div>

      {bilder.length > 1 && (
        <div className="mt-3 flex gap-3">
          {bilder.map((b, i) => (
            <button
              key={b.datei}
              type="button"
              onClick={() => setAktiv(i)}
              aria-label={`Bild ${i + 1} von ${bilder.length} anzeigen`}
              aria-current={i === aktiv}
              className={`relative h-20 w-20 overflow-hidden rounded-[12px] bg-cream-deep transition-all ${
                i === aktiv
                  ? "ring-2 ring-rose-deep ring-offset-2 ring-offset-cream"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={b.datei}
                alt=""
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
