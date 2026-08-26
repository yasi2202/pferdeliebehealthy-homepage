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
// Seit 26.08.2026 laeuft er ueber alfima, damit du die E-Mail-Adressen
// bekommst. Der Weg ist:
//
//   1. Alle Knoepfe auf der Seite fuehren zu `anmeldung` — dort traegt sich
//      die Interessentin bei alfima mit Namen und E-Mail ein (kostenlos).
//   2. alfima leitet danach auf `danke` weiter. Diese Adresse traegst du in
//      alfima beim Produkt unter „Externer Link" ein.
//   3. Auf der Dankesseite steht der Knopf zum `fragebogen` — den fuenf
//      Fragen selbst.
//
// Der Fragebogen bleibt technisch fuer jeden erreichbar, wer die Adresse
// kennt. Deshalb: ueberall (Instagram, TikTok, Facebook) nur noch `anmeldung`
// teilen, nie die direkte Adresse des Fragebogens.
// ---------------------------------------------------------------------------

export const futterCheck = {
  /** Die kostenlose Anmeldung bei alfima — hierhin fuehren alle Knoepfe. */
  anmeldung: "https://alfima.com/pferdeliebehealthy/der-kostenlose-futter-check",

  /** Die Dankesseite nach der Anmeldung. In alfima als „Externer Link". */
  danke: "/danke-futter-check",

  /** Der Fragebogen selbst (public/futter-check.html). */
  fragebogen: "/futter-check",
};
