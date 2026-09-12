import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Verkaufsseite from "@/components/Verkaufsseite";
import { digitalFinden } from "@/lib/digital";
import { preisText } from "@/lib/shop";
import { verkaufstextZu } from "@/lib/verkaufstexte";

// ---------------------------------------------------------------------------
// Die Verkaufsseite zur Drei-Töpfe-Methode, seit 12.09.2026.
//
// Buchbar erst ab `verkaufAb` in lib/digital.ts (01.10.2026, Kursstart).
// Bis dahin zeigt components/Verkaufsseite.tsx statt des Kaufknopfs den
// Termin, und die Kasse weist einen Kauf ab.
//
// ▸ WARUM HIER `revalidate` STEHT
//   Ohne das würde die Seite beim Bauen einmal gerechnet und bliebe so
//   stehen: Am 01.10. zeigte sie weiter „Buchbar ab“, bis zufällig jemand neu
//   veröffentlicht. Mit einer Stunde erscheint der Knopf spätestens eine
//   Stunde nach Mitternacht von selbst.
// ---------------------------------------------------------------------------

export const revalidate = 3600;

const SLUG = "drei-toepfe-methode";

const produkt = digitalFinden(SLUG)!;
const text = verkaufstextZu(SLUG)!;

const BESCHREIBUNG =
  text.einleitung[0] + ` ${preisText(produkt.preis)}, dauerhafter Zugang.`;

export const metadata: Metadata = {
  alternates: { canonical: `/${SLUG}` },
  title: text.seitentitel,
  description: BESCHREIBUNG,
  openGraph: {
    type: "website",
    locale: "de_DE",
    siteName: "Pferdeliebehealthy",
    title: `${text.seitentitel} | Pferdeliebehealthy`,
    description: BESCHREIBUNG,
    url: `/${SLUG}`,
    images: [{ url: "/images/vorschau.jpg", width: 1200, height: 630 }],
  },
};

export default function DreiToepfeSeite() {
  if (!produkt || !text) {
    notFound();
  }

  return <Verkaufsseite produkt={produkt} text={text} />;
}
