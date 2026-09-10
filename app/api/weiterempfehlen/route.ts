import { istEingerichtet, EMAIL_MUSTER, kuerzen } from "@/lib/versand";
import { codeSaeubern, codeTaugt } from "@/lib/empfehlungsprogramm";
import {
  bewerbungMelden,
  empfehlerAnlegen,
  empfehlerZuCode,
  empfehlerZuEmail,
  kontolinkSenden,
} from "@/lib/empfehlungsprogramm-server";

// ---------------------------------------------------------------------------
// Nimmt Bewerbungen für das Empfehlungsprogramm entgegen, und schickt auf
// Wunsch den Kontolink noch einmal zu.
//
// Beides in einer Datei, unterschieden durch `art`. Grund: Es sind zwei
// Knöpfe auf derselben Seite, und beide tun im Kern dasselbe, nämlich eine
// Mailadresse entgegennehmen und eine Mail auslösen.
//
// ▸ WAS HIER NICHT PASSIERT: freischalten. Eine Bewerbung wird immer nur
//   angelegt, nie aktiviert. Das geht ausschliesslich von Hand unter
//   /admin/empfehler, und genau so hat Yasemin es am 10.09.2026 entschieden.
//   Wer das hier einmal ändern möchte, sollte vorher überlegen, was passiert,
//   wenn jemand ihre Kurse auf einem Gutscheinportal listet oder bei Google
//   Anzeigen auf ihren Namen schaltet.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

export async function POST(request: Request) {
  let daten: Record<string, unknown>;

  try {
    daten = await request.json();
  } catch {
    return Response.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  if (!istEingerichtet()) {
    console.error(
      "Empfehlungsprogramm: SUPABASE_URL, SUPABASE_SECRET_KEY oder RESEND_API_KEY fehlt in den Vercel-Einstellungen.",
    );

    return Response.json(
      {
        fehler:
          "Das klappt gerade nicht. Schreib mir bitte kurz an info@pferdeliebehealthy.de.",
      },
      { status: 503 },
    );
  }

  // ▸ DER HONIGTOPF
  //   Ein Feld, das kein Mensch sieht und deshalb kein Mensch ausfüllt.
  //   Steht etwas darin, war es eine Maschine. Die Antwort ist trotzdem ein
  //   freundliches ok: Wer merkt, dass er erkannt wurde, versucht es mit
  //   einem anderen Weg noch einmal.
  if (kuerzen(daten.webseite, 200)) {
    return Response.json({ ok: true });
  }

  const email = kuerzen(daten.email, 160).toLowerCase();

  if (!EMAIL_MUSTER.test(email)) {
    return Response.json(
      { fehler: "Diese E-Mail-Adresse sieht nicht vollständig aus." },
      { status: 400 },
    );
  }

  // -------------------------------------------------------------------------
  // Der Kontolink
  // -------------------------------------------------------------------------

  if (daten.art === "kontolink") {
    // Die Antwort ist immer dieselbe, auch wenn es die Adresse nicht gibt.
    // Sonst liesse sich durch Ausprobieren herausfinden, wer mitmacht.
    // Die Entscheidung, ob wirklich eine Mail rausgeht, trifft
    // `kontolinkSenden`.
    await kontolinkSenden(email);

    return Response.json({ ok: true });
  }

  // -------------------------------------------------------------------------
  // Die Bewerbung
  // -------------------------------------------------------------------------

  const vorname = kuerzen(daten.vorname, 60);
  const nachname = kuerzen(daten.nachname, 60);
  const code = codeSaeubern(kuerzen(daten.code, 40));
  const kanal = kuerzen(daten.kanal, 600);
  const zahlweg = kuerzen(daten.zahlweg, 120);
  const steuernummer = kuerzen(daten.steuernummer, 40);
  const unternehmerin = daten.unternehmerin === true;

  if (vorname.length < 2 || nachname.length < 2) {
    return Response.json(
      { fehler: "Bitte trag deinen Vor- und Nachnamen ein." },
      { status: 400 },
    );
  }

  if (!codeTaugt(code)) {
    return Response.json(
      {
        fehler:
          "Dein Wunschname für den Link braucht mindestens drei Buchstaben oder Ziffern.",
      },
      { status: 400 },
    );
  }

  if (zahlweg.length < 5) {
    return Response.json(
      {
        fehler:
          "Bitte sag mir, wohin die Provision gehen soll: eine PayPal-Adresse oder eine IBAN.",
      },
      { status: 400 },
    );
  }

  // ▸ Schon dabei? Dann keine zweite Zeile anlegen. Sonst stünde dieselbe
  //   Person zweimal im Buch, mit zwei Codes und zwei Konten, und keines der
  //   beiden zeigte ihr die vollen Zahlen.
  if (await empfehlerZuEmail(email)) {
    return Response.json(
      {
        fehler:
          "Mit dieser Adresse bist du schon angemeldet. Lass dir unten den Link zu deinem Konto schicken.",
      },
      { status: 409 },
    );
  }

  if (await empfehlerZuCode(code)) {
    return Response.json(
      {
        fehler: `Den Namen ${code} hat leider schon jemand. Nimm bitte einen anderen, zum Beispiel mit deinem Pferdenamen dahinter.`,
      },
      { status: 409 },
    );
  }

  const neu = await empfehlerAnlegen({
    code,
    vorname,
    nachname,
    email,
    kanal,
    zahlweg,
    unternehmerin,
    steuernummer,
  });

  if (!neu) {
    return Response.json(
      {
        fehler:
          "Deine Bewerbung liess sich gerade nicht speichern. Versuch es bitte gleich noch einmal oder schreib mir an info@pferdeliebehealthy.de.",
      },
      { status: 502 },
    );
  }

  // Die Meldung an Yasemin darf die Antwort nicht aufhalten: Die Bewerbung
  // steht schon im Buch, und sie sieht sie auch unter /admin/empfehler.
  if (!(await bewerbungMelden(neu))) {
    console.error(`Meldung über die Bewerbung von ${email} ging nicht raus.`);
  }

  return Response.json({ ok: true });
}
