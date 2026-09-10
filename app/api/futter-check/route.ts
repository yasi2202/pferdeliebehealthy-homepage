import { istEingerichtet, EMAIL_MUSTER, kuerzen } from "@/lib/versand";
import {
  speichereAnmeldung,
  sendeBestaetigungsMail,
  sendeErgebnisMail,
  sendeBenachrichtigung,
} from "@/lib/futter-check-server";
import { seitenUrl } from "@/lib/seo";

// ---------------------------------------------------------------------------
// Nimmt die Anmeldung aus dem Futter-Check entgegen.
//
// Ablauf:
//   1. Der Fragebogen schickt Name, E-Mail und das errechnete Ergebnis hierher.
//   2. Wir speichern das in der Datenbank — zunaechst als unbestaetigt.
//   3. Wir schicken eine Bestaetigungsmail mit einem Link.
//   4. Erst der Klick auf diesen Link macht die Adresse zu einer, an die
//      geworben werden darf. Das passiert in app/futter-check-bestaetigt,
//      und dort gibt es auch das Ergebnis.
//   5. Ist die Adresse schon bestaetigt (der Check wird wiederholt), geht
//      das neue Ergebnis sofort per Mail raus. Der Fragebogen zeigt seit
//      10.09.2026 kein Ergebnis mehr an, ohne diese Mail bekaeme sie nichts.
//
// Das Ergebnis wird bewusst vom Browser mitgeschickt statt hier noch einmal
// berechnet: die Auswertungslogik steht komplett im Fragebogen, und sie
// zweimal zu pflegen waere eine sichere Quelle fuer Abweichungen. Die Texte
// werden gekuerzt und beim Versand maskiert, damit ueber dieses Feld nichts
// in deine Mails geschmuggelt werden kann.
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
      "Futter-Check: SUPABASE_URL, SUPABASE_SECRET_KEY oder RESEND_API_KEY fehlt in den Vercel-Einstellungen."
    );
    return Response.json(
      {
        ok: false,
        fehler:
          "Die Anmeldung ist gerade nicht möglich. Schreib mir bitte kurz an info@pferdeliebehealthy.de, dann schicke ich dir dein Ergebnis von Hand.",
      },
      { status: 503 }
    );
  }

  // Woher sie kam, aus /futter-check-start?von=instagram. Gleiche Regel wie
  // beim Stall Organizer: nur Kleinbuchstaben, Ziffern, - und _.
  const quelle =
    kuerzen(daten.von, 40).toLowerCase().replace(/[^a-z0-9_-]/g, "") || null;

  // Die Antworten sind ein kleines Objekt. Alles, was deutlich groesser ist,
  // kommt nicht vom Fragebogen.
  const antworten =
    daten.antworten && JSON.stringify(daten.antworten).length <= 2000 ? daten.antworten : null;

  const anmeldung = await speichereAnmeldung({
    vorname,
    email,
    ergebnisTitel: kuerzen(daten.ergebnisTitel, 200),
    ergebnisText: kuerzen(daten.ergebnisText, 4000),
    antworten,
    quelle,
  });

  if (!anmeldung) {
    console.error("Futter-Check: Speichern in Supabase fehlgeschlagen.");
    return Response.json(
      {
        ok: false,
        fehler:
          "Das hat gerade nicht geklappt. Versuch es bitte gleich noch einmal oder schreib mir an info@pferdeliebehealthy.de.",
      },
      { status: 502 }
    );
  }

  if (!anmeldung.bestaetigt) {
    const basisUrl = new URL(request.url).origin;
    const verschickt = await sendeBestaetigungsMail(anmeldung, basisUrl);
    if (!verschickt) {
      console.error("Futter-Check: Bestaetigungsmail konnte nicht versendet werden.");
    }
  } else {
    // Schon bestaetigt: keine zweite Bestaetigung, das neue Ergebnis direkt.
    const verschickt = await sendeErgebnisMail(anmeldung, seitenUrl);
    if (!verschickt) {
      console.error("Futter-Check: Ergebnismail bei Wiederholung nicht versendet.");
    }
    await sendeBenachrichtigung(anmeldung, true);
  }

  return Response.json({ ok: true, schonBestaetigt: anmeldung.bestaetigt });
}
