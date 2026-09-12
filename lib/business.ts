// ---------------------------------------------------------------------------
// Pferdebusinessmitherz: die Seite pferdeliebehealthy.de/business.
//
// Pferdebusinessmitherz ist Yasemins Untermarke für Pferdemenschen, die mit
// ihrem Wissen online etwas aufbauen wollen. Steuerlich ist es dasselbe
// Unternehmen wie Pferdeliebehealthy, deshalb liegt die Seite hier und nicht
// auf einer eigenen Domain (so entschieden am 12.09.2026). Eine eigene Domain
// kann später einfach hierher weiterleiten. Auf diese Seite zeigt der Link in
// der Instagram-Bio von @pferdebusinessmitherz.
//
// WAS HIER NIE STEHEN DARF
//   ▸ Umsatz- oder Einkommensversprechen, auch keine Beispiele wie „meine
//     Teilnehmerin verdient jetzt …“. Das ist irreführende Werbung, sobald es
//     nicht für alle gilt, und es gilt nie für alle.
//   ▸ Begleitung, Betreuung, Feedback, Calls, Korrektur. Seit dem BGH-Urteil
//     vom Juni 2025 gilt das Fernunterrichtsgesetz auch für Business-Kurse an
//     Selbstständige: Wird der Lernerfolg begleitet, braucht der Kurs eine
//     ZFU-Zulassung, sonst ist der Vertrag nichtig. Die Kurse hier sind
//     deshalb Selbstlernkurse, genau wie der Aroma-Kurs.
//   ▸ Seit wann und ob Yasemin hauptberuflich davon lebt. Das möchte sie
//     nicht teilen (08.09.2026).
//
// Die Kurse unten sind VORSCHLÄGE vom 12.09.2026, noch nicht gebaut und noch
// nicht von Yasemin bestätigt. Deshalb steht bei allen „In Arbeit“ und es
// gibt nur eine Warteliste, keinen Kaufknopf.
// ---------------------------------------------------------------------------

export const businessFarben = {
  /** Die Farben aus dem Logo: Salbei auf hellem Grau. */
  grund: "#F1F0EA",
  flaeche: "#E4E9DF",
  salbei: "#8DAA89",
  /** Salbei, so weit abgedunkelt, dass er als Textfarbe reicht (über 5 zu 1 auf dem Grund). */
  tief: "#48664A",
  tinte: "#2B2623",
  weich: "#5A5550",
  weiss: "#FFFFFF",
};

export const businessLinks = {
  instagram: "https://www.instagram.com/pferdebusinessmitherz/",
  /**
   * Die Warteliste ist vorerst eine Mail an Yasemin. Die Insider-Anmeldung
   * der Website passt nicht, sie bestätigt den Fütterungs-Newsletter. Sobald
   * es einen ersten Kurs gibt, kommt hier eine echte Anmeldung mit
   * Bestätigungsmail hin.
   */
  warteliste:
    "mailto:info@pferdeliebehealthy.de?subject=" +
    encodeURIComponent("Warteliste Pferdebusiness") +
    "&body=" +
    encodeURIComponent(
      "Hallo Yasi,\n\nich möchte auf die Warteliste für deine Business-Kurse.\n\nMich interessiert vor allem:\n\n"
    ),
};

export const businessKurse = [
  {
    titel: "Vom Pferdewissen zum Onlinekurs",
    text: "Ein Thema finden, nach dem Menschen wirklich suchen. Den Kurs so gliedern, dass man ihn durcharbeitet und nicht nach Lektion zwei liegen lässt. Einen Preis finden, zu dem du stehen kannst.",
  },
  {
    titel: "Instagram für Pferdemenschen",
    text: "Hooks, Reels und Karussells, die auch Menschen erreichen, die dir noch nicht folgen. Aus dem, was ich auf meinem eigenen Konto mit 12.000 Followern teste und messe.",
  },
  {
    titel: "Deine eigene Verkaufsseite",
    text: "Eigene Seite, eigene Kasse, eigene Mailliste statt Gebühren und Regeln einer Plattform. Dazu die Rechtstexte, ohne die du nichts verkaufen solltest.",
  },
];
// ENDE DER DATEI
