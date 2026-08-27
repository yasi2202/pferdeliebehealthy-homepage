import { istEingerichtet } from "@/lib/versand";
import { aktuellerInsider } from "@/lib/insider-zugang";
import { istAdmin, einladungVersenden } from "@/lib/insider-versand";

// ---------------------------------------------------------------------------
// Löst die einmalige Einladung an die Bestandskundinnen aus.
//
// Gleiche Absicherung wie beim Beitragsversand: Nur wer als Yasi angemeldet
// ist, kommt hier durch. Ein fremder Aufruf bekommt dieselbe Antwort wie ein
// leerer.
// ---------------------------------------------------------------------------

// Über tausend Adressen gehen in elf Bündeln raus, mit kurzer Pause
// dazwischen. Die üblichen zehn Sekunden reichen dafür nicht — ohne diese
// Zeile bricht Vercel mittendrin ab, und der Browser meldet nur, dass er den
// Server nicht erreicht.
export const maxDuration = 60;

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

  const ergebnis = await einladungVersenden(new URL(request.url).origin);

  if (!ergebnis.ok) {
    return Response.json({ ok: false, fehler: ergebnis.text }, { status: 409 });
  }

  return Response.json({
    ok: true,
    empfaenger: ergebnis.empfaenger,
    uebersprungen: ergebnis.uebersprungen,
  });
}
