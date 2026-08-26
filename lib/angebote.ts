// ---------------------------------------------------------------------------
// Deine Angebote, Stand 24.08.2026.
//
// ▸ NOCH EINZUTRAGEN: bei mehreren Angeboten fehlen Preis und Link.
//   Wo `preis` fehlt, zeigt die Seite einfach keinen an — es steht also
//   nirgends eine erfundene Zahl. Wo `url` fehlt, führt der Eintrag auf
//   die Kontaktanfrage.
//
// ▸ Die Ausbildung heißt jetzt „Masterclass zur ganzheitlichen
//   Pferdefütterung". Preis und Modulzahl habe ich aus dem bisherigen
//   Ausbildungs-Eintrag übernommen — BITTE PRÜFEN, ob 899 € und 8 Module
//   noch stimmen.
// ---------------------------------------------------------------------------

export type Angebot = {
  name: string;
  untertitel?: string;
  preis?: string;
  url?: string;
};

/** Weg 1 — für Leute mit eigenem Pferd. Reihenfolge = Einstieg zuerst. */
export const fuerDeinPferd: Angebot[] = [
  {
    name: "Die Basis einer guten Versorgung",
    untertitel: "Der Einstieg in eine durchdachte Fütterung",
    // preis: "",  ← fehlt noch
    url: "https://alfima.com/pferdeliebehealthy/was-dein-mineralfutter-dir-nicht-sagt",
  },
  {
    name: "Mineral-Klarheit",
    untertitel: "Kurs mit Rechner, du rechnest selbst",
    preis: "27 €",
    // Fuehrt auf die eigene Seite, nicht direkt zu alfima: dort steht die
    // ausfuehrliche Beschreibung, und gekauft wird von dort aus weiter.
    url: "/mineral-klarheit",
  },
  {
    name: "RatioPro",
    untertitel: "Die einfache Rationsberechnung für dein Pferd",
    // preis: "",  ← fehlt noch
    // url: "",    ← fehlt noch
  },
  {
    name: "Ganzjahresfutterplan",
    untertitel: "Natürlich durchs Jahr",
    // preis: "",  ← fehlt noch
    // url: "",    ← fehlt noch
  },
  {
    name: "Futterberatung 365",
    untertitel: "Deine Gesundheitsakte, 1:1 mit mir erarbeitet",
    preis: "auf Anfrage",
  },
];

type Masterclass = {
  name: string;
  beschreibung: string;
  kennzahlen: { zahl: string; label: string }[];
  schnupperkurs: { name: string; untertitel: string; url?: string };
};

/** Weg 2 — für angehende Beraterinnen. */
export const masterclass: Masterclass = {
  name: "Masterclass zur ganzheitlichen Pferdefütterung",
  beschreibung:
    "Von den Grundlagen bis zur eigenen Beratungspraxis. Am Ende steht ein Zertifikat — und ein System, mit dem du sofort arbeiten kannst.",
  kennzahlen: [
    { zahl: "8", label: "Module" },
    { zahl: "899 €", label: "einmalig" },
    { zahl: "∞", label: "Zugang" },
  ],
  /** Kostenloser Einstieg. Link fehlt noch. */
  schnupperkurs: {
    name: "Kostenloser Schnupperkurs",
    untertitel: "Schau erst rein, bevor du dich entscheidest",
    url: "https://alfima.com/pferdeliebehealthy/kostenloser-einblick-in-die-ausbildung-zur-ganzheitlichen-pferdefutterung",
  },
};
