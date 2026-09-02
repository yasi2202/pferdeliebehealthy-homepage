import { partnerFinden, partnerSchluessel } from "./empfehlungen";
import type { Empfehlung } from "./empfehlungen";

// ---------------------------------------------------------------------------
// Einzelne Produkte bei Partnern, für die gezielte Empfehlung im Blogbeitrag.
//
// Der Unterschied zum Partnerkasten: Der nennt einen Shop, das hier nennt ein
// bestimmtes Produkt. "Kräuter helfen bei Fehlgärungen" ist ein Satz, "die
// Oregano-Pellets von Mo's Grun" ist eine Empfehlung, der jemand folgen kann.
//
// ▸ SO TRÄGST DU EIN PRODUKT EIN:
//   Einen Eintrag unten anhängen. `partner` muss genau so heißen wie in
//   lib/empfehlungen.ts, daher kommen Rabattcode und Shopadresse. Fehlt eine
//   `url`, verlinkt der Kasten auf den Shop statt auf die Produktseite.
//
// ▸ WARUM DIE BESCHREIBUNGEN SO NÜCHTERN SIND:
//   Sie sagen, was das Produkt IST, nicht was es BEWIRKT. Gesundheitsbezogene
//   Aussagen zu Futtermitteln sind rechtlich eng geregelt, und im Kasten
//   stehen sie neben einem Kaufknopf, also besonders angreifbar. Was ein
//   Kraut im Pferd tut, gehört in deinen Fließtext, wo es begründet ist.
//
// ▸ TOTE LINKS SIND SCHLIMMER ALS KEINE.
//   Nur eintragen, was du im Shop tatsächlich gesehen hast. Die vier
//   Mo's-Grun-Adressen unten sind am 02.09.2026 geprüft worden.
// ---------------------------------------------------------------------------

export type Partnerprodukt = {
  /** Was im Beitrag steht: [[produkt:mos-grun-oregano]] */
  schluessel: string;
  /** Genau wie in lib/empfehlungen.ts geschrieben. */
  partner: string;
  name: string;
  /** Direkte Produktseite. Fehlt sie, wird der Shop verlinkt. */
  url?: string;
  /** Ein Satz: was es ist, nicht was es kann. */
  kurz: string;
};

export const partnerprodukte: Partnerprodukt[] = [
  {
    schluessel: "mos-grun-oregano",
    partner: "Mo's Grun",
    name: "Kretischer Oregano",
    url: "https://mos-grun.de/products/oregano",
    kurz: "Sortenreine Pellets aus kretischem Oregano, ohne Zusätze.",
  },
  {
    schluessel: "mos-grun-melisse",
    partner: "Mo's Grun",
    name: "Melisse",
    url: "https://mos-grun.de/products/melisse",
    kurz: "Melisse als Pellets, sortenrein und direkt vom Feld.",
  },
  {
    schluessel: "mos-grun-artemisia",
    partner: "Mo's Grun",
    name: "Artemisia annua",
    url: "https://mos-grun.de/products/artemisia",
    kurz: "Einjähriger Beifuß, sortenrein. Gehört zu den Kräutern, die nur kurweise gefüttert werden.",
  },
  {
    schluessel: "mos-grun-brennnessel",
    partner: "Mo's Grun",
    name: "Brennnessel",
    url: "https://mos-grun.de/products/brennnessel",
    kurz: "Brennnessel als sortenreine Pellets.",
  },

  // Ohne Produktadresse: Diese Shops geben ihre Produktseiten nicht so
  // preis, dass ich sie sicher prüfen konnte. Der Kasten verlinkt deshalb
  // auf den Shop. Trag die Adresse ein, wenn du sie zur Hand hast.
  {
    schluessel: "hotte-maxe-moringa",
    partner: "Hotte Maxe",
    name: "Moringa",
    kurz: "Moringa als Kraut, in der Fütterung als Einzelkraut eingesetzt.",
  },
  {
    schluessel: "pernaturam-amara",
    partner: "PerNaturam",
    name: "Amara Bitterkräuter",
    kurz: "Kräutermischung mit Bitterstoffen, unter anderem Wermut, Rosmarin, Beifuß und Löwenzahnwurzel.",
  },
  {
    schluessel: "pernaturam-ostpreussen",
    partner: "PerNaturam",
    name: "Ostpreußen Kräuter",
    kurz: "Vielseitige Kräutermischung, unter anderem mit Kümmel und Mädesüß.",
  },
  {
    schluessel: "elmengrund-kraeuterheucobs",
    partner: "Biohof Elmengrund",
    name: "Kräuter-Heucobs",
    kurz: "Heucobs aus Kräuterheu vom eigenen Hof, in Bio-Qualität.",
  },
];

/** Ein Produkt samt dem Partner, zu dem es gehört. `null`, wenn eines von
 *  beiden fehlt: Ein Produkt ohne hinterlegten Partner hätte weder Code noch
 *  Shopadresse und wäre im Beitrag eine Sackgasse. */
export function produktFinden(
  schluessel: string
): { produkt: Partnerprodukt; partner: Empfehlung } | null {
  const produkt = partnerprodukte.find((p) => p.schluessel === schluessel);
  if (!produkt) return null;

  const partner = partnerFinden(partnerSchluessel(produkt.partner));
  if (!partner) return null;

  return { produkt, partner };
}
