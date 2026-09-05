import { streckenLauf } from "@/lib/newsletter-strecken";
import { alteEreignisseLoeschen } from "@/lib/newsletter-server";
import { seitenUrl } from "@/lib/seo";

// ---------------------------------------------------------------------------
// Der tägliche Lauf der Mailstrecken.
//
// ▸ WER IHN AUFRUFT
//   Vercel, einmal am Tag. Der Zeitplan steht in vercel.json als „0 8 * * *".
//   Vercel rechnet in UTC, das sind also 10 Uhr im Sommer und 9 Uhr im
//   Winter. Genauer geht es nicht, Vercel kennt keine Zeitzonen im Zeitplan.
//
// ▸ WARUM DER SCHLÜSSEL GEPRÜFT WIRD
//   Die Adresse ist öffentlich erreichbar. Ohne Prüfung könnte jeder sie
//   aufrufen und damit Mails auslösen. Vercel schickt bei jedem Cron-Aufruf
//   den Wert aus CRON_SECRET im Authorization-Kopf mit.
//
//   ▸ CRON_SECRET MUSS BEI VERCEL GESETZT SEIN. Ist die Variable leer, lehnt
//     diese Route JEDEN Aufruf ab, auch den von Vercel. Das ist Absicht:
//     Eine offene Adresse, die Mails verschickt, wäre schlimmer als ein
//     Lauf, der nicht läuft. Dieselbe Variable benutzt schon die
//     Bewertungsbitte, du musst also nichts Neues anlegen.
//
// ▸ WAS PASSIERT, WENN EIN TAG AUSFÄLLT
//   Nichts Schlimmes. Der Lauf fragt nicht „wer ist heute genau drei Tage
//   dabei", sondern „wer ist mindestens drei Tage dabei und hat die Mail
//   noch nicht". Ein ausgefallener Tag wird am nächsten nachgeholt.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: Request) {
  const schluessel = process.env.CRON_SECRET;

  if (!schluessel) {
    console.error("CRON_SECRET fehlt — der Streckenlauf ist gesperrt.");
    return Response.json({ fehler: "Nicht eingerichtet." }, { status: 503 });
  }

  const kopf = request.headers.get("authorization");
  if (kopf !== `Bearer ${schluessel}`) {
    return Response.json({ fehler: "Nicht erlaubt." }, { status: 401 });
  }

  // Hängt hier mit dran, weil dieser Lauf der einzige ist, der genau einmal
  // am Tag kommt. Die Zwölfmonatsfrist steht als Zusage in der
  // Datenschutzerklärung, siehe alteEreignisseLoeschen.
  await alteEreignisseLoeschen();

  const ergebnisse = await streckenLauf(seitenUrl);

  const gesamt = ergebnisse.reduce((summe, e) => summe + e.verschickt, 0);
  console.log(`Streckenlauf: ${gesamt} Mails`, ergebnisse);

  return Response.json({ ok: true, gesamt, ergebnisse });
}
