import { istEingerichtet, EMAIL_MUSTER, kuerzen } from "@/lib/versand";
import { webinarAnmelden, sendeAnmeldemail } from "@/lib/webinar-server";
import { istGueltigerTermin } from "@/lib/webinar";

// ---------------------------------------------------------------------------
// Nimmt die Anmeldung zum kostenlosen Webinar entgegen.
//
// Anders als beim Insider-Kanal gibt es keine getrennte Bestaetigungsmail:
// Die Anmeldemail traegt den Zugangslink, und der Klick darauf ist der Beleg,
// dass die Adresse der Person gehoert.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let daten: Record<string, unknown>;
  try {
    daten = await request.json();
  } catch {
    return Response.json({ ok: false, fehler: "ungueltig" }, { status: 400 });
  }

  // Honigtopf, wie bei den anderen Formularen: unsichtbares Feld, das nur
  // Spam-Skripte ausfuellen. Wir tun so, als haette es geklappt.
  if (kuerzen(daten.webseite, 100) !== "") {
    return Response.json({ ok: true });
  }

  const vorname = kuerzen(daten.vorname, 60);
  const email = kuerzen(daten.email, 200).toLowerCase();
  const terminRoh = kuerzen(daten.termin, 40);
  const quelle = kuerzen(daten.quelle, 60) || "website";

  if (vorname.length < 2) {
    return Response.json(
      { ok: false, fehler: "Bitte trag deinen Vornamen ein." },
      { status: 400 }
    );
  }
  if (!EMAIL_MUSTER.test(email)) {
    return Response.json(
      { ok: false, fehler: "Diese E-Mail-Adresse sieht nicht vollständig aus." },
      { status: 400 }
    );
  }

  const termin = new Date(terminRoh);
  if (Number.isNaN(termin.getTime()) || !istGueltigerTermin(termin)) {
    return Response.json(
      { ok: false, fehler: "Bitte wähle einen Termin aus." },
      { status: 400 }
    );
  }

  if (!istEingerichtet()) {
    // Ohne Zugangsdaten waere die Anmeldung ins Leere gelaufen. Lieber ehrlich
    // sagen, dass es gerade nicht geht, als so tun, als sei sie angekommen.
    return Response.json(
      { ok: false, fehler: "Die Anmeldung ist gerade nicht möglich. Bitte schreib mir kurz eine Mail." },
      { status: 503 }
    );
  }

  const ergebnis = await webinarAnmelden({
    vorname,
    email,
    termin,
    quelle,
    einwilligungText:
      "Ja, schick mir den Zugangslink zum kostenlosen Webinar und eine Erinnerung " +
      "vor dem Termin. Ich kann mich jederzeit abmelden.",
  });

  if (!ergebnis.ok) {
    return Response.json({ ok: false, fehler: ergebnis.fehler }, { status: 400 });
  }

  // Auch bei einer zweiten Anmeldung fuer denselben Termin geht die Mail
  // erneut raus: Meist ist die erste im Spam gelandet, und genau deshalb
  // traegt sich jemand ein zweites Mal ein.
  try {
    await sendeAnmeldemail(ergebnis.anmeldung);
  } catch {
    // Gespeichert ist sie. Dass die Mail haengt, darf die Anmeldung nicht
    // scheitern lassen — der Zugangslink steht auch auf der Dankeseite.
  }

  return Response.json({
    ok: true,
    token: ergebnis.anmeldung.token,
    schonDa: ergebnis.schonDa,
  });
}
