import { NextRequest, NextResponse } from "next/server";
import { istAngemeldet } from "@/lib/admin-zugang";
import { ersteZeile, supabase } from "@/lib/versand";
import {
  bewertungsbitteSenden,
  type DigitalBestellung,
} from "@/lib/digital-server";
import { bewertungslink } from "@/lib/seite";

// ---------------------------------------------------------------------------
// Die Bitte um eine Bewertung von Hand verschicken.
//
// ▸ WOFÜR ES DIESEN WEG GIBT
//   Der tägliche Lauf unter /api/bewertungsbitte fragt vier Wochen nach dem
//   Kauf. Für Beratungen taugt das nicht: Wann eine Beratung fertig ist, weiß
//   nur Yasemin. Deshalb gibt es im Adminbereich einen Knopf, mit dem sie die
//   Mail dann auslöst, wenn es passt.
//
// ▸ AUCH HIER GILT DIE EINWILLIGUNG.
//   Die Frage nach der Zufriedenheit ist Werbung (BGH VI ZR 225/17). Dass
//   Yasemin selbst auf den Knopf drückt, ändert daran nichts. Ohne
//   Newsletter-Zustimmung wird nicht verschickt, und die Antwort sagt auch,
//   warum.
//
// ▸ JEDE KUNDIN WIRD NUR EINMAL GEFRAGT. Ist `bewertung_gebeten_am` gesetzt,
//   lehnt diese Route ab. Zweimal nach einer Bewertung zu fragen ist das,
//   was aus einer Bitte eine Belästigung macht.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Zeile = DigitalBestellung & {
  id: string;
  newsletter: boolean;
  bewertung_gebeten_am: string | null;
};

export async function POST(request: NextRequest) {
  if (!(await istAngemeldet())) {
    return NextResponse.json({ fehler: "nicht angemeldet" }, { status: 401 });
  }

  if (!bewertungslink) {
    return NextResponse.json(
      { fehler: "Es ist kein Bewertungslink hinterlegt, siehe lib/seite.ts." },
      { status: 400 },
    );
  }

  const { nummer } = (await request.json()) as { nummer?: string };

  if (!nummer) {
    return NextResponse.json({ fehler: "keine Bestellnummer" }, { status: 400 });
  }

  const b = await ersteZeile<Zeile>(
    `digitalbestellungen?nummer=eq.${encodeURIComponent(nummer)}&select=*`,
  );

  if (!b) {
    return NextResponse.json({ fehler: "Bestellung nicht gefunden" }, { status: 404 });
  }

  if (b.status !== "bezahlt") {
    return NextResponse.json(
      { fehler: "Diese Bestellung ist nicht bezahlt." },
      { status: 400 },
    );
  }

  if (b.bewertung_gebeten_am) {
    const wann = new Date(b.bewertung_gebeten_am).toLocaleDateString("de-DE");
    return NextResponse.json(
      { fehler: `Wurde am ${wann} schon gefragt.` },
      { status: 400 },
    );
  }

  if (!b.newsletter) {
    return NextResponse.json(
      {
        fehler:
          "Diese Kundin hat beim Kauf nicht zugestimmt, Post zu bekommen. " +
          "Eine Bitte um eine Bewertung ist Werbung und darf ohne " +
          "Einwilligung nicht per Mail raus.",
      },
      { status: 400 },
    );
  }

  const ok = await bewertungsbitteSenden(b);

  if (!ok) {
    return NextResponse.json(
      { fehler: "Die Mail ging nicht raus. Steht der Resend-Schlüssel?" },
      { status: 500 },
    );
  }

  await supabase(`digitalbestellungen?id=eq.${b.id}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ bewertung_gebeten_am: new Date().toISOString() }),
  });

  return NextResponse.json({ ok: true });
}
