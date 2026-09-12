import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Verkaufsseite from "@/components/Verkaufsseite";
import { digitalFinden } from "@/lib/digital";
import { preisText } from "@/lib/shop";
import { verkaufstextZu } from "@/lib/verkaufstexte";

// ---------------------------------------------------------------------------
// Die Verkaufsseite zur Lesehilfe „Heuanalyse selbst lesen“, seit 12.09.2026.
//
// Aufbau wie bei RatioPro: Gerüst in components/Verkaufsseite.tsx, Texte in
// lib/verkaufstexte.ts, Preis und Zugang in lib/digital.ts. Die Lesehilfe
// selbst liegt in der Akademie unter inhalte/lektionen/heuanalyse-lesen.html.
// ---------------------------------------------------------------------------

const SLUG = "heuanalyse-lesen";

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

export default function HeuanalyseLesenSeite() {
  if (!produkt || !text) {
    notFound();
  }

  return <Verkaufsseite produkt={produkt} text={text} />;
}
