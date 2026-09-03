import { timingSafeEqual } from "node:crypto";
import { digitalFinden, funnelZu } from "@/lib/digital";
import { stripeEingerichtet } from "@/lib/shop-server";
import {
  bezahlseiteDigitalAnlegen,
  digitalAlsBezahltMarkieren,
  digitalErgaenzen,
  digitalLaden,
  digitalNummer,
  digitalSpeichern,
  nachDerZahlung,
  hatZugangSchon,
  upsellAbbuchen,
  zahlungsdatenHolen,
  zugriffToken,
} from "@/lib/digital-server";
import { supabase } from "@/lib/versand";

// ---------------------------------------------------------------------------
// Das Angebot nach dem Kauf, mit einem Klick angenommen.
//
// ▸ WIE DAS OHNE ERNEUTE KARTENEINGABE GEHT
//   Beim ersten Kauf wurde die Bezahlseite mit `setup_future_usage` angelegt,
//   Stripe hat die Zahlungsart der Kundin also gespeichert. Hier wird sie
//   damit ein zweites Mal belastet. Ihre Kartennummer sehen wir dabei nie,
//   wir nennen Stripe nur die Kennung der gespeicherten Zahlungsart.
//
// ▸ DASS DAS NICHT IMMER KLAPPT, IST NORMAL, KEIN FEHLER
//   Manche Banken verlangen auch bei einer gespeicherten Karte eine
//   Bestätigung durch die Kundin (3D Secure). Dann kommt "bestaetigen"
//   zurück, und wir schicken sie über die ganz normale Bezahlseite. Genauso
//   bei abgelehnter oder abgelaufener Karte. In beiden Fällen ist der Kauf
//   nicht verloren, er dauert nur zwei Klicks länger.
//
// ▸ WAS HIER MEHRFACH GEPRÜFT WIRD, UND WARUM
//   Wer diese Adresse aufruft, löst eine Abbuchung aus. Deshalb:
//     - Der Schlüssel aus der Adresszeile muss zur Bestellung passen. Eine
//       geratene Bestellnummer allein reicht nicht.
//     - Die Bestellung muss wirklich bezahlt sein.
//     - Es darf noch kein Angebot zu ihr angenommen worden sein. Sonst
//       könnte ein zweiter Aufruf ein zweites Mal abbuchen.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

/** Vergleicht zwei Schlüssel, ohne durch die Antwortzeit zu verraten, ab
 *  welchem Zeichen sie sich unterscheiden. */
function schluesselStimmt(a: string, b: string): boolean {
  const A = Buffer.from(a);
  const B = Buffer.from(b);
  return A.length === B.length && timingSafeEqual(A, B);
}

export async function POST(request: Request) {
  let daten: Record<string, unknown>;

  try {
    daten = await request.json();
  } catch {
    return Response.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const nummer = typeof daten.nummer === "string" ? daten.nummer.trim() : "";
  const token = typeof daten.token === "string" ? daten.token.trim() : "";

  if (!nummer || !token) {
    return Response.json({ fehler: "Angebot nicht gefunden." }, { status: 400 });
  }

  const kauf = await digitalLaden(nummer);

  if (!kauf || !schluesselStimmt(token, kauf.zugriff_token)) {
    return Response.json({ fehler: "Angebot nicht gefunden." }, { status: 404 });
  }

  // Welche Stufe wird angenommen? Der Upsell direkt nach dem Kauf, oder der
  // Downsell, der erscheint, wenn der Upsell abgelehnt wurde. Beide laufen
  // durch dieselbe Route, weil sich davor und danach nichts unterscheidet.
  const stufe: "upsell" | "downsell" =
    daten.stufe === "downsell" ? "downsell" : "upsell";

  const anschluss = funnelZu(kauf.artikel[0]?.slug ?? "");

  const angebotSlug =
    stufe === "upsell" ? anschluss?.upsell : anschluss?.downsell;

  const angebotPreis =
    stufe === "upsell" ? anschluss?.upsellPreis : anschluss?.downsellPreis;

  const produkt = angebotSlug ? digitalFinden(angebotSlug) : undefined;

  if (!anschluss || !produkt || angebotPreis === undefined) {
    return Response.json(
      { fehler: "Zu diesem Kauf gibt es kein Angebot." },
      { status: 404 },
    );
  }

  // ▸ EIN ANGEBOT DARF NICHT AUSSERHALB SEINER VERKAUFSZEIT LAUFEN.
  //   Die normale Kasse prueft `verkaufAb` und `verkaufBis`, dieser Weg hier
  //   ging bisher daran vorbei: Der Ein-Klick-Kauf bucht direkt ab, ohne noch
  //   einmal durch /api/digitalkasse zu gehen. Seit es ein befristetes
  //   Angebot gibt, waere das eine Luecke, durch die nach dem Stichtag noch
  //   Geld eingezogen wuerde. Und ein zulassungspflichtiger Lehrgang darf vor
  //   seinem Vertriebsbeginn auch hier nicht verkauft werden.
  const heute = new Date();

  if (produkt.verkaufAb && heute < new Date(`${produkt.verkaufAb}T00:00:00+02:00`)) {
    return Response.json(
      { fehler: "Dieses Angebot ist noch nicht buchbar." },
      { status: 403 },
    );
  }

  if (produkt.verkaufBis && heute > new Date(`${produkt.verkaufBis}T23:59:59+02:00`)) {
    return Response.json(
      { fehler: "Dieses Angebot ist ausgelaufen." },
      { status: 410 },
    );
  }

  // Wurde das Angebot schon einmal angenommen? Dann hier auf keinen Fall
  // erneut abbuchen.
  const res = await supabase(
    `digitalbestellungen?gehoert_zu=eq.${encodeURIComponent(nummer)}&select=nummer,status&limit=1`,
  );

  if (res.ok) {
    const vorhanden = await res.json();

    if (Array.isArray(vorhanden) && vorhanden.length > 0) {
      return Response.json(
        {
          ergebnis: "schon_gekauft",
          hinweis: "Du hast dieses Angebot bereits angenommen.",
        },
        { status: 200 },
      );
    }
  }

  // ▸ HAT SIE DAS SCHON? Dann nicht verkaufen.
  //   Die Seiten prüfen das bereits und zeigen das Angebot gar nicht erst
  //   an. Hier steht es trotzdem noch einmal, weil diese Adresse direkt
  //   aufgerufen werden kann und eine Abbuchung auslöst. Eine Route, die
  //   Geld bewegt, darf sich nicht darauf verlassen, dass die Seite davor
  //   schon nachgesehen hat.
  if (await hatZugangSchon(kauf.email, produkt.erwarteterZugang)) {
    return Response.json(
      {
        ergebnis: "schon_gekauft",
        hinweis: "Das hast du bereits, ich habe nichts abgebucht.",
      },
      { status: 200 },
    );
  }

  if (!stripeEingerichtet()) {
    return Response.json(
      { fehler: "Das Angebot ist gerade nicht verfügbar." },
      { status: 503 },
    );
  }

  // Zahlungsdaten besorgen. Sie stehen in der Bestellung, sobald die
  // Rückmeldung von Stripe da war. Ist sie es noch nicht -- und das ist der
  // Normalfall, die Kundin ist ja schneller hier als der Webhook --, fragen
  // wir Stripe direkt.
  let kunde = kauf.stripe_kunde ?? null;
  let zahlungsart = kauf.stripe_zahlungsart ?? null;
  let bezahlt = kauf.status === "bezahlt";

  if ((!kunde || !zahlungsart || !bezahlt) && kauf.stripe_sitzung) {
    const frisch = await zahlungsdatenHolen(kauf.stripe_sitzung);
    kunde = kunde ?? frisch.kunde;
    zahlungsart = zahlungsart ?? frisch.zahlungsart;
    bezahlt = bezahlt || frisch.bezahlt;
  }

  if (!bezahlt) {
    return Response.json(
      {
        fehler:
          "Deine Zahlung ist noch nicht bestätigt. Warte bitte einen Moment und lad die Seite neu.",
      },
      { status: 409 },
    );
  }

  // Ab hier wird gekauft. Erst die Bestellung anlegen, dann abbuchen: Geht
  // beim Abbuchen etwas schief, steht sie als "offen" da und du siehst, dass
  // es einen Versuch gab.
  const upsellNummer = digitalNummer();
  const upsellToken = zugriffToken();
  const jetzt = new Date().toISOString();
  const seitenUrl = new URL(request.url).origin;

  const bestellung = {
    nummer: upsellNummer,
    status: "offen" as const,
    art: "upsell" as const,
    gehoert_zu: nummer,
    email: kauf.email,
    vorname: kauf.vorname,
    // Anschrift aus dem ersten Kauf. Sie noch einmal abzufragen wäre auf
    // einer Angebotsseite absurd, und für die Rechnung ist es dieselbe.
    nachname: kauf.nachname,
    strasse: kauf.strasse,
    plz: kauf.plz,
    ort: kauf.ort,
    land: kauf.land,
    artikel: [
      {
        slug: produkt.slug,
        name: produkt.name,
        preis: angebotPreis,
        mwst: produkt.mwst,
      },
    ],
    gesamt: angebotPreis,
    // Die Zustimmung zum sofortigen Zugang gilt auch hier: Sie steht auf der
    // Angebotsseite unmittelbar über dem Bestellknopf.
    widerruf_verzicht: true,
    widerruf_verzicht_am: jetzt,
    // Beim Newsletter zählt, was beim ersten Kauf gewählt wurde. Ein zweites
    // Häkchen im Angebot wäre nur eine weitere Hürde.
    newsletter: false,
    zugriff_token: upsellToken,
    stripe_sitzung: null,
  };

  if (!(await digitalSpeichern(bestellung))) {
    return Response.json(
      { fehler: "Das Angebot liess sich gerade nicht anlegen." },
      { status: 502 },
    );
  }

  // Der Ein-Klick-Weg. Nur möglich, wenn beim ersten Kauf wirklich eine
  // Zahlungsart gespeichert wurde.
  if (kunde && zahlungsart) {
    const abbuchung = await upsellAbbuchen({
      kunde,
      zahlungsart,
      preis: angebotPreis,
      produkt,
      nummer: upsellNummer,
    });

    if (abbuchung.ergebnis === "bezahlt") {
      const bezahlteBestellung = await digitalAlsBezahltMarkieren(upsellNummer, {
        kunde,
        zahlungsart,
      });

      if (bezahlteBestellung) {
        await nachDerZahlung(bezahlteBestellung);
      }

      return Response.json({ ergebnis: "bezahlt", nummer: upsellNummer });
    }
  }

  // Der Rückfallweg: die normale Bezahlseite. Von dort meldet sich Stripe
  // wie bei jedem anderen Kauf, und app/api/stripe-webhook schaltet frei.
  const bezahlseite = await bezahlseiteDigitalAnlegen({
    produkt,
    preis: angebotPreis,
    nummer: upsellNummer,
    token: upsellToken,
    email: kauf.email,
    seitenUrl,
    // Ein zweites Mal merken wäre sinnlos, danach kommt kein Angebot mehr.
    zahlungsartMerken: false,
    weiterNach: `${seitenUrl}/danke/${upsellNummer}?t=${upsellToken}`,
  });

  if ("fehler" in bezahlseite) {
    return Response.json(
      { fehler: "Die Bezahlung liess sich nicht öffnen." },
      { status: 502 },
    );
  }

  await digitalErgaenzen(upsellNummer, { stripe_sitzung: bezahlseite.sitzung });

  return Response.json({ ergebnis: "bezahlseite", url: bezahlseite.url });
}
