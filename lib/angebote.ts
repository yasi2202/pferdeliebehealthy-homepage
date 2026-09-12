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

/** Weg 1 — für Leute mit eigenem Pferd.
 *
 *  ▸ REIHENFOLGE: der günstigste Einstieg zuerst, dann aufsteigend nach
 *    Preis. Am 09.09.2026 so festgelegt, weil vorher RatioPro (69 €) vor dem
 *    Ganzjahresfutterplan (59 €) stand und die Liste damit mittendrin
 *    zurücksprang. Wer hier ein Angebot einfügt, sortiert es nach Preis ein. */
export const fuerDeinPferd: Angebot[] = [
  // ▸ HIER STAND "Die Basis einer guten Versorgung", ein kostenloses Heft bei
  //   alfima. Am 02.09.2026 entfernt: Die Adresse antwortet mit 404, das
  //   Produkt gibt es nicht mehr, und alfima wird nicht weiter genutzt.
  //   Der kostenlose Einstieg ist jetzt der Futter-Check weiter unten.
  {
    name: "Mineral-Klarheit",
    untertitel: "Kurs mit Rechner, du rechnest selbst",
    preis: "27 €",
    // Fuehrt auf die eigene Seite, nicht direkt zu alfima: dort steht die
    // ausfuehrliche Beschreibung, und gekauft wird von dort aus weiter.
    url: "/mineral-klarheit",
  },
  {
    name: "Ganzjahresfutterplan",
    untertitel: "Ganzheitlich durchs Jahr",
    // Am 02.09.2026 von 29 auf 59 € angehoben, siehe lib/digital.ts.
    preis: "59 €",
    url: "/ganzjahresfutterplan",
  },
  {
    name: "RatioPro",
    untertitel: "Die einfache Rationsberechnung für dein Pferd",
    // Regulaer 99 €, zurzeit 69 €. Die Liste zeigt bewusst nur eine Zahl,
    // pro Zeile ist nur fuer eine Platz.
    preis: "69 €",
    url: "/ratiopro",
  },
  // Die Beratung hat seit dem 03.09.2026 eine Treppe. Hier stehen bewusst nur
  // zwei Stufen: der Einstieg und das große Angebot. Nachberatung (69 €),
  // Befund-Einschätzung (79 €) und die drei Monate (249 €) findet man über
  // /shop und über die Verweise auf den Verkaufsseiten. Eine Liste mit fünf
  // Beratungszeilen würde die beiden Wege auf der Startseite erschlagen.
  {
    name: "Futterplan",
    untertitel: "Einmal durchgerechnet, mit vier Wochen Begleitung",
    // Maßgeblich ist immer lib/digital.ts, hier steht nur die Anzeige.
    preis: "149 €",
    url: "/futterplan",
  },
  {
    name: "Pferdeliebe 365",
    untertitel: "Deine Gesundheitsakte, 1:1 mit mir erarbeitet",
    // 599 € seit dem 03.09.2026. Der Jahresplan enthält seither vier feste
    // Termine über zwölf Monate statt nur vier Wochen Begleitung.
    preis: "599 €",
    // Die Verkaufsseite gab es schon lange, die Angebotsliste verlinkte sie
    // aber nicht, deshalb sah niemand den Preis.
    url: "/pferdeliebe-365",
  },
];

type Masterclass = {
  name: string;
  beschreibung: string;
  kennzahlen: { zahl: string; label: string }[];
  schnupperkurs: { name: string; untertitel: string };
};

/** Weg 2 — für angehende Beraterinnen.
 *
 *  Heißt seit 27.08.2026 wie im ZFU-Zulassungsantrag und nicht mehr
 *  „Masterclass". Zwei Gründe: Die ZFU prüft im Verfahren auch das
 *  Werbematerial, und der Lehrgangstitel muss überall derselbe sein. Und
 *  „Masterclass" führt eine Wettbewerberin für ihre Profi-Ausbildung, du
 *  würdest also mit ihr verwechselt.
 *
 *  Seit dem 07.09.2026 heißt er auch in der Akademie so, in RatioPro und im
 *  Ganzjahresfutterplan ebenfalls. Der alte Name durfte dort eine Weile
 *  stehen bleiben, weil ihn nur sieht, wer schon gekauft hat; jetzt ist er
 *  überall derselbe. Der Bezeichner `masterclass` in diesem Code bleibt
 *  dagegen, wie er ist: Blogbeiträge schalten ihren Empfehlungskasten über
 *  `angebot: "masterclass"` im Frontmatter, ein Umbenennen würde sie
 *  stillschweigend leerlaufen lassen.
 *
 *  Die Kennzahl „∞ Zugang" ist bewusst raus: Die Lehrgangsdauer sind laut
 *  Antrag 12 Monate, ein unbefristeter Zugang stünde dagegen. */
export const masterclass: Masterclass = {
  name: "Ausbildung Ganzheitliche Pferdefütterung",
  beschreibung:
    "Von den Grundlagen bis zur eigenen Beratungspraxis. Am Ende steht deine individuelle Abschlussprüfung, ein Zertifikat, und mit RatioPro und EquiDesk zwei Werkzeuge, die im ersten Jahr dabei sind.",
  kennzahlen: [
    { zahl: "8", label: "Module" },
    { zahl: "899 €", label: "einmalig" },
    { zahl: "12", label: "Monate" },
  ],
  /** Kostenloser Einstieg, nur Beschriftung.
   *
   *  ▸ DIE ADRESSE STEHT ABSICHTLICH NICHT HIER, sondern als
   *    `schnupperkurs` in lib/ausbildung.ts. Bis zum 09.09.2026 lag sie
   *    doppelt im Haus, hier und dort. Wer den Schnupperkurs auf die eigene
   *    Seite umzieht, hätte nur eine der beiden geändert, und die Startseite
   *    wäre still weiter bei alfima gelandet.
   *
   *    Diese Datei darf lib/ausbildung.ts NICHT importieren: next.config.ts
   *    zieht lib/angebote.ts über lib/blog.ts mit herein, und der
   *    Config-Übersetzer von Next scheitert dann an lib/ausbildung.ts, der
   *    Server startet gar nicht mehr. Am 09.09.2026 ausprobiert. Die
   *    Startseite holt die Adresse deshalb erst in components/WegeSection.tsx. */
  schnupperkurs: {
    name: "Kostenloser Schnupperkurs",
    untertitel: "Schau erst rein, bevor du dich entscheidest",
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
  // Die 1:1-Beratung. Sie hiess in aelteren Blogtexten noch
  // "4-Wochen-Futterberatung", das ist heute Pferdeliebe 365.
  "pferdeliebe-365": {
    augenbraue: "Wenn du es abgeben willst",
    name: "Pferdeliebe 365",
    text: "Die 1:1 Futterberatung als Gesundheitsakte: Ich rechne die Ration deines Pferdes durch, baue den Plan auf und begleite dich vier Wochen lang bei der Umstellung.",
    knopf: "Pferdeliebe 365 ansehen",
    url: "/pferdeliebe-365",
  },
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
    url: "/ratiopro",
  },
  ganzjahresfutterplan: {
    augenbraue: "Dazu passend",
    name: "Ganzjahresfutterplan",
    text: "Ganzheitlich durchs Jahr: was dein Pferd wann braucht, saisonal gedacht statt das ganze Jahr über gleich.",
    knopf: "Ganzjahresfutterplan ansehen",
    url: "/ganzjahresfutterplan",
  },
  masterclass: {
    augenbraue: "Für angehende Beraterinnen",
    name: "Die Ausbildung Ganzheitliche Pferdefütterung",
    text: "Von den Grundlagen bis zur eigenen Beratungspraxis, mit individueller Abschlussprüfung, Zertifikat und den Werkzeugen RatioPro und EquiDesk, die im ersten Jahr dabei sind.",
    knopf: "Die Ausbildung ansehen",
    // Führt auf die eigene Seite statt direkt zu alfima: dort steht alles
    // erklärt, und der kostenlose Schnupperkurs steht dort ganz oben.
    url: "/ausbildung",
  },
  // Das einzige Angebot hier, das sich nicht an Pferdebesitzerinnen richtet,
  // sondern an Beraterinnen. Bewusst OHNE Preis im Text: Das Testkundinnen-
  // Angebot ist befristet, ein Preis an dieser Stelle waere nach Ablauf falsch.
  // Was es kostet, steht auf der Seite selbst.
  equidesk: {
    augenbraue: "Für angehende Beraterinnen",
    name: "EquiDesk",
    text: "Die Kundenverwaltung für die Futterberatung: deine Kundinnen, ihre Pferde, der Beratungsverlauf, Futterpläne mit Nährstoffrechnung und die Rechnungen an einer Stelle.",
    knopf: "EquiDesk ansehen",
    url: "/equidesk",
  },
  basisfutterkurs: {
    augenbraue: "Dazu passend",
    name: "Der Basisfutterkurs",
    text: "Zwanzig Lektionen, Schritt für Schritt von gutem Raufutter über Eiweiß und Mineralstoffe bis zu den Kräutern. Für alle, die es einmal von Grund auf verstehen wollen.",
    knopf: "Basisfutterkurs ansehen",
    url: "/kasse/basisfutterkurs",
  },
  // Der Ratgeber zum Blogbeitrag über Sträucher und Bäume, seit 12.09.2026.
  knabberecke: {
    augenbraue: "Dazu passend",
    name: "Knabberecke",
    text: "Der Ratgeber für die Praxis: welche Zweige du wann anbietest, wie viel, wie du Laub für den Winter trocknest und wie du eine Knabberecke am Paddock anlegst.",
    knopf: "Knabberecke ansehen",
    url: "/knabberecke",
  },
  darmaufbau: {
    augenbraue: "Dazu passend",
    name: "Darmaufbau beim Pferd",
    text: "Der 3-Phasen-Plan als E-Book: den Darm vorbereiten, aufbauen und stabil halten, der Reihe nach statt nach Gefühl.",
    knopf: "Darmaufbau ansehen",
    // Die eigene Kasse, nicht mehr ThriveCart. In den alten Blogbeiträgen
    // hieß der Kurs "3-Phasen-Darmsanierung", das Produkt ist dasselbe.
    url: "/kasse/darmaufbau",
  },
};

/** Findet den Angebotshinweis zu einem Schlüssel. Null, wenn keiner passt.
 *
 *  Nicht mit `empfehlungen` aus lib/empfehlungen.ts verwechseln — das sind
 *  die Rabattcodes der Partner, etwas ganz anderes. */
export function angebotshinweisFinden(schluessel: string): Angebotshinweis | null {
  return angebotsHinweise[schluessel] ?? null;
}
