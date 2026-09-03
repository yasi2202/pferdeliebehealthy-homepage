import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Verkaufsseite from "@/components/Verkaufsseite";
import { digitalFinden } from "@/lib/digital";
// preisText steht in shop.ts, seit es den Warenshop gibt.
import { preisText } from "@/lib/shop";
import { verkaufstextZu } from "@/lib/verkaufstexte";

// ---------------------------------------------------------------------------
// Die Verkaufsseite zu Pferdeliebe 365.
//
// Sie enthält absichtlich fast nichts: Der Aufbau steckt in
// components/Verkaufsseite.tsx, die Texte in lib/verkaufstexte.ts und Preis
// und Zugang in lib/digital.ts. So sehen alle Produktseiten gleich aus, und
// eine Verbesserung am Aufbau wirkt sofort auf allen.
// ---------------------------------------------------------------------------

const SLUG = "pferdeliebe-365";

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

export default function Pferdeliebe365Seite() {
  // Fehlt eines von beiden, ist das ein Fehler beim Anlegen des Produkts und
  // keine Seite, die es zu zeigen lohnt.
  if (!produkt || !text) {
    notFound();
  }

  return <Verkaufsseite produkt={produkt} text={text} />;
}
