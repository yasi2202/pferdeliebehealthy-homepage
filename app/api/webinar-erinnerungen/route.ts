import { supabaseAlle } from "@/lib/versand";
import { sendeErinnerung, type WebinarAnmeldung } from "@/lib/webinar-server";

// ---------------------------------------------------------------------------
// Die Erinnerungen zum Webinar.
//
// ▸ WER IHN AUFRUFT
//   Vercel, alle fünfzehn Minuten. Der Zeitplan steht in vercel.json.
//
// ▸ ZEITZONEN SIND HIER KEIN THEMA
//   Anders als bei der Morgenmail von EquiDesk fragt diese Route nicht „ist
//   es gerade neun Uhr", sondern rechnet mit Abständen: Wie weit ist es noch
//   bis zum Termin? Ein Abstand kennt keine Sommerzeit. Deshalb darf der Cron
//   ruhig nach Weltzeit laufen.
//
// ▸ ZWEI ERINNERUNGEN
//   Eine am Vortag, eine eine Stunde vorher. Die zweite ist die wichtigere:
//   Wer sich vor drei Tagen angemeldet hat, hat den Termin längst vergessen.
//
// ▸ DOPPELVERSAND
//   Jede Mail hinterlässt einen Zeitstempel in ihrer eigenen Spalte. Läuft
//   der Zeitplan zweimal oder holt einen Ausfall nach, bekommt trotzdem
//   niemand dieselbe Mail zweimal.
// ---------------------------------------------------------------------------

export const dynamic = "force-dynamic";

/** Fenster für die Erinnerung am Vortag: 20 bis 28 Stunden vorher. */
const TAG_VON = 20 * 3600_000;
const TAG_BIS = 28 * 3600_000;

/** Fenster für die letzte Erinnerung: 30 bis 90 Minuten vorher. */
const STUNDE_VON = 30 * 60_000;
const STUNDE_BIS = 90 * 60_000;

export async function GET(request: Request) {
  const erwartet = process.env.CRON_SECRET;
  if (erwartet) {
    const kopf = request.headers.get("authorization");
    if (kopf !== `Bearer ${erwartet}`) {
      return Response.json({ ok: false }, { status: 401 });
    }
  }

  const jetzt = Date.now();
  const bis = new Date(jetzt + TAG_BIS).toISOString();
  const von = new Date(jetzt).toISOString();

  // Alles, was in den nächsten 28 Stunden ansteht. Kleine Menge, ein Zugriff.
  const anstehend = await supabaseAlle<WebinarAnmeldung & {
    erinnerung_tag_am: string | null;
    erinnerung_stunde_am: string | null;
  }>(
    `webinar_anmeldungen?termin=gte.${encodeURIComponent(von)}` +
      `&termin=lte.${encodeURIComponent(bis)}&select=*`
  );

  if (!anstehend) {
    return Response.json({ ok: false, fehler: "Datenbank nicht erreichbar" }, { status: 500 });
  }

  let tag = 0;
  let stunde = 0;
  const fehler: string[] = [];

  for (const a of anstehend) {
    const abstand = new Date(a.termin).getTime() - jetzt;
    try {
      if (!a.erinnerung_stunde_am && abstand >= STUNDE_VON && abstand <= STUNDE_BIS) {
        await sendeErinnerung(a, "stunde");
        stunde++;
      } else if (!a.erinnerung_tag_am && abstand >= TAG_VON && abstand <= TAG_BIS) {
        await sendeErinnerung(a, "tag");
        tag++;
      }
    } catch (e) {
      // Eine kaputte Adresse darf den Lauf nicht anhalten. Beim Rundversand
      // hat genau das schon einmal hundert Mails gekostet.
      fehler.push(a.email);
    }
  }

  return Response.json({ ok: true, geprueft: anstehend.length, tag, stunde, fehler });
}
