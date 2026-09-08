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
  knopf,
  anrede,
  ANTWORT_AN,
} from "@/lib/versand";
import { bewertungslink } from "@/lib/seite";
import { kaufAufsHandy } from "@/lib/telegram";

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
  // ▸ ABO ODER EINMALKAUF, UND WAS STRIPE DABEI NICHT ZUSAMMEN ERLAUBT
  //   Bei einem Abo läuft die Bezahlseite im Modus `subscription`. Damit
  //   verbieten sich drei Dinge, die beim Einmalkauf richtig sind:
  //     - `payment_intent_data` gibt es nicht, die Angaben gehören in
  //       `subscription_data`. Stripe weist die Anfrage sonst ab.
  //     - `customer_creation` ebenso wenig: Ein Abo braucht immer einen
  //       Kunden, Stripe legt ihn von sich aus an.
  //     - `setup_future_usage` erübrigt sich, die Zahlungsart wird beim Abo
  //       ohnehin für die Folgemonate gespeichert.
  //   Die Angaben in `subscription_data.metadata` sind kein Beiwerk: Nur
  //   daran erkennt der Webhook später, wessen Zugang bei einer Kündigung
  //   erlischt. Eine Kündigung kommt Monate nach dem Kauf, da hilft keine
  //   Sitzung mehr.
  const abo = opt.produkt.abo;

  const ergebnis = await stripeAnfrage("checkout/sessions", {
    mode: abo ? "subscription" : "payment",
    locale: "de",
    customer_email: opt.email,
    client_reference_id: opt.nummer,
    // Nur wenn eine eigene Konfiguration hinterlegt ist. Sonst gilt die von
    // alfima, siehe die Erklärung bei STRIPE_ZAHLARTEN oben.
    ...(STRIPE_ZAHLARTEN
      ? { payment_method_configuration: STRIPE_ZAHLARTEN }
      : {}),
    ...(opt.zahlungsartMerken && !abo
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
          ...(abo ? { recurring: { interval: "month" } } : {}),
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
    ...(abo
      ? {
          subscription_data: {
            description: `${opt.produkt.kurzname} (${opt.nummer})`,
            metadata: {
              bestellnummer: opt.nummer,
              art: "digital",
              slug: opt.produkt.slug,
              email: opt.email,
            },
          },
        }
      : {
          payment_intent_data: {
            description: `${opt.produkt.kurzname} (${opt.nummer})`,
            metadata: { bestellnummer: opt.nummer, art: "digital" },
          },
        }),
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
// Das Abo: kündigen, und den Zugang wieder wegnehmen
//
// ▸ WARUM DAS NICHT EINFACH "ZUGANG WEG" HEISST
//   EquiDesk gab es vor dem Abo einmalig für 29 Euro, mit der Zusage
//   "einmal zahlen und behalten". Wer damals gekauft hat und später
//   zusätzlich ein Abo abschliesst und wieder kündigt, darf den Zugang
//   NICHT verlieren. Deshalb steht vor jedem Entzug `hatDauerkauf`.
//
// ▸ WO DIE ANGABEN HERKOMMEN
//   Eine Kündigung erreicht uns Monate nach dem Kauf. Die Bezahlseite von
//   damals gibt es dann längst nicht mehr. Verlassen können wir uns nur auf
//   `subscription_data.metadata`, das beim Anlegen mitgegeben wurde
//   (bestellnummer, slug, email). Siehe `bezahlseiteDigitalAnlegen`.
// ---------------------------------------------------------------------------

/** Hat diese Adresse dasselbe Produkt schon einmal dauerhaft gekauft?
 *
 *  Gibt bei einem Fehler bewusst `true` zurück: Wer nicht sicher weiß, ob
 *  jemand den Zugang bezahlt hat, nimmt ihn nicht weg. Ein Monat zu viel
 *  Zugang ist ein kleiner Schaden, ein zu Unrecht gesperrter Zugang ein
 *  großer. */
export async function hatDauerkauf(
  email: string,
  slug: string,
): Promise<boolean> {
  try {
    const res = await supabase(
      `digitalbestellungen?email=eq.${encodeURIComponent(email.toLowerCase())}` +
        `&status=eq.bezahlt&select=artikel`,
    );

    if (!res.ok) {
      console.error("Dauerkauf liess sich nicht pruefen:", res.status);
      return true;
    }

    const zeilen = await res.json();

    if (!Array.isArray(zeilen)) return true;

    return zeilen.some((zeile: { artikel?: { slug?: string }[] }) =>
      (zeile.artikel ?? []).some((a) => a?.slug === slug),
    );
  } catch (e) {
    console.error("Dauerkauf liess sich nicht pruefen:", e);
    return true;
  }
}

/** Meldet der Akademie, dass ein Zugang erlischt.
 *
 *  Rückgabe wie bei `inAkademieFreischalten`: null heisst, die Meldung ist
 *  angekommen. Ein Text ist der Grund, warum nicht. */
export async function inAkademieEntziehen(opt: {
  email: string;
  zugang: string;
  grund: string;
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
        event: "access_revoked",
        data: { email: opt.email, access: opt.zugang, reason: opt.grund },
      }),
      cache: "no-store",
    });

    if (!res.ok) {
      return `Die Akademie hat die Meldung mit ${res.status} abgelehnt.`;
    }

    return null;
  } catch (e) {
    return `Die Akademie war nicht erreichbar: ${String(e)}`;
  }
}

/** Sagt dir Bescheid, wenn ein Abo endet.
 *
 *  ▸ WARUM DAS EINE MAIL WERT IST
 *    Eine Kündigung ist die einzige Rückmeldung, die du zu einem Produkt
 *    bekommst, ohne dass jemand schreibt. Sie gehört gesehen, nicht ins
 *    Protokoll. Und wenn der Entzug nicht geklappt hat, musst du ihn von
 *    Hand nachholen, sonst arbeitet jemand weiter, der nicht mehr zahlt. */
export async function aboMeldenAnYasi(opt: {
  email: string;
  produkt: string;
  grund: string;
  entzogen: boolean;
  hinweis?: string | null;
}): Promise<boolean> {
  const kopf = opt.entzogen
    ? `Abo beendet: ${opt.produkt}`
    : `Abo beendet, Zugang bleibt: ${opt.produkt}`;

  return sendeMail(
    ANTWORT_AN,
    `${kopf} (${opt.email})`,
    rahmen(`
      <h1 style="font-size:22px;margin:0 0 16px;">${esc(kopf)}</h1>

      <p style="font-size:16px;line-height:1.6;">
        <a href="mailto:${esc(opt.email)}" style="color:#B87878;">${esc(opt.email)}</a>
      </p>

      <p style="font-size:15px;line-height:1.6;color:#8a7070;">
        Grund: ${esc(opt.grund)}
      </p>

      ${
        opt.entzogen
          ? `<p style="font-size:15px;line-height:1.6;">Der Zugang ist weg, du musst nichts tun.</p>`
          : opt.hinweis
            ? `<p style="background:#F9EDED;border-radius:12px;padding:16px;font-size:15px;line-height:1.6;">
                 <strong>Bitte von Hand nachsehen.</strong> Der Zugang konnte nicht
                 automatisch entzogen werden: ${esc(opt.hinweis)}
               </p>`
            : `<p style="font-size:15px;line-height:1.6;">
                 Der Zugang bleibt bestehen, weil dieselbe Adresse dasselbe
                 Produkt schon einmal dauerhaft gekauft hat. Das ist so gewollt.
               </p>`
      }
    `),
  );
}

/** Nimmt den Zugang zu einem Abo-Produkt wieder weg, wenn er nicht
 *  zusätzlich dauerhaft gekauft wurde. Meldet in beiden Fällen an Yasemin,
 *  damit eine Kündigung nicht unbemerkt bleibt. */
export async function zugangEntziehen(opt: {
  email: string;
  slug: string;
  grund: string;
}): Promise<void> {
  const produkt = digitalFinden(opt.slug);

  if (!produkt?.abo) {
    console.error(`Entzug fuer ${opt.slug}: kein Abo-Produkt.`);
    return;
  }

  const dauerSlug = produkt.abo.dauerkaufSlug;

  if (dauerSlug && (await hatDauerkauf(opt.email, dauerSlug))) {
    console.warn(
      `Entzug fuer ${opt.email} uebersprungen: hat ${dauerSlug} dauerhaft gekauft.`,
    );
    await aboMeldenAnYasi({
      email: opt.email,
      produkt: produkt.kurzname,
      grund: opt.grund,
      entzogen: false,
    });
    return;
  }

  const hinweis = await inAkademieEntziehen({
    email: opt.email,
    zugang: produkt.erwarteterZugang,
    grund: opt.grund,
  });

  if (hinweis) {
    console.error(`Zugang fuer ${opt.email} liess sich nicht entziehen: ${hinweis}`);
  }

  await aboMeldenAnYasi({
    email: opt.email,
    produkt: produkt.kurzname,
    grund: opt.grund,
    entzogen: !hinweis,
    hinweis,
  });
}

/** Ein laufendes Abo, so wie es die Kündigungsseite braucht. */
export type LaufendesAbo = {
  /** Die Kennung bei Stripe, sub_... */
  id: string;
  slug: string;
  name: string;
  /** Wann der bezahlte Zeitraum endet, als Zeitstempel in Sekunden. */
  laeuftBis: number;
  /** Schon gekündigt, läuft nur noch aus. */
  gekuendigt: boolean;
};

/** Sucht die laufenden Abos zu einer Adresse.
 *
 *  ▸ WARUM ÜBER STRIPE UND NICHT ÜBER DIE EIGENE DATENBANK
 *    Weil Stripe die Wahrheit über ein Abo kennt und wir nicht: ob die
 *    letzte Abbuchung durchging, wann der bezahlte Monat endet, ob schon
 *    gekündigt wurde. In `digitalbestellungen` steht nur der erste Kauf.
 *    Eine zweite Wahrheit daneben würde früher oder später auseinanderlaufen.
 *
 *  ▸ Adressen werden bei Stripe gross und klein gemischt gespeichert, die
 *    Suche ist aber genau. Deshalb wird kleingeschrieben gesucht und, falls
 *    das nichts findet, noch einmal mit der Schreibweise, die ankam. */
export async function abosZuAdresse(email: string): Promise<LaufendesAbo[]> {
  const gefunden: LaufendesAbo[] = [];
  const versuche = [email.trim().toLowerCase(), email.trim()];
  const gesehen = new Set<string>();

  for (const adresse of versuche) {
    if (gesehen.has(adresse)) continue;
    gesehen.add(adresse);

    const kunden = await stripeHolen(
      `customers?email=${encodeURIComponent(adresse)}&limit=20`,
    );

    if (!kunden.ok) continue;

    const liste = (kunden.antwort.data as { id?: string }[] | undefined) ?? [];

    for (const kunde of liste) {
      if (typeof kunde.id !== "string") continue;

      // `status=all` wäre falsch: Ein abgelaufenes Abo soll nicht mehr
      // kündbar aussehen. `active` schliesst `trialing` aus, das gibt es
      // hier nicht, und `past_due` ebenfalls — wer nicht zahlt, kündigt
      // nicht, dem kündigt Stripe.
      const abos = await stripeHolen(
        `subscriptions?customer=${encodeURIComponent(kunde.id)}&status=active&limit=20`,
      );

      if (!abos.ok) continue;

      const zeilen =
        (abos.antwort.data as
          | {
              id?: string;
              cancel_at_period_end?: boolean;
              current_period_end?: number;
              metadata?: Record<string, string>;
              items?: { data?: { price?: { current_period_end?: number } }[] };
            }[]
          | undefined) ?? [];

      for (const abo of zeilen) {
        if (typeof abo.id !== "string") continue;
        if (gefunden.some((a) => a.id === abo.id)) continue;

        const slug = abo.metadata?.slug ?? "";
        const produkt = slug ? digitalFinden(slug) : null;

        gefunden.push({
          id: abo.id,
          slug,
          name: produkt?.name ?? "EquiDesk im Monatszugang",
          laeuftBis: abo.current_period_end ?? 0,
          gekuendigt: abo.cancel_at_period_end === true,
        });
      }
    }
  }

  return gefunden;
}

/** Kündigt ein Abo zum Ende des bezahlten Monats.
 *
 *  ▸ ZUM MONATSENDE, NICHT SOFORT. Der Monat ist bezahlt, also gehört er
 *    der Kundin. Sofort abzuschalten hiesse, bezahlte Zeit einzubehalten.
 *    Stripe schickt am Ende von selbst `customer.subscription.deleted`,
 *    und erst dann nimmt der Webhook den Zugang weg. */
export async function aboKuendigen(
  aboId: string,
): Promise<{ ok: true; endetAm: number } | { ok: false; fehler: string }> {
  const ergebnis = await stripeAnfrage(
    `subscriptions/${encodeURIComponent(aboId)}`,
    { cancel_at_period_end: true },
  );

  if (!ergebnis.ok) {
    return { ok: false, fehler: "Die Kündigung liess sich nicht speichern." };
  }

  const endetAm = ergebnis.antwort.current_period_end;

  return { ok: true, endetAm: typeof endetAm === "number" ? endetAm : 0 };
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

      ${bewertungsbitte(b)}

      <p style="font-size:16px;line-height:1.6;">Liebe Grüße<br>Yasemin</p>
    `),
  );
}

/**
 * Die eigene Mail mit der Bitte um eine Bewertung, vier Wochen nach dem Kauf.
 *
 * ▸ WARUM VIER WOCHEN UND NICHT SOFORT
 *   Direkt nach dem Kauf hat die Kundin noch nichts gelesen und kann nichts
 *   beurteilen. Nach vier Wochen ist das Heft durch, der Kurs angefangen, das
 *   Werkzeug benutzt. Wer bis dahin nichts gemacht hat, macht es auch nicht
 *   mehr, und eine spätere Bitte wäre nur noch lästig.
 *
 * ▸ NUR MIT EINWILLIGUNG. Wie bei der Bitte in der Bestellbestätigung: Die
 *   Frage nach der Zufriedenheit ist Werbung (BGH VI ZR 225/17). Diese Mail
 *   ist noch eindeutiger Werbung als der Absatz in der Bestätigung, weil sie
 *   allein deshalb verschickt wird. Ohne `newsletter` geht sie nicht raus.
 *
 * ▸ NICHT BEI DER BERATUNG. Bei Pferdeliebe 365 sind vier Wochen nach dem
 *   Kauf womöglich mitten in der Arbeit: Erst kommt der Fragebogen, dann die
 *   Akte, dann die Begleitung. Wann eine Beratung fertig ist, weiß nur
 *   Yasemin, deshalb gibt es dafür den Knopf im Adminbereich.
 */
export async function bewertungsbitteSenden(
  b: DigitalBestellung,
): Promise<boolean> {
  if (!bewertungslink) return false;

  const was = b.artikel.map((a) => a.name).join(", ");

  return sendeMail(
    b.email,
    "Wie läuft es bei euch?",
    rahmen(`
      <h1 style="font-size:24px;margin:0 0 16px;">Wie läuft es bei euch?</h1>

      <p style="font-size:16px;line-height:1.6;">${anrede(b.vorname)}</p>

      <p style="font-size:16px;line-height:1.6;">
        vor vier Wochen hast du ${esc(was)} bei mir geholt. Ich hoffe, du
        konntest etwas davon mitnehmen, und wenn ja, habe ich eine Bitte an
        dich.
      </p>

      <p style="font-size:16px;line-height:1.6;">
        Schreib ein paar Zeilen bei Google. Das dauert eine Minute und hilft
        anderen Pferdemenschen bei der Entscheidung mehr als alles, was ich
        selbst über meine Angebote schreiben kann.
      </p>

      ${knopf(bewertungslink, "Bewertung schreiben")}

      <p style="font-size:16px;line-height:1.6;">
        Schreib gern ehrlich, auch wenn etwas gefehlt hat oder anders war,
        als du erwartet hast. Und wenn du eine Frage offen hast: Antworte
        einfach auf diese Mail, dann klären wir das zuerst.
      </p>

      <p style="font-size:12px;line-height:1.6;color:#8a7070;">
        Du bekommst diese Mail, weil du beim Kauf zugestimmt hast, Post von
        mir zu bekommen. Wenn du das nicht mehr möchtest, antworte kurz,
        dann trage ich dich aus.
      </p>

      <p style="font-size:16px;line-height:1.6;">Liebe Grüße<br>Yasemin</p>
    `),
  );
}

/**
 * Die Erinnerung an eine angefangene und nicht bezahlte Bestellung.
 *
 * ▸ SIE GEHT NUR AUF KNOPFDRUCK RAUS, es gibt bewusst keinen täglichen Lauf
 *   dafür. Wer automatisch hinterherschreibt, schreibt irgendwann auch der
 *   Kundin, die aus gutem Grund abgebrochen hat.
 *
 * ▸ WARUM SIE NICHT DRÄNGT
 *   Kein Countdown, kein Rabatt, kein „nur noch heute". Der häufigste Grund
 *   für einen Abbruch ist eine offene Frage, nicht ein zu hoher Preis. Also
 *   fragt die Mail danach und bietet den Weg zurück an, mehr nicht. Ein
 *   Rabatt hier wäre ausserdem unfair gegenüber allen, die eben bezahlt
 *   haben.
 *
 * ▸ DER HINWEIS AUF DIE EINWILLIGUNG BLEIBT DRIN. § 7 Abs. 3 UWG verlangt
 *   ihn in jeder solchen Mail, und wer widersprechen will, soll nicht suchen
 *   müssen.
 */
export async function abbruchErinnerungSenden(opt: {
  email: string;
  vorname: string;
  /** Was im Warenkorb lag, als lesbarer Text. */
  produkt: string;
  /** Vollständige Adresse zurück zur Kasse. Leer: dann ohne Knopf. */
  link: string | null;
  /**
   * Nur gesetzt, wenn das Angebot eigentlich schon abgelaufen ist und der
   * Link ausnahmsweise noch öffnet. Dann muss in der Mail stehen, wie lange,
   * sonst wäre die Frist im Nachhinein doch keine gewesen.
   */
  gueltigBis?: string | null;
}): Promise<boolean> {
  return sendeMail(
    opt.email,
    "Deine Bestellung ist liegengeblieben",
    rahmen(`
      <h1 style="font-size:24px;margin:0 0 16px;">Da ist etwas liegengeblieben</h1>

      <p style="font-size:16px;line-height:1.6;">${anrede(opt.vorname)}</p>

      <p style="font-size:16px;line-height:1.6;">
        du hattest vor Kurzem ${esc(opt.produkt)} in der Kasse, die Bestellung
        ist dann aber nicht zu Ende gegangen. Das passiert öfter, als man
        denkt: eine Karte, die nicht durchgeht, ein Fenster, das zufällt.
      </p>

      <p style="font-size:16px;line-height:1.6;">
        Falls du weitermachen möchtest, geht es hier weiter. Falls nicht, ist
        das auch völlig in Ordnung, dann brauchst du nichts zu tun.
      </p>

      ${
        opt.gueltigBis
          ? `<p style="font-size:16px;line-height:1.6;">
        Eine Sache dazu: Der Preis von damals war ein befristetes Angebot und
        ist inzwischen ausgelaufen. Weil du es vorher schon in der Kasse
        hattest, halte ich ihn für dich noch bis zum
        ${esc(opt.gueltigBis)} offen. Der Knopf unten ist dein persönlicher
        Weg dorthin, danach gilt der neue Preis.
      </p>`
          : ""
      }

      ${opt.link ? knopf(opt.link, "Bestellung abschliessen") : ""}

      <p style="font-size:16px;line-height:1.6;">
        Und wenn eine Frage offen geblieben ist, ob das Richtige für dein
        Pferd dabei ist oder wie das Ganze abläuft: Antworte einfach auf diese
        Mail, ich lese jede selbst.
      </p>

      <p style="font-size:12px;line-height:1.6;color:#8a7070;">
        Du bekommst diese Mail, weil du beim Bestellen zugestimmt hast, Post
        von mir zu bekommen. Wenn du das nicht mehr möchtest, antworte kurz,
        dann trage ich dich aus.
      </p>

      <p style="font-size:16px;line-height:1.6;">Liebe Grüße<br>Yasemin</p>
    `),
  );
}

/**
 * Die Bitte um eine Google-Bewertung, unten in der Bestellbestätigung.
 *
 * ▸ SIE GEHT NICHT AN ALLE, UND DAS HAT EINEN GRUND.
 *   Der BGH hat 2018 entschieden (VI ZR 225/17), dass die Frage nach der
 *   Zufriedenheit Werbung ist. Ohne Einwilligung darf sie nicht per Mail
 *   raus, auch nicht angehängt an eine Bestellbestätigung, die sonst
 *   erlaubt wäre. Genau daran ist der beklagte Händler damals gescheitert.
 *
 *   Deshalb steht sie nur in der Mail an Kundinnen, die beim Kauf dem
 *   Newsletter zugestimmt haben. Die haben ausdrücklich eingewilligt, und
 *   der Widerspruchshinweis steht trotzdem dabei, weil § 7 Abs. 3 UWG ihn
 *   in jeder solchen Mail verlangt.
 *
 * ▸ OHNE LINK KEINE BITTE. Solange `bewertungslink` in lib/seite.ts leer
 *   ist, kommt hier nichts. Kein halber Satz, kein toter Knopf.
 *
 * ▸ SIE FRAGT NACH EINER EHRLICHEN BEWERTUNG, nicht nach einer guten. Wer
 *   um „fünf Sterne" bittet oder dafür etwas verspricht, kauft sich
 *   Bewertungen, und das ist unlauter.
 */
function bewertungsbitte(b: DigitalBestellung): string {
  if (!bewertungslink || !b.newsletter) return "";

  return `
    <div style="margin:28px 0 0;padding:18px 20px;background:#F9EDED;border-radius:12px;">
      <p style="font-size:15px;line-height:1.6;margin:0 0 12px;">
        Wenn dir gefällt, was du bekommen hast, freue ich mich sehr über ein
        paar Zeilen bei Google. Das dauert eine Minute und hilft anderen
        Pferdemenschen bei der Entscheidung mehr als jeder Text, den ich
        selbst schreiben könnte.
      </p>

      ${knopf(bewertungslink, "Bewertung schreiben")}

      <p style="font-size:12px;line-height:1.6;color:#8a7070;margin:12px 0 0;">
        Schreib gern ehrlich, auch wenn etwas gefehlt hat. Wenn du solche
        Hinweise nicht bekommen möchtest, antworte kurz auf diese Mail, dann
        lasse ich sie weg.
      </p>
    </div>
  `;
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
  // Die Meldung aufs Handy laeuft mit im selben Bund: Sie kommt sofort mit
  // Ton an, waehrend die Mail erst beim naechsten Blick ins Postfach
  // auffaellt. Siehe lib/telegram.ts.
  const [anKundin, anYasi] = await Promise.all([
    digitalBestaetigungSenden(b),
    digitalMeldenAnYasi(b),
    kaufAufsHandy(b),
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
