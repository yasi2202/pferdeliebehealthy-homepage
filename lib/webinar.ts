// ---------------------------------------------------------------------------
// Das kostenlose Webinar: Termine, Zeiten, Texte.
//
// Diese Datei enthaelt nichts Geheimes und darf auch im Browser laufen.
// Alles, was Adressen speichert oder Mails schickt, steht in webinar-server.ts.
//
// ▸ DIE ZEITZONE IST DER GANZE WITZ DIESER DATEI
//   Der Server laeuft bei Vercel nach Weltzeit. "20 Uhr" heisst dort im
//   Sommer 18:00 UTC und im Winter 19:00 UTC. Wer das nicht umrechnet, hat
//   nach der Zeitumstellung ein Webinar, das eine Stunde daneben liegt, und
//   merkt es erst, wenn niemand da ist. Dieselbe Falle steckt in den
//   Zeitplaenen von EquiDesk und dem Stall Organizer.
//
//   Deshalb wird hier durchgehend in UTC gerechnet und ausschliesslich fuer
//   die Anzeige nach Europe/Berlin umgerechnet.
// ---------------------------------------------------------------------------

export const ZEITZONE = "Europe/Berlin";

/** Wie lange das Webinar dauert. Bestimmt, wie lange der Raum offen bleibt. */
export const DAUER_MINUTEN = 45;

/**
 * Wie lange vor dem Termin man sich noch anmelden kann.
 *
 * Ohne diesen Vorlauf bucht jemand den Termin, der in vierzig Sekunden
 * beginnt, und die Anmeldemail kommt an, wenn das Webinar schon laeuft.
 */
export const VORLAUF_MINUTEN = 10;

/**
 * Wie lange nach dem Start man noch einsteigen darf.
 *
 * Wer zehn Minuten zu spaet kommt, soll nicht vor einer verschlossenen Tuer
 * stehen. Danach lohnt es sich nicht mehr, dann lieber der naechste Termin.
 */
export const EINLASS_MINUTEN = 10;

/**
 * Die Sendezeiten, in Berliner Zeit.
 *
 * `tage` sind die Wochentage nach JavaScript-Zaehlung: 0 ist Sonntag.
 * Eine leere Liste heisst: an jedem Tag.
 *
 * Hier aendert man die Zeiten, und nur hier.
 */
export const SENDEZEITEN: { stunde: number; minute: number; tage: number[] }[] = [
  { stunde: 20, minute: 0, tage: [] },   // jeden Abend
  { stunde: 10, minute: 0, tage: [0] },  // sonntagvormittags
];

// ---------------------------------------------------------------------------
// Zeitzonen-Rechnung
// ---------------------------------------------------------------------------

/** Wie viele Minuten Berlin zu diesem Zeitpunkt vor der Weltzeit liegt (60 oder 120). */
function versatzMinuten(zeitpunkt: Date): number {
  const teile = new Intl.DateTimeFormat("en-US", {
    timeZone: ZEITZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(zeitpunkt);

  const w = (art: string) => Number(teile.find((t) => t.type === art)?.value ?? 0);
  // formatToParts gibt bei hour12: false um Mitternacht je nach Umgebung
  // "24" statt "00" zurueck. Das faengt der Modulo ab.
  const alsWaereEsUtc = Date.UTC(w("year"), w("month") - 1, w("day"), w("hour") % 24, w("minute"), w("second"));
  return (alsWaereEsUtc - zeitpunkt.getTime()) / 60000;
}

/** Macht aus einer Berliner Wanduhrzeit den echten Zeitpunkt. */
function berlinerZeit(jahr: number, monat: number, tag: number, stunde: number, minute: number): Date {
  // Erst so tun, als waere die Wanduhrzeit schon Weltzeit, dann den Versatz
  // abziehen, den Berlin zu genau diesem Zeitpunkt hat.
  const geraten = Date.UTC(jahr, monat - 1, tag, stunde, minute);
  const versatz = versatzMinuten(new Date(geraten));
  return new Date(geraten - versatz * 60000);
}

/** Datum und Wochentag, wie sie in Berlin auf dem Kalender stehen. */
function berlinerDatum(zeitpunkt: Date) {
  const teile = new Intl.DateTimeFormat("en-US", {
    timeZone: ZEITZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
  }).formatToParts(zeitpunkt);
  const w = (art: string) => teile.find((t) => t.type === art)?.value ?? "";
  const wochentage: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return {
    jahr: Number(w("year")),
    monat: Number(w("month")),
    tag: Number(w("day")),
    wochentag: wochentage[w("weekday")] ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Termine
// ---------------------------------------------------------------------------

/**
 * Die naechsten Termine, aufsteigend.
 *
 * Geht Tag fuer Tag durch den Berliner Kalender und sammelt die Sendezeiten,
 * die noch weit genug in der Zukunft liegen.
 */
export function naechsteTermine(anzahl = 5, ab: Date = new Date()): Date[] {
  const frueheste = ab.getTime() + VORLAUF_MINUTEN * 60000;
  const gefunden: Date[] = [];

  for (let versatzTage = 0; versatzTage < 21 && gefunden.length < anzahl; versatzTage++) {
    const tagesZeitpunkt = new Date(ab.getTime() + versatzTage * 86400000);
    const { jahr, monat, tag, wochentag } = berlinerDatum(tagesZeitpunkt);

    for (const zeit of SENDEZEITEN) {
      if (zeit.tage.length && !zeit.tage.includes(wochentag)) continue;
      const termin = berlinerZeit(jahr, monat, tag, zeit.stunde, zeit.minute);
      if (termin.getTime() >= frueheste) gefunden.push(termin);
    }
  }

  return gefunden.sort((a, b) => a.getTime() - b.getTime()).slice(0, anzahl);
}

/** Steht dieser Zeitpunkt wirklich auf dem Sendeplan? */
export function istGueltigerTermin(termin: Date): boolean {
  const { wochentag } = berlinerDatum(termin);
  const teile = new Intl.DateTimeFormat("de-DE", {
    timeZone: ZEITZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(termin);
  const stunde = Number(teile.find((t) => t.type === "hour")?.value ?? -1) % 24;
  const minute = Number(teile.find((t) => t.type === "minute")?.value ?? -1);

  return SENDEZEITEN.some(
    (z) =>
      z.stunde === stunde &&
      z.minute === minute &&
      (z.tage.length === 0 || z.tage.includes(wochentag))
  );
}

// ---------------------------------------------------------------------------
// Anzeige
// ---------------------------------------------------------------------------

/** "Sonntag, 14. September, 10:00 Uhr" */
export function terminText(termin: Date): string {
  const datum = new Intl.DateTimeFormat("de-DE", {
    timeZone: ZEITZONE,
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(termin);
  const uhrzeit = new Intl.DateTimeFormat("de-DE", {
    timeZone: ZEITZONE,
    hour: "2-digit",
    minute: "2-digit",
  }).format(termin);
  return `${datum}, ${uhrzeit} Uhr`;
}

/** "heute", "morgen" oder der Wochentag. Fuer die kurze Zeile im Formular. */
export function terminNaehe(termin: Date, jetzt: Date = new Date()): string {
  const a = berlinerDatum(termin);
  const b = berlinerDatum(jetzt);
  const tageDazwischen = Math.round(
    (Date.UTC(a.jahr, a.monat - 1, a.tag) - Date.UTC(b.jahr, b.monat - 1, b.tag)) / 86400000
  );
  if (tageDazwischen === 0) return "heute";
  if (tageDazwischen === 1) return "morgen";
  return new Intl.DateTimeFormat("de-DE", { timeZone: ZEITZONE, weekday: "long" }).format(termin);
}

// ---------------------------------------------------------------------------
// Zustand des Raums
// ---------------------------------------------------------------------------

export type RaumZustand =
  | { art: "wartet"; sekundenBisStart: number }
  | { art: "laeuft"; sekundeImVideo: number }
  | { art: "verpasst" }
  | { art: "vorbei" };

/**
 * Was der Warteraum gerade zeigen soll.
 *
 * `sekundeImVideo` ist der Punkt, an dem das Video einsteigt. Wer zu spaet
 * kommt, sieht nicht den Anfang: Das ist der Unterschied zwischen einem
 * Termin und einer Aufzeichnung, und er ist Absicht.
 */
export function raumZustand(termin: Date, jetzt: Date = new Date()): RaumZustand {
  const sekunden = Math.floor((jetzt.getTime() - termin.getTime()) / 1000);
  if (sekunden < 0) return { art: "wartet", sekundenBisStart: -sekunden };
  if (sekunden > DAUER_MINUTEN * 60) return { art: "vorbei" };
  if (sekunden > EINLASS_MINUTEN * 60) return { art: "verpasst" };
  return { art: "laeuft", sekundeImVideo: sekunden };
}
