import {
  supabase,
  ersteZeile,
  sendeMail,
  esc,
  rahmen,
  knopf,
  ANTWORT_AN,
} from "@/lib/versand";

// ---------------------------------------------------------------------------
// Der Futter-Check auf dem Server: Anmeldung speichern, bestaetigen, Mails.
// Der gemeinsame Unterbau (Datenbank, Mailversand, Zugangsdaten) steht in
// lib/versand.ts.
//
// Nur aus Route-Handlern und Server-Komponenten importieren.
// ---------------------------------------------------------------------------

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
  const vorhanden = await ersteZeile<Anmeldung>(
    `${TABELLE}?email=eq.${encodeURIComponent(daten.email)}&select=*&limit=1`
  );

  const inhalt = {
    vorname: daten.vorname,
    email: daten.email,
    ergebnis_titel: daten.ergebnisTitel,
    ergebnis_text: daten.ergebnisText,
    antworten: daten.antworten,
    quelle: "futter-check",
  };

  if (vorhanden) {
    const res = await supabase(`${TABELLE}?id=eq.${encodeURIComponent(vorhanden.id)}`, {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify(inhalt),
    });
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
  const anmeldung = await ersteZeile<Anmeldung>(
    `${TABELLE}?token=eq.${encodeURIComponent(token)}&select=*&limit=1`
  );
  if (!anmeldung) return null;
  if (anmeldung.bestaetigt) return { anmeldung, frisch: false };

  const res = await supabase(`${TABELLE}?id=eq.${encodeURIComponent(anmeldung.id)}`, {
    method: "PATCH",
    body: JSON.stringify({ bestaetigt: true, bestaetigt_am: new Date().toISOString() }),
  });
  if (!res.ok) return null;

  return { anmeldung: { ...anmeldung, bestaetigt: true }, frisch: true };
}

/** Schritt 1: die Bestaetigungsmail (Double-Opt-in).
 *
 *  Sie enthaelt bewusst noch nichts Werbliches. Erst der Klick auf den Link
 *  macht die Adresse zu einer, an die geworben werden darf. */
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
      ${knopf(link, "Ja, das bin ich")}
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
      ${knopf(`${basisUrl}/mineral-klarheit`, "Mineral-Klarheit ansehen")}
      <p style="font-size:16px;line-height:1.6;">Alles Gute für dich und dein Pferd,<br>Yasi</p>
    `)
  );
}

/** Schritt 3: die Nachricht an Yasi.
 *
 *  Geht erst nach der Bestaetigung raus — so hoert sie nur von Adressen, die
 *  wirklich existieren, und ihr Postfach bleibt frei von Tippfehlern und
 *  Spam-Eintraegen. */
export async function sendeBenachrichtigung(anmeldung: Anmeldung) {
  return sendeMail(
    ANTWORT_AN,
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
