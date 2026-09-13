import { NextResponse } from "next/server";
import { istAngemeldet } from "@/lib/admin-zugang";
import { pruefeNeueKommentare } from "@/lib/instagram-kommentare-server";

// ---------------------------------------------------------------------------
// Der Knopf „Kommentare jetzt prüfen“ in /admin/instagram.
//
// Holt die Kommentare der neuesten Beiträge selbst ab und beantwortet die mit
// Stichwort. Warum es das neben dem Webhook braucht, steht an
// pruefeNeueKommentare() in lib/instagram-kommentare-server.ts.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  if (!(await istAngemeldet())) {
    return NextResponse.json({ fehler: "nicht angemeldet" }, { status: 401 });
  }
  const r = await pruefeNeueKommentare();
  return NextResponse.json(r.ok ? { ok: true, text: r.meldung } : { ok: false, fehler: r.meldung });
}
