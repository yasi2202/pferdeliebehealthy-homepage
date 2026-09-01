import { cookies } from "next/headers";
import {
  KEKS_NAME,
  KEKS_OPTIONEN,
  adminEingerichtet,
  keksBauen,
  passwortStimmt,
} from "@/lib/admin-zugang";

// ---------------------------------------------------------------------------
// Anmeldung am Auswertungsbereich.
//
// ▸ WARUM DIE ANTWORT BEI FALSCHEM PASSWORT ABSICHTLICH LANGSAM IST
//   Ohne Verzögerung könnte jemand tausende Passwörter pro Minute
//   durchprobieren. Eine Sekunde Wartezeit macht das unbrauchbar, ohne dass
//   es beim richtigen Passwort stört -- da wartet man einmal.
//
// ▸ Die Antwort sagt nie, WAS falsch war. "Passwort stimmt nicht" und
//   "Bereich nicht eingerichtet" wären zwei verschiedene Auskünfte, und die
//   zweite verrät, dass es hier überhaupt etwas zu holen gibt.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

function warten(ms: number) {
  return new Promise((fertig) => setTimeout(fertig, ms));
}

export async function POST(request: Request) {
  let daten: Record<string, unknown>;

  try {
    daten = await request.json();
  } catch {
    return Response.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const passwort = typeof daten.passwort === "string" ? daten.passwort : "";

  if (!adminEingerichtet() || !passwortStimmt(passwort)) {
    await warten(1000);
    return Response.json({ fehler: "Das hat nicht gepasst." }, { status: 401 });
  }

  (await cookies()).set(KEKS_NAME, keksBauen(), KEKS_OPTIONEN);

  return Response.json({ ok: true });
}

/** Abmelden. */
export async function DELETE() {
  (await cookies()).set(KEKS_NAME, "", { ...KEKS_OPTIONEN, maxAge: 0 });
  return Response.json({ ok: true });
}
