// ---------------------------------------------------------------------------
// Der Kulanzweg für Nachzüglerinnen.
//
// ▸ WOZU
//   Befristete Angebote laufen wirklich ab, die Kasse weist danach ab (siehe
//   `verkaufBis` in lib/digital.ts). Das muss so sein, sonst wäre die Frist
//   eine Behauptung. Es gibt aber den Fall, dass jemand am letzten Abend
//   kaufen wollte und es nicht geklappt hat und sich am Tag danach meldet.
//   Diesem einen Menschen das Angebot noch zu geben, ist selbstverständlich.
//   Die Frist dafür für alle wieder zu öffnen, wäre falsch.
//
//   Deshalb dieser Weg: An die Adresse der Kasse wird `?kulanz=<Schlüssel>`
//   angehängt. Nur wer den Schlüssel hat, kommt an den alten Preis. Auf der
//   Verkaufsseite ändert sich nichts, für alle anderen bleibt das Angebot zu.
//
// ▸ WARUM DER SCHLÜSSEL NICHT HIER IM CODE STEHT
//   Das Repo pferdeliebehealthy-homepage ist öffentlich. Ein Codewort in
//   dieser Datei könnte jede Person nachlesen. Der Schlüssel steht deshalb in
//   den Vercel-Einstellungen als `KULANZ_SCHLUESSEL`. Ist er dort nicht
//   gesetzt, gibt es keinen Kulanzweg. Das ist die sichere Voreinstellung:
//   Ohne Schlüssel bleibt eine abgelaufene Frist abgelaufen.
//
// ▸ WARUM ES TROTZDEM EIN ENDE GIBT
//   Ein Schlüssel, der ewig gilt, macht aus jeder befristeten Aktion eine
//   dauerhafte. Ein Kulanzkauf ist deshalb nur bis 14 Tage nach dem Fristende
//   möglich. Danach ist auch mit Schlüssel Schluss, und es braucht eine
//   bewusste Entscheidung statt eines alten Links.
//
//   Der Link enthält den Schlüssel im Klartext. Wer ihn weitergibt, gibt das
//   Angebot weiter. Bei zwei Wochen Nachfrist und einer Handvoll Nachzügler
//   ist das vertretbar. Soll ein Schlüssel nicht mehr gelten, wird er bei
//   Vercel geändert.
// ---------------------------------------------------------------------------

/** So lange nach dem Fristende ist ein Kulanzkauf noch möglich. */
export const KULANZ_NACHFRIST_TAGE = 14;

/** Darf dieser Kauf trotz abgelaufener Frist durchgehen?
 *
 *  Läuft nur auf dem Server, denn `KULANZ_SCHLUESSEL` ist keine
 *  NEXT_PUBLIC-Variable und hat im Browser nichts zu suchen. */
export function kulanzGilt(
  kulanz: unknown,
  verkaufBis: string,
  jetzt: Date = new Date(),
): boolean {
  const schluessel = process.env.KULANZ_SCHLUESSEL?.trim();

  if (!schluessel) return false;
  if (typeof kulanz !== "string") return false;
  if (kulanz.trim() !== schluessel) return false;

  const ende = new Date(`${verkaufBis}T23:59:59+02:00`);
  const nachfrist = new Date(
    ende.getTime() + KULANZ_NACHFRIST_TAGE * 24 * 60 * 60 * 1000,
  );

  return jetzt <= nachfrist;
}

/** Wann die Nachfrist für einen Kulanzkauf endet. */
export function kulanzEnde(verkaufBis: string): Date {
  const ende = new Date(`${verkaufBis}T23:59:59+02:00`);
  return new Date(ende.getTime() + KULANZ_NACHFRIST_TAGE * 24 * 60 * 60 * 1000);
}

/**
 * Der Schlüssel für einen Kulanzlink, oder null.
 *
 * Gedacht für den einen Fall, für den dieser Weg gebaut wurde: Jemand wollte
 * am letzten Abend kaufen, es hat nicht geklappt, und du schreibst ihr
 * hinterher. Dann gehört an den Link in dieser Mail der Schlüssel, sonst
 * schickst du sie auf eine Seite, die ihren Kauf abweist.
 *
 * Null kommt zurück, wenn `KULANZ_SCHLUESSEL` bei Vercel gar nicht gesetzt
 * ist oder die Nachfrist vorbei ist. Wer die Antwort bekommt, darf keinen
 * Link bauen, sondern muss den Fall anders lösen.
 *
 * ▸ NUR AUF DEM SERVER AUFRUFEN. Der Schlüssel ist keine
 *   NEXT_PUBLIC-Variable und hat im Browser nichts zu suchen.
 */
export function kulanzSchluessel(
  verkaufBis: string,
  jetzt: Date = new Date(),
): string | null {
  const schluessel = process.env.KULANZ_SCHLUESSEL?.trim();

  if (!schluessel) return null;
  if (jetzt > kulanzEnde(verkaufBis)) return null;

  return schluessel;
}
