import { supabaseAlle } from "@/lib/versand";
import { digitalFinden } from "@/lib/digital";
import { produktFinden } from "@/lib/shop";

// ---------------------------------------------------------------------------
// Die Zahlen für den Auswertungsbereich.
//
// ▸ WAS HIER GEZÄHLT WIRD UND WAS NICHT
//   Nur Bestellungen mit status = 'bezahlt'. Eine angefangene Bestellung,
//   bei der die Bezahlung abgebrochen wurde, ist kein Umsatz. Wer sie
//   mitzählt, sieht Zahlen, die es nie gab, und trifft danach falsche
//   Entscheidungen.
//
// ▸ WARUM supabaseAlle UND NICHT supabase
//   Supabase liefert pro Anfrage höchstens tausend Zeilen zurück, ohne
//   Fehler und ohne Hinweis. Ab der tausendundersten Bestellung wäre die
//   Auswertung still falsch, und zwar zu niedrig. `supabaseAlle` lädt in
//   Blöcken nach, bis nichts mehr kommt.
//
// ▸ ALLE BETRÄGE IN CENT, wie überall. Umgerechnet wird erst in der Anzeige.
//
// ▸ DIE ZEITRÄUME RICHTEN SICH NACH DEUTSCHER ZEIT.
//   Der Server steht irgendwo, und wenn er in UTC rechnet, fallen abends
//   zwischen 22 und 24 Uhr getätigte Käufe auf den falschen Tag. Deshalb
//   wird für die Einordnung jedes Datum erst nach Europe/Berlin umgerechnet.
// ---------------------------------------------------------------------------

export type Bezahlt = {
  nummer: string;
  bezahlt_am: string | null;
  angelegt_am: string;
  gesamt: number;
  rabatt_cent: number | null;
  art: string;
  artikel: { slug: string; name: string; preis: number }[];
};

export type Warenbestellung = {
  nummer: string;
  bezahlt_am: string | null;
  angelegt_am: string;
  gesamt: number;
  versand: number;
  artikel: { slug: string; name: string; menge: number; zwischensumme: number }[];
};

/** Ein Datum als "2026-09-01", gerechnet in deutscher Zeit. */
export function tagesschluessel(datum: Date): string {
  // sv-SE liefert das Format Jahr-Monat-Tag, und mit timeZone stimmt der Tag
  // auch dann, wenn der Server anderswo steht.
  return datum.toLocaleDateString("sv-SE", { timeZone: "Europe/Berlin" });
}

/**
 * Der Beginn eines Tages in deutscher Zeit, als echter Zeitpunkt.
 *
 * Der Versatz zu UTC darf nicht fest eingetragen werden: Im Sommer sind es
 * zwei Stunden, im Winter eine. Mit einem festen "+02:00" würde "Heute" ab
 * der Zeitumstellung im Oktober schon um 23 Uhr des Vortags beginnen, und
 * die letzten Kaeufe des Abends landeten auf dem falschen Tag.
 *
 * Bestimmt wird der Versatz für die Mittagszeit des Tages. Mittags liegt
 * sicher innerhalb des Tages, auch an den beiden Umstellungstagen.
 */
function tagesbeginn(tag: string): Date {
  const mittags = new Date(`${tag}T12:00:00Z`);

  const name =
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Europe/Berlin",
      timeZoneName: "longOffset",
    })
      .formatToParts(mittags)
      .find((t) => t.type === "timeZoneName")?.value ?? "GMT+01:00";

  // "GMT+02:00" wird zu "+02:00". Bei reinem "GMT" bleibt nichts uebrig.
  const versatz = name.replace("GMT", "") || "+00:00";

  return new Date(`${tag}T00:00:00${versatz}`);
}

/**
 * Der Montag der Woche, in der das Datum liegt, als "2026-09-07".
 *
 * Gerechnet wird auf der Mittagszeit in UTC, nicht in der Zeit des Servers.
 * Der Server steht irgendwo, und mit einer Uhrzeit ohne Zeitzone hängt das
 * Ergebnis davon ab, wo er steht. Genau daran fiel bis zum 08.09.2026 der
 * Montagsumsatz aus der Wochenzahl: Die Woche begann nicht um Mitternacht,
 * sondern mittags.
 */
function wochenanfang(datum: Date): string {
  const d = new Date(`${tagesschluessel(datum)}T12:00:00Z`);
  // getUTCDay(): 0 ist Sonntag. Wir wollen Montag als ersten Tag.
  const versatz = (d.getUTCDay() + 6) % 7;
  d.setUTCDate(d.getUTCDate() - versatz);
  return d.toISOString().slice(0, 10);
}

export type Zeitraum = {
  name: string;
  von: Date;
  /** Umsatz in Cent, nach Abzug gewährter Rabatte. */
  umsatz: number;
  anzahl: number;
};

export type ProduktZahl = {
  slug: string;
  name: string;
  anzahl: number;
  umsatz: number;
  /** Wie oft es als Anschlussangebot gekauft wurde. */
  alsAngebot: number;
};

export type Auswertung = {
  zeitraeume: Zeitraum[];
  produkte: ProduktZahl[];
  /** Die letzten Tage für den kleinen Verlauf, ältester zuerst. */
  verlauf: { tag: string; umsatz: number; anzahl: number }[];
  gesamtUmsatz: number;
  gesamtAnzahl: number;
  /** Wie viel insgesamt an Rabatt gewährt wurde. */
  rabattSumme: number;
  /** Käufe, bei denen die Freischaltung nicht geklappt hat. Sollte 0 sein. */
  probleme: { nummer: string; email: string; hinweis: string | null }[];
  /** Konnten die Daten geladen werden? */
  gelesen: boolean;
};

/** Wann gilt eine Bestellung als getätigt? */
function zeitpunkt(b: { bezahlt_am: string | null; angelegt_am: string }): Date {
  return new Date(b.bezahlt_am ?? b.angelegt_am);
}

export async function auswerten(tageImVerlauf = 30): Promise<Auswertung> {
  const leer: Auswertung = {
    zeitraeume: [],
    produkte: [],
    verlauf: [],
    gesamtUmsatz: 0,
    gesamtAnzahl: 0,
    rabattSumme: 0,
    probleme: [],
    gelesen: false,
  };

  let digital: Bezahlt[] | null = null;
  let waren: Warenbestellung[] | null = null;

  try {
    digital = await supabaseAlle<Bezahlt>(
      "digitalbestellungen?status=eq.bezahlt&select=nummer,bezahlt_am,angelegt_am,gesamt,rabatt_cent,art,artikel&order=angelegt_am.desc",
    );

    // Der Futtershop zählt mit, sonst wäre der Umsatz unvollständig. Beim
    // Versand interessiert nur die Ware, nicht das Porto: Porto ist
    // durchlaufender Posten, kein Ertrag.
    waren = await supabaseAlle<Warenbestellung>(
      "bestellungen?status=eq.bezahlt&select=nummer,bezahlt_am,angelegt_am,gesamt,versand,artikel&order=angelegt_am.desc",
    );
  } catch (e) {
    console.error("Auswertung liess sich nicht laden:", e);
    return leer;
  }

  if (digital === null && waren === null) {
    return leer;
  }

  const jetzt = new Date();
  const heute = tagesschluessel(jetzt);

  const grenzen: { name: string; von: Date }[] = [
    { name: "Heute", von: tagesbeginn(heute) },
    { name: "Diese Woche", von: tagesbeginn(wochenanfang(jetzt)) },
    { name: "Dieser Monat", von: tagesbeginn(`${heute.slice(0, 7)}-01`) },
    { name: "Dieses Jahr", von: tagesbeginn(`${heute.slice(0, 4)}-01-01`) },
  ];

  const zeitraeume: Zeitraum[] = grenzen.map((g) => ({
    ...g,
    umsatz: 0,
    anzahl: 0,
  }));

  const proProdukt = new Map<string, ProduktZahl>();
  const proTag = new Map<string, { umsatz: number; anzahl: number }>();

  let gesamtUmsatz = 0;
  let gesamtAnzahl = 0;
  let rabattSumme = 0;

  /** Trägt eine Bestellung in alle Auswertungen ein. */
  function zaehlen(
    zeit: Date,
    betrag: number,
    posten: { slug: string; name: string; anzahl: number; umsatz: number }[],
    alsAngebot: boolean,
  ) {
    gesamtUmsatz += betrag;
    gesamtAnzahl += 1;

    for (const z of zeitraeume) {
      if (zeit >= z.von) {
        z.umsatz += betrag;
        z.anzahl += 1;
      }
    }

    const tag = tagesschluessel(zeit);
    const bisher = proTag.get(tag) ?? { umsatz: 0, anzahl: 0 };
    proTag.set(tag, { umsatz: bisher.umsatz + betrag, anzahl: bisher.anzahl + 1 });

    for (const p of posten) {
      const eintrag = proProdukt.get(p.slug) ?? {
        slug: p.slug,
        name: p.name,
        anzahl: 0,
        umsatz: 0,
        alsAngebot: 0,
      };

      eintrag.anzahl += p.anzahl;
      eintrag.umsatz += p.umsatz;
      if (alsAngebot) eintrag.alsAngebot += p.anzahl;

      proProdukt.set(p.slug, eintrag);
    }
  }

  for (const b of digital ?? []) {
    const artikel = Array.isArray(b.artikel) ? b.artikel : [];

    zaehlen(
      zeitpunkt(b),
      b.gesamt,
      artikel.map((a) => ({
        slug: a.slug,
        // Der Name aus dem Katalog, falls es ihn noch gibt. So heisst ein
        // Produkt in der Auswertung auch dann aktuell, wenn es beim Kauf
        // anders hiess.
        name: digitalFinden(a.slug)?.kurzname ?? a.name,
        anzahl: 1,
        // Der Rabatt wird auf den ersten Posten gerechnet. Da eine digitale
        // Bestellung immer genau einen Posten hat, ist das exakt.
        umsatz: b.gesamt,
      })),
      b.art === "upsell",
    );

    rabattSumme += b.rabatt_cent ?? 0;
  }

  for (const b of waren ?? []) {
    const artikel = Array.isArray(b.artikel) ? b.artikel : [];

    zaehlen(
      zeitpunkt(b),
      // Ohne Porto: Das ist kein Ertrag, sondern geht an DHL weiter.
      b.gesamt - (b.versand ?? 0),
      artikel.map((a) => ({
        slug: a.slug,
        name: produktFinden(a.slug)?.kurzname ?? a.name,
        anzahl: a.menge,
        umsatz: a.zwischensumme,
      })),
      false,
    );
  }

  // Der Verlauf der letzten Tage, auch die ohne Umsatz. Lücken wegzulassen
  // würde die Kurve verzerren.
  const verlauf: { tag: string; umsatz: number; anzahl: number }[] = [];

  for (let i = tageImVerlauf - 1; i >= 0; i--) {
    const d = new Date(jetzt);
    d.setDate(d.getDate() - i);
    const tag = tagesschluessel(d);
    const werte = proTag.get(tag) ?? { umsatz: 0, anzahl: 0 };
    verlauf.push({ tag, ...werte });
  }

  // Die Problemfälle: bezahlt, aber nicht freigeschaltet.
  let probleme: Auswertung["probleme"] = [];

  try {
    const zeilen = await supabaseAlle<{
      nummer: string;
      email: string;
      freischaltung_hinweis: string | null;
    }>(
      "digitalbestellungen?status=eq.bezahlt&freigeschaltet=is.false&select=nummer,email,freischaltung_hinweis",
    );

    probleme = (zeilen ?? []).map((z) => ({
      nummer: z.nummer,
      email: z.email,
      hinweis: z.freischaltung_hinweis,
    }));
  } catch {
    // Kein Grund, die ganze Auswertung scheitern zu lassen.
  }

  return {
    zeitraeume,
    produkte: [...proProdukt.values()].sort((a, b) => b.umsatz - a.umsatz),
    verlauf,
    gesamtUmsatz,
    gesamtAnzahl,
    rabattSumme,
    probleme,
    gelesen: true,
  };
}
