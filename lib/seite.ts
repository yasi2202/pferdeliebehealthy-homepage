// ---------------------------------------------------------------------------
// Seitenweite Einstellungen.
// ---------------------------------------------------------------------------

export const mitgliederbereich = {
  label: "Mitgliederbereich",

  // ▸ HIER MUSST DU RAN:
  //   Aktuell zeigt der Button auf die allgemeine alfima-Anmeldung. Sobald
  //   deine Akademie eine eigene Adresse hat (z. B.
  //   https://alfima.com/pferdeliebehealthy/login oder eine eigene Domain),
  //   trag sie hier ein — der Button in der Kopfzeile und im Menü folgt
  //   automatisch.
  url: "https://alfima.io/login",
};

// ---------------------------------------------------------------------------
// Der Futter-Check.
//
// Seit 26.08.2026 laeuft er komplett auf der eigenen Seite, ohne alfima. Der
// Weg ist:
//
//   1. `infoseite` erklaert den Check und steht bei Google. Von der Startseite
//      geht es ueber die Knoepfe direkt zum `fragebogen`.
//   2. Im Fragebogen kommt nach der fuenften Frage das Feld fuer Name und
//      E-Mail. Es geht an app/api/futter-check und landet in Supabase.
//   3. Die Interessentin bekommt eine Bestaetigungsmail. Erst der Klick auf
//      den Link darin (`bestaetigt`) macht die Adresse zu einer, an die
//      geworben werden darf — und loest die Ergebnismail aus.
//   4. Danach fuehrt alles zu `mineralKlarheit` weiter, dem Angebot.
//
// Die Adressliste liegt in deiner eigenen Datenbank. Wie du sie ansiehst und
// exportierst, steht in datenbank/futter-check.sql.
// ---------------------------------------------------------------------------

export const futterCheck = {
  /** Die Infoseite fuer Google — erklaert den Check und startet ihn. */
  infoseite: "/futter-check",

  /** Der Fragebogen selbst (public/futter-check.html). Bewusst nicht im
   *  Suchindex, damit er der Infoseite bei Google keinen Rang wegnimmt. */
  fragebogen: "/futter-check-start",

  /** Ziel des Links aus der Bestaetigungsmail. */
  bestaetigt: "/futter-check-bestaetigt",
};

// ---------------------------------------------------------------------------
// Mineral-Klarheit — das Angebot, auf das der Futter-Check hinauslaeuft.
// ---------------------------------------------------------------------------

export const mineralKlarheit = {
  /** Die Seite auf deiner eigenen Adresse. Hierhin fuehren alle Knoepfe. */
  seite: "/mineral-klarheit",

  // ▸ HIER MUSST DU RAN, falls sich die Kursadresse bei alfima aendert:
  //   Der Kauf laeuft weiter ueber alfima, nur gelesen wird auf der eigenen
  //   Seite. Von Yasi bestaetigt am 26.08.2026 — sie fuehrt direkt in den
  //   Kaufvorgang, nicht auf eine Zwischenseite.
  kauf: "https://alfima.com/pferdeliebehealthy/mineralwissen-pro/purchase",

  preis: "27 €",
};
