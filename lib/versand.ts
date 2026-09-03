// ---------------------------------------------------------------------------
// Der gemeinsame Unterbau für alles, was Adressen speichert und Mails
// verschickt: der Futter-Check und der Insider-Kanal benutzen beide diese
// Datei.
//
// Sie gehört ausschliesslich auf den Server. Importiere sie nur aus
// Route-Handlern und Server-Komponenten, nie aus einer Datei mit "use client".
// Die Schluessel unten tragen bewusst kein NEXT_PUBLIC_ im Namen — dadurch
// reicht Next.js sie gar nicht erst an den Browser weiter.
//
// ▸ Die drei Angaben stehen in den Vercel-Einstellungen dieses Projekts:
//     SUPABASE_URL, SUPABASE_SECRET_KEY, RESEND_API_KEY
// ---------------------------------------------------------------------------

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;
const RESEND_API_KEY = process.env.RESEND_API_KEY;

/** Absender. Die Domain updates.pferdeliebehealthy.de ist bei Resend
 *  freigeschaltet — dieselbe, ueber die auch die Akademie verschickt. */
const VON = "Yasi von Pferdeliebehealthy <info@updates.pferdeliebehealthy.de>";

/** Antworten landen im richtigen Postfach, nicht bei Resend. */
export const ANTWORT_AN = "info@pferdeliebehealthy.de";

/** Sagt, ob die drei Zugangsdaten hinterlegt sind. Fehlt eines, meldet die
 *  Seite das ehrlich, statt so zu tun, als sei die Anmeldung angekommen. */
export function istEingerichtet(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_SECRET_KEY && RESEND_API_KEY);
}

/** Grosszuegig, aber nicht wahllos: verlangt etwas@etwas.etwas ohne Leerzeichen. */
export const EMAIL_MUSTER = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ---------------------------------------------------------------------------
// Datenbank
// ---------------------------------------------------------------------------

export async function supabase(pfad: string, optionen: RequestInit = {}) {
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

/** Holt **alle** Zeilen einer Abfrage, auch wenn es mehr als tausend sind.
 *
 *  Supabase liefert pro Anfrage hoechstens 1000 Zeilen zurueck — ohne Fehler,
 *  ohne Hinweis, einfach abgeschnitten. Bei einem Verteiler mit 1023 Adressen
 *  hiesse das: 23 Leute bekommen nichts, und niemand merkt es. Deshalb wird
 *  hier so lange in Bloecken nachgeladen, bis nichts mehr kommt. */
export async function supabaseAlle<T>(pfad: string): Promise<T[] | null> {
  const BLOCK = 1000;
  const alle: T[] = [];
  const trenner = pfad.includes("?") ? "&" : "?";

  for (let start = 0; ; start += BLOCK) {
    const res = await supabase(`${pfad}${trenner}offset=${start}&limit=${BLOCK}`);
    if (!res.ok) return null;
    const zeilen = await res.json();
    if (!Array.isArray(zeilen)) return null;
    alle.push(...zeilen);
    if (zeilen.length < BLOCK) return alle;
  }
}

/** Zaehlt Zeilen, ohne sie zu holen.
 *
 *  Wichtig aus demselben Grund wie oben: Wer die Liste holt und `.length`
 *  nimmt, bekommt bei mehr als tausend Zeilen immer 1000 heraus. Supabase
 *  nennt die echte Zahl im Kopf `Content-Range`. Bei einem Fehler kommt -1
 *  zurueck, damit sich das von "wirklich keine" unterscheiden laesst.
 *
 *  ▸ HIER STAND FRUEHER `select=id`, UND DAS WAR EIN FEHLER.
 *    Die Ansicht `alle_anmeldungen` hat gar keine Spalte `id` -- sie fasst
 *    Futter-Check und Insider ueber die Adresse zusammen. Supabase
 *    antwortete deshalb mit 400 „column alle_anmeldungen.id does not
 *    exist", und die Adressenseite zeigte statt der Zahl eine -1.
 *    Aufgefallen am 03.09.2026 beim Bau des Newsletter-Programms.
 *
 *    `select=*` gilt fuer jede Tabelle und jede Ansicht. Teurer wird es
 *    nicht: Bei einem HEAD-Aufruf kommt ohnehin kein Inhalt zurueck, nur
 *    der Kopf mit der Zahl. */
export async function supabaseZaehlen(pfad: string): Promise<number> {
  const trenner = pfad.includes("?") ? "&" : "?";
  const res = await supabase(`${pfad}${trenner}select=*`, {
    method: "HEAD",
    headers: { Prefer: "count=exact", Range: "0-0" },
  });
  if (!res.ok) return -1;
  const bereich = res.headers.get("content-range");        // z. B. "0-0/1023"
  const zahl = Number(bereich?.split("/")[1]);
  return Number.isFinite(zahl) ? zahl : -1;
}

/** Holt die erste Zeile einer Abfrage, oder null. */
export async function ersteZeile<T>(pfad: string): Promise<T | null> {
  const res = await supabase(pfad);
  if (!res.ok) return null;
  const zeilen = await res.json();
  return Array.isArray(zeilen) && zeilen.length > 0 ? zeilen[0] : null;
}

// ---------------------------------------------------------------------------
// Mails
// ---------------------------------------------------------------------------

export async function sendeMail(an: string, betreff: string, html: string) {
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
 *  Namensfeld fremdes Markup in die Benachrichtigungsmail schmuggeln. */
export function esc(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Die Anrede einer Mail: „Hallo Anna," oder einfach „Hallo,".
 *
 *  Wer sich selbst anmeldet, tippt seinen Vornamen ein. Bei den aus den
 *  Shops uebernommenen Adressen stand aber nicht ueberall einer, und in
 *  diesen Faellen ist „du" als Platzhalter eingetragen. Ohne diese Weiche
 *  stuende dort woertlich „Hallo du," in der Mail. */
export function anrede(vorname: string | null | undefined): string {
  const v = (vorname ?? "").trim();
  if (!v || v.toLowerCase() === "du") return "Hallo,";
  return `Hallo ${esc(v)},`;
}

/** Der gemeinsame Rahmen aller Mails — schlicht gehalten, weil viele
 *  Postfaecher aufwendiges Layout ohnehin zerlegen. */
export function rahmen(inhalt: string): string {
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

/** Ein Knopf im Mail-Layout. */
export function knopf(link: string, text: string): string {
  return `<p style="margin:28px 0;">
      <a href="${link}" style="background:#B87878;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:16px;display:inline-block;">
        ${text}
      </a>
    </p>`;
}

/** Kuerzt und saeubert einen Wert aus dem Formular. */
export function kuerzen(wert: unknown, laenge: number): string {
  return typeof wert === "string" ? wert.trim().slice(0, laenge) : "";
}
