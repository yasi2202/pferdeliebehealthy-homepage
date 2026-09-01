import { istEingerichtet, EMAIL_MUSTER, kuerzen } from "@/lib/versand";
import { digitalFinden, funnelZu } from "@/lib/digital";
import { stripeEingerichtet } from "@/lib/shop-server";
import {
  bezahlseiteDigitalAnlegen,
  digitalErgaenzen,
  digitalNummer,
  digitalSpeichern,
  zugriffToken,
} from "@/lib/digital-server";

// ---------------------------------------------------------------------------
// Nimmt den Kauf eines digitalen Produkts entgegen und schickt die Kundin
// weiter zu Stripe.
//
// Ablauf:
//   1. Die Kasse schickt Name, Adresse und die Häkchen hierher.
//   2. Preis und Leistung kommen aus lib/digital.ts, NICHT aus der Anfrage.
//      Was der Browser an Preisen mitschickt, interessiert uns nicht.
//   3. Die Bestellung wird als "offen" gespeichert, mit ihrer Nummer und
//      einem zufälligen Schlüssel für die Angebotsseite danach.
//   4. Wir legen die Bezahlseite bei Stripe an und geben ihre Adresse zurück.
//   5. Bezahlt wird bei Stripe. Dass es geklappt hat, erfahren wir NICHT
//      daher, dass die Kundin auf der Dankeseite landet, sondern über die
//      unterschriebene Rückmeldung in app/api/stripe-webhook. Erst dort wird
//      der Zugang freigeschaltet.
//
// ▸ WOHIN ES NACH DER ZAHLUNG GEHT
//   Gibt es zu diesem Produkt ein Angebot (siehe `funnel` in lib/digital.ts),
//   landet die Kundin auf /angebot/<nummer>. Gibt es keines, direkt auf
//   /danke/<nummer>. Beide Adressen tragen den Schlüssel mit, sonst käme dort
//   jede Person mit einer geratenen Bestellnummer herein.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

/** Die Länder, die zur Auswahl stehen.
 *
 *  Anders als beim Versand ist das keine Beschränkung: Kaufen kann von
 *  überall jemand. Die Angabe wird nur mitgeschrieben, damit du sehen kannst,
 *  wie viel Umsatz ins Ausland geht. Warum das wichtig ist, steht in
 *  datenbank/digitalbestellungen.sql bei der Spalte `land`. */
export const KAUFLAENDER = [
  { code: "DE", name: "Deutschland" },
  { code: "AT", name: "Österreich" },
  { code: "CH", name: "Schweiz" },
  { code: "XX", name: "Ein anderes Land" },
];

export async function POST(request: Request) {
  let daten: Record<string, unknown>;

  try {
    daten = await request.json();
  } catch {
    return Response.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const slug = kuerzen(daten.slug, 80);
  const produkt = digitalFinden(slug);

  if (!produkt) {
    return Response.json(
      { fehler: "Dieses Angebot kenne ich nicht." },
      { status: 400 },
    );
  }

  const vorname = kuerzen(daten.vorname, 60);
  const nachname = kuerzen(daten.nachname, 60);
  const email = kuerzen(daten.email, 200).toLowerCase();
  const strasse = kuerzen(daten.strasse, 160);
  const plz = kuerzen(daten.plz, 12);
  const ort = kuerzen(daten.ort, 100);

  const land =
    KAUFLAENDER.find((l) => l.code === daten.land)?.code ?? "DE";

  if (vorname.length < 2 || nachname.length < 2) {
    return Response.json(
      { fehler: "Bitte trag deinen Vor- und Nachnamen ein." },
      { status: 400 },
    );
  }

  if (!EMAIL_MUSTER.test(email)) {
    return Response.json(
      { fehler: "Diese E-Mail-Adresse sieht nicht vollständig aus." },
      { status: 400 },
    );
  }

  // Die Anschrift steht auf der Rechnung, deshalb muss sie da sein. Geprüft
  // wird nur auf Vollständigkeit, nicht auf Richtigkeit: Eine Postleitzahl
  // gegen ein Verzeichnis zu prüfen würde bei jeder ausländischen Adresse
  // scheitern und ehrliche Käufe abweisen.
  if (strasse.length < 4 || plz.length < 4 || ort.length < 2) {
    return Response.json(
      { fehler: "Bitte prüf noch einmal Straße, Postleitzahl und Ort." },
      { status: 400 },
    );
  }

  // ▸ DIE BEIDEN PFLICHTHÄKCHEN, UND WARUM SIE PFLICHT SIND
  //
  //   `einverstanden` ist der übliche Hinweis auf AGB, Widerrufsbelehrung
  //   und Datenschutz, wie in der Kasse des Shops.
  //
  //   `widerrufVerzicht` ist das entscheidende. Bei digitalen Inhalten hat
  //   die Kundin vierzehn Tage Widerrufsrecht, auch wenn sie den Kurs in der
  //   Zwischenzeit vollständig gelesen hat. Es erlischt nur, wenn sie
  //   ausdrücklich zustimmt, dass vor Ablauf der Frist geliefert wird, und
  //   bestätigt, dass sie damit ihr Widerrufsrecht verliert. Ohne dieses
  //   Häkchen dürfte der Zugang erst nach vierzehn Tagen freigeschaltet
  //   werden, und niemand kauft einen Kurs, den es in zwei Wochen gibt.
  //   Deshalb ist die Zustimmung hier Voraussetzung für den sofortigen
  //   Zugang. Das steht so auch im Text neben dem Häkchen.
  if (daten.einverstanden !== true || daten.widerrufVerzicht !== true) {
    return Response.json(
      { fehler: "Bitte setz beide Häkchen, dann kann es losgehen." },
      { status: 400 },
    );
  }

  const newsletter = daten.newsletter === true;

  // Kein stiller Fehlschlag: Wer hier hängen bleibt, soll wissen, dass der
  // Kauf NICHT angekommen ist, und einen Weg haben, dich zu erreichen.
  if (!stripeEingerichtet() || !istEingerichtet()) {
    console.error(
      "Digitalkasse: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SECRET_KEY oder RESEND_API_KEY fehlt in den Vercel-Einstellungen.",
    );

    return Response.json(
      {
        fehler:
          "Der Kauf ist gerade nicht möglich. Schreib mir bitte kurz an info@pferdeliebehealthy.de, dann richte ich dir den Zugang von Hand ein.",
      },
      { status: 503 },
    );
  }

  const nummer = digitalNummer();
  const token = zugriffToken();
  const jetzt = new Date().toISOString();
  const seitenUrl = new URL(request.url).origin;

  // Gibt es ein Angebot nach dem Kauf? Dann führt der Weg dort entlang.
  const anschluss = funnelZu(produkt.slug);

  const weiterNach =
    anschluss && anschluss.upsell
      ? `${seitenUrl}/angebot/${nummer}?t=${token}`
      : `${seitenUrl}/danke/${nummer}?t=${token}`;

  const bestellung = {
    nummer,
    status: "offen" as const,
    art: "kauf" as const,
    gehoert_zu: null,
    email,
    vorname,
    nachname,
    strasse,
    plz,
    ort,
    land,
    artikel: [
      {
        slug: produkt.slug,
        name: produkt.name,
        preis: produkt.preis,
        mwst: produkt.mwst,
      },
    ],
    gesamt: produkt.preis,
    widerruf_verzicht: true,
    widerruf_verzicht_am: jetzt,
    newsletter,
    zugriff_token: token,
    stripe_sitzung: null,
  };

  if (!(await digitalSpeichern(bestellung))) {
    return Response.json(
      {
        fehler:
          "Dein Kauf liess sich gerade nicht anlegen. Versuch es bitte gleich noch einmal oder schreib mir an info@pferdeliebehealthy.de.",
      },
      { status: 502 },
    );
  }

  const bezahlseite = await bezahlseiteDigitalAnlegen({
    produkt,
    preis: produkt.preis,
    nummer,
    token,
    email,
    seitenUrl,
    // Nur beim Erstkauf: die Zahlungsart merken, damit das Angebot danach
    // mit einem Klick angenommen werden kann. Gibt es kein Angebot, wird
    // auch nichts gespeichert.
    zahlungsartMerken: Boolean(anschluss?.upsell),
    weiterNach,
  });

  if ("fehler" in bezahlseite) {
    return Response.json(
      {
        fehler:
          "Die Bezahlung liess sich nicht öffnen. Versuch es bitte noch einmal oder schreib mir an info@pferdeliebehealthy.de.",
      },
      { status: 502 },
    );
  }

  // Die Sitzungskennung nachtragen. Die Angebotsseite braucht sie, um die
  // Zahlungsart nachzuschlagen, falls die Rückmeldung von Stripe noch nicht
  // da ist. Klappt das Nachtragen nicht, ist der Kauf trotzdem gültig, nur
  // das Ein-Klick-Angebot fällt dann auf den normalen Weg zurück.
  await digitalErgaenzen(nummer, { stripe_sitzung: bezahlseite.sitzung });

  return Response.json({ url: bezahlseite.url, nummer });
}
