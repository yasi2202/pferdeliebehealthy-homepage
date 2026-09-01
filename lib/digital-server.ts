// ---------------------------------------------------------------------------
// Der Unterbau für den Verkauf digitaler Produkte: Stripe, Freischaltung in
// der Akademie, Newsletter und die Mails danach.
//
// Diese Datei gehört ausschliesslich auf den Server. Importiere sie nur aus
// Route-Handlern, nie aus einer Datei mit "use client".
//
// ▸ WAS HIER ANDERS IST ALS IM SHOP (lib/shop-server.ts)
//   Nach einer Warenbestellung packst du ein Paket. Nach einem Kurskauf muss
//   sofort etwas passieren, sonst steht die Kundin vor einer verschlossenen
//   Tür: Der Zugang muss in der Akademie freigeschaltet werden. Deshalb ist
//   der Ablauf hier länger und deshalb wird jeder Schritt einzeln in der
//   Bestellung vermerkt. Geht die Freischaltung schief, bekommst du eine
//   Mail und siehst in der Tabelle genau, an welcher Stelle es hakte.
//
// ▸ NEU EINZUTRAGEN in den Vercel-Einstellungen dieses Projekts:
//     AKADEMIE_WEBHOOK_URL   https://akademieapp.vercel.app/api/alfima-webhook
//     AKADEMIE_WEBHOOK_KEY   nur nötig, wenn in der Akademie
//                            ALFIMA_WEBHOOK_SECRET gesetzt ist. Dann muss
//                            hier DERSELBE Wert stehen.
//   Fehlt die Adresse, wird nichts freigeschaltet, der Kauf aber trotzdem
//   gespeichert, und du bekommst eine Warnmail. Lieber ein Zugang von Hand
//   als ein verlorener Kauf.
//
// ▸ WARUM DIE FREISCHALTUNG ÜBER DEN KAUF-WEBHOOK DER AKADEMIE LÄUFT
//   und nicht direkt in die Tabelle kursteilnehmer schreibt: Dort steckt die
//   ganze Logik, die es schon gibt. Sie legt neue Kundinnen an, ergänzt bei
//   bestehenden den Zugang, rührt Admin-Konten nicht an, verschickt die
//   Login-Mail und schreibt ein Protokoll. Das alles hier ein zweites Mal zu
//   bauen hiesse, es ab sofort an zwei Stellen pflegen zu müssen.
// ---------------------------------------------------------------------------

import { randomInt, randomUUID } from "node:crypto";
import {
  digitalFinden,
  type DigitalProdukt,
} from "@/lib/digital";
import { preisText } from "@/lib/shop";
import { STRIPE_ZAHLARTEN, stripeAnfrage, stripeHolen } from "@/lib/shop-server";
import {
  supabase,
  ersteZeile,
  sendeMail,
  esc,
  rahmen,
  anrede,
  ANTWORT_AN,
} from "@/lib/versand";

const AKADEMIE_WEBHOOK_URL = process.env.AKADEMIE_WEBHOOK_URL;
const AKADEMIE_WEBHOOK_KEY = process.env.AKADEMIE_WEBHOOK_KEY || "";


/**
 * Deine Angaben auf der Rechnung, aus dem Impressum übernommen.
 *
 * Zusammen mit der Anschrift der Kundin, der fortlaufenden Rechnungsnummer
 * aus der Datenbank, dem Datum, der Leistung und dem Steuersatz ergibt das
 * eine vollständige Rechnung nach § 14 UStG, nicht nur eine
 * Kleinbetragsrechnung. Yasemin hat das am 31.08.2026 so gewollt, damit alle
 * Rechnungen gleich aussehen und auch bei teureren Produkten stimmen.
 *
 * Fehlt dir hier einmal etwas, etwa eine Umsatzsteuer-Identifikationsnummer,
 * dann trag sie hier ein und nicht im Mailtext.
 */
const RECHNUNGSABSENDER = {
  name: "Yasemin Halac",
  strasse: "Steigeweg 7",
  ort: "74722 Buchen",
  land: "Deutschland",
  steuernummer: "46138/44524",
};

// ---------------------------------------------------------------------------
// Die Bestellung
// ---------------------------------------------------------------------------

export type DigitalArtikel = {
  slug: string;
  name: string;
  preis: number;
  mwst: number;
};

export type DigitalBestellung = {
  nummer: string;
  status: "offen" | "bezahlt";
  /** Zu welchem Kauf das gehört: der Erstkauf oder das Angebot danach. */
  art: "kauf" | "upsell";
  /** Bei einem Upsell die Nummer des Erstkaufs, sonst null. */
  gehoert_zu: string | null;
  email: string;
  vorname: string;
  nachname: string;
  /** Die Rechnungsanschrift. */
  strasse: string;
  plz: string;
  ort: string;
  /** Zugleich Teil der Anschrift und Grundlage für die Auswertung, welcher
   *  Umsatz ins Ausland geht. Siehe datenbank/digitalbestellungen.sql. */
  land: string;
  /** Die fortlaufende Nummer, die die Datenbank bei der Zahlung vergibt.
   *  Vorher null. Siehe den Auslöser in datenbank/digitalbestellungen.sql. */
  rechnungsnummer?: string | null;
  /** Wann die Bestellung angelegt und wann sie bezahlt wurde. Die Datenbank
   *  füllt beides selbst, deshalb stehen sie nur beim Lesen zur Verfügung. */
  angelegt_am?: string;
  bezahlt_am?: string | null;
  artikel: DigitalArtikel[];
  /** Was tatsächlich zu zahlen war, nach Abzug eines Rabatts. In Cent. */
  gesamt: number;
  /** Der benutzte Rabattcode, oder null. Gehört auf die Rechnung, damit
   *  nachvollziehbar bleibt, warum weniger gezahlt wurde als der Listenpreis. */
  rabattcode?: string | null;
  rabatt_cent?: number;
  /** Hat sie dem sofortigen Zugang zugestimmt und damit auf den Widerruf
   *  verzichtet? Ohne ein true hier gilt das Widerrufsrecht weiter. */
  widerruf_verzicht: boolean;
  /** Wollte sie die Futter-Tipps per Mail? */
  newsletter: boolean;
  /** Der Schlüssel für die Angebotsseite nach dem Kauf. Ohne ihn kommt dort
   *  niemand herein, auch nicht mit einer geratenen Bestellnummer. */
  zugriff_token: string;
  /** Die Bezahlseite bei Stripe, damit sich die Zahlungsart später
   *  nachschlagen lässt, ohne auf die Rückmeldung zu warten. */
  stripe_sitzung: string | null;
  /** Wird nach der Zahlung nachgetragen, für das Ein-Klick-Angebot. */
  stripe_kunde?: string | null;
  stripe_zahlungsart?: string | null;
  /** Was die Akademie zur Freischaltung gesagt hat. */
  freigeschaltet?: boolean;
  freischaltung_hinweis?: string | null;
};

/** Eine Nummer wie "PFD-20260831-4821". PFD statt PFH, damit du digitale
 *  Käufe und Warenbestellungen im Postfach sofort auseinanderhältst. */
export function digitalNummer(): string {
  const heute = new Date();
  const tag = [
    heute.getFullYear(),
    String(heute.getMonth() + 1).padStart(2, "0"),
    String(heute.getDate()).padStart(2, "0"),
  ].join("");

  return `PFD-${tag}-${String(randomInt(1000, 10000))}`;
}

/** Der zufällige Schlüssel für die Angebotsseite. */
export function zugriffToken(): string {
  return randomUUID().replace(/-/g, "");
}

export async function digitalSpeichern(b: DigitalBestellung): Promise<boolean> {
  const res = await supabase("digitalbestellungen", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(b),
  });

  if (!res.ok) {
    console.error("Digitalbestellung liess sich nicht speichern:", await res.text());
  }

  return res.ok;
}

/** Holt eine Bestellung, oder null.
 *
 *  ▸ WARUM HIER EIN try STEHT: Diese Funktion wird von der Danke- und der
 *    Angebotsseite aufgerufen, also von den beiden Seiten, auf denen eine
 *    Kundin direkt nach der Bezahlung landet. Wäre die Datenbank einmal nicht
 *    erreichbar, würde ein durchgereichter Fehler dort einen englischen
 *    Absturz zeigen -- ausgerechnet in dem Moment, in dem gerade Geld
 *    geflossen ist. Stattdessen kommt null zurück, und die Seiten zeigen ihre
 *    allgemeine Fassung ohne persönliche Angaben. Der Kauf ist davon nicht
 *    betroffen, der hängt allein an der Rückmeldung von Stripe. */
export async function digitalLaden(
  nummer: string,
): Promise<DigitalBestellung | null> {
  try {
    return await ersteZeile<DigitalBestellung>(
      `digitalbestellungen?nummer=eq.${encodeURIComponent(nummer)}&limit=1`,
    );
  } catch (e) {
    console.error("Bestellung liess sich nicht laden:", e);
    return null;
  }
}

/** Holt die Angebote, die zu einem Kauf dazugekommen sind.
 *
 *  Aus demselben Grund wie oben abgesichert: eine leere Liste ist auf der
 *  Dankeseite unschön, ein Absturz wäre schlimmer. */
export async function digitalAnhaenge(
  nummer: string,
): Promise<DigitalBestellung[]> {
  try {
    const res = await supabase(
      `digitalbestellungen?gehoert_zu=eq.${encodeURIComponent(nummer)}`,
    );

    if (!res.ok) return [];

    const zeilen = await res.json();

    return Array.isArray(zeilen) ? zeilen : [];
  } catch (e) {
    console.error("Angebote liessen sich nicht laden:", e);
    return [];
  }
}

/** Trägt Felder an einer Bestellung nach. */
export async function digitalErgaenzen(
  nummer: string,
  felder: Record<string, unknown>,
): Promise<boolean> {
  const res = await supabase(
    `digitalbestellungen?nummer=eq.${encodeURIComponent(nummer)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify(felder),
    },
  );

  if (!res.ok) {
    console.error("Digitalbestellung liess sich nicht ergänzen:", await res.text());
  }

  return res.ok;
}

/** Setzt eine Bestellung auf "bezahlt" und gibt sie zurück.
 *
 *  Liefert null, wenn es die Nummer nicht gibt oder sie schon bezahlt war.
 *  Damit geht bei einer wiederholten Rückmeldung von Stripe keine zweite
 *  Bestätigung raus und niemand wird zweimal freigeschaltet. */
export async function digitalAlsBezahltMarkieren(
  nummer: string,
  zahlung: { kunde?: string | null; zahlungsart?: string | null } = {},
): Promise<DigitalBestellung | null> {
  const res = await supabase(
    `digitalbestellungen?nummer=eq.${encodeURIComponent(nummer)}&status=eq.offen`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: "bezahlt",
        bezahlt_am: new Date().toISOString(),
        ...(zahlung.kunde ? { stripe_kunde: zahlung.kunde } : {}),
        ...(zahlung.zahlungsart ? { stripe_zahlungsart: zahlung.zahlungsart } : {}),
      }),
    },
  );

  if (!res.ok) {
    console.error("Digitalbestellung liess sich nicht aktualisieren:", await res.text());
    return null;
  }

  const zeilen = await res.json();

  return Array.isArray(zeilen) && zeilen.length > 0 ? zeilen[0] : null;
}

// ---------------------------------------------------------------------------
// Hat die Kundin das Angebot schon?
// ---------------------------------------------------------------------------

/** Sagt, ob zu dieser Adresse der Zugang bereits vergeben ist.
 *
 *  ▸ WOZU DAS DA IST
 *    Ohne diese Prüfung bekommt jemand, der den Basisfutterkurs schon
 *    besitzt, ihn nach dem nächsten Kauf noch einmal angeboten. Im besten
 *    Fall ärgert das, im schlechteren zahlt sie ein zweites Mal für etwas,
 *    das sie längst hat, und schreibt dir eine ungehaltene Mail.
 *
 *  ▸ WARUM ÜBER DIE AKADEMIE UND NICHT ÜBER DIE EIGENEN BESTELLUNGEN
 *    In `kursteilnehmer` stehen ALLE Zugänge, auch die aus den Jahren über
 *    alfima. Wer nur die eigenen Bestellungen durchsucht, sieht die alten
 *    Käufe nicht und bietet treuen Kundinnen an, was sie schon lange haben.
 *
 *  ▸ Der Zugang kann an zwei Stellen stehen: in der Liste `zugaenge` oder,
 *    bei alten Zeilen, im einzelnen Feld `bereich`. Der Kauf-Webhook der
 *    Akademie behandelt beide Fälle genauso, deshalb hier auch.
 *
 *  ▸ Im Zweifel wird `false` zurückgegeben, also das Angebot gezeigt. Ein
 *    Angebot zu viel ist ärgerlich, ein verschluckter Verkauf teurer. */
export async function hatZugangSchon(
  email: string,
  zugang: string,
): Promise<boolean> {
  try {
    const zeile = await ersteZeile<{
      zugaenge: string[] | null;
      bereich: string | null;
    }>(
      `kursteilnehmer?email=eq.${encodeURIComponent(email)}&select=zugaenge,bereich&limit=1`,
    );

    if (!zeile) return false;

    const vorhanden =
      zeile.zugaenge && zeile.zugaenge.length > 0
        ? zeile.zugaenge
        : zeile.bereich
          ? [zeile.bereich]
          : [];

    return vorhanden.includes(zugang);
  } catch (e) {
    console.error("Zugang liess sich nicht prüfen:", e);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Rabattcodes
//
// ▸ WO GERECHNET WIRD, UND WARUM NUR HIER
//   Die Kasse zeigt den Rabatt an, aber sie bestimmt ihn nicht. Jede Prüfung
//   und jede Rechnung passiert auf dem Server. Sonst könnte jemand die
//   Anfrage von Hand bauen, sich hundert Prozent hineinschreiben und den
//   Kurs geschenkt bekommen. Was der Browser schickt, ist nur der eingetippte
//   Code.
//
// ▸ Angelegt werden Codes in Supabase, siehe datenbank/rabattcodes.sql.
// ---------------------------------------------------------------------------

export type Rabatt = {
  /** So, wie er in der Datenbank steht. */
  code: string;
  /** Der Nachlass in Cent. */
  rabattCent: number;
  /** Was am Ende zu zahlen ist, in Cent. Nie unter null. */
  endpreis: number;
};

type RabattZeile = {
  id: string;
  code: string;
  prozent: number | null;
  betrag_cent: number | null;
  gueltig_bis: string | null;
  max_einloesungen: number | null;
  einloesungen: number;
  nur_fuer: string[] | null;
  aktiv: boolean;
};

/** Prüft einen eingetippten Code und rechnet den Preis aus.
 *
 *  Gibt bei jedem Fehlschlag einen Satz zurück, den die Kundin lesen kann.
 *  Die Meldungen unterscheiden bewusst, warum es nicht klappt: "abgelaufen"
 *  ist eine andere Auskunft als "kenne ich nicht", und wer einen gültigen
 *  Code für das falsche Produkt hat, soll das erfahren, statt zu glauben,
 *  er hätte sich vertippt. */
export async function rabattPruefen(opt: {
  code: string;
  slug: string;
  preis: number;
}): Promise<Rabatt | { fehler: string }> {
  const code = opt.code.trim().toUpperCase();

  if (!code) {
    return { fehler: "Bitte gib einen Code ein." };
  }

  let zeile: RabattZeile | null = null;

  try {
    // PostgREST kann nicht auf einen Ausdrucksindex filtern, deshalb wird
    // ohne Rücksicht auf Groß- und Kleinschreibung verglichen (ilike). Der
    // Code enthält keine Platzhalterzeichen, weil unten geprüft wird, dass
    // er wirklich gleich ist.
    zeile = await ersteZeile<RabattZeile>(
      `rabattcodes?code=ilike.${encodeURIComponent(code)}&limit=1`,
    );
  } catch (e) {
    console.error("Rabattcode liess sich nicht prüfen:", e);
    return { fehler: "Der Code liess sich gerade nicht prüfen. Versuch es bitte noch einmal." };
  }

  if (!zeile || zeile.code.trim().toUpperCase() !== code) {
    return { fehler: "Diesen Code kenne ich nicht. Prüf bitte die Schreibweise." };
  }

  if (!zeile.aktiv) {
    return { fehler: "Dieser Code gilt nicht mehr." };
  }

  if (zeile.gueltig_bis && new Date(zeile.gueltig_bis) < new Date()) {
    return { fehler: "Dieser Code ist abgelaufen." };
  }

  if (
    zeile.max_einloesungen !== null &&
    zeile.einloesungen >= zeile.max_einloesungen
  ) {
    return { fehler: "Dieser Code wurde bereits vollständig eingelöst." };
  }

  if (
    zeile.nur_fuer &&
    zeile.nur_fuer.length > 0 &&
    !zeile.nur_fuer.includes(opt.slug)
  ) {
    return { fehler: "Dieser Code gilt für ein anderes Angebot." };
  }

  // Prozent gewinnt, wenn beides gesetzt ist. So steht es auch in der
  // SQL-Datei, damit sich niemand wundert.
  const roh =
    zeile.prozent && zeile.prozent > 0
      ? Math.round((opt.preis * zeile.prozent) / 100)
      : (zeile.betrag_cent ?? 0);

  // Ein Nachlass, der größer ist als der Preis, macht daraus keine
  // Gutschrift. Er deckelt einfach bei null.
  const rabattCent = Math.min(Math.max(roh, 0), opt.preis);

  if (rabattCent <= 0) {
    return { fehler: "Dieser Code bringt bei diesem Angebot keinen Nachlass." };
  }

  return { code: zeile.code, rabattCent, endpreis: opt.preis - rabattCent };
}

/** Zählt einen Code eine Einlösung hoch.
 *
 *  Wird erst gerufen, wenn die Bestellung wirklich angelegt ist. Wer die
 *  Bezahlung abbricht, hat den Code damit zwar verbraucht -- das ist die
 *  Schwäche dieser einfachen Lösung. Sie ist bewusst gewählt: Die
 *  Alternative wäre, erst nach der Zahlung zu zählen, dann könnten bei einem
 *  auf zehn Einlösungen begrenzten Code aber zwanzig Leute gleichzeitig
 *  durchrutschen. Lieber einer zu wenig als zehn zu viel. */
export async function rabattEinloesen(code: string): Promise<void> {
  try {
    const zeile = await ersteZeile<{ id: string; einloesungen: number }>(
      `rabattcodes?code=ilike.${encodeURIComponent(code)}&limit=1`,
    );

    if (!zeile) return;

    await supabase(`rabattcodes?id=eq.${zeile.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ einloesungen: zeile.einloesungen + 1 }),
    });
  } catch (e) {
    // Kein Grund, einen bezahlten Kauf scheitern zu lassen.
    console.error("Einlösung liess sich nicht zählen:", e);
  }
}

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------

/** Legt die Bezahlseite für einen digitalen Kauf an.
 *
 *  ▸ `customer_creation: "always"` zusammen mit `setup_future_usage` sorgt
 *    dafür, dass die Zahlungsart gespeichert wird. Nur dadurch lässt sich
 *    das Angebot danach mit einem Klick abbuchen, ohne dass die Kundin ihre
 *    Kartendaten erneut eintippen muss.
 *
 *  ▸ WARUM DAS NUR FÜR KARTEN GILT, UND WARUM DAS WICHTIG IST
 *    Zuerst stand `setup_future_usage` in `payment_intent_data`, galt also
 *    für die ganze Bezahlung. Das hat einen teuren Nebeneffekt: PayPal und
 *    Klarna lassen sich auf diesem Weg nicht für spätere Zahlungen
 *    hinterlegen, und Stripe blendet Bezahlarten, die eine geforderte
 *    Eigenschaft nicht erfüllen, einfach aus. Die Kundin hätte an der Kasse
 *    also nur noch Karte zur Wahl gehabt, und niemand hätte gemerkt, warum.
 *    Ein Angebot nach dem Kauf ist nett, eine fehlende Bezahlart kostet den
 *    Kauf. Deshalb steht es jetzt unter `payment_method_options` nur bei
 *    `card`. Apple Pay und Google Pay laufen bei Stripe als Karte und sind
 *    damit eingeschlossen.
 *
 *  ▸ WAS DAS FÜR DAS ANGEBOT BEDEUTET
 *    Wer mit Karte zahlt, nimmt es mit einem Klick an. Wer mit PayPal oder
 *    Klarna zahlt, geht über die normale Bezahlseite. Das ist kein Fehler
 *    und muss nirgends behandelt werden: app/api/upsell greift von selbst
 *    auf diesen Weg zurück, wenn keine Zahlungsart hinterlegt ist.
 *
 *  ▸ DER HINWEIS IN DER KASSE MUSS BLEIBEN. Eine gespeicherte Zahlungsart
 *    legt man nicht stillschweigend an. Er steht in
 *    components/DigitalKasse.tsx über dem Bestellknopf. Fällt der Upsell je
 *    weg, gehört auch dieser Satz weg. */
export async function bezahlseiteDigitalAnlegen(opt: {
  produkt: DigitalProdukt;
  preis: number;
  nummer: string;
  token: string;
  email: string;
  seitenUrl: string;
  /** Nur beim Erstkauf true. Beim Angebot danach wäre es sinnlos. */
  zahlungsartMerken: boolean;
  /** Wohin es nach der Zahlung geht. */
  weiterNach: string;
}): Promise<{ url: string; sitzung: string } | { fehler: string }> {
  const ergebnis = await stripeAnfrage("checkout/sessions", {
    mode: "payment",
    locale: "de",
    customer_email: opt.email,
    client_reference_id: opt.nummer,
    // Nur wenn eine eigene Konfiguration hinterlegt ist. Sonst gilt die von
    // alfima, siehe die Erklärung bei STRIPE_ZAHLARTEN oben.
    ...(STRIPE_ZAHLARTEN
      ? { payment_method_configuration: STRIPE_ZAHLARTEN }
      : {}),
    ...(opt.zahlungsartMerken
      ? {
          customer_creation: "always",
          // Nur bei Karte. Siehe die Erklärung über dieser Funktion.
          payment_method_options: {
            card: { setup_future_usage: "off_session" },
          },
        }
      : {}),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: opt.preis,
          product_data: {
            name: opt.produkt.name,
            description: opt.produkt.leistung,
          },
        },
      },
    ],
    // Der Webhook erkennt an `art`, dass es kein Paket zu packen gibt,
    // sondern ein Zugang freizuschalten ist.
    metadata: { bestellnummer: opt.nummer, art: "digital" },
    payment_intent_data: {
      description: `${opt.produkt.kurzname} (${opt.nummer})`,
      metadata: { bestellnummer: opt.nummer, art: "digital" },
    },
    success_url: opt.weiterNach,
    cancel_url: `${opt.seitenUrl}/kasse/${opt.produkt.slug}`,
  });

  if (!ergebnis.ok) {
    return { fehler: ergebnis.fehler };
  }

  const url = ergebnis.antwort.url;
  const sitzung = ergebnis.antwort.id;

  if (typeof url !== "string" || typeof sitzung !== "string") {
    return { fehler: "Stripe hat keine Bezahlseite zurückgegeben." };
  }

  return { url, sitzung };
}

/** Holt Kunde und Zahlungsart zu einer bezahlten Bezahlseite.
 *
 *  Wird an zwei Stellen gebraucht: in der Rückmeldung von Stripe, und auf
 *  der Angebotsseite. Letzteres, weil die Kundin dort oft schon steht, bevor
 *  die Rückmeldung angekommen ist. Auf sie zu warten hiesse, ihr ein Angebot
 *  zu zeigen, das sie noch nicht annehmen kann. */
export async function zahlungsdatenHolen(
  sitzungId: string,
): Promise<{ bezahlt: boolean; kunde: string | null; zahlungsart: string | null }> {
  const leer = { bezahlt: false, kunde: null, zahlungsart: null };

  const sitzung = await stripeHolen(
    `checkout/sessions/${encodeURIComponent(sitzungId)}?expand[]=payment_intent`,
  );

  if (!sitzung.ok) return leer;

  const daten = sitzung.antwort;
  const bezahlt = daten.payment_status === "paid";

  const kunde =
    typeof daten.customer === "string"
      ? daten.customer
      : ((daten.customer as Record<string, unknown> | null)?.id as string | undefined) ?? null;

  const absicht = daten.payment_intent as Record<string, unknown> | string | null;

  const zahlungsart =
    absicht && typeof absicht === "object"
      ? typeof absicht.payment_method === "string"
        ? absicht.payment_method
        : ((absicht.payment_method as Record<string, unknown> | null)?.id as string | undefined) ?? null
      : null;

  return { bezahlt, kunde, zahlungsart };
}

/** Bucht das Angebot nach dem Kauf mit der gespeicherten Zahlungsart ab.
 *
 *  Drei Ausgänge, und alle drei müssen behandelt werden:
 *    "bezahlt"   -- durchgelaufen, der Zugang kann freigeschaltet werden.
 *    "bestaetigen" -- die Bank verlangt eine Bestätigung (3D Secure). Das
 *                   ist kein Fehler, das ist Alltag. Die Kundin muss dann
 *                   über die normale Bezahlseite gehen, deshalb kommt eine
 *                   Adresse zurück.
 *    "fehler"    -- Karte abgelehnt, abgelaufen, gesperrt. Auch hier bleibt
 *                   der Weg über die normale Bezahlseite. */
export async function upsellAbbuchen(opt: {
  kunde: string;
  zahlungsart: string;
  preis: number;
  produkt: DigitalProdukt;
  nummer: string;
}): Promise<{ ergebnis: "bezahlt" } | { ergebnis: "bestaetigen" | "fehler" }> {
  const antwort = await stripeAnfrage("payment_intents", {
    amount: opt.preis,
    currency: "eur",
    customer: opt.kunde,
    payment_method: opt.zahlungsart,
    // off_session heisst: die Kundin tippt gerade nichts ein, wir buchen mit
    // ihrer vorher gegebenen Zustimmung ab. confirm zieht die Zahlung sofort.
    off_session: true,
    confirm: true,
    description: `${opt.produkt.kurzname} (${opt.nummer})`,
    metadata: { bestellnummer: opt.nummer, art: "digital" },
  });

  if (!antwort.ok) {
    return { ergebnis: "fehler" };
  }

  const status = antwort.antwort.status;

  if (status === "succeeded") {
    return { ergebnis: "bezahlt" };
  }

  if (status === "requires_action" || status === "requires_confirmation") {
    return { ergebnis: "bestaetigen" };
  }

  return { ergebnis: "fehler" };
}

// ---------------------------------------------------------------------------
// Freischaltung in der Akademie
// ---------------------------------------------------------------------------

/** Meldet den Kauf an die Akademie, damit sie den Zugang freischaltet und
 *  die Login-Mail verschickt.
 *
 *  Die Meldung sieht genauso aus wie die von alfima, weil sie beim selben
 *  Endpunkt landet. Der `product_name` entscheidet dort über den Zugang,
 *  siehe akademieapp/lib/produkt-zugang.ts.
 *
 *  Gibt einen Hinweistext zurück, wenn etwas schiefging, sonst null. Der
 *  Hinweis wird an der Bestellung gespeichert, damit du später nachsehen
 *  kannst, was los war. */
export async function inAkademieFreischalten(opt: {
  email: string;
  akademieName: string;
}): Promise<string | null> {
  if (!AKADEMIE_WEBHOOK_URL) {
    return "AKADEMIE_WEBHOOK_URL fehlt in den Vercel-Einstellungen.";
  }

  const adresse = AKADEMIE_WEBHOOK_KEY
    ? `${AKADEMIE_WEBHOOK_URL}?key=${encodeURIComponent(AKADEMIE_WEBHOOK_KEY)}`
    : AKADEMIE_WEBHOOK_URL;

  try {
    const res = await fetch(adresse, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: "purchase_completed",
        data: {
          email: opt.email,
          product_name: opt.akademieName,
          payment_status: "paid",
        },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      return `Die Akademie hat die Meldung mit ${res.status} abgelehnt.`;
    }

    // ACHTUNG, DIE WICHTIGSTE EINSCHRÄNKUNG HIER:
    // Die Akademie antwortet auch dann mit "ok", wenn sie den Produktnamen
    // nicht kennt und deshalb NICHTS freigeschaltet hat. Sie vermerkt das
    // nur in ihrem eigenen Protokoll (webhook_logs). Ein ok bedeutet also
    // "Meldung angekommen", nicht "Zugang vergeben". Wenn eine Kundin sich
    // meldet, sieh dort nach.
    return null;
  } catch (e) {
    return `Die Akademie war nicht erreichbar: ${String(e)}`;
  }
}

// ---------------------------------------------------------------------------
// Newsletter
// ---------------------------------------------------------------------------

/** Trägt eine Käuferin in den Verteiler ein, wenn sie das Häkchen gesetzt hat.
 *
 *  ▸ WARUM HIER KEINE BESTÄTIGUNGSMAIL KOMMT, anders als beim Insider-Kanal
 *    und beim Futter-Check: Die Bestätigungsmail (Double-Opt-in) soll
 *    verhindern, dass jemand eine fremde Adresse einträgt. Beim Kauf kann
 *    das nicht passieren -- die Adresse ist gerade durch eine Zahlung
 *    bestätigt worden, und das Häkchen war nicht vorangekreuzt. Die
 *    Einwilligung wird mit Zeitpunkt und Quelle gespeichert, damit du sie
 *    belegen kannst.
 *
 *  ▸ In `quelle` steht deshalb "kauf-<slug>". Daran erkennst du später, wo
 *    eine Adresse herkommt, und kannst diese Gruppe im Zweifel getrennt
 *    behandeln.
 *
 *  ▸ Steht die Adresse schon im Verteiler, wird sie nicht doppelt angelegt.
 *    War sie dort noch unbestätigt, gilt sie ab jetzt als bestätigt. */
export async function newsletterEintragen(opt: {
  email: string;
  vorname: string;
  quelle: string;
}): Promise<void> {
  const jetzt = new Date().toISOString();

  const vorhanden = await ersteZeile<{ id: string; bestaetigt: boolean }>(
    `insider_anmeldungen?email=eq.${encodeURIComponent(opt.email)}&limit=1`,
  );

  if (vorhanden) {
    if (!vorhanden.bestaetigt) {
      await supabase(`insider_anmeldungen?id=eq.${vorhanden.id}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ bestaetigt: true, bestaetigt_am: jetzt }),
      });
    }
    return;
  }

  const res = await supabase("insider_anmeldungen", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      vorname: opt.vorname || "du",
      email: opt.email,
      bestaetigt: true,
      bestaetigt_am: jetzt,
      token: zugriffToken(),
      quelle: opt.quelle,
    }),
  });

  if (!res.ok) {
    // Kein Grund, den Kauf scheitern zu lassen. Nur ins Protokoll.
    console.error("Newsletter-Eintrag fehlgeschlagen:", await res.text());
  }
}

// ---------------------------------------------------------------------------
// Die Mails
// ---------------------------------------------------------------------------

/** Der Rechnungsblock. Enthält alles, was eine Kleinbetragsrechnung braucht. */
function rechnungsblock(b: DigitalBestellung): string {
  const datum = new Date().toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const zeilen = b.artikel
    .map(
      (a) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #EAD8D8;">
          ${esc(a.name)}<br>
          <span style="font-size:13px;color:#8a7070;">Digitale Leistung, ${a.mwst} % MwSt.</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #EAD8D8;text-align:right;white-space:nowrap;">
          ${preisText(a.preis)}
        </td>
      </tr>`,
    )
    .join("");

  // Der Steueranteil eines Bruttobetrags: bei 19 % sind das 19/119 der Summe.
  const satz = b.artikel[0]?.mwst ?? 19;
  const steuer = Math.round((b.gesamt * satz) / (100 + satz));

  // Das Land ausgeschrieben. Steht dort eine unbekannte Kennung, wird sie so
  // ausgegeben, wie sie gespeichert wurde -- besser als eine falsche Angabe.
  const laendernamen: Record<string, string> = {
    DE: "Deutschland",
    AT: "Österreich",
    CH: "Schweiz",
  };

  const land = laendernamen[b.land] ?? b.land;

  // Bis die Zahlung durch ist, gibt es noch keine Rechnungsnummer. Dann
  // steht die Bestellnummer da, damit die Mail nicht unvollständig wirkt.
  const nummernzeile = b.rechnungsnummer
    ? `Rechnungsnummer ${esc(b.rechnungsnummer)} &middot; Bestellnummer ${esc(b.nummer)}`
    : `Bestellnummer ${esc(b.nummer)}`;

  return `
  <p style="font-size:14px;line-height:1.6;margin:20px 0 0;">
    <strong>Rechnungsanschrift</strong><br>
    ${esc(b.vorname)} ${esc(b.nachname)}<br>
    ${esc(b.strasse)}<br>
    ${esc(b.plz)} ${esc(b.ort)}<br>
    ${esc(land)}
  </p>

  <table style="width:100%;border-collapse:collapse;font-size:15px;margin:20px 0;">
    ${zeilen}
    ${
      // Der Rabatt muss als eigene Zeile stehen. Ohne sie stünde oben der
      // Listenpreis und unten ein kleinerer Gesamtbetrag, und die Rechnung
      // ginge nicht auf.
      b.rabatt_cent && b.rabatt_cent > 0
        ? `<tr>
             <td style="padding:8px 0;color:#8a7070;">
               Rabatt${b.rabattcode ? ` (${esc(b.rabattcode)})` : ""}
             </td>
             <td style="padding:8px 0;text-align:right;color:#8a7070;">
               &minus;${preisText(b.rabatt_cent)}
             </td>
           </tr>`
        : ""
    }
    <tr>
      <td style="padding:12px 0 0;font-weight:bold;">Gesamt</td>
      <td style="padding:12px 0 0;text-align:right;font-weight:bold;">${preisText(b.gesamt)}</td>
    </tr>
    <tr>
      <td style="padding:4px 0;color:#8a7070;font-size:13px;">darin enthaltene MwSt. (${satz} %)</td>
      <td style="padding:4px 0;text-align:right;color:#8a7070;font-size:13px;">${preisText(steuer)}</td>
    </tr>
  </table>

  <p style="font-size:13px;line-height:1.6;color:#8a7070;margin:0;">
    ${nummernzeile} &middot; Rechnungsdatum ${datum}<br>
    ${esc(RECHNUNGSABSENDER.name)} &middot; ${esc(RECHNUNGSABSENDER.strasse)} &middot;
    ${esc(RECHNUNGSABSENDER.ort)} &middot; ${esc(RECHNUNGSABSENDER.land)}<br>
    Steuernummer ${esc(RECHNUNGSABSENDER.steuernummer)}
  </p>`;
}

/** Die Kaufbestätigung an die Kundin.
 *
 *  Sie enthält bewusst KEINEN Zugangslink. Den verschickt die Akademie in
 *  ihrer eigenen Mail, weil nur sie den persönlichen Schlüssel der Kundin
 *  kennt. Diese Mail hier weist deshalb darauf hin, dass gleich eine zweite
 *  kommt -- sonst sucht die Kundin in der falschen Mail nach dem Link. */
export async function digitalBestaetigungSenden(
  b: DigitalBestellung,
): Promise<boolean> {
  const verzicht = b.widerruf_verzicht
    ? `<p style="font-size:13px;line-height:1.6;color:#8a7070;">
         Du hast beim Kauf zugestimmt, dass ich dir den Zugang sofort
         freischalte, und bestätigt, dass dein Widerrufsrecht damit erlischt.
       </p>`
    : `<p style="font-size:13px;line-height:1.6;color:#8a7070;">
         Dein Widerrufsrecht von vierzehn Tagen bleibt bestehen. Die
         Einzelheiten stehen in der Widerrufsbelehrung auf meiner Seite.
       </p>`;

  return sendeMail(
    b.email,
    `Deine Bestellung ${b.nummer}`,
    rahmen(`
      <h1 style="font-size:24px;margin:0 0 16px;">Danke für deinen Kauf</h1>

      <p style="font-size:16px;line-height:1.6;">${anrede(b.vorname)}</p>

      <p style="font-size:16px;line-height:1.6;">
        deine Zahlung ist angekommen. Gleich bekommst du eine zweite Mail von
        der Pferdeliebehealthy Akademie, darin steht dein persönlicher
        Zugangslink. Falls sie nicht auftaucht, sieh bitte kurz im
        Spam-Ordner nach oder antworte einfach hier.
      </p>

      ${rechnungsblock(b)}

      ${verzicht}

      <p style="font-size:16px;line-height:1.6;">Liebe Grüße<br>Yasemin</p>
    `),
  );
}

/** Die kurze Meldung an dich. */
export async function digitalMeldenAnYasi(b: DigitalBestellung): Promise<boolean> {
  const was = b.art === "upsell" ? "Angebot angenommen" : "Neuer Kauf";

  return sendeMail(
    ANTWORT_AN,
    `${was}: ${b.artikel.map((a) => a.name).join(", ")} über ${preisText(b.gesamt)}`,
    rahmen(`
      <h1 style="font-size:22px;margin:0 0 16px;">${was}</h1>

      <p style="font-size:15px;color:#8a7070;">
        ${esc(b.nummer)} &middot; bezahlt
        ${b.gehoert_zu ? `&middot; gehört zu ${esc(b.gehoert_zu)}` : ""}
      </p>

      <p style="font-size:15px;line-height:1.6;">
        <a href="mailto:${esc(b.email)}" style="color:#B87878;">${esc(b.email)}</a>
      </p>

      ${rechnungsblock(b)}

      <p style="font-size:14px;color:#8a7070;">
        Newsletter: ${b.newsletter ? "ja" : "nein"} &middot;
        Sofortzugang zugestimmt: ${b.widerruf_verzicht ? "ja" : "nein"}
      </p>
    `),
  );
}

/** Die Warnung an dich, wenn die Freischaltung nicht geklappt hat.
 *
 *  Sie ist bewusst deutlich formuliert: Hier sitzt jemand, der bezahlt hat
 *  und nicht hineinkommt. Das ist der einzige Fehler in diesem ganzen Ablauf,
 *  bei dem du sofort etwas tun musst. */
export async function freischaltungWarnen(
  b: DigitalBestellung,
  hinweis: string,
): Promise<void> {
  await sendeMail(
    ANTWORT_AN,
    `BITTE VON HAND FREISCHALTEN: ${b.email}`,
    rahmen(`
      <h1 style="font-size:22px;margin:0 0 16px;">Die Freischaltung hat nicht geklappt</h1>

      <p style="font-size:16px;line-height:1.6;">
        Es wurde bezahlt, aber der Zugang konnte nicht automatisch vergeben
        werden. Die Kundin wartet also gerade vor einer verschlossenen Tür.
      </p>

      <p style="font-size:15px;line-height:1.6;background:#F9EDED;padding:14px;border-radius:10px;">
        <strong>Bestellung:</strong> ${esc(b.nummer)}<br>
        <strong>Adresse:</strong> ${esc(b.email)}<br>
        <strong>Produkt:</strong> ${esc(b.artikel.map((a) => a.name).join(", "))}<br>
        <strong>Grund:</strong> ${esc(hinweis)}
      </p>

      <p style="font-size:15px;line-height:1.6;">
        So trägst du es nach: In der Akademie unter Admin die Adresse suchen
        und den Zugang von Hand vergeben. Danach bekommt sie die Zugangsmail.
      </p>
    `),
  );
}

// ---------------------------------------------------------------------------
// Der gemeinsame Ablauf nach einer erfolgreichen Zahlung
// ---------------------------------------------------------------------------

/** Alles, was nach dem Geldeingang passieren muss, an einer Stelle.
 *
 *  Wird von zwei Seiten aufgerufen: von der Rückmeldung Stripes
 *  (app/api/stripe-webhook) und vom Ein-Klick-Angebot (app/api/upsell).
 *  Deshalb steht es hier und nicht in einer der beiden Routen.
 *
 *  Die Reihenfolge ist Absicht: Erst der Zugang, dann der Newsletter, dann
 *  die Mails. Wenn unterwegs etwas hakt, ist das Wichtigste schon passiert. */
export async function nachDerZahlung(b: DigitalBestellung): Promise<void> {
  const produkt = digitalFinden(b.artikel[0]?.slug ?? "");

  let hinweis: string | null = "Das Produkt war nicht mehr im Katalog.";

  if (produkt) {
    hinweis = await inAkademieFreischalten({
      email: b.email,
      akademieName: produkt.akademieName,
    });
  }

  await digitalErgaenzen(b.nummer, {
    freigeschaltet: hinweis === null,
    freischaltung_hinweis: hinweis,
  });

  if (b.newsletter) {
    await newsletterEintragen({
      email: b.email,
      vorname: b.vorname,
      quelle: `kauf-${b.artikel[0]?.slug ?? "unbekannt"}`,
    });
  }

  // Die Mails dürfen den Ablauf nicht aufhalten. Hakt eine, steht der Fehler
  // im Vercel-Protokoll, der Zugang ist aber längst vergeben.
  const [anKundin, anYasi] = await Promise.all([
    digitalBestaetigungSenden(b),
    digitalMeldenAnYasi(b),
  ]);

  if (!anKundin) {
    console.error(`Kaufbestätigung für ${b.nummer} ging nicht raus.`);
  }

  if (!anYasi) {
    console.error(`Meldung über ${b.nummer} ging nicht raus.`);
  }

  if (hinweis) {
    await freischaltungWarnen(b, hinweis);
  }
}
