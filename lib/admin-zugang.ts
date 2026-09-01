import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

// ---------------------------------------------------------------------------
// Der Zugang zum Auswertungsbereich.
//
// ▸ WARUM EIN PASSWORT UND NICHT DER LINK AUS DER MAIL wie beim Insider:
//   Hier stehen Umsätze, Adressen und Rabattcodes. Ein Link, der ein Jahr
//   lang in einem Postfach liegt, ist dafür die falsche Hürde.
//
// ▸ WAS DU EINRICHTEN MUSST, einmalig:
//   In den Vercel-Einstellungen von pferdeliebehealthy-homepage eine Variable
//       ADMIN_PASSWORT
//   anlegen, mit einem langen, zufälligen Wert. Nimm bitte kein Passwort,
//   das du woanders auch benutzt. Solange die Variable fehlt, ist der
//   Bereich vollständig gesperrt -- er zeigt dann nicht etwa alles, sondern
//   gar nichts. Das ist Absicht.
//
// ▸ WAS IM KEKS STEHT:
//   Nicht das Passwort. Sondern ein Zufallswert plus eine Unterschrift
//   darüber, gebildet mit dem Passwort als Schlüssel. Wer den Keks stiehlt,
//   kann sich damit anmelden, aber er kann das Passwort nicht daraus
//   zurückrechnen. Und wer das Passwort ändert, macht damit alle alten Kekse
//   ungültig.
// ---------------------------------------------------------------------------

const PASSWORT = process.env.ADMIN_PASSWORT || "";

const KEKS = "pfh_admin";

/** Sieben Tage. Danach einmal neu anmelden. */
export const KEKS_DAUER = 60 * 60 * 24 * 7;

export const KEKS_NAME = KEKS;

export const KEKS_OPTIONEN = {
  httpOnly: true, // Kein JavaScript kommt heran, auch kein fremdes.
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: KEKS_DAUER,
};

/** Sagt, ob der Bereich überhaupt benutzbar ist. */
export function adminEingerichtet(): boolean {
  return PASSWORT.length > 0;
}

function unterschreiben(wert: string): string {
  return createHmac("sha256", PASSWORT).update(wert).digest("hex");
}

/** Baut den Inhalt des Kekses: Zufallswert und Unterschrift darüber. */
export function keksBauen(): string {
  const zufall = randomBytes(16).toString("hex");
  return `${zufall}.${unterschreiben(zufall)}`;
}

/** Prüft einen Keks. */
function keksStimmt(keks: string): boolean {
  if (!PASSWORT) return false;

  const [zufall, unterschrift] = keks.split(".");
  if (!zufall || !unterschrift) return false;

  const erwartet = unterschreiben(zufall);
  const a = Buffer.from(erwartet, "utf8");
  const b = Buffer.from(unterschrift, "utf8");

  return a.length === b.length && timingSafeEqual(a, b);
}

/** Prüft das eingegebene Passwort.
 *
 *  Der Vergleich läuft über eine Unterschrift statt direkt, damit beide
 *  Seiten gleich lang sind: Ein direkter Vergleich zweier verschieden langer
 *  Zeichenketten verrät über die Antwortzeit die Länge des Passworts. */
export function passwortStimmt(eingabe: string): boolean {
  if (!PASSWORT) return false;

  const a = createHmac("sha256", PASSWORT).update(eingabe).digest();
  const b = createHmac("sha256", PASSWORT).update(PASSWORT).digest();

  return timingSafeEqual(a, b);
}

/** Ist gerade jemand angemeldet? */
export async function istAngemeldet(): Promise<boolean> {
  if (!PASSWORT) return false;

  const keks = (await cookies()).get(KEKS)?.value;

  return Boolean(keks && keksStimmt(keks));
}
