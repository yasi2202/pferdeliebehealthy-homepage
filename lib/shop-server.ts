// ---------------------------------------------------------------------------
// Der Unterbau des Shops: Stripe, Bestellnummern, Bestellmails.
//
// Diese Datei gehört ausschliesslich auf den Server. Importiere sie nur aus
// Route-Handlern, nie aus einer Datei mit "use client" -- sonst läge dein
// Stripe-Schlüssel im Browser jeder Besucherin.
//
// Datenbank und Mailversand kommen aus lib/versand.ts, dieselbe Verbindung,
// die auch der Futter-Check und der Insider-Kanal benutzen.
//
// ▸ NEU EINZUTRAGEN in den Vercel-Einstellungen dieses Projekts:
//     STRIPE_SECRET_KEY       aus dem Stripe-Konto, beginnt mit sk_live_
//     STRIPE_WEBHOOK_SECRET   von Stripe beim Anlegen des Webhooks, whsec_
//
//   Solange sie fehlen, sagt die Kasse das ehrlich, statt eine Bestellung
//   entgegenzunehmen, die nirgends ankommt.
//
// ▸ Warum kein Stripe-Paket aus npm: Für das, was hier gebraucht wird -- eine
//   Bezahlseite anlegen und eine Rückmeldung prüfen -- reichen zwei Aufrufe.
//   Die Website kommt damit ohne zusätzliche Abhängigkeit aus, so wie sie es
//   bei Supabase und Resend auch tut.
// ---------------------------------------------------------------------------

import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import {
  laender,
  preisText,
  produktFinden,
  versandkosten,
  type Produkt,
} from "@/lib/shop";
import {
  supabase,
  sendeMail,
  esc,
  rahmen,
  anrede,
  ANTWORT_AN,
} from "@/lib/versand";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Welche Zahlarten an der Kasse erscheinen sollen.
 *
 * ▸ WOZU DAS DA IST, UND WARUM ES WICHTIG IST
 *   Das Stripe-Konto ist über alfima verknüpft. Dadurch bestimmt alfima die
 *   Standardkonfiguration der Zahlarten, und im Stripe-Dashboard steht
 *   ausdrücklich: "alfima hat Sie nicht autorisiert, Zahlungsmethoden vom
 *   Dashboard aus zu verwalten." Eine selbst angelegte Konfiguration wird
 *   deshalb ignoriert, solange man sie nicht ausdrücklich verlangt. Am
 *   01.09.2026 fehlte darum PayPal an der Kasse, obwohl es eingeschaltet war.
 *
 * ▸ SO STELLST DU ES EIN
 *   In Stripe unter Einstellungen, Zahlungen, Zahlungsmethoden eine eigene
 *   Konfiguration anlegen und dort die Zahlarten auswählen, die du willst.
 *   Ihre Kennung beginnt mit `pmc_`. Diese Kennung als Variable
 *       STRIPE_ZAHLARTEN
 *   in den Vercel-Einstellungen eintragen.
 *
 * ▸ Ist die Variable leer, bleibt alles wie bisher: Dann gilt, was alfima
 *   vorgibt. Das ist der sichere Rückfall, keine Kasse bleibt deshalb stehen.
 *
 * ▸ GILT FÜR BEIDE KASSEN, den Futtershop hier und die digitalen Produkte in
 *   lib/digital-server.ts. Deshalb steht der Wert hier, wo auch der
 *   Stripe-Schlüssel liegt, und nicht zweimal.
 */
export const STRIPE_ZAHLARTEN = process.env.STRIPE_ZAHLARTEN || "";

/** Sagt, ob der Shop bezahlbereit ist. */
export function stripeEingerichtet(): boolean {
  return Boolean(STRIPE_SECRET_KEY);
}

// ---------------------------------------------------------------------------
// Der Warenkorb, serverseitig nachgerechnet
// ---------------------------------------------------------------------------

export type KorbWunsch = { slug: string; menge: number };

export type GeprueftesteZeile = {
  produkt: Produkt;
  menge: number;
  zwischensumme: number;
};

export type GeprueftesteBestellung = {
  zeilen: GeprueftesteZeile[];
  summe: number;
  versand: number;
  gesamt: number;
};

/** Rechnet den Warenkorb aus den Wünschen des Browsers neu aus.
 *
 *  Der Browser schickt nur Kennung und Anzahl. Preise, Verfügbarkeit und
 *  Versandkosten kommen ausschliesslich aus lib/shop.ts. Wer die Anfrage
 *  von Hand baut und sich einen Preis von 1 Cent hineinschreibt, erreicht
 *  damit nichts. */
export function pruefeKorb(
  korb: unknown,
  landCode: string,
): GeprueftesteBestellung | { fehler: string } {
  if (!Array.isArray(korb) || korb.length === 0) {
    return { fehler: "Dein Warenkorb ist leer." };
  }

  if (korb.length > 20) {
    return { fehler: "Das sind sehr viele verschiedene Artikel. Schreib mir bitte kurz, dann mache ich dir ein Angebot." };
  }

  const zeilen: GeprueftesteZeile[] = [];

  for (const eintrag of korb as KorbWunsch[]) {
    const produkt =
      typeof eintrag?.slug === "string" ? produktFinden(eintrag.slug) : undefined;

    if (!produkt) {
      return { fehler: "Ein Artikel im Warenkorb ist mir unbekannt. Leg ihn bitte noch einmal hinein." };
    }

    if (!produkt.vorraetig) {
      return {
        fehler: `${produkt.name} ist gerade nicht verfügbar. Nimm es bitte aus dem Warenkorb.`,
      };
    }

    const menge = Math.round(Number(eintrag.menge));

    if (!Number.isFinite(menge) || menge < 1 || menge > 99) {
      return { fehler: "Eine der Mengen ergibt keinen Sinn." };
    }

    zeilen.push({ produkt, menge, zwischensumme: produkt.preis * menge });
  }

  const summe = zeilen.reduce((s, z) => s + z.zwischensumme, 0);
  const versand = versandkosten(landCode);

  return { zeilen, summe, versand, gesamt: summe + versand };
}

// ---------------------------------------------------------------------------
// Bestellnummer
// ---------------------------------------------------------------------------

/** Eine Nummer wie "PFH-20260831-4821". Datum, damit du im Postfach sofort
 *  siehst, wann sie kam. Vier Zufallsziffern, damit zwei Bestellungen am
 *  selben Tag sich nicht ins Gehege kommen. */
export function bestellnummer(): string {
  const heute = new Date();
  const tag = [
    heute.getFullYear(),
    String(heute.getMonth() + 1).padStart(2, "0"),
    String(heute.getDate()).padStart(2, "0"),
  ].join("");

  return `PFH-${tag}-${String(randomInt(1000, 10000))}`;
}

// ---------------------------------------------------------------------------
// Stripe
// ---------------------------------------------------------------------------

/** Macht aus einem verschachtelten Objekt die Schreibweise, die Stripe
 *  erwartet: aus { a: { b: 1 } } wird "a[b]=1". */
function stripeFelder(
  daten: Record<string, unknown>,
  praefix = "",
): [string, string][] {
  const paare: [string, string][] = [];

  for (const [schluessel, wert] of Object.entries(daten)) {
    if (wert === undefined || wert === null) {
      continue;
    }

    const name = praefix ? `${praefix}[${schluessel}]` : schluessel;

    if (Array.isArray(wert)) {
      wert.forEach((eintrag, i) => {
        if (eintrag !== null && typeof eintrag === "object") {
          paare.push(...stripeFelder(eintrag as Record<string, unknown>, `${name}[${i}]`));
        } else {
          paare.push([`${name}[${i}]`, String(eintrag)]);
        }
      });
    } else if (typeof wert === "object") {
      paare.push(...stripeFelder(wert as Record<string, unknown>, name));
    } else {
      paare.push([name, String(wert)]);
    }
  }

  return paare;
}

/** Schickt etwas an Stripe. Die nackte Fassung, ohne Rückfall.
 *
 *  Benutze von aussen `stripeAnfrage` weiter unten, die fängt den Sonderfall
 *  mit der Zahlarten-Konfiguration ab. */
async function stripeAnfrageRoh(
  pfad: string,
  daten: Record<string, unknown>,
): Promise<{ ok: true; antwort: Record<string, unknown> } | { ok: false; fehler: string }> {
  const koerper = new URLSearchParams(stripeFelder(daten));

  const res = await fetch(`https://api.stripe.com/v1/${pfad}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: koerper,
  });

  const antwort = await res.json();

  if (!res.ok) {
    // Die Fehlermeldung von Stripe ist auf Englisch und für Kundinnen
    // unbrauchbar. Sie landet deshalb nur im Vercel-Protokoll.
    console.error("Stripe meldet einen Fehler:", antwort?.error?.message ?? antwort);
    return { ok: false, fehler: "Die Bezahlung liess sich nicht vorbereiten." };
  }

  return { ok: true, antwort };
}

/** Schickt etwas an Stripe, mit einem Rückfall für die Zahlarten.
 *
 *  ▸ WARUM ES DIESEN RÜCKFALL GIBT
 *    Zahlarten-Konfigurationen sind bei Stripe je Modus getrennt: Eine
 *    Kennung aus dem Livemodus kennt der Testmodus nicht und umgekehrt.
 *    Genau das ist am 01.09.2026 passiert. Die Kasse gab daraufhin
 *    "Die Bezahlung liess sich nicht öffnen" zurück, und zwar für JEDEN
 *    Kauf. Eine Einstellung, die eigentlich nur die Auswahl der Bezahlarten
 *    verschönern soll, hatte damit den ganzen Verkauf angehalten.
 *
 *    Das darf nicht sein. Wird die Konfiguration abgelehnt, versucht es
 *    diese Funktion deshalb sofort noch einmal ohne sie. Die Kundin merkt
 *    nichts, sie sieht dann nur die Bezahlarten aus der Standardvorgabe.
 *    Der Fehler landet im Vercel-Protokoll, damit du ihn findest.
 *
 *  Exportiert, weil lib/digital-server.ts dieselbe Verbindung braucht. Der
 *  Stripe-Schlüssel soll an genau einer Stelle stehen, nicht zweimal. */
export async function stripeAnfrage(
  pfad: string,
  daten: Record<string, unknown>,
): Promise<{ ok: true; antwort: Record<string, unknown> } | { ok: false; fehler: string }> {
  const ergebnis = await stripeAnfrageRoh(pfad, daten);

  if (ergebnis.ok || !daten.payment_method_configuration) {
    return ergebnis;
  }

  console.error(
    `Die Zahlarten-Konfiguration ${String(daten.payment_method_configuration)} ` +
      "hat Stripe abgelehnt. Prüf bitte, ob sie zum richtigen Modus gehört: " +
      "Test und Live haben getrennte Konfigurationen. Der Kauf läuft " +
      "einstweilen mit der Standardvorgabe weiter.",
  );

  const ohne = { ...daten };
  delete ohne.payment_method_configuration;

  return stripeAnfrageRoh(pfad, ohne);
}

/** Fragt etwas bei Stripe ab, ohne etwas zu ändern.
 *
 *  Gebraucht wird das beim Ein-Klick-Angebot nach dem Kauf: Dort muss die
 *  Bezahlseite noch einmal nachgeschlagen werden, um an die gespeicherte
 *  Zahlungsart zu kommen. Auf die Rückmeldung von Stripe zu warten wäre
 *  dafür zu langsam -- die Kundin steht ja schon auf der Seite. */
export async function stripeHolen(
  pfad: string,
): Promise<{ ok: true; antwort: Record<string, unknown> } | { ok: false }> {
  const res = await fetch(`https://api.stripe.com/v1/${pfad}`, {
    headers: { Authorization: `Bearer ${STRIPE_SECRET_KEY}` },
    cache: "no-store",
  });

  const antwort = await res.json();

  if (!res.ok) {
    console.error("Stripe-Abfrage fehlgeschlagen:", antwort?.error?.message ?? antwort);
    return { ok: false };
  }

  return { ok: true, antwort };
}

/** Legt die Bezahlseite bei Stripe an und gibt ihre Adresse zurück.
 *
 *  Welche Bezahlarten dort erscheinen (Karte, PayPal, Klarna, Apple Pay),
 *  entscheidest du im Stripe-Konto unter „Zahlungsmethoden". Hier steht
 *  bewusst keine feste Liste, sonst müsste die Datei jedes Mal angefasst
 *  werden, wenn du dort etwas dazuschaltest. */
export async function bezahlseiteAnlegen(opt: {
  bestellung: GeprueftesteBestellung;
  nummer: string;
  email: string;
  seitenUrl: string;
}): Promise<{ url: string } | { fehler: string }> {
  const posten = opt.bestellung.zeilen.map((z) => ({
    quantity: z.menge,
    price_data: {
      currency: "eur",
      unit_amount: z.produkt.preis,
      product_data: {
        name: z.produkt.name,
        ...(z.produkt.inhalt ? { description: z.produkt.inhalt } : {}),
      },
    },
  }));

  // Der Versand ist bei Stripe eine ganz normale Zeile. Das ist der
  // einfachste Weg, bei dem die Summe auf der Bezahlseite exakt der
  // entspricht, die die Kundin in der Kasse gesehen hat.
  posten.push({
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: opt.bestellung.versand,
      product_data: { name: "Versand mit DHL", description: "" },
    },
  });

  const ergebnis = await stripeAnfrage("checkout/sessions", {
    mode: "payment",
    locale: "de",
    customer_email: opt.email,
    client_reference_id: opt.nummer,
    // Nur wenn eine eigene Konfiguration hinterlegt ist. Sonst gilt die von
    // alfima, siehe die Erklaerung bei STRIPE_ZAHLARTEN oben.
    ...(STRIPE_ZAHLARTEN
      ? { payment_method_configuration: STRIPE_ZAHLARTEN }
      : {}),
    line_items: posten,
    metadata: { bestellnummer: opt.nummer },
    payment_intent_data: {
      description: `Bestellung ${opt.nummer}`,
      metadata: { bestellnummer: opt.nummer },
    },
    success_url: `${opt.seitenUrl}/bestellung-danke?nummer=${opt.nummer}`,
    cancel_url: `${opt.seitenUrl}/kasse`,
  });

  if (!ergebnis.ok) {
    return { fehler: ergebnis.fehler };
  }

  const url = ergebnis.antwort.url;

  if (typeof url !== "string") {
    return { fehler: "Stripe hat keine Bezahlseite zurückgegeben." };
  }

  return { url };
}

/** Prüft die Unterschrift, mit der Stripe seine Rückmeldungen versieht.
 *
 *  Ohne diese Prüfung könnte jede beliebige Person eine Nachricht an unsere
 *  Adresse schicken, in der „bezahlt" steht, und bekäme Ware. Der Schlüssel
 *  dafür ist STRIPE_WEBHOOK_SECRET.
 *
 *  Stripe schickt im Kopf `stripe-signature` etwas in der Form
 *      t=1724000000,v1=5257a869e7...
 *  Unterschrieben wird die Zeichenkette "<t>.<Nachrichtentext>". */
export function pruefeStripeUnterschrift(
  koerper: string,
  unterschrift: string | null,
): boolean {
  if (!STRIPE_WEBHOOK_SECRET || !unterschrift) {
    return false;
  }

  const teile = Object.fromEntries(
    unterschrift.split(",").map((t) => {
      const [name, ...rest] = t.split("=");
      return [name.trim(), rest.join("=")];
    }),
  );

  const zeit = teile.t;
  const gesendet = teile.v1;

  if (!zeit || !gesendet) {
    return false;
  }

  // Eine alte, abgefangene Nachricht soll nicht Jahre später noch gelten.
  // Fünf Minuten sind der Wert, den auch Stripe selbst vorschlägt.
  const alterInSekunden = Math.abs(Date.now() / 1000 - Number(zeit));

  if (!Number.isFinite(alterInSekunden) || alterInSekunden > 300) {
    return false;
  }

  const erwartet = createHmac("sha256", STRIPE_WEBHOOK_SECRET)
    .update(`${zeit}.${koerper}`)
    .digest("hex");

  const a = Buffer.from(erwartet, "utf8");
  const b = Buffer.from(gesendet, "utf8");

  // Gleich lange Puffer sind Voraussetzung für den zeitkonstanten Vergleich.
  // Der verhindert, dass sich die richtige Unterschrift Zeichen für Zeichen
  // erraten lässt, indem jemand misst, wie lange die Antwort dauert.
  return a.length === b.length && timingSafeEqual(a, b);
}

// ---------------------------------------------------------------------------
// Bestellungen speichern
// ---------------------------------------------------------------------------

export type BestellArtikel = {
  slug: string;
  name: string;
  menge: number;
  einzelpreis: number;
  zwischensumme: number;
  mwst: number;
};

export type Bestellung = {
  nummer: string;
  status: "offen" | "bezahlt";
  email: string;
  vorname: string;
  nachname: string;
  strasse: string;
  plz: string;
  ort: string;
  land: string;
  anmerkung: string;
  artikel: BestellArtikel[];
  summe: number;
  versand: number;
  gesamt: number;
};

export async function bestellungSpeichern(b: Bestellung): Promise<boolean> {
  const res = await supabase("bestellungen", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(b),
  });

  if (!res.ok) {
    console.error("Bestellung liess sich nicht speichern:", await res.text());
  }

  return res.ok;
}

/** Setzt eine Bestellung auf „bezahlt". Gibt sie zurück, damit die Mails
 *  danach die richtigen Daten haben. Liefert null, wenn es die Nummer nicht
 *  gibt oder sie schon bezahlt war -- dann wird auch keine zweite
 *  Bestätigung verschickt. */
export async function alsBezahltMarkieren(
  nummer: string,
): Promise<Bestellung | null> {
  const res = await supabase(
    `bestellungen?nummer=eq.${encodeURIComponent(nummer)}&status=eq.offen`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        status: "bezahlt",
        bezahlt_am: new Date().toISOString(),
      }),
    },
  );

  if (!res.ok) {
    console.error("Bestellung liess sich nicht aktualisieren:", await res.text());
    return null;
  }

  const zeilen = await res.json();

  return Array.isArray(zeilen) && zeilen.length > 0 ? zeilen[0] : null;
}

// ---------------------------------------------------------------------------
// Die Mails nach dem Kauf
// ---------------------------------------------------------------------------

function artikelTabelle(b: Bestellung): string {
  const zeilen = b.artikel
    .map(
      (a) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #EAD8D8;">
          ${esc(a.name)}<br>
          <span style="font-size:13px;color:#8a7070;">${a.menge} &times; ${preisText(a.einzelpreis)}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #EAD8D8;text-align:right;white-space:nowrap;">
          ${preisText(a.zwischensumme)}
        </td>
      </tr>`,
    )
    .join("");

  return `
  <table style="width:100%;border-collapse:collapse;font-size:15px;margin:20px 0;">
    ${zeilen}
    <tr>
      <td style="padding:8px 0;color:#8a7070;">Versand</td>
      <td style="padding:8px 0;text-align:right;">${preisText(b.versand)}</td>
    </tr>
    <tr>
      <td style="padding:12px 0 0;font-weight:bold;">Gesamt</td>
      <td style="padding:12px 0 0;text-align:right;font-weight:bold;">${preisText(b.gesamt)}</td>
    </tr>
  </table>
  <p style="font-size:13px;color:#8a7070;margin:0;">Alle Preise inklusive Mehrwertsteuer.</p>`;
}

function anschrift(b: Bestellung): string {
  // Der Landesname kommt aus der Länderliste, damit die Mail auch dann noch
  // stimmt, wenn dort ein Land dazukommt oder wegfällt. Steht die Kennung
  // nicht mehr drin -- etwa bei einer alten Bestellung -- wird sie so
  // ausgegeben, wie sie gespeichert wurde.
  const land = laender.find((l) => l.code === b.land)?.name ?? b.land;

  return `${esc(b.vorname)} ${esc(b.nachname)}<br>
    ${esc(b.strasse)}<br>
    ${esc(b.plz)} ${esc(b.ort)}<br>
    ${esc(land)}`;
}

/** Die Bestätigung an die Kundin. */
export async function bestellbestaetigungSenden(b: Bestellung): Promise<boolean> {
  return sendeMail(
    b.email,
    `Deine Bestellung ${b.nummer}`,
    rahmen(`
      <h1 style="font-size:24px;margin:0 0 16px;">Danke für deine Bestellung</h1>

      <p style="font-size:16px;line-height:1.6;">${anrede(b.vorname)}</p>

      <p style="font-size:16px;line-height:1.6;">
        deine Bestellung ist bei mir angekommen und die Zahlung ist eingegangen.
        Ich packe alles zusammen und schicke es dir zu.
      </p>

      <p style="font-size:15px;color:#8a7070;">
        Bestellnummer <strong style="color:#4A3636;">${esc(b.nummer)}</strong>
      </p>

      ${artikelTabelle(b)}

      <p style="font-size:15px;line-height:1.6;margin-top:24px;">
        <strong>Lieferanschrift</strong><br>
        ${anschrift(b)}
      </p>

      <p style="font-size:15px;line-height:1.6;">
        Sobald das Paket unterwegs ist, melde ich mich noch einmal. Wenn dir
        etwas auffällt oder du eine Frage zur Fütterung hast, antworte
        einfach auf diese Mail.
      </p>

      <p style="font-size:16px;line-height:1.6;">Liebe Grüße<br>Yasemin</p>
    `),
  );
}

/** Die Benachrichtigung an dich. Kurz und mit allem, was du zum Packen
 *  brauchst. */
export async function bestellungMeldenAnYasi(b: Bestellung): Promise<boolean> {
  return sendeMail(
    ANTWORT_AN,
    `Neue Bestellung ${b.nummer} über ${preisText(b.gesamt)}`,
    rahmen(`
      <h1 style="font-size:22px;margin:0 0 16px;">Neue Bestellung</h1>

      <p style="font-size:15px;color:#8a7070;">
        ${esc(b.nummer)} &middot; bezahlt
      </p>

      ${artikelTabelle(b)}

      <p style="font-size:15px;line-height:1.6;margin-top:24px;">
        <strong>Lieferanschrift</strong><br>
        ${anschrift(b)}<br>
        <a href="mailto:${esc(b.email)}" style="color:#B87878;">${esc(b.email)}</a>
      </p>

      ${
        b.anmerkung
          ? `<p style="font-size:15px;line-height:1.6;background:#F9EDED;padding:14px;border-radius:10px;">
               <strong>Anmerkung:</strong><br>${esc(b.anmerkung)}
             </p>`
          : ""
      }
    `),
  );
}
