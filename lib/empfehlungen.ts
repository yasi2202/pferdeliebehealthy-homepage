// ---------------------------------------------------------------------------
// Rabattcodes bei Partnern.
//
// Zu jedem Eintrag:
//   partner   Name der Marke
//   code      Der Rabattcode
//   rabatt    Was der Code bringt, z. B. "5 % Rabatt". Optional.
//   url       Link zum Shop. Optional — fehlt er, steht nur der Code da.
//   warum     Ein Satz, warum du es empfiehlst. Optional, wirkt aber stark.
//   bezahlt   true = du bekommst eine Provision.
//
// ▸ Stand 25.08.2026: Alle zehn Partner haben Shop-Link und Beschreibung.
//
// ▸ Die Rabatthöhe (`rabatt`) steht nur bei Mycelium, weil sie bei den
//   anderen nicht bekannt ist. Das ist Absicht und kein Versehen: Lieber
//   gar keine Angabe als eine geratene, denn eine falsche Prozentzahl auf
//   einer Werbeseite ist abmahnfähig. Die Karten sehen ohne die Zeile
//   genauso gut aus. Wenn du eine Höhe erfährst, hier nachtragen.
//
// ▸ Die Sätze bei `warum` beschreiben, was der Shop führt. Sie stehen unter
//   deinem Namen auf der Seite — änder sie so, dass sie nach dir klingen.
//
// ▸ `bezahlt` steht überall auf true, weil Partner-Rabattcodes in aller
//   Regel mit einer Provision verbunden sind und eine Kennzeichnung zu viel
//   unproblematisch ist, eine fehlende dagegen abmahnfähig. Wo du KEINE
//   Provision bekommst, setz es auf false.
// ---------------------------------------------------------------------------

export type Empfehlung = {
  partner: string;
  code: string;
  rabatt?: string;
  url?: string;
  warum?: string;
  bezahlt: boolean;
};

export const empfehlungen: Empfehlung[] = [
  {
    partner: "Biohof Elmengrund",
    code: "yasi05",
    url: "https://biohof-elmengrund.de/",
    warum:
      "Bio-Grundfutter direkt vom Hof. Kräuterheu, Heulage und Cobs, wenn du schon bei der Basis der Ration auf Qualität achten willst.",
    bezahlt: true,
  },
  {
    partner: "PerNaturam",
    code: "1677E54156",
    url: "https://www.pernaturam.de/",
    warum:
      "Breites Sortiment an Kräutern, Mineralstoffen und Ergänzungsfutter auf naturheilkundlicher Basis, für Pferde ebenso wie für Hund und Katze.",
    bezahlt: true,
  },
  // Schreibweise ohne Umlaut ist korrekt so — bitte nicht zu "Grün" ändern.
  {
    partner: "Mo's Grun",
    code: "Pferdeliebe",
    url: "https://mos-grun.de/",
    warum:
      "Sortenreine Pellets direkt vom Feld, etwa Grünhanf, Melisse, Brennnessel oder Echinacea, wenn du gezielt eine einzelne Pflanze füttern möchtest.",
    bezahlt: true,
  },
  {
    partner: "Hotte Maxe",
    code: "Pferdeliebe",
    url: "https://www.hottemaxe.de/neu/",
    warum:
      "Einzelkräuter und fertige Kräutermischungen für Pferde, praktisch, wenn du eine Mischung selbst zusammenstellen möchtest.",
    bezahlt: true,
  },
  {
    partner: "Natusat",
    code: "pferdeliebehealthy7",
    url: "https://natusat.de/",
    warum:
      "Einzelstoffe wie Aminosäuren, Algen und Kräuter, dazu Mischungen für Bewegungsapparat und Stoffwechsel, gut, wenn du eine Ration gezielt ergänzen willst.",
    bezahlt: true,
  },
  // Schreibweise ist korrekt so — kein Tippfehler, bitte nicht "korrigieren".
  {
    partner: "Foten",
    code: "pferdeliebehealthy",
    url: "https://foten.net/shop/",
    warum:
      "Spezialist für Omega-3, wahlweise aus Algen oder aus Fisch, der richtige Ort, wenn es dir gezielt um die Fettsäureversorgung geht.",
    bezahlt: true,
  },
  {
    partner: "CDVet",
    code: "pferdeliebe",
    url: "https://www.cdvet.de/",
    warum:
      "Breites Sortiment für Pferd, Hund und Katze: Futterergänzungen, Pflege und Stallhygiene aus einer Hand.",
    bezahlt: true,
  },
  {
    partner: "Naturanima",
    code: "pferdeliebehealthy",
    url: "https://naturanima.de/",
    warum:
      "Kräutermischungen nach Themen sortiert, für Bewegungsapparat, Stoffwechsel, Darm, Atemwege, Haut und Hufe, wenn du nicht selbst mischen möchtest.",
    bezahlt: true,
  },
  {
    partner: "Bäralis",
    code: "D9A6A233",
    url: "https://baeralis.de/",
    warum:
      "Pflege und Wundversorgung fürs Pferd, mit einer eigenen Ecke für schnelle Hilfe, praktisch für die Stallapotheke.",
    bezahlt: true,
  },
  {
    partner: "Mycelium Vitalpilze",
    code: "Pferdeliebehealthy",
    rabatt: "5 % Rabatt",
    url: "https://www.mycelium-vitalpilze.de/",
    warum:
      "Vitalpilze als Kapseln und Pulver, mit eigenen Varianten für Pferd, Hund und Katze. Reishi, Cordyceps, Hericium und weitere.",
    bezahlt: true,
  },

  // --- Aus der Codeliste in RatioPro übernommen, 02.09.2026 ---------------
  // Diese vier standen dort schon, auf der Website fehlten sie. Die Sätze bei
  // `warum` beschreiben, was der jeweilige Shop führt. Sie stehen unter
  // Yasemins Namen und gehören von ihr gegengelesen.
  {
    partner: "Laurel Nature",
    code: "Pferdeliebe",
    url: "https://laurelnature.com/",
    warum:
      "Mineralfutter und Ergänzungen ohne Getreide, Melasse und synthetische Zusätze, aufgebaut als Baukasten aus Grundversorgung und gezielten Ergänzungen.",
    bezahlt: true,
  },
  {
    partner: "Natural Equibalance",
    code: "PFERDELIEBEHEALTHY",
    url: "https://www.natural-equibalance.com/",
    warum:
      "Getreidefreie Ergänzungsfutter mit Blick auf das Mikrobiom, ohne Aromen, Bindemittel und Konservierungsstoffe. Schwerpunkt Magen und Darm.",
    bezahlt: true,
  },
  {
    partner: "Seewinkler Hanferei",
    code: "pferdeliebehealthy10",
    url: "https://seewinkler-naturprodukte.com/",
    warum:
      "Hanfprodukte und Vitalpilze aus dem Burgenland, in Bio-Qualität und ohne Zusätze, für Pferd und Hund.",
    bezahlt: true,
  },
  {
    partner: "Wild Baboon",
    code: "AloeVera",
    url: "https://wildbaboon.de/",
    warum:
      "Bio-Aloe-Vera als Direktsaft und als Gel, ohne Verdünnung und ohne Zusätze, wenn du gezielt mit Aloe arbeiten möchtest.",
    bezahlt: true,
  },
];

/** Werbekennzeichnung. Steht oben auf der Seite, vor dem ersten Code. */
export const werbehinweis =
  "Für die Codes auf dieser Seite bekomme ich eine Provision, wenn du damit bestellst. Für dich wird es dadurch nicht teurer, im Gegenteil, mit dem Code zahlst du weniger. Empfehlen tue ich trotzdem nur, was ich selbst einsetze oder geprüft habe.";

/** Kurzname eines Partners, wie er im Blog als Marker verwendet wird:
 *  aus "Biohof Elmengrund" wird "biohof-elmengrund". */
export function partnerSchluessel(name: string): string {
  return name
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Sucht einen Partner über seinen Kurznamen. */
export function partnerFinden(schluessel: string): Empfehlung | undefined {
  return empfehlungen.find((e) => partnerSchluessel(e.partner) === schluessel);
}
