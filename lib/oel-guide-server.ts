import { createHmac, timingSafeEqual } from "node:crypto";
import { supabase, ersteZeile, sendeMail, esc, anrede, ANTWORT_AN } from "@/lib/versand";

// ---------------------------------------------------------------------------
// Der Öl-Guide von aromahorseoil, gegen Mailadresse (seit 12.09.2026).
//
// ▸ WARUM DAS HIER LIEGT UND NICHT AUF DER AROMAHORSEOIL-SEITE
//   Die Seite der zweiten Marke hat weder Datenbank noch Mailversand und
//   keine Umgebungsvariablen. Dieses Projekt hat beides. Die aromahorseoil-
//   Seite zeigt nur das Formular und reicht es von Server zu Server hierher
//   durch (app/api/oel-guide dort), so wie der Stall Organizer es mit der
//   Akademie macht.
//
// ▸ DER ABLAUF
//   1. Anmeldung: Zeile in `oel_guide_anmeldungen` mit bestaetigt = false,
//      dann eine Mail mit dem persönlichen Link zum Guide.
//   2. Klick auf den Link: Die Adresse gilt als bestätigt, erst dann darf sie
//      weitere Post bekommen, und du bekommst eine Meldung aufs Handy.
//   Der Link ist eine Unterschrift über die Adresse (HMAC mit dem
//   Supabase-Schlüssel), keine Zufallszahl aus der Tabelle. Er funktioniert
//   deshalb auch dann, wenn das Speichern einmal scheitert, und bleibt gültig,
//   solange der Schlüssel derselbe ist.
//
// ▸ DIE PDF LIEGT IM PRIVATEN EIMER `downloads`, nicht mehr im öffentlichen
//   Ordner der aromahorseoil-Seite. Wer die alte Adresse kennt, bekommt nichts.
//
// ▸ BEWUSST NICHT IN `alle_anmeldungen`: Wer sich hier einträgt, hat Tipps zu
//   ätherischen Ölen bestellt, nicht den Newsletter zur Fütterung. Die beiden
//   Marken haben getrennte Listen.
//
// Nur aus Route-Handlern importieren.
// ---------------------------------------------------------------------------

const TABELLE = "oel_guide_anmeldungen";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

/** Die Seite der Marke. Der Link in der Mail zeigt dorthin, nicht hierher. */
const AROMA_SEITE = "https://aromahorseoil-homepage.vercel.app";

/** Gleiche freigeschaltete Domain wie alle Mails, nur der Name ist der der zweiten Marke. */
const VON = "Yasi von aromahorseoil <info@updates.pferdeliebehealthy.de>";

/** Die Datei im privaten Eimer. */
const DATEI = "downloads/aromahorseoil-oel-guide.pdf";

/**
 * Der Wortlaut des Häkchens, so wie er gespeichert wird. MUSS WÖRTLICH GLEICH
 * SEIN mit `guideSeite.einwilligung` in aromahorseoil-homepage/lib/inhalte.ts,
 * denn dort sieht ihn die Besucherin. Wer den einen ändert, ändert den anderen.
 */
export const EINWILLIGUNG_OEL_GUIDE =
  "Ja, schick mir den Öl-Guide und danach ab und zu Tipps zu ätherischen Ölen und Hydrolaten fürs Pferd per E-Mail. Abmelden kann ich mich jederzeit.";

// ---------------------------------------------------------------------------
// Der Link zum Guide
// ---------------------------------------------------------------------------

function unterschrift(email: string): string {
  return createHmac("sha256", SUPABASE_SECRET_KEY || "kein-schluessel")
    .update(`oel-guide:${email}`)
    .digest("hex")
    .slice(0, 32);
}

export function unterschriftStimmt(email: string, gegeben: string): boolean {
  const a = Buffer.from(unterschrift(email));
  const b = Buffer.from(gegeben);
  return a.length === b.length && timingSafeEqual(a, b);
}

function ladeLink(email: string): string {
  return `${AROMA_SEITE}/oel-guide/laden?e=${encodeURIComponent(email)}&p=${unterschrift(email)}`;
}

// ---------------------------------------------------------------------------
// Datenbank
// ---------------------------------------------------------------------------

/**
 * Legt die Anmeldung an. Wer sich zweimal einträgt, behält die erste Zeile
 * (erste Herkunft zählt, eine schon gesetzte Bestätigung bleibt stehen).
 * false heißt: nicht gespeichert, meist weil die Tabelle noch fehlt.
 */
export async function speichereOelGuide(email: string, vorname: string, quelle: string): Promise<boolean> {
  const res = await supabase(`${TABELLE}?on_conflict=email`, {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({
      email,
      vorname: vorname || null,
      quelle,
      einwilligung_text: EINWILLIGUNG_OEL_GUIDE,
    }),
  });
  return res.ok;
}

/**
 * Setzt die Bestätigung beim ersten Klick auf den Link. `frisch` sagt, ob das
 * gerade eben passiert ist, damit die Meldung an Yasi nur einmal kommt.
 * Geändert wird über die id, nicht über die Adresse.
 */
export async function bestaetigeOelGuide(
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

/** Die PDF aus dem privaten Eimer. */
export async function holeGuide(): Promise<ArrayBuffer | null> {
  const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${DATEI}`, {
    headers: { apikey: SUPABASE_SECRET_KEY!, Authorization: `Bearer ${SUPABASE_SECRET_KEY}` },
    cache: "no-store",
  });
  return res.ok ? res.arrayBuffer() : null;
}

// ---------------------------------------------------------------------------
// Mails, in den Farben von aromahorseoil
// ---------------------------------------------------------------------------

function rahmen(inhalt: string): string {
  return `
<div style="background:#FBF5EE;padding:32px 16px;font-family:Georgia,serif;color:#2C1D14;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
    ${inhalt}
    <p style="font-size:14px;color:#6E594A;margin-top:32px;border-top:1px solid #E9DAC5;padding-top:20px;">
      Yasi · aromahorseoil · Aromapflege fürs Pferd<br>
      <a href="mailto:${ANTWORT_AN}" style="color:#8B3E29;">${ANTWORT_AN}</a>
    </p>
  </div>
</div>`;
}

function knopf(link: string, text: string): string {
  return `<p style="margin:28px 0;">
      <a href="${link}" style="background:#B0543A;color:#FBF5EE;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:16px;display:inline-block;">
        ${text}
      </a>
    </p>`;
}

/** Die Mail mit dem Guide. Sie ist zugleich die Bestätigung der Adresse. */
export async function sendeGuideMail(email: string, vorname: string): Promise<boolean> {
  const link = ladeLink(email);
  return sendeMail(
    email,
    "Dein Öl-Guide ist da",
    rahmen(`
      <p style="font-size:17px;">${anrede(vorname)}</p>
      <p style="font-size:16px;line-height:1.6;">
        schön, dass du reinschaust. Hier ist dein Öl-Guide, dein sanfter Einstieg
        in die Welt der ätherischen Öle. Ein Klick, und du kannst ihn lesen und
        speichern:
      </p>
      ${knopf(link, "Meinen Öl-Guide öffnen")}
      <p style="font-size:16px;line-height:1.6;">
        Mein Tipp: Fang mit der kleinen Übung auf Seite 6 an. Ein Tropfen, deine
        Hände, dein Pferd, und du schaust nur zu, was es dir antwortet.
      </p>
      <p style="font-size:16px;line-height:1.6;">Alles Liebe für dich und dein Pferd,<br>Yasi</p>
      <p style="font-size:14px;line-height:1.6;color:#6E594A;">
        Mit dem Klick bestätigst du auch, dass ich dir ab und zu Tipps zu Ölen
        und Hydrolaten schicken darf. Abmelden geht jederzeit mit einer kurzen
        Antwort auf eine meiner Mails.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#6E594A;">
        Falls der Knopf nicht funktioniert, kopiere diese Adresse in deinen Browser:<br>
        <span style="word-break:break-all;">${esc(link)}</span>
      </p>
      <p style="font-size:14px;line-height:1.6;color:#6E594A;">
        Hast du dich gar nicht eingetragen? Dann ignoriere diese Mail einfach.
        Ohne deinen Klick bekommst du nichts weiter von mir.
      </p>
    `),
    { von: VON, handy: false },
  );
}

/** Die Meldung an Yasi, erst nach dem ersten Klick. Geht an info@ und damit auch aufs Handy. */
export async function meldeNeueAnmeldung(email: string, vorname: string | null): Promise<boolean> {
  return sendeMail(
    ANTWORT_AN,
    `Neue Öl-Guide-Anmeldung: ${vorname || email}`,
    rahmen(`
      <p style="font-size:17px;">Neue bestätigte Anmeldung für den Öl-Guide (aromahorseoil)</p>
      <p style="font-size:16px;line-height:1.8;">
        <strong>Name:</strong> ${esc(vorname || "ohne Angabe")}<br>
        <strong>E-Mail:</strong> ${esc(email)}
      </p>
    `),
    { von: VON },
  );
}
// ENDE DER DATEI
