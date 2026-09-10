import {
  supabase,
  ersteZeile,
  sendeMail,
  esc,
  rahmen,
  knopf,
  anrede,
  ANTWORT_AN,
} from "@/lib/versand";
import { abmeldeLink } from "@/lib/newsletter-server";
import { angebotFuer, antwortenLesen, VORGEHEN_TEXT } from "@/lib/futter-check-angebot";
import { preisText } from "@/lib/shop";

// ---------------------------------------------------------------------------
// Der Futter-Check auf dem Server: Anmeldung speichern, bestaetigen, Mails.
// Der gemeinsame Unterbau (Datenbank, Mailversand, Zugangsdaten) steht in
// lib/versand.ts.
//
// ▸ DAS ERGEBNIS GIBT ES NUR PER MAIL, so von Yasemin am 10.09.2026
//   entschieden. Der Fragebogen zeigt es nicht mehr an. Es kommt nach dem
//   Klick auf den Bestaetigungslink, als Seite und als Mail. Wer schon
//   bestaetigt ist und den Check wiederholt, bekommt es sofort per Mail.
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
  antworten?: unknown;
  quelle?: string | null;
};

export type NeueAnmeldung = {
  vorname: string;
  email: string;
  ergebnisTitel: string;
  ergebnisText: string;
  antworten: unknown;
  /** Woher sie kam, aus ?von= in der Adresse. Null heisst: unbekannt. */
  quelle: string | null;
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

  const inhalt: Record<string, unknown> = {
    vorname: daten.vorname,
    email: daten.email,
    ergebnis_titel: daten.ergebnisTitel,
    ergebnis_text: daten.ergebnisText,
    antworten: daten.antworten,
  };

  if (vorhanden) {
    // Die Herkunft zaehlt beim ersten Mal. Wer ueber Instagram kam und den
    // Check spaeter ueber die Startseite wiederholt, bleibt eine
    // Instagram-Anmeldung. Nur ein leerer oder allgemeiner Eintrag wird durch
    // eine echte Herkunft ersetzt.
    if (daten.quelle && (!vorhanden.quelle || vorhanden.quelle === "futter-check")) {
      inhalt.quelle = daten.quelle;
    }

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
    body: JSON.stringify({
      ...inhalt,
      quelle: daten.quelle ?? "futter-check",
      token: crypto.randomUUID(),
    }),
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
        Ergebnis schicken darf, brauche ich einmal deine Bestätigung, ein
        Klick, mehr nicht. Direkt danach siehst du deine Auswertung, und sie
        kommt zusätzlich in dein Postfach:
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

/** Die Ergebnismail als HTML. Getrennt vom Versand, damit sie sich ansehen
 *  laesst, ohne sie zu verschicken. */
export function ergebnisMailHtml(anmeldung: Anmeldung, basisUrl: string): string {
  const angebot = angebotFuer(anmeldung.ergebnis_titel, anmeldung.antworten);
  const seite = `${basisUrl}/futter-check-bestaetigt?token=${encodeURIComponent(anmeldung.token)}`;

  // Ergebnistext, Tierarzt- und Altershinweis sind mit Leerzeilen getrennt.
  const absaetze = (anmeldung.ergebnis_text ?? "")
    .split(/\n\s*\n/)
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => `<p style="font-size:15px;line-height:1.7;margin:0 0 12px;">${esc(t)}</p>`)
    .join("");

  const preis = angebot.haupt.preis > 0 ? ` · ${preisText(angebot.haupt.preis)}` : "";

  const neben = angebot.neben
    ? `<p style="font-size:15px;line-height:1.6;margin:8px 0 0;color:#6b5555;">
        <strong style="color:#4A3636;">${esc(angebot.neben.titel)}:</strong>
        ${esc(angebot.neben.warum)}
        <a href="${basisUrl}/${angebot.neben.slug}" style="color:#95534F;">${esc(
          angebot.neben.name
        )} ansehen</a> (${preisText(angebot.neben.preis)})
      </p>`
    : "";

  return rahmen(`
      <p style="font-size:17px;">${anrede(anmeldung.vorname)}</p>
      <p style="font-size:16px;line-height:1.6;">danke dir. Hier ist dein Ergebnis aus dem Futter-Check:</p>
      <div style="background:#F9EDED;border-radius:12px;padding:20px;margin:24px 0;">
        <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#95534F;margin:0 0 8px;">Dein Fütterungstyp</p>
        <p style="font-size:20px;margin:0 0 12px;">${esc(anmeldung.ergebnis_titel ?? "")}</p>
        ${absaetze}
      </div>
      <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#95534F;margin:32px 0 8px;">Mein Vorschlag für dich</p>
      <p style="font-size:19px;margin:0 0 10px;">${esc(angebot.haupt.name)}${preis}</p>
      <p style="font-size:16px;line-height:1.6;margin:0;">${esc(angebot.haupt.warum)}</p>
      ${knopf(`${basisUrl}/${angebot.haupt.slug}`, `${esc(angebot.haupt.name)} ansehen`)}
      ${neben}
      <p style="font-size:16px;line-height:1.6;margin-top:28px;">Alles Gute für dich und dein Pferd,<br>Yasi</p>
      <p style="font-size:13px;line-height:1.6;color:#8a7070;margin-top:24px;">
        <a href="${seite}" style="color:#8a7070;">Dein Ergebnis auf der Seite ansehen</a> ·
        <a href="${abmeldeLink(anmeldung.email, basisUrl)}" style="color:#8a7070;">Keine Mails mehr von mir</a>
      </p>
    `);
}

/** Schritt 2: das Ergebnis, nach der Bestaetigung oder bei einer
 *  Wiederholung durch eine schon bestaetigte Adresse. */
export async function sendeErgebnisMail(anmeldung: Anmeldung, basisUrl: string) {
  return sendeMail(
    anmeldung.email,
    `Dein Futter-Check: ${anmeldung.ergebnis_titel ?? "dein Ergebnis"}`,
    ergebnisMailHtml(anmeldung, basisUrl)
  );
}

/** Schritt 3: die Nachricht an Yasi.
 *
 *  Geht erst nach der Bestaetigung raus — so hoert sie nur von Adressen, die
 *  wirklich existieren, und ihr Postfach bleibt frei von Tippfehlern und
 *  Spam-Eintraegen. */
export async function sendeBenachrichtigung(anmeldung: Anmeldung, wiederholt = false) {
  const { vorgehen, vorgehenAngegeben } = antwortenLesen(anmeldung.antworten);
  const angebot = angebotFuer(anmeldung.ergebnis_titel, anmeldung.antworten);

  return sendeMail(
    ANTWORT_AN,
    `${wiederholt ? "Futter-Check wiederholt" : "Neue Futter-Check-Anmeldung"}: ${anmeldung.vorname}`,
    rahmen(`
      <p style="font-size:17px;">${wiederholt ? "Futter-Check noch einmal gemacht" : "Neue bestätigte Anmeldung"}</p>
      <p style="font-size:16px;line-height:1.8;">
        <strong>Name:</strong> ${esc(anmeldung.vorname)}<br>
        <strong>E-Mail:</strong> ${esc(anmeldung.email)}<br>
        <strong>Ergebnis:</strong> ${esc(anmeldung.ergebnis_titel ?? "—")}<br>
        <strong>Möchte:</strong> ${vorgehenAngegeben ? esc(VORGEHEN_TEXT[vorgehen]) : "keine Angabe"}<br>
        <strong>Empfohlen:</strong> ${esc(angebot.haupt.name)}<br>
        <strong>Kam über:</strong> ${esc(anmeldung.quelle ?? "unbekannt")}
      </p>
      <p style="font-size:15px;line-height:1.7;color:#8a7070;">
        ${esc(anmeldung.ergebnis_text ?? "")}
      </p>
    `)
  );
}
