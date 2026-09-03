import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Verkaufsseite from "@/components/Verkaufsseite";
import { digitalFinden } from "@/lib/digital";
// preisText steht in shop.ts, seit es den Warenshop gibt.
import { preisText } from "@/lib/shop";
import { verkaufstextZu } from "@/lib/verkaufstexte";

// ---------------------------------------------------------------------------
// Verkaufsseite aus der Beratungstreppe (angelegt 03.09.2026).
//
// Sie enthält absichtlich fast nichts: Der Aufbau steckt in
// components/Verkaufsseite.tsx, die Texte in lib/verkaufstexte.ts und Preis
// und Zugang in lib/digital.ts. So sehen alle Produktseiten gleich aus.
//
// Anders als bei den Kursen steht hier NICHT "dauerhafter Zugang": Das sind
// Dienstleistungen, die pro Pferd erbracht werden, es gibt keinen Zugang zu
// einem Kurs. Der Hinweis wäre schlicht falsch.
// ---------------------------------------------------------------------------

const SLUG = "nachberatung";

const produkt = digitalFinden(SLUG)!;
const text = verkaufstextZu(SLUG)!;

const BESCHREIBUNG =
  text.einleitung[0] + ` Zurzeit ${preisText(produkt.preis)} pro Pferd.`;

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

export default function NachberatungSeite() {
  // Fehlt eines von beiden, ist das ein Fehler beim Anlegen des Produkts und
  // keine Seite, die es zu zeigen lohnt.
  if (!produkt || !text) {
    notFound();
  }

  return <Verkaufsseite produkt={produkt} text={text} />;
}
