import { unterschriftStimmt, bestaetigeOelGuide, meldeNeueAnmeldung, holeGuide } from "@/lib/oel-guide-server";

// ---------------------------------------------------------------------------
// Gibt den Öl-Guide heraus, wenn die Unterschrift im Link stimmt.
//
// Aufruf: /api/oel-guide/datei?e=<adresse>&p=<unterschrift>
// Die Besucherin kommt nie direkt hierher. Der Link in der Mail zeigt auf
// aromahorseoil-homepage.vercel.app/oel-guide/laden, und diese Adresse holt
// die Datei von hier und reicht sie durch.
//
// Der erste Abruf bestätigt die Adresse (Double-Opt-in), siehe
// lib/oel-guide-server.ts.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const email = (url.searchParams.get("e") ?? "").trim().toLowerCase();
  const p = url.searchParams.get("p") ?? "";

  if (!email || !unterschriftStimmt(email, p)) {
    return new Response("Dieser Link stimmt nicht.", { status: 403 });
  }

  // Fehlt die Tabelle oder die Zeile, gibt es trotzdem den Guide.
  const bestaetigung = await bestaetigeOelGuide(email);
  if (bestaetigung?.frisch) {
    await meldeNeueAnmeldung(email, bestaetigung.vorname);
  }

  const pdf = await holeGuide();
  if (!pdf) {
    return new Response("Der Guide ist gerade nicht erreichbar.", { status: 502 });
  }

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="aromahorseoil-oel-guide.pdf"',
      "Cache-Control": "private, no-store",
      "X-Robots-Tag": "noindex",
    },
  });
}
// ENDE DER DATEI
