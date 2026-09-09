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
  /** Produktbild in public/images/produkte/, ohne Ordner geschrieben.
   *  Nur echte Herstellerbilder, nichts Nachgebautes. */
  bild?: string;
  /**
   * Was für ein Produkt ist das? Steuert den Pflichthinweis im Kasten.
   *
   * ▸ "futter" (Voreinstellung): Futter- und Ergänzungsfuttermittel. Der
   *   Kasten setzt dann den Satz, dass Futter kein Arzneimittel ist.
   *   Grundlage ist Art. 13 Abs. 3 der Verordnung (EG) 767/2009: Für ein
   *   Futtermittel darf nicht damit geworben werden, dass es einer Krankheit
   *   vorbeugt, sie behandelt oder heilt. Nur eingetragene Diätfuttermittel
   *   dürfen einen Verwendungszweck nennen, und dafür gibt es eine
   *   geschlossene EU-Liste.
   * ▸ "pflege": Pflege- und Wundprodukte, die man nicht füttert.
   */
  art?: "futter" | "pflege";
  /**
   * Ist das ein **Biozidprodukt**, also ein Desinfektionsmittel?
   *
   * ▸ DANN IST EIN WARNHINWEIS PFLICHT, und zwar in jeder Werbung, nicht nur
   *   auf dem Etikett. Art. 72 der Biozid-Verordnung (EU) 528/2012 verlangt
   *   wörtlich: „Biozidprodukte vorsichtig verwenden. Vor Gebrauch stets
   *   Etikett und Produktinformation lesen." Er muss sich deutlich vom Rest
   *   der Werbung abheben und gut lesbar sein.
   *
   *   Ein Partnerkasten IST Werbung. Deshalb setzt der Kasten den Hinweis
   *   selbst, sobald hier `true` steht: So kann er beim nächsten Produkt
   *   nicht vergessen werden.
   *
   * ▸ AUSSERDEM VERBOTEN sind bei solchen Produkten die Wörter „ungiftig",
   *   „unschädlich", „natürlich", „umweltfreundlich", „tierfreundlich" und
   *   alles, was das Risiko kleinredet. Beim Schreiben von `kurz` daran
   *   denken.
   *
   *   Verbandmaterial und Pflaster sind KEINE Biozidprodukte.
   */
  biozid?: boolean;
};

export const partnerprodukte: Partnerprodukt[] = [
  // ▸ BÄRALIS: die drei Produkte aus dem Wundversorgungs-Beitrag.
  //   Sie standen dort seit jeher als Fließtext ohne Link, obwohl Bäralis
  //   ein bezahlter Partner ist. Ein Kasten macht daraus einen klickbaren
  //   Weg mit Partnerkennung, und er trägt die Werbekennzeichnung, die ein
  //   Satz im Fließtext nicht hat.
  //
  //   ▸ DIE KENNUNG ?sPartner=d1c04513 MUSS AN JEDER ADRESSE DRANBLEIBEN.
  //     Ohne sie wird eine Bestellung Yasemin nicht zugerechnet. Beim
  //     Austauschen einer Adresse also immer prüfen, ob sie noch dranhängt.
  //
  //   ▸ DIE NAMEN SIND DIE AUS DEM SHOP, nicht die aus dem Blogtext.
  //     Im Beitrag stand „Hauttalent Nr. 1", „Hydrogel Nr. 2" und
  //     „Fliegenpflaster". Im Shop heißen sie „Haut-Talent", „Hydro-Gel" und
  //     „Pferde-Pflaster". Wer im Kasten einen anderen Namen liest als auf
  //     der Seite, an der er landet, wird unsicher.
  {
    schluessel: "baeralis-hauttalent",
    partner: "Bäralis",
    art: "pflege",
    name: "Haut-Talent Nr. 1",
    url: "https://baeralis.de/nr-1-haut-talent-fuer-pferde?sPartner=d1c04513",
    kurz: "Der Wundreiniger der Reihe. Brennt nicht, ist alkoholfrei und muss nicht abgespült werden.",
    biozid: true,
  },
  {
    schluessel: "baeralis-hydrogel",
    partner: "Bäralis",
    art: "pflege",
    name: "Hydro-Gel Nr. 2",
    url: "https://baeralis.de/baeralis-hydro-gel-pferd-desinfektion?sPartner=d1c04513",
    kurz: "Das Gel für den zweiten Schritt. Es bleibt auf der Wunde und hält sie feucht.",
    biozid: true,
  },
  {
    schluessel: "baeralis-fliegenpflaster",
    partner: "Bäralis",
    art: "pflege",
    name: "Pferde-Pflaster",
    url: "https://baeralis.de/pferdepflaster-wundschutz-fliegenschutz?sPartner=d1c04513",
    kurz: "Luftdurchlässiger Wundschutz, der Fliegen fernhält. Die Alternative zum Farbspray im Sommer.",
  },
  {
    // Das Set aus den drei Produkten oben. Susan Bär hat es am 09.09.2026
    // vorgeschlagen: Wer die drei Schritte einzeln zusammensuchen muss,
    // bricht unterwegs ab. Deshalb steht der Kasten am Ende der
    // Schritt-für-Schritt-Anleitung, zusätzlich zu den Einzelkästen.
    schluessel: "baeralis-stallapotheke",
    partner: "Bäralis",
    art: "pflege",
    name: "Stallapotheke BASIS",
    url: "https://baeralis.de/stallapotheke-mit-pferdepflaster-pferd?number=1092&sPartner=d1c04513",
    kurz: "Haut-Talent, Hydro-Gel und Pferde-Pflaster als Set, günstiger als die drei Teile einzeln.",
    biozid: true,
  },
  {
    // Der Krustenlöser aus dem Mauke-Beitrag. Von Susan Bär am 09.09.2026
    // vorgeschlagen, von Yasemin freigegeben.
    //
    // ▸ KEIN BIOZID, sondern ein Pflegeprodukt. Deshalb steht hier kein
    //   `biozid: true`, der Warnhinweis wäre sonst falsch.
    // ▸ IM MAUKE-BEITRAG STEHT ER BEWUSST IM PFLEGEABSCHNITT und nicht neben
    //   dem Krankheitsbild. Er löst Krusten, er behandelt keine Mauke. Der
    //   Hersteller nennt die Adresse zwar "nr-3-mauke-schaum", der Name auf
    //   der Packung ist aber "Fessel-Schaum". Wir schreiben den.
    schluessel: "baeralis-fesselschaum",
    partner: "Bäralis",
    art: "pflege",
    name: "Fessel-Schaum Nr. 3",
    url: "https://baeralis.de/nr-3-mauke-schaum?sPartner=d1c04513",
    kurz: "Schaum zum Lösen von Krusten, der ohne Wasser auskommt. Mit Panthenol, für den Fesselbereich gedacht.",
  },
  {
    // Oregano gibt es bei beiden Partnern, aber nicht als dasselbe Produkt:
    // Der "Kretische Oregano" ist der von PerNaturam, Mo's Grun führt
    // Pellets. Von Yasemin am 02.09.2026 richtiggestellt.
    schluessel: "mos-grun-oregano",
    partner: "Mo's Grun",
    name: "Oregano-Pellets",
    url: "https://mos-grun.de/products/oregano",
    kurz: "Sortenreiner Oregano als Pellets, direkt vom Feld. Praktisch, weil Oregano pur oft nicht gern gefressen wird.",
  },
  {
    schluessel: "pernaturam-kretischer-oregano",
    partner: "PerNaturam",
    name: "Kretischer Oregano",
    kurz: "Kretischer Oregano, eines der Kräuter, die nur kurweise ins Futter gehören.",
  },
  {
    schluessel: "hotte-maxe-oregano",
    partner: "Hotte Maxe",
    name: "Oregano als Kraut",
    kurz: "Oregano in Krautform, wenn du selbst mischen möchtest.",
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

  // Die beiden Blüten sind am 09.09.2026 im Shop geprüft worden, beide
  // sofort versandfertig. Ringelblume gibt es in 100 g, 500 g, 1 kg und 7 kg,
  // Hibiskus in 150 g, 500 g und 1 kg. Sie sind die Kräuter aus dem
  // Müsli-Rezept in inhalte/blog/pferdemuesli-selber-mischen.md.
  //
  // ACHTUNG beim Hibiskus: Hotte Maxe empfiehlt ihn ausdrücklich nur
  // "für bis zu sechs Wochen". Diese Grenze gehört in jeden Text, in dem
  // der Kasten steht, sonst empfiehlt der Beitrag eine Dauerfütterung, von
  // der der Hersteller selbst abrät.
  {
    schluessel: "hotte-maxe-ringelblume",
    partner: "Hotte Maxe",
    name: "Ringelblumenblüten mit Kelch, getrocknet",
    url: "https://www.hottemaxe.de/ringelblumenblueten-mit-kelch-getrocknet-ganz-383",
    kurz: "Ganze getrocknete Ringelblumenblüten mit Kelch. Der Hersteller empfiehlt 20 bis 30 g am Tag für ein Pferd von 500 kg.",
  },
  {
    schluessel: "hotte-maxe-hibiskus",
    partner: "Hotte Maxe",
    name: "Hibiskusblüten, getrocknet",
    url: "https://www.hottemaxe.de/hibiskusblueten-getrocknet-ganz-385",
    kurz: "Ganze getrocknete Hibiskusblüten, säuerlich im Geschmack. Der Hersteller empfiehlt 25 g am Tag für ein Pferd von 500 kg, und das nur für bis zu sechs Wochen.",
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
  // Die beiden FeedFix-Pellets sind am 09.09.2026 im Shop geprüft worden:
  // Futterprobe 4 kg und Einzelsack 20 kg, beide lieferbar. Verlinkt ist die
  // Produktseite, dort wählt man die Menge selbst. Die 4-Kilo-Probe ist genau
  // die Menge, die ins Müsli-Rezept geht.
  {
    schluessel: "elmengrund-luzerne-pellets",
    partner: "Biohof Elmengrund",
    name: "BIO Luzerne-Pellets (feed fix)",
    url: "https://biohof-elmengrund.de/products/bio-luzerne-pellets-feedfix-trocken-futtern",
    kurz: "Die ganze Luzernepflanze, warmluftgetrocknet und kurzfaserig pelletiert. Für die Trockenverfütterung freigegeben, quillt aber auch in kaltem Wasser auf.",
  },
  {
    schluessel: "elmengrund-gruenhafer-pellets",
    partner: "Biohof Elmengrund",
    name: "BIO Grünhafer-Pellets (feed fix)",
    url: "https://biohof-elmengrund.de/products/bio-grunhafer-pellets-feedfix-trocken-futtern",
    kurz: "Die ganze Haferpflanze, kurz nach der Blüte geerntet und kurzfaserig pelletiert. Strukturreich und stark reduziert in der Stärke.",
  },
  // Die beiden Strohsorten sind am 04.09.2026 im Shop geprüft worden:
  // einzelner Probeballen von rund 11 kg, Kleinballen nur als Palette mit
  // zwölf Stück. Beide Kästen verlinken deshalb auf den Probeballen, das ist
  // die Menge zum Ausprobieren und für die erste Umstellungswoche.
  {
    schluessel: "elmengrund-haferstroh",
    partner: "Biohof Elmengrund",
    name: "BIO Hafer-Stroh, Probeballen",
    url: "https://biohof-elmengrund.de/products/bio-hafer-stroh-futterprobe-ca-11-kg",
    bild: "elmengrund-haferstroh.webp",
    kurz: "Ausgedroschenes Haferstroh in Bioland-Qualität, warmluftgetrocknet. Einzelner Ballen von rund 11 Kilo zum Ausprobieren.",
  },
  {
    schluessel: "elmengrund-gruenhaferstroh",
    partner: "Biohof Elmengrund",
    name: "BIO Grünhafer-Stroh, Probeballen",
    url: "https://biohof-elmengrund.de/products/bio-grunhafer-stroh-futterprobe-ca-11-kg",
    bild: "elmengrund-gruenhaferstroh.webp",
    kurz: "Die ganze Haferpflanze, kurz nach der Blüte geerntet, mit Blattanteil. Einzelner Ballen von rund 11 Kilo zum Ausprobieren.",
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
