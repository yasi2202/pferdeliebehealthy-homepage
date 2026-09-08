import { supabaseAlle, supabase } from "@/lib/versand";
import { digitalFinden } from "@/lib/digital";
import { kulanzEnde } from "@/lib/kulanz";

// ---------------------------------------------------------------------------
// Angefangene Bestellungen, bei denen kein Geld angekommen ist.
//
// ▸ WAS EINE „OFFENE" BESTELLUNG IST
//   Wer auf „Zahlungspflichtig bestellen" drückt, bekommt sofort eine Zeile
//   mit `status = 'offen'`. Erst der Stripe-Webhook setzt sie auf `bezahlt`.
//   Bleibt sie offen, ist die Bezahlung abgebrochen oder gescheitert. Die
//   Datenbank unterscheidet beides nicht, und sie kann es auch nicht: Ob
//   jemand das Fenster zugemacht hat oder ob die Karte abgelehnt wurde,
//   erfährt die Seite nie.
//
// ▸ DREI SEHR VERSCHIEDENE FÄLLE STECKEN IN DIESER LISTE.
//   Wer sie alle gleich behandelt, schreibt Leuten hinterher, die längst
//   gekauft haben. Deshalb wird hier eingeordnet:
//
//   1. „gekauft"  — dieselbe Adresse hat dasselbe Produkt später bezahlt.
//                   Meist ein zweiter Anlauf ein paar Minuten danach, etwa
//                   nach einer abgelehnten Karte. Nichts zu tun.
//   2. „abgelehnt" — ein Zusatzangebot nach dem Kauf, das nicht angenommen
//                   wurde. Das ist kein Abbruch, sondern eine Entscheidung.
//                   Hinterherzuschreiben wäre aufdringlich, und der Preis
//                   des Zusatzangebots gilt ohnehin nur in dem Moment.
//   3. „offen"    — die einzige Gruppe, bei der eine Erinnerung Sinn ergibt.
//
// ▸ UND SELBST DANN NICHT IMMER: OHNE EINWILLIGUNG KEINE MAIL.
//   Eine Erinnerung an einen liegengebliebenen Einkauf ist Werbung. Die
//   Ausnahme für Bestandskundinnen (§ 7 Abs. 3 UWG) greift hier gerade
//   nicht, denn sie setzt einen tatsächlichen Verkauf voraus, und genau der
//   ist nicht zustande gekommen. Bleibt die Einwilligung, also das Häkchen
//   beim Newsletter. Ohne das Häkchen sagt die Seite, warum kein Knopf da
//   ist, statt ihn wirkungslos anzuzeigen.
// ---------------------------------------------------------------------------

/** Wie die Zeilen in der Datenbank aussehen, soweit hier gebraucht. */
type Zeile = {
  id: string;
  nummer: string;
  angelegt_am: string;
  status: string;
  art: string;
  email: string;
  vorname: string;
  nachname: string;
  gesamt: number;
  newsletter: boolean;
  artikel: { slug: string; name: string; preis: number }[] | null;
  /** Kann fehlen, solange datenbank/erinnerung-abbruch.sql nicht lief. */
  erinnert_am?: string | null;
};

export type Lage = "gekauft" | "abgelehnt" | "offen";

export type Abbruch = {
  nummer: string;
  angelegt_am: string;
  name: string;
  email: string;
  gesamt: number;
  /** Was im Warenkorb lag, als Text. */
  produkt: string;
  /** Für den Weg zurück zur Kasse: /kasse/<slug>. */
  slug: string | null;
  newsletter: boolean;
  erinnert_am: string | null;
  lage: Lage;
  /** Darf eine Erinnerung raus? */
  erinnerbar: boolean;
  /** Wenn nicht: warum nicht, in einem Satz. */
  grund: string | null;
  /**
   * Nur gesetzt, wenn das Produkt ein befristetes Angebot war und die Frist
   * durch ist. Dann muss man wissen, dass die Erinnerung den Kulanzlink
   * mitschickt und wie lange der noch trägt.
   */
  fristHinweis: string | null;
};

/** Der Satz zur abgelaufenen Frist, oder null, wenn keine Frist im Weg ist. */
function fristHinweisText(slug: string | null): string | null {
  const katalog = slug ? digitalFinden(slug) : null;
  if (!katalog?.verkaufBis) return null;

  const ende = new Date(`${katalog.verkaufBis}T23:59:59+02:00`);
  if (new Date() <= ende) return null;

  const bis = kulanzEnde(katalog.verkaufBis);

  if (new Date() > bis) {
    return `Angebot lief am ${ende.toLocaleDateString("de-DE")} aus, auch die Kulanzfrist ist vorbei`;
  }

  return (
    `Angebot lief am ${ende.toLocaleDateString("de-DE")} aus, ` +
    `alter Preis per Kulanzlink noch bis ${bis.toLocaleDateString("de-DE")}`
  );
}

/** Gehört dieser Artikel zu dieser Bestellung? Verglichen wird über den Slug. */
function slugsVon(z: Zeile): string[] {
  return (Array.isArray(z.artikel) ? z.artikel : []).map((a) => a.slug);
}

/**
 * Ordnet eine offene Bestellung ein.
 *
 * `bezahlte` sind alle bezahlten Bestellungen derselben Adresse. Die
 * Einordnung steckt bewusst in einer eigenen Funktion: Die Seite zeigt sie
 * an, und die Route, die die Mail verschickt, rechnet sie noch einmal neu.
 * Eine Seite, die zehn Minuten offen im Browser stand, darf nicht darüber
 * entscheiden, wer Post bekommt.
 */
export function lageBestimmen(offen: Zeile, bezahlte: Zeile[]): Lage {
  const slugs = slugsVon(offen);

  const schonGekauft = bezahlte.some((b) =>
    slugsVon(b).some((s) => slugs.includes(s)),
  );

  if (schonGekauft) return "gekauft";
  if (offen.art === "upsell") return "abgelehnt";
  return "offen";
}

/** Alle offenen Bestellungen, eingeordnet, neueste zuerst. */
export async function abbrueche(): Promise<{
  liste: Abbruch[];
  /** Fehlt die Spalte `erinnert_am` noch? Dann ist die SQL-Datei nicht gelaufen. */
  spalteFehlt: boolean;
  gelesen: boolean;
}> {
  const spalteFehlt = !(await spalteDaIst());

  const alle = await supabaseAlle<Zeile>(
    "digitalbestellungen?select=id,nummer,angelegt_am,status,art,email,vorname,nachname,gesamt,newsletter,artikel" +
      (spalteFehlt ? "" : ",erinnert_am") +
      "&order=angelegt_am.desc",
  );

  if (alle === null) return { liste: [], spalteFehlt, gelesen: false };

  const offene = alle.filter((z) => z.status === "offen");
  const bezahlte = alle.filter((z) => z.status === "bezahlt");

  const liste = offene.map((o) => {
    const meine = bezahlte.filter(
      (b) => b.email.toLowerCase() === o.email.toLowerCase(),
    );

    const lage = lageBestimmen(o, meine);
    const erinnert = o.erinnert_am ?? null;

    const artikel = Array.isArray(o.artikel) ? o.artikel : [];
    const slug = artikel[0]?.slug ?? null;

    return {
      nummer: o.nummer,
      angelegt_am: o.angelegt_am,
      name: `${o.vorname} ${o.nachname}`.trim(),
      email: o.email,
      gesamt: o.gesamt,
      produkt:
        artikel
          .map((a) => digitalFinden(a.slug)?.kurzname ?? a.name)
          .join(", ") || "—",
      slug,
      newsletter: o.newsletter,
      erinnert_am: erinnert,
      lage,
      erinnerbar:
        lage === "offen" && o.newsletter && !erinnert && !spalteFehlt,
      grund: grundText(lage, o.newsletter, erinnert, spalteFehlt),
      fristHinweis: lage === "offen" ? fristHinweisText(slug) : null,
    };
  });

  return { liste, spalteFehlt, gelesen: true };
}

/** Warum hier kein Knopf steht. Null heisst: es steht einer. */
function grundText(
  lage: Lage,
  newsletter: boolean,
  erinnert: string | null,
  spalteFehlt: boolean,
): string | null {
  if (lage === "gekauft") return "hat es später doch gekauft";
  if (lage === "abgelehnt") return "Zusatzangebot, nicht angenommen";

  if (erinnert) {
    return `erinnert am ${new Date(erinnert).toLocaleDateString("de-DE")}`;
  }

  if (!newsletter) return "keine Einwilligung für Post";
  if (spalteFehlt) return "erst die SQL-Datei ausführen";

  return null;
}

/**
 * Gibt es die Spalte `erinnert_am` schon?
 *
 * Solange `datenbank/erinnerung-abbruch.sql` nicht gelaufen ist, antwortet
 * Supabase auf eine Abfrage mit dieser Spalte mit 400, und die ganze Liste
 * wäre weg. Deshalb wird einmal gefragt, statt es darauf ankommen zu lassen.
 */
export async function spalteDaIst(): Promise<boolean> {
  const res = await supabase("digitalbestellungen?select=erinnert_am&limit=1");
  return res.ok;
}
