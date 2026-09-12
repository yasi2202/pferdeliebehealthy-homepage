import { createHmac, timingSafeEqual } from "node:crypto";
import { supabase, ersteZeile, sendeMail, esc, anrede, rahmen, knopf, ANTWORT_AN } from "@/lib/versand";

// ---------------------------------------------------------------------------
// Der kostenlose Minikurs „Heu 2026“, seit 12.09.2026.
//
// ▸ DER ABLAUF
//   1. Anmeldung auf /heu-2026: Zeile in `heu_minikurs_anmeldungen` mit
//      bestaetigt = false, dann die Bestätigungsmail mit einem Link.
//   2. Klick auf den Link (app/api/heu-minikurs/bestaetigen): bestaetigt =
//      true, Meldung an info@ und aufs Handy, weiter auf /heu-2026/dabei.
//   3. Die Mailstrecke „Minikurs Heu 2026“ (Auslöser "heu-minikurs", siehe
//      lib/newsletter-strecken.ts) schickt die fünf Mails, Tag 0 bis 4 nach
//      der Bestätigung. Die Texte stehen in der Datenbank, bearbeitet werden
//      sie unter /admin/newsletter.
//
// ▸ DER LINK IST EINE UNTERSCHRIFT über die Adresse (HMAC mit dem
//   Supabase-Schlüssel), keine Zufallszahl aus der Tabelle, genau wie beim
//   Öl-Guide. So kann niemand fremde Adressen bestätigen.
//
// ▸ DAS HÄKCHEN IST PFLICHT, wie beim Stall Organizer. Der Wortlaut steht
//   hier und im Formular (components/HeuMinikursAnmeldung.tsx zeigt diese
//   Konstante an, es gibt ihn also nur einmal).
//
// Nur aus Route-Handlern importieren, der Rest der Datei braucht Schlüssel.
// ---------------------------------------------------------------------------

const TABELLE = "heu_minikurs_anmeldungen";
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const SEITE = "https://www.pferdeliebehealthy.de";

export { EINWILLIGUNG_HEU_MINIKURS } from "@/lib/heu-minikurs";
import { EINWILLIGUNG_HEU_MINIKURS } from "@/lib/heu-minikurs";

// ---------------------------------------------------------------------------
// Der Bestätigungslink
// ---------------------------------------------------------------------------

function unterschrift(email: string): string {
  return createHmac("sha256", SUPABASE_SECRET_KEY || "kein-schluessel")
    .update(`heu-minikurs:${email}`)
    .digest("hex")
    .slice(0, 32);
}

export function unterschriftStimmt(email: string, gegeben: string): boolean {
  const a = Buffer.from(unterschrift(email));
  const b = Buffer.from(gegeben);
  return a.length === b.length && timingSafeEqual(a, b);
}

function bestaetigungsLink(email: string): string {
  return `${SEITE}/api/heu-minikurs/bestaetigen?e=${encodeURIComponent(email)}&p=${unterschrift(email)}`;
}

// ---------------------------------------------------------------------------
// Datenbank
// ---------------------------------------------------------------------------

/**
 * Legt die Anmeldung an. Wer sich zweimal einträgt, behält die erste Zeile
 * (erste Herkunft zählt, eine schon gesetzte Bestätigung bleibt stehen, die
 * Strecke fängt also nicht von vorn an). false heißt: nicht gespeichert,
 * meist weil datenbank/heu-minikurs.sql noch nicht eingespielt ist.
 */
export async function speichereAnmeldung(email: string, vorname: string, quelle: string): Promise<boolean> {
  const res = await supabase(`${TABELLE}?on_conflict=email`, {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({
      email,
      vorname: vorname || null,
      quelle,
      einwilligung_text: EINWILLIGUNG_HEU_MINIKURS,
    }),
  });
  return res.ok;
}

/**
 * Setzt die Bestätigung beim ersten Klick. `frisch` sagt, ob das gerade eben
 * passiert ist, damit die Meldung an Yasi nur einmal kommt. Geändert wird
 * über die id, nicht über die Adresse.
 */
export async function bestaetigeAnmeldung(
  email: string,
): Promise<{ vorname: string | null; frisch: boolean } | null> {
  const zeile = await ersteZeile<{ id: string; vorname: string | null; bestaetigt: boolean }>(
    `${TABELLE}?email=eq.${encodeURIComponent(email)}&select=id,vorname,bestaetigt&limit=1`,
  );
  if (!zeile) return null;
  if (zeile.bestaetigt) return { vorname: zeile.vorname, frisch: false };

  const res = await supabase(`${TABELLE}?id=eq.${encodeURIComponent(zeile.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ bestaetigt: true, bestaetigt_am: new Date().toISOString() }),
  });
  return res.ok ? { vorname: zeile.vorname, frisch: true } : null;
}

// ---------------------------------------------------------------------------
// Mails
// ---------------------------------------------------------------------------

/** Die Bestätigungsmail. Ohne den Klick darin kommt keine weitere Mail. */
export async function sendeBestaetigungsMail(email: string, vorname: string): Promise<boolean> {
  const link = bestaetigungsLink(email);
  return sendeMail(
    email,
    "Ein Klick noch für deinen Minikurs Heu 2026",
    rahmen(`
      <p style="font-size:17px;">${anrede(vorname)}</p>
      <p style="font-size:16px;line-height:1.6;">
        schön, dass du dabei sein willst. Ein Klick noch, dann bekommst du fünf
        Tage lang jeden Tag eine kurze Mail zum Heu 2026: was die Analysen
        dieses Jahres zeigen, auf welche Werte ich zuerst schaue und was du
        auch ohne Analyse tun kannst.
      </p>
      ${knopf(link, "Ja, ich bin dabei")}
      <p style="font-size:14px;line-height:1.6;color:#8a7070;">
        Mit dem Klick bestätigst du auch, dass ich dir danach ab und zu Tipps
        rund um Fütterung und Pferdegesundheit schicken darf. Abmelden geht mit
        einem Klick in jeder Mail.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#8a7070;">
        Falls der Knopf nicht funktioniert, kopiere diese Adresse in deinen Browser:<br>
        <span style="word-break:break-all;">${esc(link)}</span>
      </p>
      <p style="font-size:14px;line-height:1.6;color:#8a7070;">
        Hast du dich gar nicht eingetragen? Dann ignoriere diese Mail einfach.
        Ohne deinen Klick bekommst du nichts weiter von mir.
      </p>
    `),
    { handy: false },
  );
}

/** Die Meldung an Yasi, erst nach dem ersten Klick. Geht an info@ und damit aufs Handy. */
export async function meldeNeueAnmeldung(email: string, vorname: string | null): Promise<boolean> {
  return sendeMail(
    ANTWORT_AN,
    `Neue Anmeldung Minikurs Heu 2026: ${vorname || email}`,
    rahmen(`
      <p style="font-size:17px;">Neue bestätigte Anmeldung für den Minikurs Heu 2026</p>
      <p style="font-size:16px;line-height:1.8;">
        <strong>Name:</strong> ${esc(vorname || "ohne Angabe")}<br>
        <strong>E-Mail:</strong> ${esc(email)}
      </p>
      <p style="font-size:14px;line-height:1.6;color:#8a7070;">
        Die fünf Mails schickt die Strecke „Minikurs Heu 2026“, sofern sie unter
        /admin/newsletter eingeschaltet ist.
      </p>
    `),
  );
}
// ENDE DER DATEI
