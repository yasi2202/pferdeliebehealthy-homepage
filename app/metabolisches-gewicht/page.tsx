import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Verkaufsseite from "@/components/Verkaufsseite";
import { digitalFinden } from "@/lib/digital";
import { preisText } from "@/lib/shop";
import { verkaufstextZu } from "@/lib/verkaufstexte";

// ---------------------------------------------------------------------------
// Die Verkaufsseite zum Pro-Modul „Metabolisches Gewicht", 29 €.
//
// ▸ WARUM ES SIE GIBT, OBWOHL DAS PRODUKT VERSTECKT IST
//   Verkauft wird nur über einen Link aus der Mail. Ein Link direkt in die
//   Kasse verkauft aber nichts: Dort stehen Preis, ein Satz
//   Leistungsbeschreibung und drei Häkchen. Wer 29 € ausgibt, will vorher
//   sehen, was drin ist. Deshalb dieselbe Seite wie bei jedem anderen
//   Angebot, nur ohne Eintrag in Shop und Sitemap.
//
// ▸ NOINDEX IST HIER ABSICHT UND KEIN VERSEHEN
//   Das Angebot richtet sich an eine benannte Gruppe. Stünde die Seite im
//   Suchindex, wäre es kein verstecktes Angebot mehr, und in der Übersicht
//   unter /shop taucht es bewusst nicht auf. Wer den Link hat, kann kaufen;
//   das ist gewollt und braucht Google nicht.
// ---------------------------------------------------------------------------

const SLUG = "metabolisches-gewicht";

const produkt = digitalFinden(SLUG)!;
const text = verkaufstextZu(SLUG)!;

export const metadata: Metadata = {
  title: text.seitentitel,
  description:
    text.einleitung[0] + ` ${preisText(produkt.preis)}, dauerhafter Zugang.`,
  robots: { index: false, follow: false },
};

export default function MetabolischesGewichtSeite() {
  if (!produkt || !text) {
    notFound();
  }

  return <Verkaufsseite produkt={produkt} text={text} />;
}
