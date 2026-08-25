// ---------------------------------------------------------------------------
// Der Insider-Kanal: alle Texte und die Anmelde-Adresse an einer Stelle.
//
// ▸ HIER MUSST DU RAN:
//   Trag unten bei `anmeldeUrl` die Adresse deiner alfima-Anmeldeseite ein.
//   Solange dort die allgemeine Adresse steht, landen Interessentinnen auf
//   deiner alfima-Übersicht statt direkt im Insider-Formular.
//
//   In alfima legst du dafür eine Seite oder ein Opt-in an. Die Adresse sieht
//   dann etwa so aus: https://alfima.com/pferdeliebehealthy/p/insider
//
// ▸ Die Texte darunter sind ein Vorschlag. Vor allem den Rhythmus
//   („alle zwei Wochen") solltest du auf das ändern, was du wirklich
//   durchhältst — ein Versprechen im Formular ist eine Zusage.
// ---------------------------------------------------------------------------

export const insider = {
  name: "Pferdeliebe Insider",

  anmeldeUrl: "https://alfima.com/pferdeliebehealthy",

  /** Schmales Banner ganz oben auf der Startseite.
   *  Führt zum Abschnitt auf der Seite, damit man erst liest, worum es geht. */
  kopfBanner: {
    hinweis: "Neu",
    text: "Kostenloses Futterwissen als Pferdeliebe Insider",
    button: "Ansehen",
  },

  /** Kurzfassung für den Balken am unteren Bildschirmrand.
   *  Führt direkt zur Anmeldung — wer so weit gelesen hat, weiß Bescheid. */
  balken: {
    text: "Kostenloses Futterwissen direkt ins Postfach",
    button: "Insider werden",
  },

  /** Der Abschnitt auf der Startseite */
  abschnitt: {
    augenbraue: "Kostenlos",
    ueberschrift: "Werde Pferdeliebe Insider",
    einleitung:
      "Alle zwei Wochen schreibe ich dir ein Thema aus der Praxis. Kein Newsletter, der dir etwas verkaufen will, sondern das, was mir in echten Rationen tatsächlich begegnet.",
    inhalte: [
      {
        titel: "Was in Rationen wirklich schiefgeht",
        text: "Anonymisierte Beispiele aus meiner Arbeit und was ich daran geändert habe.",
      },
      {
        titel: "Zusatzfutter, ehrlich eingeordnet",
        text: "Welche Produkte ihr Geld wert sind, welche nicht, und woran du das selbst erkennst.",
      },
      {
        titel: "Laborwerte lesen lernen",
        text: "Heuanalyse, Blutbild, Selenwert — Stück für Stück, in verständlicher Sprache.",
      },
    ],
    button: "Insider werden — kostenlos",
    kleingedrucktes:
      "Anmeldung über meine Kursplattform alfima. Abmeldung jederzeit mit einem Klick, deine Adresse gebe ich nicht weiter.",
  },
} as const;
