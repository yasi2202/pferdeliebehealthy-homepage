import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Die Anmeldung zum Stall Organizer, von der Website aus.
//
// WARUM ÜBER DEN SERVER UND NICHT DIREKT AUS DEM BROWSER
// Der Organizer und die Konten liegen in der Akademie, also auf einer anderen
// Adresse. Ein Formular, das von hier aus direkt dorthin schickt, wäre eine
// fremde Anfrage und bräuchte CORS-Freigaben auf der anderen Seite. Von
// Server zu Server ist das kein Thema, und die Besucherin merkt nichts davon.
//
// Angelegt wird das Konto weiterhin dort. Diese Route reicht nur durch und
// gibt die Antwort unverändert zurück; die Formulierungen kommen also aus
// einer Hand und stehen nicht an zwei Stellen leicht verschieden.
// ---------------------------------------------------------------------------

const AKADEMIE = process.env.AKADEMIE_URL || "https://akademieapp.vercel.app";

/** Aus der Angabe in `?von=` wird der Eintrag in der Spalte `quelle`. */
function quelleAus(von: unknown): string {
  if (typeof von !== "string") return "website";
  const sauber = von.toLowerCase().replace(/[^a-z0-9_-]/g, "").slice(0, 40);
  return sauber || "website";
}

export async function POST(req: Request) {
  const koerper = await req.json().catch(() => null);

  if (!koerper || typeof koerper.email !== "string") {
    return NextResponse.json(
      { ok: false, meldung: "Da fehlt die Adresse." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${AKADEMIE}/api/stall-anmeldung`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Die Herkunft aus `?von=` wird zur Quelle, sonst bleibt es "website".
      // Nochmal gesaeubert, obwohl das Formular es schon tut: Diese Route
      // nimmt Anfragen von ueberall entgegen, nicht nur vom eigenen Formular.
      body: JSON.stringify({ ...koerper, quelle: quelleAus(koerper.von) }),
      cache: "no-store",
    });

    const daten = await res.json().catch(() => null);
    if (!daten) throw new Error("keine Antwort");

    return NextResponse.json(daten, { status: res.status });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        meldung:
          "Das hat gerade nicht geklappt. Versuch es in ein paar Minuten noch einmal, oder schreib mir kurz.",
      },
      { status: 502 },
    );
  }
}
