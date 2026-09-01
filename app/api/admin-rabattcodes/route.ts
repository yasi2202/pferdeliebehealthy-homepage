import { istAngemeldet } from "@/lib/admin-zugang";
import { digitalprodukte } from "@/lib/digital";
import { supabase, kuerzen } from "@/lib/versand";

// ---------------------------------------------------------------------------
// Rabattcodes anlegen und abschalten.
//
// ▸ JEDE ANFRAGE PRÜFT DIE ANMELDUNG ZUERST. Eine Route, die Daten ändert,
//   darf sich nicht darauf verlassen, dass die Seite davor schon geprüft hat.
//   Wer die Adresse kennt, kann sie direkt aufrufen.
//
// ▸ CODES WERDEN NIE GELÖSCHT, nur abgeschaltet. Du willst in einem halben
//   Jahr noch nachsehen können, welche Aktion wie oft lief.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

async function gesperrt() {
  return Response.json({ fehler: "Nicht angemeldet." }, { status: 401 });
}

/** Einen neuen Code anlegen. */
export async function POST(request: Request) {
  if (!(await istAngemeldet())) return gesperrt();

  let daten: Record<string, unknown>;

  try {
    daten = await request.json();
  } catch {
    return Response.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  // Nur Buchstaben, Ziffern, Strich und Unterstrich. Ein Code mit Leerzeichen
  // oder Sonderzeichen tippt niemand richtig ab.
  const code = kuerzen(daten.code, 40).toUpperCase().replace(/[^A-Z0-9_-]/g, "");

  if (code.length < 3) {
    return Response.json(
      { fehler: "Der Code braucht mindestens drei Zeichen, nur Buchstaben und Ziffern." },
      { status: 400 },
    );
  }

  const prozent = Number(daten.prozent);
  const euro = Number(daten.euro);

  const hatProzent = Number.isFinite(prozent) && prozent > 0;
  const hatBetrag = Number.isFinite(euro) && euro > 0;

  if (hatProzent && hatBetrag) {
    return Response.json(
      { fehler: "Bitte entweder Prozent oder einen Betrag, nicht beides." },
      { status: 400 },
    );
  }

  if (!hatProzent && !hatBetrag) {
    return Response.json(
      { fehler: "Trag einen Prozentsatz oder einen Betrag ein." },
      { status: 400 },
    );
  }

  if (hatProzent && prozent > 100) {
    return Response.json(
      { fehler: "Mehr als 100 Prozent Nachlass gibt es nicht." },
      { status: 400 },
    );
  }

  const max = Number(daten.maxEinloesungen);
  const bis = kuerzen(daten.gueltigBis, 20);

  // Die Produktauswahl gegen den Katalog prüfen. Ein Tippfehler würde sonst
  // einen Code erzeugen, der für nichts gilt und den niemand einlösen kann.
  const gewaehlt = Array.isArray(daten.nurFuer) ? daten.nurFuer : [];
  const bekannt = new Set(digitalprodukte.map((p) => p.slug));
  const nurFuer = gewaehlt
    .filter((s): s is string => typeof s === "string")
    .filter((s) => bekannt.has(s));

  const zeile: Record<string, unknown> = {
    code,
    prozent: hatProzent ? Math.round(prozent) : null,
    betrag_cent: hatBetrag ? Math.round(euro * 100) : null,
    max_einloesungen: Number.isFinite(max) && max > 0 ? Math.round(max) : null,
    // Bis zum Ende des gewählten Tages, nicht bis Mitternacht davor. Sonst
    // läuft ein Code, der "bis 30.09." gelten soll, am 29. abends ab.
    gueltig_bis: bis ? `${bis}T23:59:59+02:00` : null,
    nur_fuer: nurFuer.length > 0 ? nurFuer : null,
    notiz: kuerzen(daten.notiz, 200) || null,
    aktiv: true,
  };

  const res = await supabase("rabattcodes", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(zeile),
  });

  if (!res.ok) {
    const text = await res.text();

    // Der eindeutige Index schlägt zu, wenn es den Code schon gibt.
    if (text.includes("duplicate") || text.includes("unique")) {
      return Response.json(
        { fehler: `Den Code ${code} gibt es schon.` },
        { status: 409 },
      );
    }

    console.error("Rabattcode liess sich nicht anlegen:", text);

    return Response.json(
      { fehler: "Der Code liess sich nicht anlegen." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true, code });
}

/** Einen Code an- oder abschalten. */
export async function PATCH(request: Request) {
  if (!(await istAngemeldet())) return gesperrt();

  let daten: Record<string, unknown>;

  try {
    daten = await request.json();
  } catch {
    return Response.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const id = kuerzen(daten.id, 40);

  if (!id) {
    return Response.json({ fehler: "Welcher Code?" }, { status: 400 });
  }

  const res = await supabase(`rabattcodes?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ aktiv: daten.aktiv === true }),
  });

  if (!res.ok) {
    return Response.json(
      { fehler: "Das liess sich nicht ändern." },
      { status: 502 },
    );
  }

  return Response.json({ ok: true });
}
