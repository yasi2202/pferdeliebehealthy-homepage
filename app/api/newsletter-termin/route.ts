import { terminLauf } from "@/lib/newsletter-server";
import { seitenUrl } from "@/lib/seo";

// ---------------------------------------------------------------------------
// Der Terminversand: schickt Newsletter, deren Zeitpunkt erreicht ist.
//
// ▸ WER IHN AUFRUFT
//   Vercel, alle fünf Minuten. Der Zeitplan steht in vercel.json als
//   „*/5 * * * *". Die fünf Minuten sind die Genauigkeit des Ganzen: Ein auf
//   18 Uhr geplanter Brief geht zwischen 18:00 und 18:05 raus.
//
// ▸ ZEITZONEN SIND HIER KEIN THEMA, anders als beim Streckenlauf. Der Cron
//   sagt nur „sieh nach", die Entscheidung trifft der Vergleich in der
//   Datenbank, und der rechnet mit echten Zeitstempeln samt Zeitzone. Ein
//   Termin, der im Adminbereich als 18 Uhr eingegeben wurde, ist 18 Uhr
//   deutscher Zeit, im Sommer wie im Winter.
//
// ▸ WARUM DER SCHLÜSSEL GEPRÜFT WIRD
//   Die Adresse ist öffentlich erreichbar. Ohne Prüfung könnte jeder sie
//   aufrufen. Zwar geht auch dann nur raus, was ohnehin fällig ist — aber
//   eine offene Adresse, die einen Versand an tausende Menschen auslösen
//   kann, gehört verschlossen. Vercel schickt bei jedem Cron-Aufruf den Wert
//   aus CRON_SECRET im Authorization-Kopf mit, dieselbe Variable wie bei der
//   Bewertungsbitte und beim Streckenlauf.
//
// ▸ WAS PASSIERT, WENN EIN LAUF AUSFÄLLT
//   Nichts geht verloren. Ein geplanter Brief bleibt fällig, bis er raus
//   ist, und wird beim nächsten Lauf verschickt — dann eben ein paar Minuten
//   später als geplant.
//
// ▸ MAXDURATION: Der Versand läuft in Bündeln zu hundert mit Pause. Bei
//   2.300 Adressen sind das gut zwanzig Sekunden, ohne diese Zeile bräche
//   Vercel nach zehn ab.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const schluessel = process.env.CRON_SECRET;

  if (!schluessel) {
    console.error("CRON_SECRET fehlt — der Terminversand ist gesperrt.");
    return Response.json({ fehler: "Nicht eingerichtet." }, { status: 503 });
  }

  const kopf = request.headers.get("authorization");
  if (kopf !== `Bearer ${schluessel}`) {
    return Response.json({ fehler: "Nicht erlaubt." }, { status: 401 });
  }

  const ergebnisse = await terminLauf(seitenUrl);

  if (ergebnisse.length > 0) {
    console.log("Terminversand:", ergebnisse);
  }

  return Response.json({ ok: true, anzahl: ergebnisse.length, ergebnisse });
}
