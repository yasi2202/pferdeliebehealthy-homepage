// ---------------------------------------------------------------------------
// Seitenweite Einstellungen.
// ---------------------------------------------------------------------------

export const mitgliederbereich = {
  label: "Mitgliederbereich",

  // Seit 28.08.2026 führt der Knopf in die eigene Akademie statt zu alfima.
  //
  // ▸ HIER MUSST DU RAN, sobald die Akademie eine eigene Domain bekommt
  //   (z. B. https://akademie.pferdeliebehealthy.de/login): einfach die
  //   Adresse hier austauschen, der Knopf im Mitglieder-Streifen folgt
  //   automatisch.
  url: "https://akademieapp.vercel.app/login",
};

// ---------------------------------------------------------------------------
// Die Bitte um eine Google-Bewertung.
//
// ▸ HIER DEN LINK EINTRAGEN, dann erscheint die Bitte. Solange er leer ist,
//   passiert nichts, keine Mail und kein Hinweis in der Akademie.
//
//   Den Link findest du im Google-Unternehmensprofil unter „Rezensionen"
//   → „Mehr Rezensionen erhalten". Er sieht aus wie
//   https://g.page/r/…/review oder
//   https://search.google.com/local/writereview?placeid=…
//
// ▸ WARUM DIE BITTE NUR AN MANCHE GEHT
//   Der BGH hat 2018 entschieden (VI ZR 225/17), dass eine Frage nach der
//   Zufriedenheit Werbung ist. Ohne Einwilligung darf sie nicht per Mail
//   raus, auch nicht angehängt an eine Bestellbestätigung. Deshalb steht sie
//   nur in der Mail an Kundinnen, die beim Kauf dem Newsletter zugestimmt
//   haben, und auch dort mit dem Hinweis, dass man widersprechen kann.
//
//   Alle anderen sehen die Bitte nur dort, wo kein Werberecht gilt: in der
//   Akademie, wenn sie ohnehin eingeloggt sind.
// ---------------------------------------------------------------------------
// Geprüft am 02.09.2026: leitet weiter auf search.google.com/local/writereview
// mit der Kennung ChIJQSpXEKEbmEcRQnb6A-Wh9CE.
export const bewertungslink = "https://g.page/r/CUJ2-gPlofQhEBM/review";

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

  // ▸ SEIT DEM 01.09.2026 LAEUFT DER KAUF UEBER DIE EIGENE KASSE.
  //   Vorher zeigte diese Adresse direkt in den Kaufvorgang bei alfima.
  //   Jetzt fuehrt sie auf /kasse/mineral-klarheit, wo Preis, Rabattfeld und
  //   die Pflichthinweise stehen. Stripe kommt erst danach.
  kauf: "/kasse/mineral-klarheit",

  // ▸ DIE PREISE STEHEN NICHT MEHR HIER, sondern in lib/digital.ts beim
  //   Produkt. Sonst haette man zwei Stellen, an denen ein Preis steht, und
  //   irgendwann nennt die Verkaufsseite einen anderen Betrag als die Kasse.
  //   Die Seite holt sich beides ueber digitalFinden("mineral-klarheit").
};
