import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Verkaufsseite from "@/components/Verkaufsseite";
import { digitalFinden } from "@/lib/digital";
import { preisText } from "@/lib/shop";
import { verkaufstextZu } from "@/lib/verkaufstexte";

// ---------------------------------------------------------------------------
// Die Verkaufsseite zum Bündel aus RatioPro und dem Pro-Modul, 79 €.
//
// Gleiche Begründung wie bei /metabolisches-gewicht: verstecktes Angebot,
// aber mit einer richtigen Seite, weil ein Link in die Kasse nichts verkauft.
// Auf noindex, nicht in der Sitemap, nicht in der Shopübersicht.
//
// ▸ DIESES ANGEBOT IST BEFRISTET. Das Datum steht als `verkaufBis` in
//   lib/digital.ts, die Kasse setzt es durch, und in der Kasse steht es auch.
//   Läuft es aus, sollte diese Seite mit weg oder der Text umgeschrieben
//   werden: Eine Verkaufsseite, deren Kasse den Kauf abweist, ist eine
//   Sackgasse für die Besucherin.
// ---------------------------------------------------------------------------

const SLUG = "ratiopro-buendel";

const produkt = digitalFinden(SLUG)!;
const text = verkaufstextZu(SLUG)!;

export const metadata: Metadata = {
  title: text.seitentitel,
  description:
    text.einleitung[0] +
    ` ${preisText(produkt.preis)}` +
    (produkt.statt ? ` statt ${preisText(produkt.statt)}` : "") +
    ", dauerhafter Zugang.",
  robots: { index: false, follow: false },
};

export default function RatioProBuendelSeite() {
  if (!produkt || !text) {
    notFound();
  }

  return <Verkaufsseite produkt={produkt} text={text} />;
}
