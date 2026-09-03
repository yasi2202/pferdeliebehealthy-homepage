import { aktuellerInsider } from "@/lib/insider-zugang";
import { istAdmin, bewertungsbitteVorschau } from "@/lib/insider-versand";

// ---------------------------------------------------------------------------
// Die Bewertungsbitte ansehen, bevor sie rausgeht.
//
// ▸ WARUM ES DAS BRAUCHT
//   Ein Rundversand an einen ganzen Verteiler laesst sich nicht
//   zurueckholen. Wer nicht sehen kann, was verschickt wird, drueckt
//   entweder nie auf den Knopf oder einmal zu schnell. Beides ist schlecht.
//
// ▸ SIE ZEIGT DIE ECHTE MAIL, nicht eine nachgebaute Fassung. Der Text kommt
//   aus derselben Funktion, die auch verschickt, mit einem Beispielnamen und
//   einem Beispiel-Abmeldelink. Was hier steht, geht auch raus.
//
// ▸ NUR FUER YASI, wie der Versand selbst.
// ---------------------------------------------------------------------------

export async function GET(request: Request) {
  const angemeldet = await aktuellerInsider();

  if (!istAdmin(angemeldet)) {
    return new Response("Nicht erlaubt.", { status: 403 });
  }

  const html = bewertungsbitteVorschau(new URL(request.url).origin);

  return new Response(html, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
