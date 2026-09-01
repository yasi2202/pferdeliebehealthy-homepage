import { istEingerichtet, EMAIL_MUSTER, kuerzen } from "@/lib/versand";
import { digitalFinden, funnelZu } from "@/lib/digital";
import { stripeEingerichtet } from "@/lib/shop-server";
import {
  bezahlseiteDigitalAnlegen,
  digitalAlsBezahltMarkieren,
  digitalErgaenzen,
  digitalNummer,
  digitalSpeichern,
  nachDerZahlung,
  rabattEinloesen,
  rabattPruefen,
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

  // ▸ DER VERTRIEBSBEGINN, UND WARUM ER HIER GEPRÜFT WIRD UND NICHT NUR AUF
  //   DER SEITE
  //   Zulassungspflichtiger Fernunterricht darf erst vertrieben werden, wenn
  //   die Zulassung der ZFU vorliegt. Ein Vertrag davor ist nach § 7 FernUSG
  //   nichtig: Die Teilnehmerin könnte ihr Geld zurückverlangen, und zwar
  //   auch noch nach Monaten, während der Lehrgang längst gelaufen ist.
  //
  //   Ein Hinweis auf der Verkaufsseite würde das nicht verhindern, weil die
  //   Adresse der Kasse bekannt sein kann. Deshalb steht die Prüfung hier,
  //   wo der Vertrag tatsächlich zustande kommt.
  //
  //   Freigeschaltet wird über `verkaufAb` in lib/digital.ts. Sobald die
  //   Zulassung da ist, kann dort das Datum weg.
  if (produkt.verkaufAb) {
    const start = new Date(`${produkt.verkaufAb}T00:00:00+02:00`);

    if (new Date() < start) {
      return Response.json(
        {
          fehler:
            `Dieses Angebot ist noch nicht buchbar. Es startet am ` +
            `${start.toLocaleDateString("de-DE")}. Schreib mir gern an ` +
            `info@pferdeliebehealthy.de, dann sage ich dir Bescheid.`,
        },
        { status: 403 },
      );
    }
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

  // ▸ DER RABATT WIRD HIER NEU GERECHNET, nicht übernommen.
  //   Der Browser schickt nur den eingetippten Code. Preis und Nachlass
  //   kommen ausschliesslich aus lib/digital.ts und der Rabatttabelle. Wer
  //   die Anfrage von Hand baut und sich einen Preis von einem Cent
  //   hineinschreibt, erreicht damit nichts.
  //
  //   Ein Code, der zwischen dem Eintippen und dem Bestellen ungültig
  //   geworden ist, führt hier zu einem Abbruch mit Begründung. Still den
  //   vollen Preis abzubuchen wäre schlimmer: Die Kundin hat einen anderen
  //   Betrag gesehen, als sie auf den Knopf gedrückt hat.
  const codeEingabe = kuerzen(daten.rabattcode, 40);

  let preis = produkt.preis;
  let rabattCent = 0;
  let rabattcode: string | null = null;

  if (codeEingabe) {
    const rabatt = await rabattPruefen({
      code: codeEingabe,
      slug: produkt.slug,
      preis: produkt.preis,
    });

    if ("fehler" in rabatt) {
      return Response.json({ fehler: rabatt.fehler }, { status: 400 });
    }

    preis = rabatt.endpreis;
    rabattCent = rabatt.rabattCent;
    rabattcode = rabatt.code;
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
    gesamt: preis,
    rabattcode,
    rabatt_cent: rabattCent,
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

  if (rabattcode) {
    await rabattEinloesen(rabattcode);
  }

  // ▸ DER SONDERFALL: Ein Code, der den Preis auf null senkt.
  //   Stripe kann keine Zahlung über 0,00 € anlegen, die Bezahlseite würde
  //   also mit einem Fehler antworten. Statt die Kundin davorlaufen zu
  //   lassen, wird der Kauf hier sofort abgeschlossen und freigeschaltet.
  //   Das ist der einzige Weg, auf dem eine Bestellung ohne Rückmeldung von
  //   Stripe auf "bezahlt" springt -- und er ist sicher, weil kein Geld
  //   fliessen muss und der Rabatt serverseitig geprüft wurde.
  if (preis <= 0) {
    const bezahlt = await digitalAlsBezahltMarkieren(nummer);

    if (bezahlt) {
      await nachDerZahlung(bezahlt);
    }

    return Response.json({ weiter: weiterNach, nummer, ohneZahlung: true });
  }

  const bezahlseite = await bezahlseiteDigitalAnlegen({
    produkt,
    // `preis`, nicht `produkt.preis`: Hier steht der Betrag nach Abzug des
    // Rabatts. Sonst würde Stripe den vollen Preis einziehen, obwohl in der
    // Kasse der ermässigte stand.
    preis,
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
