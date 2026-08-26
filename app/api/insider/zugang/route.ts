import { istEingerichtet, EMAIL_MUSTER, kuerzen, ersteZeile, sendeMail, esc, rahmen, knopf, ANTWORT_AN } from "@/lib/versand";
import type { InsiderAnmeldung } from "@/lib/insider-server";

// ---------------------------------------------------------------------------
// "Ich bin schon dabei" — schickt einen Anmeldelink an eine bekannte Adresse.
//
// Für den Fall, dass jemand am Laptop liest, sich aber am Handy eingetragen
// hat. Sie gibt ihre Adresse ein, bekommt einen Link, klickt, ist drin.
//
// Die Antwort ist immer dieselbe, egal ob die Adresse bekannt ist oder nicht.
// Sonst wäre dieses Formular ein Werkzeug, mit dem sich herausfinden liesse,
// wer bei Yasi eingetragen ist — man müsste nur Adressen durchprobieren.
// ---------------------------------------------------------------------------

const TABELLE = "insider_anmeldungen";

export async function POST(request: Request) {
  let daten: Record<string, unknown>;
  try {
    daten = await request.json();
  } catch {
    return Response.json({ ok: false, fehler: "ungueltig" }, { status: 400 });
  }

  const email = kuerzen(daten.email, 200).toLowerCase();
  const weiter = kuerzen(daten.weiter, 200);

  if (!EMAIL_MUSTER.test(email)) {
    return Response.json(
      { ok: false, fehler: "Diese E-Mail-Adresse sieht nicht vollständig aus." },
      { status: 400 }
    );
  }

  if (!istEingerichtet()) {
    console.error("Insider-Zugang: Zugangsdaten fehlen in den Vercel-Einstellungen.");
    return Response.json(
      { ok: false, fehler: `Das geht gerade nicht. Schreib mir bitte kurz an ${ANTWORT_AN}.` },
      { status: 503 }
    );
  }

  const anmeldung = await ersteZeile<InsiderAnmeldung>(
    `${TABELLE}?email=eq.${encodeURIComponent(email)}&select=*&limit=1`
  );

  // Nur bestätigte Anmeldungen bekommen einen Link. Eine nie bestätigte
  // Anmeldung soll nicht nachträglich über diesen Weg Zugang verschaffen.
  if (anmeldung?.bestaetigt) {
    const basisUrl = new URL(request.url).origin;
    const ziel = weiter.startsWith("/") && !weiter.startsWith("//") ? weiter : "";
    const link =
      `${basisUrl}/insider-bestaetigt?token=${encodeURIComponent(anmeldung.token)}` +
      (ziel ? `&weiter=${encodeURIComponent(ziel)}` : "");

    const verschickt = await sendeMail(
      anmeldung.email,
      "Dein Anmeldelink für die Pferdeliebe Insider",
      rahmen(`
        <p style="font-size:17px;">Hallo ${esc(anmeldung.vorname)},</p>
        <p style="font-size:16px;line-height:1.6;">
          hier ist dein Link. Ein Klick, und du bist auf diesem Gerät
          angemeldet — ein Passwort brauchst du nicht.
        </p>
        ${knopf(link, "Anmelden und weiterlesen")}
        <p style="font-size:14px;line-height:1.6;color:#8a7070;">
          Falls der Knopf nicht funktioniert, kopiere diese Adresse in deinen
          Browser:<br>
          <span style="word-break:break-all;">${link}</span>
        </p>
        <p style="font-size:14px;line-height:1.6;color:#8a7070;">
          Hast du das gar nicht angefordert? Dann ignoriere diese Mail einfach.
        </p>
      `)
    );
    if (!verschickt) {
      console.error("Insider-Zugang: Anmeldelink konnte nicht versendet werden.");
    }
  }

  // Bewusst immer dieselbe Antwort.
  return Response.json({ ok: true });
}
