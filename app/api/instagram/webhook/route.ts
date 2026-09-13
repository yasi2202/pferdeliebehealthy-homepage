import { stichwortIn } from "@/lib/instagram-stichwoerter";
import { beantworte, merkeLetzteMeldung, unterschriftVon } from "@/lib/instagram-kommentare-server";

// ---------------------------------------------------------------------------
// Hier meldet Meta neue Kommentare auf Instagram (Ersatz für ManyChat).
//
// ▸ GET: Beim Einrichten des Webhooks in der App fragt Meta einmal an und
//   will das Wort aus `hub.challenge` zurück, aber nur, wenn `hub.verify_token`
//   mit INSTAGRAM_WEBHOOK_TOKEN übereinstimmt.
//
// ▸ POST: Jede Meldung trägt eine Unterschrift. Ohne gültige Unterschrift
//   passiert nichts, sonst könnte jeder über diese Adresse Nachrichten in
//   Yasemins Namen auslösen. Danach: Stichwort im Kommentar suchen, antworten.
//
// ▸ ANTWORTET IMMER MIT 200, sobald die Unterschrift stimmt, auch wenn das
//   Antworten scheitert. Sonst schickt Meta dieselbe Meldung wieder und wieder,
//   und nach vielen Fehlern schaltet Meta den Webhook ab. Was schiefging, steht
//   in der Tabelle und im Vercel-Protokoll.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: Request) {
  const u = new URL(request.url);
  // Getrimmt, weil beim Einfügen in Vercel leicht ein Leerzeichen oder
  // Zeilenumbruch mitkommt, und dann sagt die Seite still „Nicht erlaubt“.
  const erwartet = (process.env.INSTAGRAM_WEBHOOK_TOKEN || "").trim();
  if (
    erwartet &&
    u.searchParams.get("hub.mode") === "subscribe" &&
    (u.searchParams.get("hub.verify_token") || "").trim() === erwartet
  ) {
    return new Response(u.searchParams.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Nicht erlaubt.", { status: 403 });
}

type Aenderung = {
  field?: string;
  value?: {
    id?: string;
    text?: string;
    from?: { id?: string; username?: string };
    media?: { id?: string };
  };
};
type Meldung = { object?: string; entry?: { id?: string; changes?: Aenderung[] }[] };

export async function POST(request: Request) {
  const roh = await request.text();
  const kopf = request.headers.get("x-hub-signature-256");

  let meldung: Meldung = {};
  try {
    meldung = JSON.parse(roh);
  } catch {
    // unlesbar, bleibt leer
  }
  const felder = (meldung.entry ?? []).flatMap((e) => (e.changes ?? []).map((c) => c.field ?? "?"));

  const geheimnis = unterschriftVon(roh, kopf);
  if (!geheimnis) {
    console.error("Instagram-Webhook: Unterschrift fehlt oder stimmt nicht. Sind INSTAGRAM_APP_GEHEIMNIS und META_APP_GEHEIMNIS gesetzt?");
    await merkeLetzteMeldung({ unterschriftOk: false, unterschriftDa: !!kopf, art: meldung.object ?? null, felder });
    return new Response("Nicht erlaubt.", { status: 403 });
  }

  const ergebnisse: string[] = [];
  for (const eintrag of meldung.entry ?? []) {
    for (const aenderung of eintrag.changes ?? []) {
      if (aenderung.field !== "comments" || !aenderung.value?.id) continue;
      const v = aenderung.value;

      // Eigene Kommentare nie beantworten, auch nicht die kurzen Antworten,
      // die diese Route selbst unter Kommentare setzt.
      if (v.from?.id && eintrag.id && v.from.id === eintrag.id) continue;

      const stichwort = stichwortIn(v.text ?? "");
      if (!stichwort) continue;

      ergebnisse.push(
        await beantworte(
          {
            id: v.id!,
            text: v.text ?? "",
            beitragId: v.media?.id ?? null,
            vonId: v.from?.id ?? null,
            vonName: v.from?.username ?? null,
          },
          stichwort,
        ),
      );
    }
  }

  await merkeLetzteMeldung({ unterschriftOk: true, geheimnis, art: meldung.object ?? null, felder, ergebnisse });
  return Response.json({ ok: true, ergebnisse });
}
// ENDE DER DATEI
