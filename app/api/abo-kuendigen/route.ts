import { abosZuAdresse, aboKuendigen } from "@/lib/digital-server";
import { EMAIL_MUSTER, kuerzen, sendeMail, rahmen, esc } from "@/lib/versand";

// ---------------------------------------------------------------------------
// Die Schnittstelle hinter dem Kündigungsknopf.
//
// Zwei Schritte, genau wie es § 312k BGB vorsieht:
//   1. Nur `email`          -> sagt, was zu dieser Adresse läuft. Ändert nichts.
//   2. `email` + `aboId`    -> kündigt, und schickt die Bestätigung als Mail.
//
// ▸ WARUM SCHRITT 1 NICHT SCHON KÜNDIGT
//   Die Kundin muss vor dem Klick sehen, was sie kündigt und wann es wirkt.
//   Das ist der Zweck der Bestätigungsseite im Gesetz.
//
// ▸ WARUM HIER KEINE ANMELDUNG VERLANGT WIRD
//   Weil sie verboten ist. Eine Kündigung darf nicht schwerer sein als der
//   Abschluss, und abgeschlossen wird ohne Konto. Siehe den Kommentar in
//   components/AboKuendigung.tsx.
//
// ▸ DER ZUGANG WIRD HIER NICHT ENTZOGEN. Das passiert erst, wenn der bezahlte
//   Monat abgelaufen ist -- Stripe meldet das dann als
//   `customer.subscription.deleted` an app/api/stripe-webhook.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";

/** Aus einem Stripe-Zeitstempel (Sekunden) ein deutsches Datum machen. */
function datumText(sekunden: number): string {
  if (!sekunden) return "zum Ende des bezahlten Zeitraums";

  return new Date(sekunden * 1000).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export async function POST(request: Request) {
  let daten: Record<string, unknown>;

  try {
    daten = await request.json();
  } catch {
    return Response.json({ fehler: "Ungültige Anfrage." }, { status: 400 });
  }

  const email = kuerzen(daten.email, 200).trim().toLowerCase();

  if (!EMAIL_MUSTER.test(email)) {
    return Response.json(
      { fehler: "Bitte gib die Adresse ein, mit der du bezahlt hast." },
      { status: 400 },
    );
  }

  const abos = await abosZuAdresse(email);

  // --- Schritt 1: nur nachsehen ---------------------------------------------
  if (!daten.bestaetigt) {
    return Response.json({
      abos: abos.map((a) => ({
        id: a.id,
        name: a.name,
        laeuftBis: datumText(a.laeuftBis),
        gekuendigt: a.gekuendigt,
      })),
    });
  }

  // --- Schritt 2: wirklich kündigen -----------------------------------------
  const aboId = kuerzen(daten.aboId, 120);

  // Die Kennung muss zu genau dieser Adresse gehören. Ohne diese Prüfung
  // könnte jemand eine fremde Abo-Kennung einsetzen und den Vertrag einer
  // anderen beenden, ohne deren Adresse zu kennen.
  const gemeint = abos.find((a) => a.id === aboId);

  if (!gemeint) {
    return Response.json(
      { fehler: "Zu dieser Adresse finde ich diesen Vertrag nicht." },
      { status: 404 },
    );
  }

  if (gemeint.gekuendigt) {
    return Response.json({ endetAm: datumText(gemeint.laeuftBis) });
  }

  const ergebnis = await aboKuendigen(gemeint.id);

  if (!ergebnis.ok) {
    return Response.json(
      {
        fehler:
          "Die Kündigung liess sich gerade nicht speichern. Schreib mir bitte " +
          "an info@pferdeliebehealthy.de, dann mache ich es von Hand.",
      },
      { status: 502 },
    );
  }

  const endetAm = datumText(ergebnis.endetAm || gemeint.laeuftBis);

  // ▸ DIE BESTÄTIGUNG IST PFLICHT, NICHT HÖFLICHKEIT. Das Gesetz verlangt
  //   sie "in Textform" und "unmittelbar". Sie enthält deshalb alles, was die
  //   Kundin später belegen können muss: was, wann gekündigt, ab wann wirksam.
  await sendeMail(
    email,
    `Deine Kündigung: ${gemeint.name}`,
    rahmen(`
      <h1 style="font-size:22px;margin:0 0 16px;">Deine Kündigung ist angekommen</h1>

      <p style="font-size:16px;line-height:1.6;">
        Du hast <strong>${esc(gemeint.name)}</strong> gekündigt, am
        ${esc(new Date().toLocaleDateString("de-DE"))}.
      </p>

      <div style="background:#F9EDED;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="font-size:15px;line-height:1.7;margin:0;">
          <strong>Wirksam zum:</strong> ${esc(endetAm)}<br>
          <strong>Vertrag von:</strong> ${esc(email)}<br>
          <strong>Art:</strong> ordentliche Kündigung zum nächstmöglichen Zeitpunkt
        </p>
      </div>

      <p style="font-size:16px;line-height:1.6;">
        Bis dahin kannst du weiterarbeiten wie bisher. Danach wird nichts mehr
        abgebucht, und der Zugang schliesst sich.
      </p>

      <p style="font-size:16px;line-height:1.6;">
        Wenn du deine Daten behalten willst, lade sie dir vorher herunter. Und
        wenn dir etwas gefehlt hat, schreib mir gern, ich lese das wirklich.
      </p>

      <p style="font-size:16px;line-height:1.6;">Alles Gute für dich,<br>Yasi</p>
    `),
  );

  return Response.json({ endetAm });
}
