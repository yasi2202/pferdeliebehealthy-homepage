import { altesLoeschen, erneuereZugang } from "@/lib/instagram-kommentare-server";

// ---------------------------------------------------------------------------
// Wöchentlicher Lauf für die Instagram-Kommentar-Antwort (vercel.json):
//   1. den Instagram-Schlüssel erneuern, bevor er nach 60 Tagen abläuft
//   2. Einträge löschen, die älter als zwölf Monate sind
//
// Geschützt wie die anderen Läufe über CRON_SECRET. Ist die Variable leer,
// wird jeder Aufruf abgelehnt.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const schluessel = process.env.CRON_SECRET;
  if (!schluessel) {
    return Response.json({ fehler: "Nicht eingerichtet." }, { status: 503 });
  }
  if (request.headers.get("authorization") !== `Bearer ${schluessel}`) {
    return Response.json({ fehler: "Nicht erlaubt." }, { status: 401 });
  }

  const zugang = await erneuereZugang();
  if (!zugang.ok) console.error("Instagram-Schlüssel:", zugang.meldung);
  const geloescht = await altesLoeschen();

  return Response.json({ zugang, altesGeloescht: geloescht });
}
// ENDE DER DATEI
