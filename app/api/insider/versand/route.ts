import { kuerzen, istEingerichtet } from "@/lib/versand";
import { aktuellerInsider } from "@/lib/insider-zugang";
import { istAdmin, beitragVersenden } from "@/lib/insider-versand";
import { beitragLesen } from "@/lib/beitraege";

// ---------------------------------------------------------------------------
// Löst den Rundversand eines Beitrags aus.
//
// Nur für Yasi: Geprüft wird, wer über den Keks angemeldet ist und ob diese
// Adresse in der Admin-Liste steht. Ein fremder Aufruf bekommt dieselbe
// Antwort wie ein leerer — nämlich, dass es die Möglichkeit nicht gibt.
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

  let daten: Record<string, unknown>;
  try {
    daten = await request.json();
  } catch {
    return Response.json({ ok: false, fehler: "ungueltig" }, { status: 400 });
  }

  const slug = kuerzen(daten.slug, 120);
  const beitrag = beitragLesen(slug);
  if (!beitrag) {
    return Response.json({ ok: false, fehler: "Diesen Beitrag gibt es nicht." }, { status: 404 });
  }

  const ergebnis = await beitragVersenden(beitrag, new URL(request.url).origin);

  if (!ergebnis.ok) {
    return Response.json({ ok: false, fehler: ergebnis.text }, { status: 409 });
  }

  return Response.json({ ok: true, empfaenger: ergebnis.empfaenger });
}
