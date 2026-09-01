// ---------------------------------------------------------------------------
// Die digitalen Produkte: Kurse und Pläne, die es nur als Zugang zur Akademie
// gibt, nicht als Ware im Paket.
//
// ▸ WARUM EINE EIGENE DATEI NEBEN lib/shop.ts
//   Ein Kurs ist etwas anderes als ein Eimer Futter. Es gibt keinen Versand,
//   keine Anschrift und keinen Vorrat, dafür einen Zugangsschlüssel, ein
//   Widerrufsrecht mit anderen Regeln und die Freischaltung in der Akademie.
//   Beides in lib/shop.ts zu mischen hätte jede Bestellung mit Feldern
//   belastet, die für sie keinen Sinn ergeben.
//
// ▸ ALLE PREISE STEHEN IN CENT, genau wie im Shop. 2900 sind 29,00 €.
//
// ▸ DIE TEXTE STAMMEN WÖRTLICH VON DER ALFIMA-SEITE. Sie sind nicht gekürzt
//   und nicht geglättet, so wie es beim Shop auch gehalten wurde. Wenn ein
//   Text geändert werden soll, dann hier und bewusst.
//
// ▸ DER `akademieName` IST DER WICHTIGSTE WERT IN DIESER DATEI.
//   Mit genau diesem Namen meldet die Website den Kauf an die Akademie, und
//   dort entscheidet lib/produkt-zugang.ts anhand des Namens, welcher Zugang
//   freigeschaltet wird. Passt der Name auf keine Regel, wird NICHTS
//   freigeschaltet, und der Kauf steht im Protokoll der Akademie unter
//   "Produktname unbekannt". Das ist Absicht und immer noch besser als ein
//   falsch vergebener Zugang, aber du musst es merken. Deshalb bitte den
//   Namen niemals ändern, ohne in der Akademie nachzusehen.
// ---------------------------------------------------------------------------

export type DigitalBlock =
  | { art: "absatz"; text: string; betont?: boolean }
  | { art: "ueberschrift"; text: string }
  | { art: "liste"; punkte: string[] };

export type DigitalProdukt = {
  /** Teil der Adresse: /ganzjahresfutterplan und /kasse/ganzjahresfutterplan */
  slug: string;
  /** Der volle Name, wie er auf der Verkaufsseite und in der Mail steht. */
  name: string;
  /** Kurze Form für Kasse, Mail und Bestellübersicht. */
  kurzname: string;
  /** Der Preis, zu dem regulär verkauft wird. In Cent. */
  preis: number;
  /**
   * Digitale Leistungen: immer 19 %. Der ermäßigte Satz von 7 % gilt für
   * Bücher, auch für E-Books, NICHT aber für Onlinekurse und den Zugang zu
   * einer Lernplattform. Bevor hier bei einem neuen Produkt eine 7 steht,
   * bitte einmal mit der Steuerberatung sprechen.
   */
  mwst: 19;
  /** Die Zeile unter dem Namen, kurz. */
  kurz: string;
  /** Was in der Kasse als Leistungsbeschreibung über dem Knopf steht. */
  leistung: string;
  /**
   * Der Produktname, mit dem der Kauf an die Akademie gemeldet wird.
   * Siehe die lange Erklärung im Kopf dieser Datei.
   */
  akademieName: string;
  /** Nur zur Kontrolle: welchen Zugang die Akademie daraufhin vergibt. */
  erwarteterZugang: string;
  /** Der Verkaufstext der Seite. */
  beschreibung: DigitalBlock[];
};

// ---------------------------------------------------------------------------
// Die Produkte
// ---------------------------------------------------------------------------

export const digitalprodukte: DigitalProdukt[] = [
  {
    slug: "ganzjahresfutterplan",
    name: "Ganzjahresfutterplan für Pferde, natürlich durchs Jahr",
    kurzname: "Ganzjahresfutterplan",
    preis: 2900,
    mwst: 19,
    kurz:
      "Zwölf Monatspläne, die dich vom Fellwechsel bis zur Winterruhe " +
      "begleiten.",
    leistung:
      "Digitaler Zugang zum Ganzjahresfutterplan in der Pferdeliebehealthy " +
      "Akademie, zwölf Monatspläne, dauerhaft abrufbar.",
    // Genau dieser Name trifft in der Akademie auf die Regel
    // /ganzjahresfutterplan/i in lib/produkt-zugang.ts.
    akademieName: "Ganzjahresfutterplan für Pferde, natürlich durchs Jahr",
    erwarteterZugang: "ganzjahresfutterplan",
    beschreibung: [
      {
        art: "absatz",
        text: "Der digitale Ganzjahres-Futterplan begleitet dich Monat für Monat durch das Pferdejahr, mit natürlichen Futterempfehlungen, abgestimmt auf Fellwechsel, Weidezeit, Witterung und die jeweilige Jahreszeit.",
      },
      { art: "ueberschrift", text: "Was du bekommst:" },
      {
        art: "liste",
        punkte: [
          "12 Monatspläne mit Futterplan, Mineralien, Kräutern und saisonalen Schwerpunkten",
          "Onboarding-Bereich mit den wichtigsten Grundlagen zur natürlichen Pferdefütterung",
          "Schritt-für-Schritt-Anleitung zur Erstellung deines eigenen Futterplans",
          "Spezielle Themen wie Impfung, Wurmkur, Wetterwechsel und Senior Pferd",
          "Rabattcodes bei über 13 ausgewählten Partnern",
        ],
      },
      {
        art: "absatz",
        text: "Die Pläne werden zwei Monate im Voraus bereitgestellt, sodass du genug Zeit hast, alles vorzubereiten.",
      },
      {
        art: "absatz",
        text: "Nach dem Kauf bekommst du eine E-Mail mit deinem persönlichen Zugang zur Akademie.",
      },
      {
        art: "absatz",
        betont: true,
        text: "Natürlich füttern. Gesund begleiten.",
      },
    ],
  },
  {
    slug: "basisfutterkurs",
    name: "Basisfutterkurs",
    kurzname: "Basisfutterkurs",
    // 29 € ist der Preis im Upsell, von Yasemin am 31.08.2026 festgelegt.
    // Einen regulären Verkaufspreis gibt es noch nicht, der Kurs wurde bisher
    // nirgends angeboten. Solange `preis` und `upsellPreis` im Funnel gleich
    // sind, kommt bei `ersparnis()` null heraus und die Upsell-Seite zeigt
    // bewusst KEINEN Vergleichspreis. Warum das wichtig ist, steht dort.
    preis: 2900,
    mwst: 19,
    kurz:
      "Die Grundlagen der ganzheitlichen Pferdefütterung in zwanzig Lektionen.",
    leistung:
      "Digitaler Zugang zum Basisfutterkurs in der Pferdeliebehealthy " +
      "Akademie, zwanzig Lektionen, dauerhaft abrufbar.",
    // Trifft in der Akademie auf die Regel /basisfutterkurs/i.
    akademieName: "Basisfutterkurs",
    erwarteterZugang: "basisfutterkurs",
    beschreibung: [
      {
        art: "absatz",
        text: "Die Grundlagen der ganzheitlichen Pferdefütterung: Futterdeklarationen lesen, Mineralien verstehen, Darm sanieren, Leber und Niere unterstützen, dazu Ekzem, Futterumstellung und Entwurmung.",
      },
      {
        art: "absatz",
        text: "Zwanzig Lektionen, dauerhafter Zugang, in deinem Tempo.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Die Funnel
//
// Ein Funnel ist ein Hauptprodukt und höchstens ein Angebot, das danach kommt.
// Mehr als eine Stufe ist bewusst nicht vorgesehen: Zwei oder drei Angebote
// hintereinander verkaufen in Summe weniger als eines, und sie machen die
// Rückabwicklung bei einer Erstattung unübersichtlich.
// ---------------------------------------------------------------------------

export type Funnel = {
  /** Der Slug des Hauptprodukts. */
  produkt: string;
  /** Der Slug des Angebots danach, oder null für einen Funnel ohne Upsell. */
  upsell: string | null;
  /** Der Preis des Upsells in diesem Funnel, in Cent. */
  upsellPreis: number;
  /** Die Überschrift auf der Upsell-Seite. */
  upsellTitel: string;
  /** Der Grund, warum das eine zum anderen passt. Keine Floskel. */
  upsellGrund: string;
};

export const funnel: Funnel[] = [
  {
    produkt: "ganzjahresfutterplan",
    upsell: "basisfutterkurs",
    upsellPreis: 2900,
    upsellTitel: "Möchtest du auch verstehen, warum die Pläne so aussehen?",
    upsellGrund:
      "Der Ganzjahresfutterplan sagt dir, was du wann fütterst. Der " +
      "Basisfutterkurs erklärt dir, warum. Du lernst darin, Deklarationen zu " +
      "lesen und Mineralien einzuordnen, und kannst die Monatspläne danach " +
      "auf dein Pferd zuschneiden, statt sie nur abzuarbeiten.",
  },
];

// ---------------------------------------------------------------------------
// Kleine Helfer
// ---------------------------------------------------------------------------

export function digitalFinden(slug: string): DigitalProdukt | undefined {
  return digitalprodukte.find((p) => p.slug === slug);
}

export function funnelZu(slug: string): Funnel | undefined {
  return funnel.find((f) => f.produkt === slug);
}

/**
 * Wie viel der Upsell günstiger ist als der reguläre Preis. Null, wenn es
 * keine Ersparnis gibt.
 *
 * WARUM DAS HIER SO SORGFÄLTIG GERECHNET WIRD: Ein durchgestrichener Preis
 * darf nur dort stehen, wo tatsächlich auch zu diesem höheren Preis verkauft
 * wird. Steht der Kurs sonst nirgends teurer im Angebot, wäre "statt 49 €"
 * eine Ersparnis, die es nicht gibt. Genau deshalb ist beim Moventa im Shop
 * am 31.08.2026 der Streichpreis entfernt worden. Solange `preis` und
 * `upsellPreis` gleich sind, kommt hier 0 heraus und die Seite zeigt gar
 * keinen Vergleich an.
 */
export function ersparnis(f: Funnel): number {
  const produkt = f.upsell ? digitalFinden(f.upsell) : undefined;
  if (!produkt) return 0;
  const differenz = produkt.preis - f.upsellPreis;
  return differenz > 0 ? differenz : 0;
}
