// ---------------------------------------------------------------------------
// Alles, was beim Futter-Check auf dem Server passiert: speichern und Mails
// verschicken.
//
// Diese Datei gehoert ausschliesslich auf den Server. Importiere sie nur aus
// Route-Handlern und Server-Komponenten, nie aus einer Datei mit "use client".
// Die Schluessel unten tragen bewusst kein NEXT_PUBLIC_ im Namen — dadurch
// reicht Next.js sie gar nicht erst an den Browser weiter.
//
// ▸ DAMIT DAS LAEUFT, brauchst du drei Angaben in den Vercel-Einstellungen
//   dieses Projekts (Settings → Environment Variables):
//
//     SUPABASE_URL         dieselbe wie bei der Akademie
//     SUPABASE_SECRET_KEY  derselbe wie bei der Akademie
//     RESEND_API_KEY       derselbe wie bei der Akademie
//
//   Alle drei findest du in den Einstellungen deines Akademie-Projekts bei
//   Vercel und kannst sie von dort kopieren.
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

/** Absender. Die Domain updates.pferdeliebehealthy.de ist bei Resend bereits
 *  freigeschaltet — dieselbe, ueber die auch die Akademie verschickt. */
const VON = "Yasi von Pferdeliebehealthy <info@updates.pferdeliebehealthy.de>";

/** Antworten landen in deinem richtigen Postfach, nicht bei Resend. */
const ANTWORT_AN = "info@pferdeliebehealthy.de";

/** Hierhin gehen die Benachrichtigungen ueber neue Anmeldungen. */
const BENACHRICHTIGUNG_AN = "info@pferdeliebehealthy.de";

const TABELLE = "futter_check_anmeldungen";

export type Anmeldung = {
  id: string;
  vorname: string;
  email: string;
  bestaetigt: boolean;
  token: string;
  ergebnis_titel: string | null;
  ergebnis_text: string | null;
};

/** Sagt, ob die drei Zugangsdaten hinterlegt sind. Fehlt eines, meldet die
 *  Seite das ehrlich, statt so zu tun, als sei die Anmeldung angekommen. */
export function istEingerichtet(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY && RESEND_API_KEY);
}

// ---------------------------------------------------------------------------
// Datenbank
// ---------------------------------------------------------------------------

async function supabase(pfad: string, optionen: RequestInit = {}) {
  return fetch(`${SUPABASE_URL}/rest/v1/${pfad}`, {
    ...optionen,
    headers: {
      apikey: SUPABASE_SECRET_KEY!,
      Authorization: `Bearer ${SUPABASE_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...optionen.headers,
    },
    cache: "no-store",
  });
}

async function findeNachEmail(email: string): Promise<Anmeldung | null> {
  const res = await supabase(
    `${TABELLE}?email=eq.${encodeURIComponent(email)}&select=*&limit=1`
  );
  if (!res.ok) return null;
  const zeilen = await res.json();
  return Array.isArray(zeilen) && zeilen.length > 0 ? zeilen[0] : null;
}

export async function findeNachToken(token: string): Promise<Anmeldung | null> {
  const res = await supabase(
    `${TABELLE}?token=eq.${encodeURIComponent(token)}&select=*&limit=1`
  );
  if (!res.ok) return null;
  const zeilen = await res.json();
  return Array.isArray(zeilen) && zeilen.length > 0 ? zeilen[0] : null;
}

export type NeueAnmeldung = {
  vorname: string;
  email: string;
  ergebnisTitel: string;
  ergebnisText: string;
  antworten: unknown;
};

/** Legt die Anmeldung an oder aktualisiert eine bestehende.
 *
 *  Wer den Check ein zweites Mal macht, bekommt keinen zweiten Eintrag,
 *  sondern sein Ergebnis wird ueberschrieben. Der Token bleibt dabei
 *  derselbe, damit ein alter Bestaetigungslink aus einer frueheren Mail
 *  nicht ploetzlich ins Leere laeuft.
 *
 *  Rueckgabe: die gespeicherte Zeile, oder null wenn die Datenbank nicht
 *  erreichbar war. */
export async function speichereAnmeldung(
  daten: NeueAnmeldung
): Promise<Anmeldung | null> {
  const vorhanden = await findeNachEmail(daten.email);

  const inhalt = {
    vorname: daten.vorname,
    email: daten.email,
    ergebnis_titel: daten.ergebnisTitel,
    ergebnis_text: daten.ergebnisText,
    antworten: daten.antworten,
    quelle: "futter-check",
  };

  if (vorhanden) {
    const res = await supabase(
      `${TABELLE}?id=eq.${encodeURIComponent(vorhanden.id)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=representation" },
        body: JSON.stringify(inhalt),
      }
    );
    if (!res.ok) return null;
    const zeilen = await res.json();
    return Array.isArray(zeilen) && zeilen.length > 0 ? zeilen[0] : vorhanden;
  }

  const res = await supabase(TABELLE, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ ...inhalt, token: crypto.randomUUID() }),
  });
  if (!res.ok) return null;
  const zeilen = await res.json();
  return Array.isArray(zeilen) && zeilen.length > 0 ? zeilen[0] : null;
}

/** Setzt den Haken, dass die Adresse bestaetigt ist.
 *
 *  Gibt zurueck, ob das gerade eben passiert ist. Bei einem zweiten Klick
 *  auf denselben Link ist die Anmeldung schon bestaetigt — dann meldet die
 *  Funktion `frisch: false`, damit die Ergebnismail nicht doppelt rausgeht. */
export async function bestaetigeAnmeldung(
  token: string
): Promise<{ anmeldung: Anmeldung; frisch: boolean } | null> {
  const anmeldung = await findeNachToken(token);
  if (!anmeldung) return null;
  if (anmeldung.bestaetigt) return { anmeldung, frisch: false };

  const res = await supabase(`${TABELLE}?id=eq.${encodeURIComponent(anmeldung.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ bestaetigt: true, bestaetigt_am: new Date().toISOString() }),
  });
  if (!res.ok) return null;

  return { anmeldung: { ...anmeldung, bestaetigt: true }, frisch: true };
}

// ---------------------------------------------------------------------------
// Mails
// ---------------------------------------------------------------------------

async function sendeMail(an: string, betreff: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: VON,
      to: [an],
      reply_to: ANTWORT_AN,
      subject: betreff,
      html,
    }),
  });
  return res.ok;
}

/** Macht aus Text sicheres HTML. Ohne das koennte jemand ueber das
 *  Namensfeld fremdes Markup in deine Benachrichtigungsmail schmuggeln. */
function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Der gemeinsame Rahmen aller Mails — schlicht gehalten, weil viele
 *  Postfaecher aufwendiges Layout ohnehin zerlegen. */
function rahmen(inhalt: string): string {
  return `
<div style="background:#F9EDED;padding:32px 16px;font-family:Georgia,serif;color:#4A3636;">
  <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:32px;">
    ${inhalt}
    <p style="font-size:14px;color:#8a7070;margin-top:32px;border-top:1px solid #EAD8D8;padding-top:20px;">
      Yasemin Halac · Pferdeliebehealthy · Ernährungsberaterin für Pferde<br>
      <a href="mailto:${ANTWORT_AN}" style="color:#B87878;">${ANTWORT_AN}</a>
    </p>
  </div>
</div>`;
}

/** Schritt 1: die Bestaetigungsmail (Double-Opt-in).
 *
 *  Sie enthaelt bewusst noch nichts Werbliches. Erst der Klick auf den Link
 *  macht die Adresse zu einer, an die du schreiben darfst. */
export async function sendeBestaetigungsMail(
  anmeldung: Anmeldung,
  basisUrl: string
) {
  const link = `${basisUrl}/futter-check-bestaetigt?token=${encodeURIComponent(anmeldung.token)}`;
  return sendeMail(
    anmeldung.email,
    "Bitte bestätige kurz deine E-Mail-Adresse",
    rahmen(`
      <p style="font-size:17px;">Hallo ${esc(anmeldung.vorname)},</p>
      <p style="font-size:16px;line-height:1.6;">
        schön, dass du den Futter-Check gemacht hast. Damit ich dir dein
        Ergebnis schicken darf, brauche ich einmal deine Bestätigung — ein
        Klick, mehr nicht:
      </p>
      <p style="margin:28px 0;">
        <a href="${link}" style="background:#B87878;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:16px;display:inline-block;">
          Ja, das bin ich
        </a>
      </p>
      <p style="font-size:14px;line-height:1.6;color:#8a7070;">
        Falls der Knopf nicht funktioniert, kopiere diese Adresse in deinen
        Browser:<br>
        <span style="word-break:break-all;">${link}</span>
      </p>
      <p style="font-size:14px;line-height:1.6;color:#8a7070;">
        Hast du dich gar nicht angemeldet? Dann ignoriere diese Mail einfach.
        Ohne deinen Klick passiert nichts weiter.
      </p>
    `)
  );
}

/** Schritt 2: das Ergebnis, nach der Bestaetigung. */
export async function sendeErgebnisMail(anmeldung: Anmeldung, basisUrl: string) {
  return sendeMail(
    anmeldung.email,
    `Dein Futter-Check: ${anmeldung.ergebnis_titel ?? "dein Ergebnis"}`,
    rahmen(`
      <p style="font-size:17px;">Hallo ${esc(anmeldung.vorname)},</p>
      <p style="font-size:16px;line-height:1.6;">danke dir. Hier ist dein Ergebnis noch einmal zum Nachlesen:</p>
      <div style="background:#F9EDED;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#B87878;margin:0 0 8px;">Dein Fütterungstyp</p>
        <p style="font-size:20px;margin:0 0 12px;">${esc(anmeldung.ergebnis_titel ?? "")}</p>
        <p style="font-size:15px;line-height:1.7;margin:0;">${esc(anmeldung.ergebnis_text ?? "")}</p>
      </div>
      <p style="font-size:16px;line-height:1.6;">
        Wenn du jetzt wissen willst, ob die Mineralversorgung deines Pferdes
        wirklich zu seinem Alter, seiner Haltung und seiner Belastung passt,
        ist das dein nächster Schritt:
      </p>
      <p style="margin:24px 0;">
        <a href="${basisUrl}/mineral-klarheit" style="background:#B87878;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:16px;display:inline-block;">
          Mineral-Klarheit ansehen
        </a>
      </p>
      <p style="font-size:16px;line-height:1.6;">Alles Gute für dich und dein Pferd,<br>Yasi</p>
    `)
  );
}

/** Schritt 3: die Nachricht an dich.
 *
 *  Geht erst nach der Bestaetigung raus — so hoerst du nur von Adressen, die
 *  wirklich existieren, und dein Postfach bleibt frei von Tippfehlern und
 *  Spam-Eintraegen. */
export async function sendeBenachrichtigung(anmeldung: Anmeldung) {
  return sendeMail(
    BENACHRICHTIGUNG_AN,
    `Neue Futter-Check-Anmeldung: ${anmeldung.vorname}`,
    rahmen(`
      <p style="font-size:17px;">Neue bestätigte Anmeldung</p>
      <p style="font-size:16px;line-height:1.8;">
        <strong>Name:</strong> ${esc(anmeldung.vorname)}<br>
        <strong>E-Mail:</strong> ${esc(anmeldung.email)}<br>
        <strong>Ergebnis:</strong> ${esc(anmeldung.ergebnis_titel ?? "—")}
      </p>
      <p style="font-size:15px;line-height:1.7;color:#8a7070;">
        ${esc(anmeldung.ergebnis_text ?? "")}
      </p>
    `)
  );
}
