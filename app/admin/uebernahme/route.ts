import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  KEKS_NAME,
  KEKS_OPTIONEN,
  adminEingerichtet,
  keksBauen,
} from "@/lib/admin-zugang";
import { sicheresZiel, zettelStimmt } from "@/lib/admin-uebernahme";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Ankunft aus der Akademie.
//
// Die Verwaltung der Akademie schickt hierher, wenn dort auf einen Punkt unter
// "Homepage" geklickt wird. Wer einen gültigen Zettel mitbringt, bekommt den
// Keks dieses Bereichs und wird weitergeleitet, ohne das Passwort einzugeben.
// Warum das sicher genug ist, steht in lib/admin-uebernahme.ts.
//
// Stimmt etwas nicht, landet man auf der gewöhnlichen Anmeldung. Keine
// Fehlermeldung, keine Erklärung: Wer hier ohne gültigen Zettel ankommt, soll
// nichts darüber erfahren, wie der Zettel aussehen müsste.
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const adresse = new URL(request.url);
  const ziel = sicheresZiel(adresse.searchParams.get("weiter"));
  const zettel = adresse.searchParams.get("t");

  if (!adminEingerichtet() || !zettelStimmt(zettel, ziel)) {
    return NextResponse.redirect(new URL("/admin", adresse.origin));
  }

  const keks = await cookies();
  keks.set(KEKS_NAME, keksBauen(), KEKS_OPTIONEN);

  return NextResponse.redirect(new URL(ziel, adresse.origin));
}
// ENDE DER DATEI
