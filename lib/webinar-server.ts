import {
  supabase,
  ersteZeile,
  sendeMail,
  esc,
  rahmen,
  anrede,
  knopf,
} from "@/lib/versand";
import { terminText, istGueltigerTermin, VORLAUF_MINUTEN } from "@/lib/webinar";

// ---------------------------------------------------------------------------
// Das Webinar auf dem Server: anmelden, Zugangslink verschicken, Raum finden.
//
// Anders als beim Insider-Kanal gibt es hier KEINE eigene Bestaetigungsmail.
// Die Anmeldemail traegt den Zugangslink, und wer ihn anklickt, hat damit
// belegt, dass die Adresse ihm gehoert. Eine zweite Mail dazwischen waere
// eine Huerde, an der die Haelfte haengen bleibt, und der Termin steht ja
// schon fest.
//
// Nur aus Route-Handlern und Server-Komponenten importieren.
// ---------------------------------------------------------------------------

const TABELLE = "webinar_anmeldungen";

export type WebinarAnmeldung = {
  id: string;
  vorname: string | null;
  email: string;
  webinar: string;
  termin: string;
  token: string;
  raum_geoeffnet_am: string | null;
  gesehen_bis_sekunde: number | null;
};

/** Ein Zugangsschluessel, der sich nicht raten laesst. */
function neuerToken(): string {
  const zeichen = "abcdefghijkmnpqrstuvwxyz23456789"; // ohne l, o, 0, 1
  const zufall = new Uint8Array(24);
  crypto.getRandomValues(zufall);
  return Array.from(zufall, (z) => zeichen[z % zeichen.length]).join("");
}

/**
 * Meldet jemanden zu einem Termin an.
 *
 * Wer sich fuer denselben Termin ein zweites Mal eintraegt, bekommt seinen
 * bestehenden Zugang zurueck statt einer Fehlermeldung: Meist hat die erste
 * Mail nur den Weg in den Spam gefunden, und dann soll das Formular helfen
 * und nicht meckern.
 */
export async function webinarAnmelden(daten: {
  vorname: string;
  email: string;
  termin: Date;
  einwilligungText: string;
  quelle?: string;
}): Promise<{ ok: true; anmeldung: WebinarAnmeldung; schonDa: boolean } | { ok: false; fehler: string }> {
  const email = daten.email.trim().toLowerCase();
  const termin = daten.termin;

  if (!istGueltigerTermin(termin)) {
    return { ok: false, fehler: "Diesen Termin gibt es nicht." };
  }
  if (termin.getTime() < Date.now() + VORLAUF_MINUTEN * 60000) {
    return { ok: false, fehler: "Dieser Termin beginnt gleich. Bitte wähle den nächsten." };
  }

  const vorhanden = await ersteZeile<WebinarAnmeldung>(
    `${TABELLE}?email=eq.${encodeURIComponent(email)}` +
      `&termin=eq.${encodeURIComponent(termin.toISOString())}&select=*&limit=1`
  );
  if (vorhanden) return { ok: true, anmeldung: vorhanden, schonDa: true };

  const res = await supabase(TABELLE, {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      vorname: daten.vorname.trim() || null,
      email,
      webinar: "heu",
      termin: termin.toISOString(),
      token: neuerToken(),
      einwilligung_text: daten.einwilligungText,
      quelle: daten.quelle ?? "website",
    }),
  });

  if (!res.ok) return { ok: false, fehler: "Speichern fehlgeschlagen." };
  const zeilen = await res.json();
  const anmeldung = Array.isArray(zeilen) ? zeilen[0] : zeilen;
  return { ok: true, anmeldung, schonDa: false };
}

/** Holt die Anmeldung zu einem Zugangsschluessel. */
export async function anmeldungZuToken(token: string): Promise<WebinarAnmeldung | null> {
  if (!/^[a-z2-9]{10,60}$/.test(token)) return null;
  return ersteZeile<WebinarAnmeldung>(
    `${TABELLE}?token=eq.${encodeURIComponent(token)}&select=*&limit=1`
  );
}

/**
 * Haelt fest, dass der Raum geoeffnet wurde.
 *
 * Der erste Aufruf ist zugleich der Beleg, dass die Adresse der Person
 * gehoert. Spaetere Aufrufe schreiben nur noch mit, wie weit sie gekommen ist.
 */
export async function raumBesuchNotieren(id: string, sekunde: number, ersterBesuch: boolean) {
  const werte: Record<string, unknown> = {
    gesehen_bis_sekunde: Math.max(0, Math.round(sekunde)),
  };
  if (ersterBesuch) werte.raum_geoeffnet_am = new Date().toISOString();
  await supabase(`${TABELLE}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(werte),
  });
}

// ---------------------------------------------------------------------------
// Mails
// ---------------------------------------------------------------------------

function raumLink(token: string): string {
  const basis = process.env.BASE_URL || "https://pferdeliebehealthy.de";
  return `${basis.replace(/\/$/, "")}/webinar/raum/${token}`;
}

/**
 * Die Anmeldemail mit dem Zugangslink.
 *
 * Sie enthaelt den Termin im Klartext und noch einmal als Kalendereintrag,
 * damit er nicht untergeht. Ein Webinar, das man vergisst, ist so gut wie
 * eines, zu dem man sich nie angemeldet hat.
 */
export async function sendeAnmeldemail(a: WebinarAnmeldung) {
  const wann = terminText(new Date(a.termin));
  const link = raumLink(a.token);

  await sendeMail(
    a.email,
    `Dein Platz ist reserviert: ${wann}`,
    rahmen(`
      <p style="font-size:17px;">${anrede(a.vorname)}</p>
      <p style="font-size:17px;line-height:1.6;">
        schön, dass du dabei bist. Dein Platz im Webinar
        <strong>„Was steckt wirklich in deinem Heu?"</strong> ist reserviert:
      </p>
      <p style="font-size:19px;line-height:1.5;background:#F9EDED;border-radius:12px;padding:16px 20px;margin:24px 0;">
        <strong>${esc(wann)}</strong><br>
        <span style="font-size:15px;color:#8a7070;">45 Minuten, online, kostenlos</span>
      </p>
      ${knopf(link, "Zum Warteraum")}
      <p style="font-size:15px;line-height:1.6;color:#6B5450;">
        Der Link führt vor dem Termin in einen Warteraum mit einem Countdown.
        Zur vollen Zeit startet das Webinar dort von selbst. Am besten legst du
        dir den Link jetzt gleich in ein Lesezeichen.
      </p>
      <p style="font-size:15px;line-height:1.6;color:#6B5450;">
        Falls du doch nicht kannst: Melde dich einfach für einen anderen Termin
        an, es gibt jeden Abend einen.
      </p>
      <p style="font-size:15px;line-height:1.6;">Bis dahin,<br>Yasi</p>
    `)
  );

  await supabase(`${TABELLE}?id=eq.${encodeURIComponent(a.id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ anmeldemail_am: new Date().toISOString() }),
  });
}

/** Die Erinnerung, wahlweise am Vortag oder eine Stunde vorher. */
export async function sendeErinnerung(a: WebinarAnmeldung, art: "tag" | "stunde") {
  const wann = terminText(new Date(a.termin));
  const link = raumLink(a.token);

  const betreff =
    art === "tag" ? `Morgen: ${wann}` : `In einer Stunde geht es los`;
  const einstieg =
    art === "tag"
      ? `morgen ist es soweit. Dein Webinar beginnt <strong>${esc(wann)}</strong>.`
      : `in einer Stunde beginnt dein Webinar. Der Warteraum ist schon offen.`;

  await sendeMail(
    a.email,
    betreff,
    rahmen(`
      <p style="font-size:17px;">${anrede(a.vorname)}</p>
      <p style="font-size:17px;line-height:1.6;">${einstieg}</p>
      ${knopf(link, "Zum Warteraum")}
      <p style="font-size:15px;line-height:1.6;color:#6B5450;">
        Nimm dir 45 Minuten und etwas zu schreiben mit. Es geht um Zahlen, die
        du danach bei deinem eigenen Pferd nachrechnen kannst.
      </p>
      <p style="font-size:15px;line-height:1.6;">Bis gleich,<br>Yasi</p>
    `)
  );

  const spalte = art === "tag" ? "erinnerung_tag_am" : "erinnerung_stunde_am";
  await supabase(`${TABELLE}?id=eq.${encodeURIComponent(a.id)}`, {
    method: "PATCH",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({ [spalte]: new Date().toISOString() }),
  });
}
