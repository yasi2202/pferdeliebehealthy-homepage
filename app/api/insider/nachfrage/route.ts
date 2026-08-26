import { istEingerichtet } from "@/lib/versand";
import { aktuellerInsider } from "@/lib/insider-zugang";
import { istAdmin, nachfrageVersenden } from "@/lib/insider-versand";

// ---------------------------------------------------------------------------
// Schickt die einmalige Nachfrage an die aus alfima übernommenen Adressen,
// bei denen keine Bestätigung dokumentiert ist.
//
// Nur für Yasi, und nur einmal — der Vermerk in insider_versand verhindert
// den zweiten Klick.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  const angemeldet = await aktuellerInsider();
  if (!istAdmin(angemeldet)) {
    return Response.json({ ok: false, fehler: "Nicht erlaubt." }, { status: 403 });
  }

  if (!istEingerichtet()) {
    return Response.json(
      { ok: false, fehler: "Die Zugangsdaten fehlen in den Vercel-Einstellungen." },
      { status: 503 }
    );
  }

  const ergebnis = await nachfrageVersenden(new URL(request.url).origin);

  if (!ergebnis.ok) {
    return Response.json({ ok: false, fehler: ergebnis.text }, { status: 409 });
  }

  return Response.json({ ok: true, empfaenger: ergebnis.empfaenger });
}
