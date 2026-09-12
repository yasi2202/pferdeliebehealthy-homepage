import { istEingerichtet, EMAIL_MUSTER, kuerzen, ANTWORT_AN } from "@/lib/versand";
import { speichereAnmeldung, sendeBestaetigungsMail } from "@/lib/heu-minikurs-server";

// ---------------------------------------------------------------------------
// Nimmt die Anmeldung zum Minikurs Heu 2026 entgegen (Formular auf /heu-2026).
// Ablauf und Begründung stehen in lib/heu-minikurs-server.ts.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  let daten: Record<string, unknown>;
  try {
    daten = await request.json();
  } catch {
    return Response.json({ ok: false, fehler: "Die Anmeldung kam nicht vollständig an." }, { status: 400 });
  }

  // Honigtopf wie beim Insider-Kanal: Menschen lassen das unsichtbare Feld leer.
  if (kuerzen(daten.webseite, 100) !== "") {
    return Response.json({ ok: true });
  }

  const email = kuerzen(daten.email, 200).toLowerCase();
  const vorname = kuerzen(daten.vorname, 60);
  const quelle = kuerzen(daten.quelle, 40).toLowerCase().replace(/[^a-z0-9_-]/g, "") || "website";

  if (!EMAIL_MUSTER.test(email)) {
    return Response.json(
      { ok: false, fehler: "Diese E-Mail-Adresse sieht nicht vollständig aus." },
      { status: 400 },
    );
  }

  if (daten.einwilligung !== true) {
    return Response.json(
      { ok: false, fehler: "Bitte setz das Häkchen, sonst darf ich dir den Minikurs nicht schicken." },
      { status: 400 },
    );
  }

  if (!istEingerichtet()) {
    console.error("Minikurs Heu: SUPABASE_URL, SUPABASE_SECRET_KEY oder RESEND_API_KEY fehlt.");
    return Response.json(
      { ok: false, fehler: `Das geht gerade nicht. Schreib mir bitte kurz an ${ANTWORT_AN}.` },
      { status: 503 },
    );
  }

  // Ohne gespeicherte Zeile findet die Strecke sie später nicht. Die
  // Bestätigungsmail geht trotzdem raus, damit die Besucherin nicht vor einer
  // Fehlermeldung sitzt; der Fehler steht im Vercel-Protokoll.
  const gespeichert = await speichereAnmeldung(email, vorname, quelle);
  if (!gespeichert) {
    console.error("Minikurs Heu: Speichern ging nicht. Ist datenbank/heu-minikurs.sql eingespielt?");
  }

  const verschickt = await sendeBestaetigungsMail(email, vorname);
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
