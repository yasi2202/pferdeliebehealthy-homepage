import { cookies } from "next/headers";
import { ersteZeile } from "@/lib/versand";
import type { InsiderAnmeldung } from "@/lib/insider-server";

// ---------------------------------------------------------------------------
// Der Zugang zum Insider-Bereich — ohne Passwort.
//
// Das Prinzip: Wer sich einträgt, bekommt eine Mail mit einem persönlichen
// Link. Ein Klick darauf legt einen Keks (Cookie) im Browser ab, und der
// bleibt ein Jahr liegen. Ab dann ist sie eingeloggt, ohne je ein Passwort
// gewählt oder vergessen zu haben. Ihr Postfach ist der Ausweis.
//
// Genau so macht es auch deine Akademie. Und es ist für einen kostenlosen
// Kanal die richtige Hürde: hoch genug, dass niemand ohne Adresse liest,
// niedrig genug, dass niemand an einem Anmeldeformular scheitert.
//
// Wichtig: Geprüft wird auf dem Server, bevor die Seite gebaut wird. Der Text
// eines geschützten Beitrags verlässt den Server also gar nicht erst, wenn
// jemand keinen gültigen Keks hat. Ihn im Browser nur zu verstecken wäre kein
// Schutz — man sieht ihn dann im Quelltext.
// ---------------------------------------------------------------------------

const KEKS = "pfh_insider_zugang";

/** Ein Jahr. Danach klickt sie einmal einen Link aus einer Mail, fertig. */
export const KEKS_DAUER = 60 * 60 * 24 * 365;

export const KEKS_NAME = KEKS;

export const KEKS_OPTIONEN = {
  httpOnly: true, // Kein JavaScript kommt heran, auch kein fremdes.
  secure: true,
  sameSite: "lax" as const,
  path: "/",
  maxAge: KEKS_DAUER,
};

/** Wer ist gerade eingeloggt? Null, wenn niemand.
 *
 *  Nur bestätigte Anmeldungen zählen: Ein Token aus einer Anmeldung, die nie
 *  bestätigt wurde, öffnet nichts. Sonst könnte man sich mit einer fremden
 *  Adresse eintragen und läse mit, ohne dass der Adressinhaber je zugestimmt
 *  hat. */
export async function aktuellerInsider(): Promise<InsiderAnmeldung | null> {
  const keks = (await cookies()).get(KEKS)?.value;
  if (!keks) return null;

  const anmeldung = await ersteZeile<InsiderAnmeldung>(
    `insider_anmeldungen?token=eq.${encodeURIComponent(keks)}&select=*&limit=1`
  );
  if (!anmeldung || !anmeldung.bestaetigt) return null;
  return anmeldung;
}
