// ---------------------------------------------------------------------------
// Der Insider-Kanal: alle Texte an einer Stelle.
//
// Seit 26.08.2026 läuft die Anmeldung auf der eigenen Seite, nicht mehr über
// alfima. Das Formular steht in components/InsiderFormular.tsx, die Adressen
// landen in der Supabase-Tabelle `insider_anmeldungen`, und erst der Klick auf
// den Link in der Bestätigungsmail macht eine Adresse verwendbar.
//
// ▸ Die Texte darunter sind ein Vorschlag. Vor allem den Rhythmus
//   („alle zwei Wochen") solltest du auf das ändern, was du wirklich
//   durchhältst — ein Versprechen im Formular ist eine Zusage.
// ---------------------------------------------------------------------------

export const insider = {
  name: "Pferdeliebe Insider",

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
      "Du bekommst eine Mail, in der du deine Adresse einmal bestätigst — erst danach schreibe ich dir. Abmeldung jederzeit mit einem Klick, deine Adresse gebe ich nicht weiter.",
  },
} as const;
