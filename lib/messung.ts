// ---------------------------------------------------------------------------
// Messung der Werbung, und die Einwilligung dafür.
//
// WOZU DAS GANZE
// Wer Anzeigen bei Instagram und Facebook schaltet, muss Meta sagen können,
// welcher Klick zu einer Anmeldung oder einem Kauf geführt hat. Ohne diese
// Rückmeldung sucht Meta die Anzeigen nur nach Klicks aus, und Klicks kann
// jede Anzeige einsammeln, auch die, die niemanden bringt. Erst mit den
// gemeldeten Ergebnissen lernt die Auslieferung, wer wirklich anmeldet.
//
// DIE REIHENFOLGE IST PFLICHT, NICHT GESCHMACK
// Der Meta-Pixel legt eine Kennung im Browser ab. Nach § 25 Abs. 1 TDDDG
// darf das erst nach einer Einwilligung passieren. Deshalb wird hier
// nichts geladen, bevor jemand zugestimmt hat. Wer ablehnt, bekommt keine
// Zeile Fremdcode zu sehen, und die Seite kann alles, was sie vorher konnte.
//
// OHNE PIXELNUMMER PASSIERT GAR NICHTS
// Die Nummer steht in .env.production (seit 10.09.2026: 1061479973538555,
// Datensatz "Pferdeliebehealthy Website" im Ereignismanager).
// Steht NEXT_PUBLIC_META_PIXEL nicht in den Umgebungsvariablen, erscheint
// auch kein Banner. Solange keine Anzeigen laufen, sieht die Seite also aus
// wie immer. Das ist Absicht: Ein Einwilligungsbanner kostet Anmeldungen,
// und ohne Werbung gäbe es dafür keinen Gegenwert.
//
// DIE ZWEITE MESSUNG LÄUFT UNABHÄNGIG DAVON
// Wer über `?von=meta-...` kommt, landet mit dieser Herkunft in der Spalte
// `quelle` der Anmeldung. Das steht in der eigenen Datenbank, zählt auf dem
// Server und braucht deshalb weder Einwilligung noch Pixel. Diese Zahl ist
// die Wahrheit, der Pixel ist das Werkzeug zum Steuern. Gehen beide
// auseinander, gilt die eigene Zahl.
// ---------------------------------------------------------------------------

/** Die Pixelnummer aus den Umgebungsvariablen. Leer heißt: keine Messung. */
export const PIXEL = process.env.NEXT_PUBLIC_META_PIXEL || "";

/** Wo die Entscheidung im Browser liegt. */
const SCHALTER = "pfh_messung";

/** Wortlaut-Fassung der Einwilligung.
 *
 *  Ändert sich der Text im Banner inhaltlich, wird hier das Datum
 *  hochgesetzt. Alle alten Entscheidungen gelten dann als nicht getroffen
 *  und werden neu erfragt: Eingewilligt hat man in einen bestimmten Text,
 *  nicht in eine Absicht.
 */
export const FASSUNG = "2026-09-10";

export type Wahl = "ja" | "nein";

type Eintrag = { wahl: Wahl; am: string; fassung: string };

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

// Ereignisse, die vor der Entscheidung anfallen, warten hier. Sie gehen
// hinterher raus, wenn zugestimmt wurde, und werden sonst verworfen.
// Beispiel: Jemand meldet sich an, bevor er das Banner beantwortet hat.
let wartend: { name: string; daten?: Record<string, unknown>; kennung?: string }[] = [];

// Wer wissen will, wenn sich die Entscheidung ändert (Banner, Insider-Balken).
const horcher = new Set<() => void>();

/** Die getroffene Entscheidung, oder null, solange keine vorliegt. */
export function gewaehlt(): Wahl | null {
  if (!PIXEL) return "nein"; // ohne Pixel gibt es nichts zu entscheiden
  // Auf dem Server gibt es keinen Browserspeicher. Wer hier "nein" zurueckgaebe,
  // liesse das Banner beim ersten Zeichnen aufblitzen und wieder verschwinden.
  if (typeof window === "undefined") return null;
  try {
    const roh = window.localStorage.getItem(SCHALTER);
    if (!roh) return null;
    const e = JSON.parse(roh) as Eintrag;
    if (e.fassung !== FASSUNG) return null; // neuer Text, neue Frage
    return e.wahl === "ja" ? "ja" : "nein";
  } catch {
    // Privater Modus oder gesperrter Speicher: dann eben nicht messen.
    return "nein";
  }
}

/** Steht die Frage noch offen? Danach richtet sich, ob das Banner erscheint. */
export function offen(): boolean {
  return Boolean(PIXEL) && gewaehlt() === null;
}

/** Die Entscheidung festhalten und alles Weitere anstoßen. */
export function waehlen(wahl: Wahl) {
  try {
    const e: Eintrag = { wahl, am: new Date().toISOString(), fassung: FASSUNG };
    window.localStorage.setItem(SCHALTER, JSON.stringify(e));
  } catch {
    /* Ohne Speicher wird bei jedem Besuch neu gefragt, mehr passiert nicht. */
  }
  if (wahl === "ja") {
    pixelStarten();
    const rest = wartend;
    wartend = [];
    for (const w of rest) senden(w.name, w.daten, w.kennung);
  } else {
    wartend = [];
  }
  for (const fn of horcher) fn();
}

/** Die Einwilligung zurücknehmen. Hängt als Knopf im Datenschutztext. */
export function widerrufen() {
  try {
    window.localStorage.removeItem(SCHALTER);
  } catch {
    /* dann bleibt es beim alten Stand, bis der Browser geleert wird */
  }
  for (const fn of horcher) fn();
}

/** Auf Änderungen der Entscheidung hören. Gibt die Abmeldung zurück. */
export function beobachten(fn: () => void): () => void {
  horcher.add(fn);
  return () => horcher.delete(fn);
}

/** Ein Ereignis an Meta melden.
 *
 *  `kennung` ist die Ereigniskennung. Sie ist heute ohne Wirkung und steht
 *  hier für später: Sobald dieselben Käufe zusätzlich vom Server gemeldet
 *  werden (Conversions API), erkennt Meta an ihr, dass Browser und Server
 *  vom selben Vorgang sprechen, und zählt ihn nur einmal. Für Käufe ist die
 *  Bestellnummer die richtige Kennung.
 */
export function melde(name: string, daten?: Record<string, unknown>, kennung?: string) {
  if (!PIXEL) return;
  const wahl = gewaehlt();
  if (wahl === "nein") return;
  if (wahl === null) {
    if (wartend.length < 10) wartend.push({ name, daten, kennung });
    return;
  }
  senden(name, daten, kennung);
}

function senden(name: string, daten?: Record<string, unknown>, kennung?: string) {
  pixelStarten();
  try {
    window.fbq?.("track", name, daten || {}, kennung ? { eventID: kennung } : undefined);
  } catch {
    /* Werbeblocker: dann kommt die Meldung eben nicht an. */
  }
}

let gestartet = false;

/** Lädt den Pixel nach und meldet den ersten Seitenaufruf. Nur einmal. */
export function pixelStarten() {
  if (gestartet || !PIXEL || typeof window === "undefined") return;
  gestartet = true;

  if (!window.fbq) {
    const f = Object.assign(
      function (...args: unknown[]) {
        if (f.callMethod) f.callMethod.apply(f, args);
        else f.queue.push(args);
      },
      { queue: [] as unknown[][], loaded: true, version: "2.0" },
    ) as Fbq;
    // Wie im Schnipsel von Meta: `fbq.push` zeigt auf fbq selbst. Aeltere
    // Teile von fbevents.js rufen die Warteschlange ueber `_fbq.push` auf.
    (f as Fbq & { push?: Fbq }).push = f;
    window.fbq = f;
    window._fbq = f;

    const s = document.createElement("script");
    s.async = true;
    s.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(s);
  }

  window.fbq?.("init", PIXEL);
  window.fbq?.("track", "PageView");
}
