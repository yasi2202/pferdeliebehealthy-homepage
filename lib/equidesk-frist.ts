// ---------------------------------------------------------------------------
// Die Frist des EquiDesk-Testkundinnen-Angebots, an einer Stelle.
//
// ▸ WARUM SIE IN EINER EIGENEN DATEI STEHT UND NICHT MEHR IM ZÄHLER
//   Der Zähler (components/EquiDeskFrist.tsx) ist eine Client-Komponente. Die
//   Verkaufsseite ist eine Server-Komponente und muss dieselbe Frist kennen,
//   denn sie entscheidet, ob sie den Einmalkauf oder den Monatszugang zeigt.
//   Eine Konstante aus einer "use client"-Datei in einer Server-Komponente zu
//   lesen ist kein verlässlicher Weg -- genau das hat am 06.09.2026 dazu
//   geführt, dass die Verkaufsseite den Monatspreis zeigte, obwohl das
//   einmalige Angebot noch lief.
//
//   Diese Datei hat kein "use client" und keine Abhängigkeiten. Beide Seiten
//   lesen dieselbe Zeile, und es gibt keine zweite Wahrheit.
//
// ▸ SOLL DAS ANGEBOT VERLÄNGERT WERDEN, wird hier das Datum geändert, sonst
//   nirgends. Zu ändern ist dann auch `verkaufBis` beim Produkt `equidesk` in
//   lib/digital.ts -- die Kasse weist einen Kauf danach nämlich wirklich ab.
// ---------------------------------------------------------------------------

/** Sonntag, 6. September 2026, 23:59:59 deutscher Zeit. */
export const FRIST = "2026-09-06T23:59:59+02:00";

export const FRIST_TEXT = "Sonntag, 6. September 2026, 23:59 Uhr";

/** Läuft das einmalige Testkundinnen-Angebot noch?
 *
 *  Wird auf dem Server (Verkaufsseite) und im Browser (Zähler) gebraucht,
 *  deshalb steht sie hier und nicht in einer der beiden Dateien. */
export function aktionLaeuft(jetzt: number = Date.now()): boolean {
  return jetzt <= new Date(FRIST).getTime();
}
