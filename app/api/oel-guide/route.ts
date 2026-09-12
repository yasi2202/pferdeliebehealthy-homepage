import { istEingerichtet, EMAIL_MUSTER, kuerzen, ANTWORT_AN } from "@/lib/versand";
import { speichereOelGuide, sendeGuideMail } from "@/lib/oel-guide-server";

// ---------------------------------------------------------------------------
// Nimmt die Anmeldung zum Öl-Guide von aromahorseoil entgegen.
//
// Aufgerufen wird die Adresse von Server zu Server, vom Formular auf
// aromahorseoil-homepage.vercel.app/oel-guide. Ablauf und Begründung stehen in
// lib/oel-guide-server.ts.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  let daten: Record<string, unknown>;
  try {
    daten = await request.json();
  } catch {
    return Response.json({ ok: false, fehler: "ungueltig" }, { status: 400 });
  }

  // Honigtopf wie beim Insider-Kanal: Menschen lassen das unsichtbare Feld leer.
  if (kuerzen(daten.webseite, 100) !== "") {
    return Response.json({ ok: true });
  }

  const email = kuerzen(daten.email, 200).toLowerCase();
  const vorname = kuerzen(daten.vorname, 60);
  const quelle = kuerzen(daten.quelle, 40).toLowerCase().replace(/[^a-z0-9_-]/g, "") || "aromahorseoil";

  if (!EMAIL_MUSTER.test(email)) {
    return Response.json(
      { ok: false, fehler: "Diese E-Mail-Adresse sieht nicht vollständig aus." },
      { status: 400 },
    );
  }

  // Ohne Häkchen kein Guide, so wie beim Stall Organizer entschieden.
  if (daten.einwilligung !== true) {
    return Response.json(
      { ok: false, fehler: "Bitte setz das Häkchen, sonst darf ich dir den Guide nicht schicken." },
      { status: 400 },
    );
  }

  if (!istEingerichtet()) {
    console.error("Öl-Guide: SUPABASE_URL, SUPABASE_SECRET_KEY oder RESEND_API_KEY fehlt.");
    return Response.json(
      { ok: false, fehler: `Das geht gerade nicht. Schreib mir bitte kurz an ${ANTWORT_AN}.` },
      { status: 503 },
    );
  }

  // Scheitert das Speichern, bekommt sie den Guide trotzdem: Der Link braucht
  // die Tabelle nicht. Die Adresse fehlt dann aber in der Liste.
  const gespeichert = await speichereOelGuide(email, vorname, quelle);
  if (!gespeichert) {
    console.error("Öl-Guide: Speichern ging nicht. Ist datenbank/oel-guide-anmeldungen.sql eingespielt?");
  }

  const verschickt = await sendeGuideMail(email, vorname);
  if (!verschickt) {
    return Response.json(
      {
        ok: false,
        fehler: `Die Mail ging gerade nicht raus. Versuch es bitte gleich noch einmal oder schreib mir an ${ANTWORT_AN}.`,
      },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
// ENDE DER DATEI
