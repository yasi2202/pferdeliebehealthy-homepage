import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Verkaufsseite from "@/components/Verkaufsseite";
import { digitalFinden } from "@/lib/digital";
import { preisText } from "@/lib/shop";
import { verkaufstextZu } from "@/lib/verkaufstexte";

// ---------------------------------------------------------------------------
// Die Angebotsseite: EquiDesk einmalig für 69 €, bis 17.09.2026.
//
// Nur über den Link in der Mail erreichbar: noindex, nicht in der Sitemap,
// nicht in der Shopübersicht. Die Verkaufsseite /equidesk zeigt weiter das
// Abo für 19 € im Monat. So von Yasemin am 10.09.2026 entschieden, damit
// Abo-Kundinnen dort nicht auf den günstigeren Einmalpreis stoßen.
//
// ▸ DIESES ANGEBOT IST BEFRISTET. Das Datum steht als `verkaufBis` in
//   lib/digital.ts, die Kasse setzt es durch. Läuft es aus, sollte diese
//   Seite mit weg oder auf /equidesk weiterleiten: Eine Verkaufsseite, deren
//   Kasse den Kauf abweist, ist eine Sackgasse für die Besucherin.
// ---------------------------------------------------------------------------

const SLUG = "equidesk-einmalig";

const produkt = digitalFinden(SLUG)!;
const text = verkaufstextZu(SLUG)!;

export const metadata: Metadata = {
  title: text.seitentitel,
  description: `${text.einleitung[0]} Einmalig ${preisText(produkt.preis)}, dauerhafter Zugang.`,
  robots: { index: false, follow: false },
};

export default function EquiDeskEinmaligSeite() {
  if (!produkt || !text) {
    notFound();
  }

  return <Verkaufsseite produkt={produkt} text={text} />;
}
