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

const FARBEN: Kartenfarbe[] = [
  { flaeche: "bg-rose-deep", schrift: "text-cream", strich: "bg-rose-deep" },
  { flaeche: "bg-ink", schrift: "text-cream", strich: "bg-ink" },
  { flaeche: "bg-rose", schrift: "text-ink", strich: "bg-rose" },
  { flaeche: "bg-ink-soft", schrift: "text-cream", strich: "bg-ink-soft" },
];

export function kategorieFarbe(kategorie: string): Kartenfarbe {
  // Quersumme der Buchstaben: dieselbe Kategorie ergibt immer dieselbe Farbe,
  // auch nachdem neue Beitraege dazugekommen sind.
  let summe = 0;
  for (const zeichen of kategorie) summe += zeichen.charCodeAt(0);
  return FARBEN[summe % FARBEN.length];
}
