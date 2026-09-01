import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Verkaufsseite from "@/components/Verkaufsseite";
import { digitalFinden } from "@/lib/digital";
import { verkaufstextZu } from "@/lib/verkaufstexte";

// ---------------------------------------------------------------------------
// Die Verkaufsseite zu Magen Reset.
//
// Sie enthält absichtlich fast nichts: Der Aufbau steckt in
// components/Verkaufsseite.tsx, die Texte in lib/verkaufstexte.ts und Preis
// und Zugang in lib/digital.ts. So sehen alle Produktseiten gleich aus, und
// eine Verbesserung am Aufbau wirkt sofort auf allen.
// ---------------------------------------------------------------------------

const SLUG = "magen-reset";

const produkt = digitalFinden(SLUG)!;
const text = verkaufstextZu(SLUG)!;

const BESCHREIBUNG =
  text.einleitung[0] +
  ` Zurzeit ${(produkt.preis / 100).toFixed(0)} €` +
  (produkt.statt ? ` statt ${(produkt.statt / 100).toFixed(0)} €` : "") +
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
    images: [{ url: "/images/yasi-helena.jpg", width: 1122, height: 1402 }],
  },
};

export default function MagenResetSeite() {
  // Fehlt eines von beiden, ist das ein Fehler beim Anlegen des Produkts und
  // keine Seite, die es zu zeigen lohnt.
  if (!produkt || !text) {
    notFound();
  }

  return <Verkaufsseite produkt={produkt} text={text} />;
}
