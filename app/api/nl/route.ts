import {
  unterschriftStimmt,
  klickUnterschrift,
  ereignisSpeichern,
} from "@/lib/newsletter-server";

// ---------------------------------------------------------------------------
// Die Zählstelle des Newsletters: Öffnungen und Klicks.
//
// ▸ ZWEI AUFGABEN IN EINER ADRESSE:
//   Ohne `z` ist es das Zählpixel am Ende der Mail — lädt das Postfach es,
//   war die Mail offen. Mit `z` ist es ein Klick: Der Klick wird vermerkt
//   und die Leserin sofort weitergeleitet.
//
// ▸ SIE DARF NIEMALS IM WEG STEHEN. Ist etwas an der Zählung kaputt, wird
//   trotzdem weitergeleitet und trotzdem ein Bildpunkt ausgeliefert. Eine
//   Messung ist es nicht wert, dass jemand vor einer Fehlerseite steht.
//
// ▸ WARUM DAS ZIEL UNTERSCHRIEBEN SEIN MUSS:
//   Ohne diese Prüfung wäre das hier eine offene Weiterleitung — jeder
//   könnte einen Link bauen, der auf pferdeliebehealthy.de beginnt und
//   irgendwo endet. Genau damit werden Newsletter-Domains für Betrugsmails
//   missbraucht, und die Domain verliert ihren guten Ruf bei den
//   Postfächern. Stimmt die Unterschrift nicht, wird nicht weitergeleitet.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Ein durchsichtiger Bildpunkt, 1 × 1 Pixel. */
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);

function pixelAusliefern() {
  return new Response(new Uint8Array(PIXEL), {
    headers: {
      "Content-Type": "image/gif",
      // Kein Zwischenspeicher: Sonst zählt ein Postfach, das das Bild
      // aufbewahrt, die zweite Öffnung nicht mehr.
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
      "Content-Length": String(PIXEL.length),
    },
  });
}

export async function GET(request: Request) {
  const u = new URL(request.url);

  const briefId = u.searchParams.get("b") ?? "";
  const email = u.searchParams.get("e") ?? "";
  const ziel = u.searchParams.get("z");

  // ---- Ein Klick
  if (ziel) {
    const unterschriftGegeben = u.searchParams.get("s") ?? "";
    const echt =
      unterschriftGegeben === klickUnterschrift(email, ziel) &&
      /^https?:\/\//i.test(ziel);

    if (!echt) {
      // Nicht weiterleiten. Wer hier landet, hat einen umgebauten Link —
      // oder einen aus einer Zeit vor einem Schlüsselwechsel.
      return Response.redirect(new URL("/", u.origin), 302);
    }

    if (briefId && email) {
      try {
        await ereignisSpeichern(briefId, email, "geklickt", ziel);
      } catch (fehler) {
        // Bewusst verschluckt: Die Leserin will zu ihrem Ziel, nicht zu
        // einer Fehlermeldung über eine Statistik.
        console.error("Newsletter-Klick nicht vermerkt:", fehler);
      }
    }

    return Response.redirect(ziel, 302);
  }

  // ---- Eine Öffnung
  const p = u.searchParams.get("p") ?? "";

  if (briefId && email && unterschriftStimmt(email, p)) {
    try {
      await ereignisSpeichern(briefId, email, "geoeffnet");
    } catch (fehler) {
      console.error("Newsletter-Öffnung nicht vermerkt:", fehler);
    }
  }

  return pixelAusliefern();
}
