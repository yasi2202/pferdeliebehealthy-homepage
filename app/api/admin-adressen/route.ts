import { istAngemeldet } from "@/lib/admin-zugang";
import { supabaseAlle } from "@/lib/versand";

// ---------------------------------------------------------------------------
// Der Export der Adressliste als CSV, zum Einlesen in ein Newsletter-Werkzeug.
//
// ▸ ES WERDEN NUR BESTÄTIGTE ADRESSEN AUSGEGEBEN.
//   Wer sich eingetragen, aber nie bestätigt hat, gehört nicht in einen
//   Verteiler. Das ist keine Kleinigkeit: Eine unbestätigte Adresse
//   anzuschreiben ist eine unerlaubte Werbemail, und beim zweiten Mal wird es
//   teuer. Der Filter sitzt deshalb hier und nicht in der Anzeige, wo man ihn
//   versehentlich wegklicken könnte.
//
// ▸ WOHER DIE ADRESSEN KOMMEN
//   Aus der Ansicht `alle_anmeldungen`, die Futter-Check und Insider
//   zusammenfasst und Doppelte entfernt. Steht eine Adresse in beiden,
//   erscheint sie einmal, und `woher` nennt beide Quellen.
//
// ▸ WARUM SEMIKOLON UND NICHT KOMMA
//   Excel in deutscher Fassung erwartet Semikolon. Mit Komma landet alles in
//   einer einzigen Spalte, und man denkt, der Export sei kaputt.
//
// ▸ WARUM EIN BOM AM ANFANG
//   Die drei unsichtbaren Zeichen ganz vorn sagen Excel, dass die Datei
//   UTF-8 ist. Ohne sie werden aus Umlauten Zeichenfolgen wie "Ã¤".
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

type Adresse = {
  email: string;
  vorname: string | null;
  bestaetigt: boolean;
  erste_anmeldung: string | null;
  woher: string | null;
};

/** Macht einen Wert für CSV sicher.
 *
 *  Die Anführungszeichen und das Verdoppeln sind Pflicht, sobald in einem
 *  Feld ein Semikolon oder ein Zeilenumbruch steht. Das führende Hochkomma
 *  bei Formelzeichen verhindert, dass Excel den Inhalt als Formel ausführt:
 *  Eine Adresse wie "=cmd|..." wäre sonst eine Sicherheitslücke im Postfach
 *  desjenigen, der die Datei öffnet. */
function feld(wert: unknown): string {
  const text = String(wert ?? "");
  const entschaerft = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${entschaerft.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!(await istAngemeldet())) {
    return new Response("Nicht angemeldet.", { status: 401 });
  }

  const zeilen =
    (await supabaseAlle<Adresse>(
      "alle_anmeldungen?bestaetigt=is.true&select=email,vorname,bestaetigt,erste_anmeldung,woher",
    )) ?? [];

  const kopf = ["E-Mail", "Vorname", "Angemeldet seit", "Herkunft"];

  const inhalt = [
    kopf.map(feld).join(";"),
    ...zeilen.map((z) =>
      [
        feld(z.email),
        // "du" ist der Platzhalter aus den übernommenen Listen. In einer
        // Anrede stünde sonst wörtlich "Hallo du,".
        feld(z.vorname && z.vorname.toLowerCase() !== "du" ? z.vorname : ""),
        feld(
          z.erste_anmeldung
            ? new Date(z.erste_anmeldung).toLocaleDateString("de-DE")
            : "",
        ),
        feld(z.woher),
      ].join(";"),
    ),
  ].join("\r\n");

  const heute = new Date().toLocaleDateString("sv-SE", {
    timeZone: "Europe/Berlin",
  });

  return new Response("﻿" + inhalt, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="adressen-${heute}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
