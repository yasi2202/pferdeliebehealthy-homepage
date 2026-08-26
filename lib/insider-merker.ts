// ---------------------------------------------------------------------------
// Merkt sich im Browser, dass jemand schon Insider ist.
//
// Damit verschwinden die Anmelde-Aufforderungen für Leute, die sich längst
// eingetragen haben — sie sollen nicht auf jeder Seite gefragt werden, ob sie
// nicht endlich beitreten wollen.
//
// Das ist bewusst kein Login: gespeichert wird nur ein Ja/Nein im Browser,
// kein Name, keine Adresse. Entsprechend gilt es auch nur in diesem einen
// Browser — wer sich am Handy einträgt und später am Laptop vorbeikommt,
// sieht das Formular dort wieder. Das ist der Preis dafür, dass niemand ein
// Passwort braucht.
//
// Läuft nur im Browser. Aus Server-Komponenten nicht aufrufen.
// ---------------------------------------------------------------------------

const SCHALTER = "pfh_insider";

/** Ist dieser Browser als Insider markiert? */
export function istInsider(): boolean {
  try {
    return window.localStorage.getItem(SCHALTER) === "ja";
  } catch {
    // Privates Fenster oder blockierte Speicherung: dann eben nicht.
    // Im Zweifel zeigen wir die Anmeldung — schlimmstenfalls sieht sie
    // jemand, der schon dabei ist. Umgekehrt wäre es schlimmer.
    return false;
  }
}

/** Markiert diesen Browser als Insider. */
export function merkeInsider(): void {
  try {
    window.localStorage.setItem(SCHALTER, "ja");
  } catch {
    // nicht schlimm, dann bleibt die Anmeldung eben sichtbar
  }
}

/** Nimmt die Markierung zurück. Für den Fall, dass jemand sie loswerden will. */
export function vergissInsider(): void {
  try {
    window.localStorage.removeItem(SCHALTER);
  } catch {
    // nicht schlimm
  }
}
