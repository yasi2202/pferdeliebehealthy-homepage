// ---------------------------------------------------------------------------
// Die Farbe einer Blogkarte.
//
// Solange es zu den Beitraegen keine Fotos gibt, traegt die Farbe das Bild.
// Sie wird aus der Kategorie abgeleitet und nicht in der Beitragsdatei
// eingetragen: So sehen alle Beitraege einer Kategorie gleich aus, und
// niemand muss sich beim Schreiben eine Farbe aussuchen.
//
// Sobald in einer Beitragsdatei ein `bild` steht, tritt die Farbe zurueck und
// das Foto steht an ihrer Stelle.
//
// Diese Datei steht bewusst getrennt von lib/blog.ts: Jene liest Dateien vom
// Server und darf deshalb nicht im Browser landen. Die Farben werden aber
// auch von der Liste gebraucht, und die laeuft im Browser.
// ---------------------------------------------------------------------------

export type Kartenfarbe = {
  /** Hintergrund der Farbflaeche, als Tailwind-Klasse */
  flaeche: string;
  /** Schriftfarbe darauf */
  schrift: string;
  /** Feine Linie am oberen Rand der Karte, greift die Flaeche auf */
  strich: string;
};

// Vier warme Toene aus der Palette der Seite. Ink (fast schwarz) war einmal
// dabei und ist wieder raus: Als schmaler Strich neben Rose wirkte er wie ein
// Fehler, nicht wie eine Farbe. Gold ist hier unbedenklich, weil es nur als
// Flaeche und nie als Schriftfarbe verwendet wird.
const FARBEN: Kartenfarbe[] = [
  { flaeche: "bg-rose-deep", schrift: "text-cream", strich: "bg-rose-deep" },
  { flaeche: "bg-rose", schrift: "text-ink", strich: "bg-rose" },
  { flaeche: "bg-ink-soft", schrift: "text-cream", strich: "bg-ink-soft" },
  { flaeche: "bg-gold", schrift: "text-ink", strich: "bg-gold" },
];

/** Die Farbe einer Kategorie, bestimmt ueber ihre Stelle in der alphabetisch
 *  sortierten Liste aller Kategorien.
 *
 *  Der erste Versuch war eine Quersumme des Namens. Das sah aus wie eine gute
 *  Idee und ergab in der Praxis vier Karten in derselben Farbe: Bei aehnlich
 *  langen deutschen Woertern liegen die Quersummen dicht beieinander. Ueber
 *  die Position ist die Verteilung gleichmaessig, und benachbarte Kategorien
 *  sind garantiert verschieden.
 *
 *  Wichtig: immer die vollstaendige Kategorienliste uebergeben, nicht nur die
 *  der gerade angezeigten Beitraege. Sonst haette dieselbe Kategorie auf der
 *  Startseite eine andere Farbe als im Blog. */
export function kategorieFarbe(kategorie: string, alle: string[]): Kartenfarbe {
  const sortiert = [...new Set(alle)].sort((a, b) => a.localeCompare(b, "de"));
  const stelle = sortiert.indexOf(kategorie);
  return FARBEN[(stelle < 0 ? 0 : stelle) % FARBEN.length];
}
