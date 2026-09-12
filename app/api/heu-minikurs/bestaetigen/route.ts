import { EMAIL_MUSTER } from "@/lib/versand";
import { bestaetigeAnmeldung, meldeNeueAnmeldung, unterschriftStimmt } from "@/lib/heu-minikurs-server";

// ---------------------------------------------------------------------------
// Der Klick auf „Ja, ich bin dabei“ in der Bestätigungsmail.
//
// Prüft die Unterschrift, setzt die Bestätigung und leitet auf die Dankeseite.
// Ab dann findet die Strecke „Minikurs Heu 2026“ die Adresse. Ein falscher
// oder abgeschnittener Link führt zurück auf die Anmeldeseite.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const adresse = new URL(request.url);
  const email = (adresse.searchParams.get("e") || "").trim().toLowerCase();
  const p = adresse.searchParams.get("p") || "";

  if (!EMAIL_MUSTER.test(email) || !unterschriftStimmt(email, p)) {
    return Response.redirect(new URL("/heu-2026", adresse), 303);
  }

  const ergebnis = await bestaetigeAnmeldung(email);
  if (!ergebnis) {
    // Keine Zeile gefunden oder Speichern gescheitert. Die Dankeseite kommt
    // trotzdem, der Fehler gehört ins Protokoll, nicht vor die Besucherin.
    console.error("Minikurs Heu: Bestätigung ging nicht. Ist datenbank/heu-minikurs.sql eingespielt?");
  } else if (ergebnis.frisch) {
    await meldeNeueAnmeldung(email, ergebnis.vorname);
  }

  return Response.redirect(new URL("/heu-2026/dabei", adresse), 303);
}
// ENDE DER DATEI
