import { NextRequest, NextResponse } from "next/server";
import { supabase, supabaseAlle } from "@/lib/versand";
import {
  bewertungsbitteSenden,
  type DigitalBestellung,
} from "@/lib/digital-server";
import { bewertungslink } from "@/lib/seite";

// ---------------------------------------------------------------------------
// Der tägliche Lauf, der vier Wochen nach dem Kauf um eine Bewertung bittet.
//
// ▸ WER IHN AUFRUFT
//   Vercel, einmal am Tag. Der Zeitplan steht in vercel.json als „0 7 * * *".
//   Vercel rechnet in UTC, das sind also 9 Uhr im Sommer und 8 Uhr im Winter.
//   Genauer geht es nicht, Vercel kennt keine Zeitzonen im Zeitplan. Für eine
//   Mail, die vier Wochen nach dem Kauf kommt, ist eine Stunde egal.
//
// ▸ WARUM DER SCHLÜSSEL GEPRÜFT WIRD
//   Die Adresse ist öffentlich erreichbar. Ohne Prüfung könnte jeder sie
//   aufrufen und damit Mails auslösen. Vercel schickt bei jedem Cron-Aufruf
//   den Wert aus CRON_SECRET im Authorization-Kopf mit; fehlt der Schlüssel
//   oder stimmt er nicht, passiert hier nichts.
//
//   ▸ CRON_SECRET MUSS BEI VERCEL GESETZT SEIN. Ist die Variable leer, lehnt
//     diese Route JEDEN Aufruf ab, auch den von Vercel. Das ist Absicht: Eine
//     offene Adresse, die Mails verschickt, wäre schlimmer als ein Lauf, der
//     nicht läuft.
//
// ▸ WEN ER ANSCHREIBT
//   Bezahlt, zwischen 28 und 35 Tage her, Newsletter zugestimmt, noch nicht
//   gefragt. Die Obergrenze verhindert, dass beim ersten Lauf plötzlich alle
//   Bestellungen der letzten Monate eine Mail bekommen.
//
// ▸ WEN ER AUSLÄSST
//   Beratungen (art „dienstleistung"). Vier Wochen nach dem Kauf steckt eine
//   Beratung womöglich mitten in der Arbeit. Wann sie fertig ist, weiß nur
//   Yasemin, dafür gibt es den Knopf im Adminbereich.
//
// ▸ ER VERMERKT JEDEN VERSAND SOFORT. Sonst bekäme dieselbe Kundin die Mail
//   jeden Tag wieder, solange sie im Zeitfenster liegt.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Ab wann gefragt wird und bis wann. In Tagen nach der Zahlung. */
const AB_TAGEN = 28;
const BIS_TAGEN = 35;

type Zeile = DigitalBestellung & {
  id: string;
  bezahlt_am: string;
  bewertung_gebeten_am: string | null;
};

function vorTagen(tage: number): string {
  return new Date(Date.now() - tage * 86400000).toISOString();
}

export async function GET(request: NextRequest) {
  const erwartet = process.env.CRON_SECRET;
  const mitgeschickt = request.headers.get("authorization");

  if (!erwartet || mitgeschickt !== `Bearer ${erwartet}`) {
    return NextResponse.json({ fehler: "nicht erlaubt" }, { status: 401 });
  }

  if (!bewertungslink) {
    return NextResponse.json({ uebersprungen: "kein Bewertungslink gesetzt" });
  }

  // Die Auswahl macht die Datenbank, nicht dieser Code: Sonst müssten alle
  // Bestellungen hierher übertragen werden, nur um die meisten wegzuwerfen.
  const zeilen = await supabaseAlle<Zeile>(
    "digitalbestellungen?" +
      [
        "status=eq.bezahlt",
        "newsletter=is.true",
        "bewertung_gebeten_am=is.null",
        `bezahlt_am=lte.${vorTagen(AB_TAGEN)}`,
        `bezahlt_am=gte.${vorTagen(BIS_TAGEN)}`,
        "select=*",
      ].join("&"),
  );

  if (!zeilen) {
    return NextResponse.json({ fehler: "Datenbank nicht erreichbar" }, { status: 500 });
  }

  // Beratungen bleiben außen vor, siehe oben.
  const dran = zeilen.filter(
    (z) => !z.artikel?.some((a) => a.slug === "pferdeliebe-365"),
  );

  let verschickt = 0;
  const fehler: string[] = [];

  for (const z of dran) {
    const ok = await bewertungsbitteSenden(z);

    if (!ok) {
      fehler.push(z.nummer);
      continue;
    }

    // Sofort vermerken, nicht erst am Ende. Bricht der Lauf mittendrin ab,
    // sind die schon verschickten trotzdem markiert und niemand bekommt die
    // Mail beim nächsten Durchlauf noch einmal.
    await supabase(`digitalbestellungen?id=eq.${z.id}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ bewertung_gebeten_am: new Date().toISOString() }),
    });

    verschickt++;
  }

  return NextResponse.json({
    geprueft: zeilen.length,
    ausgelassen_beratung: zeilen.length - dran.length,
    verschickt,
    fehler,
  });
}
