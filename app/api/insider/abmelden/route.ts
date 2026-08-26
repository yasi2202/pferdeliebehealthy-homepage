import { kuerzen, istEingerichtet } from "@/lib/versand";
import { insiderAbmelden } from "@/lib/insider-versand";
import { KEKS_NAME } from "@/lib/insider-zugang";

// ---------------------------------------------------------------------------
// Meldet eine Adresse ab und löscht sie.
//
// Nur per POST, nie über einen einfachen Aufruf der Adresse: Manche
// Mailprogramme öffnen alle Links einer Mail automatisch zur Prüfung. Wäre
// das Abmelden ein GET, verschwände ein Teil des Verteilers von selbst.
// ---------------------------------------------------------------------------

export async function POST(request: Request) {
  if (!istEingerichtet()) {
    return Response.json({ ok: false }, { status: 503 });
  }

  let daten: Record<string, unknown>;
  try {
    daten = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const token = kuerzen(daten.token, 100);
  if (!token) return Response.json({ ok: false }, { status: 400 });

  const geklappt = await insiderAbmelden(token);
  if (!geklappt) {
    console.error("Insider-Abmeldung fehlgeschlagen.");
    return Response.json({ ok: false }, { status: 502 });
  }

  // Den Zugangs-Keks gleich mit entfernen: Ohne Eintrag in der Liste öffnet
  // er ohnehin nichts mehr, und ein Keks, der ins Leere zeigt, verwirrt nur.
  const antwort = Response.json({ ok: true });
  antwort.headers.append(
    "Set-Cookie",
    `${KEKS_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`
  );
  return antwort;
}
