import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Verkaufsseite from "@/components/Verkaufsseite";
import { digitalFinden } from "@/lib/digital";
// preisText steht in shop.ts, seit es den Warenshop gibt.
import { preisText } from "@/lib/shop";
import { verkaufstextZu } from "@/lib/verkaufstexte";

// ---------------------------------------------------------------------------
// Die Verkaufsseite zur Knabberecke, seit 12.09.2026.
//
// Gebaut wie die Seite zum Magen Reset: Der Aufbau steckt in
// components/Verkaufsseite.tsx, die Texte in lib/verkaufstexte.ts und Preis
// und Zugang in lib/digital.ts.
// ---------------------------------------------------------------------------

const SLUG = "knabberecke";

const produkt = digitalFinden(SLUG)!;
const text = verkaufstextZu(SLUG)!;

const BESCHREIBUNG =
  text.einleitung[0] +
  ` Zurzeit ${preisText(produkt.preis)}` +
  (produkt.statt ? ` statt ${preisText(produkt.statt)}` : "") +
  ", dauerhafter Zugang.";

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

export default function KnabbereckeSeite() {
  if (!produkt || !text) {
    notFound();
  }

  return <Verkaufsseite produkt={produkt} text={text} />;
}
