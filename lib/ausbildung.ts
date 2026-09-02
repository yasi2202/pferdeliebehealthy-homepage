// ---------------------------------------------------------------------------
// Die Ausbildung Ganzheitliche Pferdefütterung.
//
// Alles, was auf der Seite /ausbildung steht und sich irgendwann ändern kann,
// steht hier. Du änderst diese Datei, nicht die Seite selbst.
//
// WICHTIG — die Zahlen hier sind die aus dem ZFU-Zulassungsantrag vom
// 20.08.2026. Sie sind verbindlich: Was die ZFU im Verfahren liest, muss mit
// dem übereinstimmen, was auf deiner Website steht. Wenn du hier etwas
// änderst, ändere es auch in den Unterlagen, und umgekehrt.
//
// Vier Angaben aus alten Unterlagen dürfen nirgends wieder auftauchen:
// der Preis 599 €, das Softcover-Workbook mit ca. 500 Seiten, die Webinare
// und die Struktur mit 13 Modulen / 96 Lektionen.
// ---------------------------------------------------------------------------

// ▸ DER WICHTIGSTE SCHALTER AUF DER GANZEN SEITE
//
//   Solange er auf `false` steht, zeigt die Seite keinen Kaufknopf, sondern
//   führt zum kostenlosen Schnupperkurs und zur Vormerkung per Mail.
//
//   Der Grund ist rechtlich, nicht gestalterisch: Ein Fernlehrgang mit
//   Lernerfolgskontrolle und Betreuung braucht nach dem Fernunterrichts-
//   schutzgesetz eine Zulassung der ZFU. Verträge, die vor der Zulassung
//   geschlossen werden, sind unwirksam. Dein Verfahren unter Reg.-Nr. 76270
//   läuft noch, der Vertriebsbeginn steht im Antrag auf dem 01.10.2026.
//
//   Erst wenn die Zulassung schriftlich vorliegt: hier auf `true` stellen
//   und unten bei `kauf` die alfima-Adresse eintragen.
export const verkaufOffen = false;

export const ausbildung = {
  /** Der Lehrgangstitel aus dem Zulassungsantrag. Bitte wörtlich so lassen. */
  titel: "Ausbildung Ganzheitliche Pferdefütterung",

  /** Der Abschluss heißt wie der Kurs (entschieden am 27.08.2026).
   *  „Ernährungsberater für Pferde" ist die Berufsbezeichnung und bleibt als
   *  solche im Text stehen, ist aber nicht der Name des Abschlusses. */
  abschluss: "Ganzheitliche Pferdefütterung",

  preis: "899 €",
  preisRaten: "904 €",
  /** Belegt: es wurden schon 1.050 und 1.100 € gezahlt. Kein Wettbewerbsproblem. */
  preisVorher: "999 €",
  ratenModelle: "2, 4, 6, 8 oder 12 Raten",

  dauerMonate: 12,
  wochenstunden: 3,
  zeitstunden: 155,
  mindestbearbeitung: "6 Monate",

  module: 8,
  /** Stand 28.08.2026: Alle acht Module haben Inhalt, Modul 4 seit dem 28.08.
   *  Vorher stand hier 104 — das war die Zahl aus dem Zulassungsantrag vom
   *  20.08.2026. Die Unterlagen, die seither bei der ZFU liegen, zeigen 110
   *  Lektionen; beide Seiten müssen dieselbe Zahl nennen. */
  lektionen: 110,

  /** Die Lernplattform. Nicht die Website, sondern die Akademie. */
  plattform: "akademieapp.vercel.app",

  // ▸ HIER MUSST DU RAN, sobald `verkaufOffen` auf `true` geht:
  //   die eigene Kasse eintragen, /kasse/ausbildung.
  kauf: "",

  /** Der kostenlose Einstieg. Läuft schon und darf beworben werden, weil er
   *  keine Lernerfolgskontrolle und keine Betreuung enthält.
   *
   *  ▸ DIE LETZTE ADRESSE, DIE NOCH BEI ALFIMA LIEGT.
   *    Am 02.09.2026 sind alle anderen Verweise auf alfima und Tentary aus
   *    beiden Projekten entfernt worden, beide Plattformen werden nicht mehr
   *    genutzt. Diese eine steht noch, weil sie funktioniert und weil es auf
   *    der eigenen Seite bisher keinen Ersatz gibt.
   *
   *    Das ist kein Dauerzustand: Wird alfima abgeschaltet, laufen die beiden
   *    Knöpfe „Kostenlos reinschnuppern" auf /ausbildung ins Leere, und das
   *    ausgerechnet auf der Seite, die das teuerste Angebot verkauft.
   *    Yasemin baut den Schnupperkurs in den nächsten Tagen selbst nach
   *    (Gespräch vom 02.09.2026); danach gehört hier ein eigener Pfad hin. */
  schnupperkurs:
    "https://alfima.com/pferdeliebehealthy/kostenloser-einblick-in-die-ausbildung-zur-ganzheitlichen-pferdefutterung",

  /** Für die Vormerkung, solange nicht verkauft werden darf. */
  mail: "info@pferdeliebehealthy.de",
};

// ---------------------------------------------------------------------------
// Die enthaltenen Werkzeuge.
//
// Von Yasemin entschieden am 27.08.2026: RatioPro und EquiDesk gehören zur
// Ausbildung, dauerhaft, ohne Frist und ohne Anschlussgebühr.
//
// Das ist eine Zusage an jede Käuferin. Sie steht im Kopf der Seite, im
// eigenen Abschnitt und im Preisblock. Wenn du das Modell je änderst, gilt
// die Änderung nur für neue Anmeldungen — wer zu diesen Bedingungen gekauft
// hat, behält sie. Bevor die erste Anmeldung reinkommt, muss die Freischaltung
// beider Zugänge nach bestandener Prüfung eingerichtet sein.
//
// Warum es sich lohnt: Keine Wettbewerberin am deutschsprachigen Markt gibt
// Software zur Ausbildung dazu. VETogether (749 €), Sarah Ullrich (1.111 €)
// und Naturnahes Pferd liefern Wissen. Das ist das eine Argument, das keine
// von ihnen kopieren kann.
// ---------------------------------------------------------------------------

export const werkzeugeDauerhaft = true;

// ---------------------------------------------------------------------------
// Die Module.
//
// Titel und Lektionszahlen stammen aus deiner Akademie, gezogen am 27.08.2026
// über scripts/zfu-export.mjs. Sie sind also nicht ausgedacht, sondern das,
// was wirklich im Kurs steht.
//
// ▸ MODUL 4 IST SEIT DEM 28.08.2026 DA. Am 27.08. hatte es in der Akademie
//   keine einzige veröffentlichte Lektion und fehlte deshalb hier; inzwischen
//   stehen seine neun Lektionen zur Sichtanalyse geschrieben. Die Seite zeigt
//   ein Modul weiterhin nur, solange sein `titel` gefüllt ist — leert man ihn,
//   verschwindet es wieder und die Überschrift nennt keine Zahl mehr.
//
//   Die Lektionszahlen sind der Stand der Akademie vom 28.08.2026 und zählen
//   die geschriebenen Lektionen, nicht nur die schon freigeschalteten. Summe:
//   110, dieselbe Zahl wie oben und dieselbe wie in den ZFU-Unterlagen.
// ---------------------------------------------------------------------------

export type Modul = {
  nummer: number;
  /** Ein Wort, das sagt, was du in diesem Modul tust. */
  verb: string;
  titel: string;
  text: string;
  /** Geschriebene Lektionen, Stand 28.08.2026. */
  lektionen: number;
};

export const module: Modul[] = [
  {
    nummer: 1,
    verb: "Verstehen",
    titel: "Wie der Pferdekörper funktioniert",
    text: "Von der Zelle bis zum Huf: Stoffwechselorgane, Verdauung, Zähne, Kreislauf, Haut und Nervensystem. Und wie diese Systeme zusammenarbeiten, statt einzeln betrachtet zu werden.",
    lektionen: 11,
  },
  {
    nummer: 2,
    verb: "Lesen",
    titel: "Nährstoffe, Energie und echte Bedarfe",
    text: "Makronährstoffe, Aminosäuren, Mengen- und Spurenelemente mit ihren Wechselwirkungen, Vitamine, Mineralspeicher. Hier lernst du, einen Bedarf zu berechnen statt zu schätzen.",
    lektionen: 10,
  },
  {
    nummer: 3,
    verb: "Beurteilen",
    titel: "Futtermittel und Rationsbasis",
    text: "Raufutter im Detail, Rohfaser und was artgerechte Fütterung praktisch bedeutet. Die Grundlage jeder Ration, bevor überhaupt ein Zusatz ins Spiel kommt.",
    lektionen: 15,
  },
  {
    nummer: 4,
    verb: "Erkennen",
    titel: "Sichtanalyse und körperliche Hinweise",
    text: "Ein Pferd lesen, bevor ein Blutbild auffällig wird: Fellbild, Hufqualität, Bemuskelung, Körperhaltung, Schleimhäute. Dazu die häufigsten Fehldeutungen und eine Übung an echten Pferdebildern.",
    lektionen: 9,
  },
  {
    nummer: 5,
    verb: "Diagnostizieren",
    titel: "Befunde, Frühmarker und Analysen",
    text: "Heuanalysen, Fellmineralanalysen, Blutbilder, Kotbefunde, Allergietests und Urintests selbstständig auswerten. Und Frühmarker erkennen, bevor ein Pferd wirklich krank ist.",
    lektionen: 8,
  },
  {
    nummer: 6,
    verb: "Anwenden",
    titel: "Krankheitsbilder und Fütterungsstrategien",
    text: "Das größte Modul: Atemwege, Stoffwechsel, KPU, Haut, Magen und Darm, Muskeln, Leber, Nieren, Parasiten, toxische Belastungen. Dazu zwei durchgerechnete Fallbeispiele aus der Praxis.",
    lektionen: 36,
  },
  {
    nummer: 7,
    verb: "Ergänzen",
    titel: "Phyto, Myko und der Werkzeugkasten Zusätze",
    text: "Wann ein Pferd überhaupt Zusätze braucht, welche vier Kategorien es gibt, und wie Phytotherapie in der Praxis eingesetzt wird. Vor allem aber: wann eben nicht.",
    lektionen: 11,
  },
  {
    nummer: 8,
    verb: "Beraten",
    titel: "Praxisaufbau und Selbstständigkeit",
    text: "Rechtliche Grundlagen, Beratungsablauf, Umgang mit Kundinnen, Organisation der eigenen Praxis, Sichtbarkeit auf Instagram und wie du neue Forschung selbst einordnest.",
    lektionen: 10,
  },
];

// ---------------------------------------------------------------------------
// Die Prüfung.
//
// Aus dem Zulassungsantrag. Sie wird für jede Teilnehmerin individuell
// zusammengestellt, es gibt keine feste Klausur — genau das ist der
// Unterschied zu den kurzen Zertifikatslehrgängen.
// ---------------------------------------------------------------------------

export const pruefung = {
  bearbeitungstage: 10,
  korrekturWerktage: 14,
  wiederholung: "Die erste Wiederholung ist kostenfrei, die zweite kostet 20 €, die dritte 30 €.",
};
