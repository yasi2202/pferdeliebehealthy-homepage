import { istAngemeldet } from "@/lib/admin-zugang";
import { supabaseAlle } from "@/lib/versand";

// ---------------------------------------------------------------------------
// Der Export aller Verkäufe als CSV, für die Buchhaltung.
//
// ▸ WAS DEIN STEUERBÜRO BRAUCHT, UND WARUM ES SO IN DER TABELLE STEHT
//   Für jede Zeile: Rechnungsnummer, Datum, was verkauft wurde, der
//   Bruttobetrag, der darin enthaltene Steuerbetrag, der Nettobetrag und der
//   Steuersatz. Genau diese Spalten liest jedes Buchhaltungsprogramm ein.
//
//   Netto und Steuer stehen ausgerechnet dabei, obwohl man sie aus dem Brutto
//   ableiten könnte. Das ist Absicht: Sonst rechnet jeder anders und rundet
//   anders, und am Jahresende gehen die Summen um ein paar Cent auseinander.
//   Gerundet wird hier genauso wie auf der Rechnung, die die Kundin bekommen
//   hat.
//
// ▸ NUR BEZAHLTE VERKÄUFE. Eine abgebrochene Bestellung ist kein
//   Geschäftsvorfall und hat in der Buchhaltung nichts zu suchen.
//
// ▸ DAS ERSETZT DIE RECHNUNGEN NICHT VOLLSTÄNDIG.
//   Diese Datei ist ein Journal, also die Liste aller Vorgänge. Die einzelnen
//   Rechnungen sind die Mails, die deine Kundinnen bekommen haben. Für die
//   laufende Buchhaltung reicht das Journal, für eine Prüfung solltest du
//   auch die Rechnungen selbst vorlegen können. Sag Bescheid, wenn du sie als
//   PDF brauchst, das ist ein eigener Bau.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

type Zeile = {
  nummer: string;
  rechnungsnummer: string | null;
  bezahlt_am: string | null;
  angelegt_am: string;
  art: string;
  gehoert_zu: string | null;
  email: string;
  vorname: string;
  nachname: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
  artikel: { name: string; mwst: number }[];
  gesamt: number;
  rabattcode: string | null;
  rabatt_cent: number | null;
};

/** Macht einen Wert für CSV sicher. Siehe app/api/admin-adressen. */
function feld(wert: unknown): string {
  const text = String(wert ?? "");
  const entschaerft = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${entschaerft.replace(/"/g, '""')}"`;
}

/** Aus 2900 wird "29,00". Mit Komma, weil deutsche Programme das erwarten. */
function betrag(cent: number): string {
  return (cent / 100).toFixed(2).replace(".", ",");
}

function datum(wert: string | null): string {
  return wert ? new Date(wert).toLocaleDateString("de-DE") : "";
}

export async function GET() {
  if (!(await istAngemeldet())) {
    return new Response("Nicht angemeldet.", { status: 401 });
  }

  const zeilen =
    (await supabaseAlle<Zeile>(
      "digitalbestellungen?status=eq.bezahlt&select=*&order=bezahlt_am.asc",
    )) ?? [];

  const kopf = [
    "Rechnungsnummer",
    "Bestellnummer",
    "Rechnungsdatum",
    "Art",
    "Gehört zu",
    "Produkt",
    "Kundin",
    "E-Mail",
    "Straße",
    "PLZ",
    "Ort",
    "Land",
    "Brutto",
    "Netto",
    "MwSt-Betrag",
    "MwSt-Satz",
    "Rabattcode",
    "Rabatt",
  ];

  const daten = zeilen.map((z) => {
    const artikel = Array.isArray(z.artikel) ? z.artikel : [];
    const satz = artikel[0]?.mwst ?? 19;

    // Der Steueranteil eines Bruttobetrags: bei 19 % sind das 19/119.
    // Genauso gerechnet wie auf der Rechnung, siehe lib/digital-server.ts.
    const steuer = Math.round((z.gesamt * satz) / (100 + satz));
    const netto = z.gesamt - steuer;

    return [
      feld(z.rechnungsnummer),
      feld(z.nummer),
      feld(datum(z.bezahlt_am ?? z.angelegt_am)),
      feld(z.art === "upsell" ? "Anschlussangebot" : "Kauf"),
      feld(z.gehoert_zu),
      feld(artikel.map((a) => a.name).join(", ")),
      feld(`${z.vorname} ${z.nachname}`),
      feld(z.email),
      feld(z.strasse),
      feld(z.plz),
      feld(z.ort),
      feld(z.land),
      feld(betrag(z.gesamt)),
      feld(betrag(netto)),
      feld(betrag(steuer)),
      feld(`${satz} %`),
      feld(z.rabattcode),
      feld(z.rabatt_cent ? betrag(z.rabatt_cent) : ""),
    ].join(";");
  });

  const inhalt = [kopf.map(feld).join(";"), ...daten].join("\r\n");

  const heute = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Europe/Berlin",
  });

  // Das unsichtbare Zeichen am Anfang sagt Excel, dass die Datei UTF-8 ist.
  // Ohne es werden aus Umlauten Zeichenfolgen wie "Ã¤".
  return new Response("﻿" + inhalt, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="verkaeufe-${heute}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
