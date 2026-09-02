import { istEingerichtet } from "@/lib/versand";
import { aktuellerInsider } from "@/lib/insider-zugang";
import { istAdmin, bewertungsbitteRundmail } from "@/lib/insider-versand";

// ---------------------------------------------------------------------------
// Schickt die einmalige Bitte um eine Google-Bewertung an den Verteiler.
//
// Nur für Yasi, und nur einmal — der Vermerk in insider_versand verhindert
// den zweiten Aufruf.
//
// ▸ SIE GEHT NUR AN BESTÄTIGTE ADRESSEN. Die Frage nach der Zufriedenheit
//   ist Werbung (BGH VI ZR 225/17) und braucht eine Einwilligung. Bestätigt
//   heißt: Die Person hat auf einen Bestätigungslink geklickt, und das ist
//   dokumentiert.
// ---------------------------------------------------------------------------

// Wie bei der Nachfrage: Über tausend Adressen gehen in Bündeln raus, mit
// Pause dazwischen. Die üblichen zehn Sekunden reichen dafür nicht.
export const maxDuration = 60;

export async function POST(request: Request) {
  const angemeldet = await aktuellerInsider();

  if (!istAdmin(angemeldet)) {
    return Response.json({ ok: false, fehler: "Nicht erlaubt." }, { status: 403 });
  }

  if (!istEingerichtet()) {
    return Response.json(
      { ok: false, fehler: "Die Zugangsdaten fehlen in den Vercel-Einstellungen." },
      { status: 503 },
    );
  }

  const ergebnis = await bewertungsbitteRundmail(new URL(request.url).origin);

  if (!ergebnis.ok) {
    return Response.json({ ok: false, fehler: ergebnis.text }, { status: 409 });
  }

  return Response.json({
    ok: true,
    empfaenger: ergebnis.empfaenger,
    uebersprungen: ergebnis.uebersprungen,
  });
}
