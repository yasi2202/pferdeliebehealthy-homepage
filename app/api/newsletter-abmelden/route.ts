import { unterschriftStimmt, newsletterAbmelden } from "@/lib/newsletter-server";

// ---------------------------------------------------------------------------
// Der Abmeldeknopf, den Gmail und Outlook oben in der Mail anzeigen.
//
// ▸ POST: Das Postfach meldet ab, ohne dass die Leserin etwas sieht. Es
//   erwartet eine kurze Bestätigung, keine Seite. Nach dem Standard
//   RFC 8058 darf hier keine Rückfrage kommen — ein Klick, erledigt.
//
// ▸ GET: Kommt vor, wenn jemand die Adresse doch im Browser öffnet. Dann
//   geht es auf die richtige Seite mit der Rückfrage weiter.
//
// ▸ ES WIRD IMMER MIT ok GEANTWORTET, auch wenn die Unterschrift nicht
//   stimmt. Ein Postfach, das hier einen Fehler bekommt, zeigt der Leserin
//   „Abmelden nicht möglich" — und sie drückt dann auf Spam. Was wirklich
//   passiert ist, steht in den Vercel-Protokollen.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function abmelden(request: Request): Promise<boolean> {
  const u = new URL(request.url);
  const email = u.searchParams.get("e") ?? "";
  const p = u.searchParams.get("p") ?? "";

  if (!email || !unterschriftStimmt(email, p)) {
    console.warn("Newsletter-Abmeldung mit falscher Unterschrift:", email);
    return false;
  }

  return newsletterAbmelden(email, "link");
}

export async function POST(request: Request) {
  await abmelden(request);
  return new Response("ok", { status: 200 });
}

export async function GET(request: Request) {
  const u = new URL(request.url);
  const ziel = new URL("/newsletter-abmelden", u.origin);
  ziel.search = u.search;

  return Response.redirect(ziel, 302);
}
