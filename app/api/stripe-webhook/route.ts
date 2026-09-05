import {
  alsBezahltMarkieren,
  bestellbestaetigungSenden,
  bestellungMeldenAnYasi,
  pruefeStripeUnterschrift,
} from "@/lib/shop-server";
import {
  digitalAlsBezahltMarkieren,
  nachDerZahlung,
  zahlungsdatenHolen,
} from "@/lib/digital-server";
import { bestellungAufsHandy } from "@/lib/telegram";

// ---------------------------------------------------------------------------
// Die Rückmeldung von Stripe: hier erfahren wir, dass wirklich bezahlt wurde.
//
// ▸ WARUM DAS SO SEIN MUSS: Nach der Bezahlung schickt Stripe die Kundin auf
//   /bestellung-danke. Diese Adresse kann aber jede Person auch direkt in den
//   Browser tippen. Aus „sie ist auf der Dankeseite" folgt deshalb NICHT
//   „sie hat bezahlt". Verlässlich ist nur diese Nachricht hier, weil Stripe
//   sie unterschreibt und wir die Unterschrift prüfen.
//
// ▸ EINRICHTEN, EINMALIG: Im Stripe-Konto unter Entwickler und dann Webhooks
//   einen Endpunkt anlegen auf
//       https://pferdeliebehealthy.de/api/stripe-webhook
//   und als Ereignis `checkout.session.completed` auswählen. Stripe zeigt
//   danach einen Schlüssel, der mit whsec_ beginnt. Der gehört in die
//   Vercel-Einstellungen als STRIPE_WEBHOOK_SECRET.
//
// ▸ Stripe wiederholt eine Nachricht, wenn sie nicht mit 200 beantwortet
//   wird. Damit dabei keine zweite Bestätigungsmail rausgeht, setzt
//   `alsBezahltMarkieren` den Zustand nur um, solange er noch „offen" ist,
//   und gibt beim zweiten Mal null zurück.
// ---------------------------------------------------------------------------

// node:crypto für die Unterschriftsprüfung.
export const runtime = "nodejs";

export async function POST(request: Request) {
  // Der Text muss unverändert bleiben: die Unterschrift gilt für genau diese
  // Zeichenfolge. Erst prüfen, dann als JSON lesen -- niemals umgekehrt.
  const koerper = await request.text();
  const unterschrift = request.headers.get("stripe-signature");

  if (!pruefeStripeUnterschrift(koerper, unterschrift)) {
    console.error("Stripe-Webhook: Unterschrift stimmt nicht.");
    return new Response("Unterschrift ungültig", { status: 400 });
  }

  let ereignis: { type?: string; data?: { object?: Record<string, unknown> } };

  try {
    ereignis = JSON.parse(koerper);
  } catch {
    return new Response("Ungültige Nachricht", { status: 400 });
  }

  // Alles andere quittieren wir freundlich, damit Stripe es nicht wiederholt.
  if (ereignis.type !== "checkout.session.completed") {
    return new Response("ok", { status: 200 });
  }

  const sitzung = ereignis.data?.object ?? {};
  const angaben = sitzung.metadata as Record<string, string> | undefined;
  const nummer =
    (sitzung.client_reference_id as string | undefined) ??
    angaben?.bestellnummer;

  if (!nummer) {
    console.error("Stripe-Webhook: Zahlung ohne Bestellnummer.", sitzung.id);
    return new Response("ok", { status: 200 });
  }

  // Zwei Sorten Kauf laufen über dieselbe Adresse. Digitale Käufe tragen
  // `art: "digital"` in den Angaben, die die Kasse bei Stripe hinterlegt hat.
  // Sie brauchen einen anderen Ablauf: kein Paket, dafür einen Zugang, der
  // sofort freigeschaltet werden muss. Alles Weitere in lib/digital-server.ts.
  if (angaben?.art === "digital") {
    if (sitzung.payment_status !== "paid") {
      console.warn(
        `Stripe-Webhook: ${nummer} ist noch nicht bezahlt (${String(sitzung.payment_status)}).`,
      );
      return new Response("ok", { status: 200 });
    }

    // Kunde und Zahlungsart mitnehmen, damit das Angebot nach dem Kauf mit
    // einem Klick angenommen werden kann. Klappt das Nachschlagen nicht,
    // geht der Kauf trotzdem durch, das Angebot fällt dann nur auf die
    // normale Bezahlseite zurück.
    const zahlung =
      typeof sitzung.id === "string"
        ? await zahlungsdatenHolen(sitzung.id)
        : { kunde: null, zahlungsart: null };

    const bestellung = await digitalAlsBezahltMarkieren(nummer, {
      kunde: zahlung.kunde,
      zahlungsart: zahlung.zahlungsart,
    });

    if (!bestellung) {
      // Entweder war sie schon bezahlt -- dann hat das Ein-Klick-Angebot sie
      // bereits abgeschlossen und alles ist erledigt -- oder die Nummer ist
      // unbekannt. Beides ist kein Grund für einen erneuten Versuch.
      console.warn(`Stripe-Webhook: ${nummer} war nicht mehr offen.`);
      return new Response("ok", { status: 200 });
    }

    await nachDerZahlung(bestellung);

    return new Response("ok", { status: 200 });
  }

  // Bei Zahlarten wie Klarna oder Lastschrift kann die Sitzung abgeschlossen
  // sein, bevor das Geld da ist. Dann warten wir auf die nächste Nachricht.
  if (sitzung.payment_status !== "paid") {
    console.warn(
      `Stripe-Webhook: ${nummer} ist noch nicht bezahlt (${String(sitzung.payment_status)}).`,
    );
    return new Response("ok", { status: 200 });
  }

  const bestellung = await alsBezahltMarkieren(nummer);

  if (!bestellung) {
    // Entweder war sie schon bezahlt (Stripe wiederholt) oder die Nummer ist
    // unbekannt. Beides ist kein Grund, Stripe erneut anklopfen zu lassen.
    console.warn(`Stripe-Webhook: ${nummer} war nicht mehr offen.`);
    return new Response("ok", { status: 200 });
  }

  // Die Mails sind wichtig, aber wenn eine hakt, darf die Bestellung
  // trotzdem als bezahlt gelten. Deshalb wird der Fehler nur protokolliert.
  const [anKundin, anYasi] = await Promise.all([
    bestellbestaetigungSenden(bestellung),
    bestellungMeldenAnYasi(bestellung),
    // Zusaetzlich aufs Handy, damit du vom Paket erfaehrst, ohne ins
    // Postfach zu schauen. Siehe lib/telegram.ts.
    bestellungAufsHandy(bestellung),
  ]);

  if (!anKundin) {
    console.error(`Bestellbestätigung für ${nummer} ging nicht raus.`);
  }

  if (!anYasi) {
    console.error(`Benachrichtigung über ${nummer} ging nicht raus.`);
  }

  return new Response("ok", { status: 200 });
}
