import { tagesberichtAufsHandy, telegramEingerichtet } from "@/lib/telegram";

// ---------------------------------------------------------------------------
// Die Übersicht am Abend, aufs Handy.
//
// ▸ WER SIE AUFRUFT
//   Vercel, einmal am Tag. Der Zeitplan steht in vercel.json als "0 18 * * *".
//   Vercel rechnet in UTC, das sind also 20 Uhr im Sommer und 19 Uhr im
//   Winter. Genauer geht es nicht, Vercel kennt keine Zeitzonen im Zeitplan.
//
// ▸ WARUM DER SCHLÜSSEL GEPRÜFT WIRD
//   Die Adresse ist öffentlich erreichbar. Ohne Prüfung könnte jeder sie
//   aufrufen und dir damit Nachrichten schicken. Vercel sendet bei jedem
//   Cron-Aufruf den Wert aus CRON_SECRET im Authorization-Kopf mit. Es ist
//   dieselbe Variable, die der Streckenlauf und die Bewertungsbitte schon
//   benutzen, es muss also nichts Neues angelegt werden.
//
// ▸ ZUM AUSPROBIEREN kannst du diese Adresse auch selbst aufrufen:
//     curl -H "Authorization: Bearer <CRON_SECRET>" \
//          https://www.pferdeliebehealthy.de/api/tagesbericht
//   Dann kommt die Übersicht sofort, unabhängig von der Uhrzeit.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const schluessel = process.env.CRON_SECRET;

  if (!schluessel) {
    console.error("CRON_SECRET fehlt, die Tagesübersicht ist gesperrt.");
    return Response.json({ fehler: "Nicht eingerichtet." }, { status: 503 });
  }

  const kopf = request.headers.get("authorization");
  if (kopf !== `Bearer ${schluessel}`) {
    return Response.json({ fehler: "Nicht erlaubt." }, { status: 401 });
  }

  if (!telegramEingerichtet()) {
    // Kein Fehler: Solange der Bot nicht eingerichtet ist, soll der tägliche
    // Lauf still bleiben und nicht jeden Abend im Protokoll Alarm schlagen.
    return Response.json({ ok: true, uebersprungen: "Telegram fehlt." });
  }

  const verschickt = await tagesberichtAufsHandy();

  if (!verschickt) {
    console.error("Die Tagesübersicht ging nicht raus.");
  }

  return Response.json({ ok: verschickt });
}
