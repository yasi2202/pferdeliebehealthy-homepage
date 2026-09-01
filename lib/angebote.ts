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
    // Bei alfima ein 0-€-Produkt. Auf der Seite steht "kostenlos" statt
    // "0 €" — das liest sich wie ein Angebot und nicht wie ein Restposten.
    preis: "kostenlos",
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
    // Preis von der alfima-Seite abgelesen, 26.08.2026. Dort steht ein
    // Streichpreis von 199 € daneben — hier bewusst nur der echte Preis,
    // die Liste hat pro Zeile Platz fuer eine Zahl.
    preis: "69 €",
    url: "https://alfima.com/pferdeliebehealthy/ratiopro-die-einfache-rationsberechnung-fur-dein-pferd",
  },
  {
    name: "Ganzjahresfutterplan",
    untertitel: "Natürlich durchs Jahr",
    // Preis von der alfima-Seite abgelesen, 26.08.2026. Streichpreis dort: 99 €.
    preis: "29 €",
    url: "https://alfima.com/pferdeliebehealthy/ganzjahresfutterplan-fur-pferde-naturlich-durchs-jahr",
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

/** Weg 2 — für angehende Beraterinnen.
 *
 *  Heißt seit 27.08.2026 wie im ZFU-Zulassungsantrag und nicht mehr
 *  „Masterclass". Zwei Gründe: Die ZFU prüft im Verfahren auch das
 *  Werbematerial, und der Lehrgangstitel muss überall derselbe sein. Und
 *  „Masterclass" führt eine Wettbewerberin für ihre Profi-Ausbildung, du
 *  würdest also mit ihr verwechselt. In der Akademie darf der alte Name
 *  bleiben, dort sieht ihn nur, wer schon gekauft hat.
 *
 *  Die Kennzahl „∞ Zugang" ist bewusst raus: Die Lehrgangsdauer sind laut
 *  Antrag 12 Monate, ein unbefristeter Zugang stünde dagegen. */
export const masterclass: Masterclass = {
  name: "Ausbildung Ganzheitliche Pferdefütterung",
  beschreibung:
    "Von den Grundlagen bis zur eigenen Beratungspraxis. Am Ende steht deine individuelle Abschlussprüfung, ein Zertifikat, und mit RatioPro und EquiDesk zwei Werkzeuge, die dir dauerhaft bleiben.",
  kennzahlen: [
    { zahl: "8", label: "Module" },
    { zahl: "899 €", label: "einmalig" },
    { zahl: "12", label: "Monate" },
  ],
  /** Kostenloser Einstieg. Link fehlt noch. */
  schnupperkurs: {
    name: "Kostenloser Schnupperkurs",
    untertitel: "Schau erst rein, bevor du dich entscheidest",
    url: "https://alfima.com/pferdeliebehealthy/kostenloser-einblick-in-die-ausbildung-zur-ganzheitlichen-pferdefutterung",
  },
};

// ---------------------------------------------------------------------------
// Angebote, die unter einem Insider-Beitrag empfohlen werden können.
//
// In der Kopfzeile einer Beitragsdatei steht dafür z. B. `angebot: mineral`.
// Passt keins, lässt du die Zeile weg — ein aufgezwungener Verkaufskasten
// unter einem Fachtext schadet mehr, als er bringt.
// ---------------------------------------------------------------------------

export type Angebotshinweis = {
  augenbraue: string;
  name: string;
  text: string;
  knopf: string;
  url: string;
};

export const angebotsHinweise: Record<string, Angebotshinweis> = {
  mineral: {
    augenbraue: "Dazu passend",
    name: "Mineral-Klarheit",
    text: "Der Kurs mit Rechner: Du liest eine Deklaration nicht mehr nur, du verstehst sie, und rechnest selbst durch, ob ein Mineralfutter zu deinem Pferd passt.",
    knopf: "Mineral-Klarheit ansehen",
    url: "/mineral-klarheit",
  },
  "futter-check": {
    augenbraue: "Kostenlos",
    name: "Der Futter-Check",
    text: "Fünf Fragen, keine drei Minuten, und danach weißt du, ob die Fütterung deines Pferdes wirklich zu seiner Situation passt.",
    knopf: "Zum Futter-Check",
    url: "/futter-check",
  },
  ratiopro: {
    augenbraue: "Dazu passend",
    name: "RatioPro",
    text: "Die einfache Rationsberechnung für dein Pferd, damit du siehst, was tatsächlich im Trog landet und was fehlt.",
    knopf: "RatioPro ansehen",
    url: "https://alfima.com/pferdeliebehealthy/ratiopro-die-einfache-rationsberechnung-fur-dein-pferd",
  },
  ganzjahresfutterplan: {
    augenbraue: "Dazu passend",
    name: "Ganzjahresfutterplan",
    text: "Natürlich durchs Jahr: was dein Pferd wann braucht, saisonal gedacht statt das ganze Jahr über gleich.",
    knopf: "Ganzjahresfutterplan ansehen",
    url: "https://alfima.com/pferdeliebehealthy/ganzjahresfutterplan-fur-pferde-naturlich-durchs-jahr",
  },
  masterclass: {
    augenbraue: "Für angehende Beraterinnen",
    name: "Die Ausbildung Ganzheitliche Pferdefütterung",
    text: "Von den Grundlagen bis zur eigenen Beratungspraxis, mit individueller Abschlussprüfung, Zertifikat und den Werkzeugen RatioPro und EquiDesk, die dir dauerhaft bleiben.",
    knopf: "Die Ausbildung ansehen",
    // Führt auf die eigene Seite statt direkt zu alfima: dort steht alles
    // erklärt, und der kostenlose Schnupperkurs steht dort ganz oben.
    url: "/ausbildung",
  },
};

/** Findet den Angebotshinweis zu einem Schlüssel. Null, wenn keiner passt.
 *
 *  Nicht mit `empfehlungen` aus lib/empfehlungen.ts verwechseln — das sind
 *  die Rabattcodes der Partner, etwas ganz anderes. */
export function angebotshinweisFinden(schluessel: string): Angebotshinweis | null {
  return angebotsHinweise[schluessel] ?? null;
}
