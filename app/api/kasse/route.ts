import { istEingerichtet, EMAIL_MUSTER, kuerzen } from "@/lib/versand";
import { laender } from "@/lib/shop";
import {
  bestellnummer,
  bestellungSpeichern,
  bezahlseiteAnlegen,
  pruefeKorb,
  stripeEingerichtet,
  type BestellArtikel,
} from "@/lib/shop-server";

// ---------------------------------------------------------------------------
// Nimmt eine Bestellung entgegen und schickt die Kundin weiter zu Stripe.
//
// Ablauf:
//   1. Die Kasse schickt Warenkorb und Anschrift hierher.
//   2. Wir rechnen den Warenkorb aus lib/shop.ts neu aus. Was der Browser
//      an Preisen mitgeschickt hat, interessiert uns nicht.
//   3. Die Bestellung wird als "offen" gespeichert, mit ihrer Nummer.
//   4. Wir legen die Bezahlseite bei Stripe an und geben ihre Adresse zurück.
//   5. Bezahlt wird bei Stripe. Dass es geklappt hat, erfahren wir NICHT
//      daher, dass die Kundin auf der Dankeseite landet -- diese Adresse
//      könnte jede Person auch von Hand aufrufen -- sondern über die
//      unterschriebene Rückmeldung in app/api/stripe-webhook.
//
// Erst dort wird aus "offen" ein "bezahlt", und erst dort gehen die Mails
// raus.
// ---------------------------------------------------------------------------

// Node statt Edge, weil lib/shop-server.ts für die Unterschriftsprüfung
// node:crypto braucht und beide Routen dieselbe Umgebung haben sollen.
export const runtime = "nodejs";

export async function POST(request: Request) {
  let daten: Record<string, unknown>;

  try {
    daten = await request.json();
  } catch {
    return Response.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const vorname = kuerzen(daten.vorname, 60);
  const nachname = kuerzen(daten.nachname, 60);
  const email = kuerzen(daten.email, 200).toLowerCase();
  const strasse = kuerzen(daten.strasse, 160);
  const plz = kuerzen(daten.plz, 12);
  const ort = kuerzen(daten.ort, 100);
  const anmerkung = kuerzen(daten.anmerkung, 1000);

  // Das Land muss in der Länderliste stehen. Sonst könnte jemand die Anfrage
  // von Hand bauen, ein nicht beliefertes Land eintragen und würde mit
  // deutschem Porto beliefert.
  const land = laender.find((l) => l.code === daten.land)?.code;

  if (!land) {
    return Response.json(
      {
        fehler: `Ich versende zurzeit nur nach ${laender.map((l) => l.name).join(" und ")}.`,
      },
      { status: 400 },
    );
  }

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

  if (strasse.length < 4 || plz.length < 4 || ort.length < 2) {
    return Response.json(
      { fehler: "Bitte prüf noch einmal Straße, Postleitzahl und Ort." },
      { status: 400 },
    );
  }

  const geprueft = pruefeKorb(daten.korb, land);

  if ("fehler" in geprueft) {
    return Response.json({ fehler: geprueft.fehler }, { status: 400 });
  }

  // Kein stiller Fehlschlag: Wer hier hängen bleibt, soll wissen, dass die
  // Bestellung NICHT angekommen ist, und einen Weg haben, dich zu erreichen.
  if (!stripeEingerichtet() || !istEingerichtet()) {
    console.error(
      "Kasse: STRIPE_SECRET_KEY, SUPABASE_URL, SUPABASE_SECRET_KEY oder RESEND_API_KEY fehlt in den Vercel-Einstellungen.",
    );

    return Response.json(
      {
        fehler:
          "Die Bezahlung ist gerade nicht möglich. Schreib mir bitte kurz an info@pferdeliebehealthy.de, dann nehme ich deine Bestellung von Hand auf.",
      },
      { status: 503 },
    );
  }

  const nummer = bestellnummer();

  const artikel: BestellArtikel[] = geprueft.zeilen.map((z) => ({
    slug: z.produkt.slug,
    name: z.produkt.name,
    menge: z.menge,
    einzelpreis: z.produkt.preis,
    zwischensumme: z.zwischensumme,
    mwst: z.produkt.mwst,
  }));

  const gespeichert = await bestellungSpeichern({
    nummer,
    status: "offen",
    email,
    vorname,
    nachname,
    strasse,
    plz,
    ort,
    land,
    anmerkung,
    artikel,
    summe: geprueft.summe,
    versand: geprueft.versand,
    gesamt: geprueft.gesamt,
  });

  if (!gespeichert) {
    return Response.json(
      {
        fehler:
          "Deine Bestellung liess sich gerade nicht anlegen. Versuch es bitte gleich noch einmal oder schreib mir an info@pferdeliebehealthy.de.",
      },
      { status: 502 },
    );
  }

  const bezahlseite = await bezahlseiteAnlegen({
    bestellung: geprueft,
    nummer,
    email,
    seitenUrl: new URL(request.url).origin,
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

  return Response.json({ url: bezahlseite.url, nummer });
}
