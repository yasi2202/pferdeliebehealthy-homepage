import { istEingerichtet, EMAIL_MUSTER, kuerzen, ANTWORT_AN } from "@/lib/versand";
import { speichereInsider, sendeInsiderBestaetigung } from "@/lib/insider-server";

// ---------------------------------------------------------------------------
// Nimmt die Anmeldung für den Insider-Kanal entgegen.
//
// Gleicher Ablauf wie beim Futter-Check: speichern als unbestaetigt, dann
// eine Bestaetigungsmail. Erst der Klick auf den Link darin macht die Adresse
// zu einer, an die geworben werden darf — das passiert in
// app/insider-bestaetigt.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  let daten: Record<string, unknown>;
  try {
    daten = await request.json();
  } catch {
    return Response.json({ ok: false, fehler: "ungueltig" }, { status: 400 });
  }

  // Honigtopf: ein im Browser unsichtbares Feld. Menschen lassen es leer,
  // automatische Spam-Skripte fuellen stur alles aus. Wir tun so, als haette
  // es geklappt — sonst lernt das Skript, es beim naechsten Mal wegzulassen.
  if (kuerzen(daten.webseite, 100) !== "") {
    return Response.json({ ok: true });
  }

  const vorname = kuerzen(daten.vorname, 60);
  const email = kuerzen(daten.email, 200).toLowerCase();
  const quelle = kuerzen(daten.quelle, 60) || "insider";

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

  if (!istEingerichtet()) {
    // Kein stiller Fehlschlag: stuende hier ein "hat geklappt", wuerde sich
    // die Interessentin auf eine Mail verlassen, die nie ankommt.
    console.error(
      "Insider: SUPABASE_URL, SUPABASE_SECRET_KEY oder RESEND_API_KEY fehlt in den Vercel-Einstellungen."
    );
    return Response.json(
      {
        ok: false,
        fehler: `Die Anmeldung ist gerade nicht möglich. Schreib mir bitte kurz an ${ANTWORT_AN}.`,
      },
      { status: 503 }
    );
  }

  const anmeldung = await speichereInsider(vorname, email, quelle);

  if (!anmeldung) {
    console.error("Insider: Speichern in Supabase fehlgeschlagen.");
    return Response.json(
      {
        ok: false,
        fehler: `Das hat gerade nicht geklappt. Versuch es bitte gleich noch einmal oder schreib mir an ${ANTWORT_AN}.`,
      },
      { status: 502 }
    );
  }

  // Wer schon bestaetigt hat, bekommt keine zweite Bestaetigungsmail — das
  // waere unnoetig und wirkt wie ein Fehler.
  if (!anmeldung.bestaetigt) {
    const basisUrl = new URL(request.url).origin;
    const verschickt = await sendeInsiderBestaetigung(anmeldung, basisUrl);
    if (!verschickt) {
      console.error("Insider: Bestaetigungsmail konnte nicht versendet werden.");
    }
  }

  return Response.json({ ok: true, schonBestaetigt: anmeldung.bestaetigt });
}
