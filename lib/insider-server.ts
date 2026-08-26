import {
  supabase,
  ersteZeile,
  sendeMail,
  esc,
  rahmen,
  knopf,
  ANTWORT_AN,
} from "@/lib/versand";
import { insider } from "@/lib/insider";

// ---------------------------------------------------------------------------
// Der Insider-Kanal auf dem Server.
//
// Gleicher Ablauf wie beim Futter-Check: speichern, Bestaetigungsmail, und
// erst nach dem Klick auf den Link gilt die Adresse als bestaetigt. Nur ohne
// Ergebnis, weil hier nichts ausgewertet wird.
//
// Bewusst eine eigene Tabelle: Wer sich hier eintraegt, hat in etwas anderes
// eingewilligt als jemand, der den Futter-Check gemacht hat. Getrennt gespei-
// chert laesst sich fuer jede Adresse belegen, wofuer und wo sie zugestimmt
// hat. Eine gemeinsame Liste zum Herunterladen gibt es trotzdem — die
// Ansicht `alle_anmeldungen` in datenbank/insider.sql fasst beide zusammen.
//
// Nur aus Route-Handlern und Server-Komponenten importieren.
// ---------------------------------------------------------------------------

const TABELLE = "insider_anmeldungen";

export type InsiderAnmeldung = {
  id: string;
  vorname: string;
  email: string;
  bestaetigt: boolean;
  token: string;
};

/** Legt die Anmeldung an oder gibt eine bestehende zurueck.
 *
 *  Wer sich zweimal eintraegt, bekommt keinen zweiten Eintrag. Der Token
 *  bleibt derselbe, damit ein alter Bestaetigungslink weiter funktioniert. */
export async function speichereInsider(
  vorname: string,
  email: string,
  quelle: string
): Promise<InsiderAnmeldung | null> {
  const vorhanden = await ersteZeile<InsiderAnmeldung>(
    `${TABELLE}?email=eq.${encodeURIComponent(email)}&select=*&limit=1`
  );
  if (vorhanden) {
    // Nur den Namen auffrischen, falls sie ihn anders geschrieben hat.
    await supabase(`${TABELLE}?id=eq.${encodeURIComponent(vorhanden.id)}`, {
      method: "PATCH",
      body: JSON.stringify({ vorname }),
    });
    return { ...vorhanden, vorname };
  }

  const res = await supabase(TABELLE, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      vorname,
      email,
      quelle,
      token: crypto.randomUUID(),
    }),
  });
  if (!res.ok) return null;
  const zeilen = await res.json();
  return Array.isArray(zeilen) && zeilen.length > 0 ? zeilen[0] : null;
}

/** Setzt den Haken, dass die Adresse bestaetigt ist. `frisch` sagt, ob das
 *  gerade eben passiert ist — beim zweiten Klick auf denselben Link soll die
 *  Willkommensmail nicht noch einmal rausgehen. */
export async function bestaetigeInsider(
  token: string
): Promise<{ anmeldung: InsiderAnmeldung; frisch: boolean } | null> {
  const anmeldung = await ersteZeile<InsiderAnmeldung>(
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

/** Schritt 1: die Bestaetigungsmail. Enthaelt bewusst noch nichts Werbliches. */
export async function sendeInsiderBestaetigung(
  anmeldung: InsiderAnmeldung,
  basisUrl: string
) {
  const link = `${basisUrl}/insider-bestaetigt?token=${encodeURIComponent(anmeldung.token)}`;
  return sendeMail(
    anmeldung.email,
    "Bitte bestätige kurz deine E-Mail-Adresse",
    rahmen(`
      <p style="font-size:17px;">Hallo ${esc(anmeldung.vorname)},</p>
      <p style="font-size:16px;line-height:1.6;">
        schön, dass du bei den ${esc(insider.name)} dabei sein willst. Ein
        Klick noch, damit ich sicher bin, dass die Adresse wirklich dir gehört:
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

/** Schritt 2: die Willkommensmail nach der Bestaetigung. */
export async function sendeInsiderWillkommen(
  anmeldung: InsiderAnmeldung,
  basisUrl: string
) {
  return sendeMail(
    anmeldung.email,
    `Willkommen bei den ${insider.name}`,
    rahmen(`
      <p style="font-size:17px;">Hallo ${esc(anmeldung.vorname)},</p>
      <p style="font-size:16px;line-height:1.6;">
        du bist dabei. Ab jetzt schreibe ich dir regelmäßig ein Thema aus
        meiner Praxis — was in echten Rationen schiefgeht, wie man Zusatzfutter
        ehrlich einordnet, und wie du Laborwerte selbst lesen lernst.
      </p>
      <p style="font-size:16px;line-height:1.6;">
        Bis die erste Ausgabe kommt, kannst du hier schon einmal stöbern:
      </p>
      ${knopf(`${basisUrl}/insider`, "Zu den Beiträgen")}
      <p style="font-size:16px;line-height:1.6;">
        Und falls du deinen Futter-Check noch nicht gemacht hast — der dauert
        keine drei Minuten und sagt dir, wo dein Pferd gerade steht:
        <a href="${basisUrl}/futter-check" style="color:#B87878;">${basisUrl.replace(/^https?:\/\//, "")}/futter-check</a>
      </p>
      <p style="font-size:16px;line-height:1.6;">Alles Gute für dich und dein Pferd,<br>Yasi</p>
    `)
  );
}

/** Schritt 3: die Nachricht an Yasi, erst nach der Bestaetigung. */
export async function sendeInsiderBenachrichtigung(anmeldung: InsiderAnmeldung) {
  return sendeMail(
    ANTWORT_AN,
    `Neue Insider-Anmeldung: ${anmeldung.vorname}`,
    rahmen(`
      <p style="font-size:17px;">Neue bestätigte Anmeldung für den Insider-Kanal</p>
      <p style="font-size:16px;line-height:1.8;">
        <strong>Name:</strong> ${esc(anmeldung.vorname)}<br>
        <strong>E-Mail:</strong> ${esc(anmeldung.email)}
      </p>
    `)
  );
}
