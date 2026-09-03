import { createHmac, timingSafeEqual } from "node:crypto";
import {
  supabase,
  supabaseAlle,
  supabaseZaehlen,
  ersteZeile,
  ANTWORT_AN,
  EMAIL_MUSTER,
} from "@/lib/versand";
import {
  textZuHtml,
  namenEinsetzen,
  newsletterRahmen,
  briefPruefen,
  type Brief,
  type Empfaenger,
} from "@/lib/newsletter";
import { vorlageFinden } from "@/lib/newsletter-vorlagen";

// ---------------------------------------------------------------------------
// Das Newsletter-Programm, Serverseite: Entwürfe, Empfänger, Versand,
// Abmeldung und Auswertung.
//
// Nur aus Route-Handlern und Server-Komponenten importieren.
// ---------------------------------------------------------------------------

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

const VON = "Yasi von Pferdeliebehealthy <info@updates.pferdeliebehealthy.de>";

/** Resend nimmt bis zu 100 Mails pro Anfrage entgegen. Einzeln verschickt
 *  liefe der Versand bei einem wachsenden Verteiler in die Zeitbegrenzung
 *  von Vercel — in Bündeln bleibt er auch bei tausend Adressen schnell. */
const BUENDEL = 100;

/** Öffnungen und Klicks mitzählen?
 *
 *  ▸ STEHT BEWUSST AUF `false`, UND DAS MUSST DU LESEN, BEVOR DU ES
 *    UMSTELLST.
 *
 *    In deiner eigenen Datenschutzerklärung steht wörtlich der Satz:
 *    „Ein Tracking-Pixel oder Öffnungs-Tracking setzen wir nicht ein."
 *    (app/datenschutz/page.tsx, Abschnitt „Speicherung und Versand").
 *
 *    Würde hier `true` stehen, wäre dieser Satz falsch — und eine falsche
 *    Aussage in der Datenschutzerklärung ist schlimmer als gar keine. Das
 *    ist genau die Art Widerspruch, die abgemahnt wird.
 *
 *  ▸ SO SCHALTEST DU ES EIN, in dieser Reihenfolge:
 *    1. Den Satz oben in der Datenschutzerklärung ersetzen durch eine
 *       Beschreibung dessen, was wirklich passiert: dass ein unsichtbarer
 *       Bildpunkt die Öffnung meldet, dass Links über eine eigene
 *       Zählstelle laufen, wozu du das auswertest und wie lange du es
 *       aufbewahrst.
 *    2. Beim Anmeldeformular einen Hinweis ergänzen — die Einwilligung
 *       muss die Messung mit umfassen.
 *    3. Beides von deiner Rechtsberatung beim Händlerbund gegenlesen
 *       lassen, die ist in der Mitgliedschaft drin.
 *    4. Erst dann hier `true` eintragen.
 *
 *    Bis dahin läuft alles andere ganz normal. Es bleiben nur die beiden
 *    Zahlen „geöffnet" und „geklickt" leer. */
const MESSEN = false;

/** Damit die Auswertungsseite erklären kann, warum dort Nullen stehen,
 *  statt so zu tun, als hätte niemand die Mail geöffnet. */
export function messungAn(): boolean {
  return MESSEN;
}

// ---------------------------------------------------------------------------
// Der Abmeldelink
//
// ▸ WARUM KEIN GESPEICHERTER SCHLÜSSEL WIE BEIM INSIDER-KANAL:
//   Der Newsletter geht an die Ansicht `alle_anmeldungen`, und die führt
//   Insider und Futter-Check zusammen. Eine Adresse kann dort aus zwei
//   Tabellen mit zwei verschiedenen Schlüsseln stammen. Deshalb wird der
//   Abmeldelink hier gerechnet statt nachgeschlagen: Adresse plus eine
//   Unterschrift darüber, gebildet mit dem geheimen Datenbankschlüssel.
//
//   Wer den Link hat, kann genau diese eine Adresse abmelden, sonst nichts.
//   Erraten lässt er sich nicht.
//
// ▸ EINE FOLGE, DIE DU KENNEN SOLLTEST: Würde der Supabase-Schlüssel
//   ausgetauscht, wären die Abmeldelinks in schon verschickten Mails
//   ungültig. Das ist kein Beinbruch — für diesen Fall gibt es im
//   Adminbereich das Feld, mit dem du eine Adresse von Hand abmeldest.
// ---------------------------------------------------------------------------

function unterschrift(wert: string): string {
  return createHmac("sha256", SUPABASE_SECRET_KEY || "kein-schluessel")
    .update(wert)
    .digest("hex")
    .slice(0, 24);
}

export function unterschriftStimmt(wert: string, gegeben: string): boolean {
  const a = Buffer.from(unterschrift(wert), "utf8");
  const b = Buffer.from(gegeben || "", "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Der Link in der Fusszeile: führt auf eine Seite mit Rückfrage. */
export function abmeldeLink(email: string, basisUrl: string): string {
  const e = encodeURIComponent(email);
  return `${basisUrl}/newsletter-abmelden?e=${e}&p=${unterschrift(email)}`;
}

/** Die Adresse für den Abmeldeknopf des Postfachs.
 *
 *  Gmail und Outlook zeigen oben in der Mail einen eigenen Knopf, wenn die
 *  Mail den Kopf `List-Unsubscribe` trägt. Dieser Knopf schickt ein POST und
 *  erwartet keine Seite, sondern nur ein „erledigt" — deshalb eine eigene
 *  Adresse und nicht die Seite von oben.
 *
 *  ▸ DIESEN KNOPF WILLST DU HABEN. Wer ihn nicht findet, drückt stattdessen
 *    auf „Spam", und das schadet dem Ruf deiner Absenderadresse bei allen
 *    anderen Empfängerinnen gleich mit. */
export function abmeldeLinkEinKlick(email: string, basisUrl: string): string {
  const e = encodeURIComponent(email);
  return `${basisUrl}/api/newsletter-abmelden?e=${e}&p=${unterschrift(email)}`;
}

// ---------------------------------------------------------------------------
// Die Entwürfe
// ---------------------------------------------------------------------------

export async function briefeHolen(): Promise<Brief[] | null> {
  return supabaseAlle<Brief>("newsletter_briefe?select=*&order=geaendert_am.desc");
}

export async function briefHolen(id: string): Promise<Brief | null> {
  return ersteZeile<Brief>(
    `newsletter_briefe?id=eq.${encodeURIComponent(id)}&select=*&limit=1`
  );
}

/** Legt einen neuen Entwurf an, wahlweise aus einer Vorlage. */
export async function briefAnlegen(vorlageSchluessel = "leer"): Promise<Brief | null> {
  const v = vorlageFinden(vorlageSchluessel);

  const res = await supabase("newsletter_briefe", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      betreff: v.betreff,
      vorschautext: v.vorschautext,
      inhalt: v.inhalt,
      status: "entwurf",
    }),
  });
  if (!res.ok) return null;
  const zeilen = await res.json();
  return Array.isArray(zeilen) && zeilen.length > 0 ? zeilen[0] : null;
}

/** Speichert einen Entwurf.
 *
 *  Ein versendeter Brief lässt sich nicht mehr ändern. Das ist keine
 *  Bevormundung, sondern die Wahrheit: Was raus ist, ist raus, und ein
 *  geänderter Text im Adminbereich würde nur vortäuschen, die Kundinnen
 *  hätten etwas anderes gelesen. */
export async function briefSpeichern(
  id: string,
  felder: { betreff?: string; vorschautext?: string; inhalt?: string }
): Promise<boolean> {
  const brief = await briefHolen(id);
  if (!brief || brief.status === "versendet") return false;

  const res = await supabase(`newsletter_briefe?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify({ ...felder, geaendert_am: new Date().toISOString() }),
  });
  return res.ok;
}

export async function briefLoeschen(id: string): Promise<boolean> {
  const brief = await briefHolen(id);
  if (!brief || brief.status === "versendet") return false;

  const res = await supabase(`newsletter_briefe?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return res.ok;
}

// ---------------------------------------------------------------------------
// Die Empfänger
// ---------------------------------------------------------------------------

type Anmeldung = { email: string; vorname: string | null };

/** Holt alle Adressen der Sperrliste, klein geschrieben. */
async function gesperrte(): Promise<Set<string>> {
  const zeilen = await supabaseAlle<{ email: string }>(
    "newsletter_abmeldungen?select=email"
  );
  return new Set((zeilen ?? []).map((z) => z.email.toLowerCase()));
}

/** Die Empfängerliste: bestätigt, brauchbare Adresse, nicht abgemeldet.
 *
 *  ▸ DREI FALLEN STECKEN HIER DRIN, alle schon einmal aufgetreten:
 *
 *    1. Supabase liefert höchstens tausend Zeilen pro Anfrage, ohne
 *       Fehlermeldung. Deshalb `supabaseAlle`, nicht `supabase`.
 *    2. Eine einzige kaputte Adresse lässt Resend das ganze Bündel von
 *       hundert Mails zurückweisen. Am 27.08.2026 stand in den
 *       übernommenen Adressen „belinda. knott@web.de" mit einem
 *       Leerzeichen — es ging keine einzige Mail raus. Deshalb wird hier
 *       aussortiert statt mitgeschickt.
 *    3. Wer sich abgemeldet hat, muss draussen bleiben, auch wenn seine
 *       Adresse durch einen späteren Import wieder in der Tabelle steht.
 *
 *  Zurück kommt `null`, wenn die Datenbank nicht erreichbar war. Das ist
 *  etwas anderes als eine leere Liste und muss anders gemeldet werden. */
export async function empfaengerHolen(): Promise<{
  liste: Empfaenger[];
  aussortiert: string[];
  abgemeldet: number;
} | null> {
  const zeilen = await supabaseAlle<Anmeldung>(
    "alle_anmeldungen?bestaetigt=is.true&select=email,vorname"
  );
  if (!zeilen) return null;

  const sperre = await gesperrte();

  const liste: Empfaenger[] = [];
  const aussortiert: string[] = [];
  const gesehen = new Set<string>();
  let abgemeldet = 0;

  for (const z of zeilen) {
    const adresse = (z.email ?? "").trim();
    const klein = adresse.toLowerCase();

    if (!EMAIL_MUSTER.test(adresse)) {
      aussortiert.push(z.email);
      continue;
    }
    if (sperre.has(klein)) {
      abgemeldet++;
      continue;
    }
    // Die Ansicht entdoppelt schon, aber ein zweiter Riegel kostet nichts
    // und verhindert die peinlichste aller Pannen: dieselbe Mail zweimal.
    if (gesehen.has(klein)) continue;

    gesehen.add(klein);
    liste.push({ email: adresse, vorname: z.vorname });
  }

  if (aussortiert.length > 0) {
    console.warn(
      `Newsletter: ${aussortiert.length} unbrauchbare Adressen uebersprungen:`,
      aussortiert.join(", ")
    );
  }

  return { liste, aussortiert, abgemeldet };
}

/** Wie viele Adressen der Newsletter erreichen würde.
 *
 *  Gezählt wird über den Kopf der Antwort, nicht über die Länge einer
 *  geholten Liste — die wäre bei über tausend Zeilen still auf 1000
 *  gedeckelt. Die Abgemeldeten werden abgezogen. */
export async function empfaengerZaehlen(): Promise<number> {
  const bestaetigt = await supabaseZaehlen("alle_anmeldungen?bestaetigt=is.true");
  if (bestaetigt < 0) return -1;

  const abgemeldet = await supabaseZaehlen("newsletter_abmeldungen?email=not.is.null");
  return Math.max(0, bestaetigt - Math.max(0, abgemeldet));
}

// ---------------------------------------------------------------------------
// Messen: Zählpixel und Klicks
// ---------------------------------------------------------------------------

/** Die Unterschrift für einen einzelnen Klicklink.
 *
 *  ▸ WARUM SIE DAS ZIEL MIT EINSCHLIESST, und warum das wichtig ist:
 *    Die Zählstelle leitet auf die Adresse weiter, die im Link steht. Wäre
 *    nur die Empfängeradresse unterschrieben, könnte jemand mit einem
 *    einzigen abgefangenen Link beliebige Ziele anhängen — und hätte damit
 *    eine Weiterleitung auf pferdeliebehealthy.de, die überall hinführt.
 *    Genau so werden Newsletter-Domains für Betrugsmails missbraucht.
 *
 *    Weil das Ziel mitunterschrieben ist, lässt sich der Link nicht
 *    umbiegen: Jede Änderung daran macht die Unterschrift ungültig. */
export function klickUnterschrift(email: string, ziel: string): string {
  return unterschrift(`${email}|${ziel}`);
}

/** Schreibt jeden Link im fertigen HTML auf die eigene Zählstelle um.
 *
 *  Ausgenommen bleiben der Abmeldelink und mailto-Links. Der Abmeldelink
 *  muss auch dann funktionieren, wenn an der Zählung etwas klemmt — sonst
 *  käme jemand nicht mehr aus dem Verteiler heraus, und das ist der eine
 *  Fehler, den man sich nicht leisten kann. */
function klicksZaehlen(
  html: string,
  briefId: string,
  email: string,
  basisUrl: string
): string {
  if (!MESSEN) return html;

  return html.replace(/href="(https?:\/\/[^"]+)"/g, (ganz, ziel: string) => {
    if (ziel.includes("/newsletter-abmelden")) return ganz;

    const link =
      `${basisUrl}/api/nl?b=${encodeURIComponent(briefId)}` +
      `&e=${encodeURIComponent(email)}&s=${klickUnterschrift(email, ziel)}` +
      `&z=${encodeURIComponent(ziel)}`;
    return `href="${link}"`;
  });
}

/** Das Zählpixel für die Öffnungen: ein einzelner Bildpunkt am Ende der
 *  Mail. Lädt das Postfach ihn, war die Mail offen. */
function zaehlpixel(briefId: string, email: string, basisUrl: string): string {
  if (!MESSEN) return "";

  const link =
    `${basisUrl}/api/nl?b=${encodeURIComponent(briefId)}` +
    `&e=${encodeURIComponent(email)}&p=${unterschrift(email)}`;

  return `<img src="${link}" alt="" width="1" height="1" style="display:block;width:1px;height:1px;border:0;">`;
}

/** Hält ein Ereignis fest. Doppelte fängt ein Index in der Datenbank ab —
 *  wer eine Mail zehnmal öffnet, zählt trotzdem als eine Öffnung. */
export async function ereignisSpeichern(
  briefId: string,
  email: string,
  art: "geoeffnet" | "geklickt",
  ziel?: string
): Promise<void> {
  await supabase("newsletter_ereignisse", {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates" },
    body: JSON.stringify({
      brief_id: briefId,
      email: email.toLowerCase(),
      art,
      ziel: ziel ?? null,
    }),
  });
}

export type Auswertung = {
  geoeffnet: number;
  geklickt: number;
  ziele: { ziel: string; anzahl: number }[];
};

/** Nur die zwei Zahlen für die Übersichtsliste.
 *
 *  Zählt über den Kopf der Antwort, statt alle Ereignisse zu holen. Bei
 *  tausend Empfängerinnen und einem Jahr Newsletter stünden hier sonst
 *  zwanzigtausend Zeilen im Speicher, nur um zwei Zahlen anzuzeigen.
 *
 *  Dass jede Person je Brief nur einmal zählt, sichert der eindeutige Index
 *  in der Datenbank — die Zahl hier ist also die Zahl der Menschen, nicht
 *  die der Klicks. */
export async function kurzauswertung(
  briefId: string
): Promise<{ geoeffnet: number; geklickt: number }> {
  const id = encodeURIComponent(briefId);

  const [geoeffnet, geklickt] = await Promise.all([
    supabaseZaehlen(`newsletter_ereignisse?brief_id=eq.${id}&art=eq.geoeffnet`),
    supabaseZaehlen(`newsletter_ereignisse?brief_id=eq.${id}&art=eq.geklickt`),
  ]);

  return { geoeffnet: Math.max(0, geoeffnet), geklickt: Math.max(0, geklickt) };
}

export async function auswertungHolen(briefId: string): Promise<Auswertung> {
  const zeilen = await supabaseAlle<{ art: string; email: string; ziel: string | null }>(
    `newsletter_ereignisse?brief_id=eq.${encodeURIComponent(briefId)}&select=art,email,ziel`
  );
  if (!zeilen) return { geoeffnet: 0, geklickt: 0, ziele: [] };

  const offen = new Set<string>();
  const klicker = new Set<string>();
  const proZiel = new Map<string, number>();

  for (const z of zeilen) {
    if (z.art === "geoeffnet") offen.add(z.email);
    if (z.art === "geklickt") {
      klicker.add(z.email);
      if (z.ziel) proZiel.set(z.ziel, (proZiel.get(z.ziel) ?? 0) + 1);
    }
  }

  return {
    geoeffnet: offen.size,
    geklickt: klicker.size,
    ziele: [...proZiel.entries()]
      .map(([ziel, anzahl]) => ({ ziel, anzahl }))
      .sort((a, b) => b.anzahl - a.anzahl),
  };
}

// ---------------------------------------------------------------------------
// Die fertige Mail
// ---------------------------------------------------------------------------

/** Baut die Mail für eine einzelne Empfängerin. */
export function mailBauen(
  brief: Pick<Brief, "id" | "betreff" | "vorschautext" | "inhalt">,
  empfaenger: Empfaenger,
  basisUrl: string,
  optionen: { messen?: boolean } = {}
): { betreff: string; html: string; abmelden: string; abmeldenEinKlick: string } {
  const abmelden = abmeldeLink(empfaenger.email, basisUrl);
  const abmeldenEinKlick = abmeldeLinkEinKlick(empfaenger.email, basisUrl);

  const inhalt = textZuHtml(namenEinsetzen(brief.inhalt, empfaenger.vorname));
  const betreff = namenEinsetzen(brief.betreff, empfaenger.vorname);

  let html = newsletterRahmen(
    inhalt,
    namenEinsetzen(brief.vorschautext, empfaenger.vorname),
    abmelden
  );

  if (optionen.messen !== false) {
    html = klicksZaehlen(html, brief.id, empfaenger.email, basisUrl);
    html += zaehlpixel(brief.id, empfaenger.email, basisUrl);
  }

  return { betreff, html, abmelden, abmeldenEinKlick };
}

// ---------------------------------------------------------------------------
// Der Versand
// ---------------------------------------------------------------------------

function warte(ms: number): Promise<void> {
  return new Promise((fertig) => setTimeout(fertig, ms));
}

export type VersandErgebnis =
  | { ok: true; empfaenger: number; uebersprungen: number }
  | {
      ok: false;
      grund: "schon-versendet" | "keine-empfaenger" | "unvollstaendig" | "fehler";
      text: string;
    };

/** Die Testmail an eine einzige Adresse. Ohne Zählung, sonst verfälscht
 *  jeder Test die Auswertung des Briefes. */
export async function testmailSenden(
  brief: Brief,
  an: string,
  basisUrl: string
): Promise<{ ok: boolean; text: string }> {
  if (!RESEND_API_KEY) {
    return { ok: false, text: "Es ist kein Resend-Schlüssel hinterlegt." };
  }
  if (!EMAIL_MUSTER.test(an.trim())) {
    return { ok: false, text: "Diese Adresse sieht nicht richtig aus." };
  }

  const gebaut = mailBauen(
    brief,
    { email: an.trim(), vorname: "Yasi" },
    basisUrl,
    { messen: false }
  );

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: VON,
      to: [an.trim()],
      reply_to: ANTWORT_AN,
      subject: `[Test] ${gebaut.betreff}`,
      html: gebaut.html,
    }),
  });

  if (!res.ok) {
    // Der Fehler muss im Browser ankommen, nicht nur in den Vercel-Logs.
    // Ohne Statuscode ist so etwas für Yasi nicht auffindbar.
    const text = (await res.text()).slice(0, 300);
    console.error("Newsletter-Testmail fehlgeschlagen:", res.status, text);
    return { ok: false, text: `Die Testmail ging nicht raus. ${res.status} — ${text}` };
  }

  return { ok: true, text: `Die Testmail ist an ${an.trim()} unterwegs.` };
}

/** Verschickt den Newsletter an alle bestätigten Adressen.
 *
 *  Geht ein Bündel schief, macht der Versand mit dem nächsten weiter statt
 *  alles abzubrechen — ein Problem bei hundert Adressen soll nicht
 *  neunhundert andere aufhalten. Erst wenn zweimal hintereinander nichts
 *  durchgeht, ist offenbar etwas Grundsätzliches kaputt. */
export async function briefVersenden(
  brief: Brief,
  basisUrl: string
): Promise<VersandErgebnis> {
  if (brief.status === "versendet") {
    return {
      ok: false,
      grund: "schon-versendet",
      text: "Dieser Newsletter ist schon raus. Er lässt sich kein zweites Mal verschicken.",
    };
  }

  const fehlt = briefPruefen(brief);
  if (fehlt.length > 0) {
    return { ok: false, grund: "unvollstaendig", text: fehlt.join(" ") };
  }

  if (!RESEND_API_KEY) {
    return { ok: false, grund: "fehler", text: "Es ist kein Resend-Schlüssel hinterlegt." };
  }

  const geholt = await empfaengerHolen();
  if (!geholt) {
    return { ok: false, grund: "fehler", text: "Die Adressliste war nicht erreichbar." };
  }
  if (geholt.liste.length === 0) {
    return {
      ok: false,
      grund: "keine-empfaenger",
      text: "Es gibt keine bestätigte Adresse, an die der Newsletter gehen könnte.",
    };
  }

  let verschickt = 0;
  let fehler: string | null = null;
  let hintereinander = 0;

  for (let i = 0; i < geholt.liste.length; i += BUENDEL) {
    // Resend nimmt zwei Anfragen pro Sekunde entgegen. Ohne Pause laufen
    // wir bei elf Bündeln in die Bremse.
    if (i > 0) await warte(600);

    const buendel = geholt.liste.slice(i, i + BUENDEL);

    const antwort = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        buendel.map((e) => {
          const gebaut = mailBauen(brief, e, basisUrl);
          return {
            from: VON,
            to: [e.email],
            reply_to: ANTWORT_AN,
            subject: gebaut.betreff,
            // Sagt dem Postfach, wo man sich abmeldet. Manche zeigen dafür
            // einen eigenen Knopf — das ist deutlich besser, als wenn
            // jemand stattdessen auf „Spam" drückt.
            headers: {
              "List-Unsubscribe": `<${gebaut.abmeldenEinKlick}>`,
              "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
            },
            html: gebaut.html,
          };
        })
      ),
    });

    if (!antwort.ok) {
      const text = (await antwort.text()).slice(0, 300);
      console.error("Newsletter-Versand fehlgeschlagen:", antwort.status, text);
      fehler ??= `${antwort.status} — ${text}`;
      if (++hintereinander >= 2) break;
      continue;
    }

    hintereinander = 0;
    verschickt += buendel.length;
  }

  if (verschickt === 0) {
    // Kein Vermerk: Es ist nichts rausgegangen, der Brief muss sich erneut
    // verschicken lassen. Ein Vermerk hier wäre eine Sackgasse, aus der nur
    // ein Eingriff in der Datenbank wieder herausführt.
    return {
      ok: false,
      grund: "fehler",
      text: `Es ist keine Mail rausgegangen. ${fehler ?? ""}`.trim(),
    };
  }

  // Ab hier ist etwas raus, und das lässt sich nicht zurücknehmen. Der
  // Vermerk muss deshalb auch dann stehen, wenn nur ein Teil durchging —
  // sonst bekämen beim nächsten Klick alle die Mail ein zweites Mal.
  await supabase(`newsletter_briefe?id=eq.${encodeURIComponent(brief.id)}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "versendet",
      versendet_am: new Date().toISOString(),
      empfaenger: verschickt,
      uebersprungen: geholt.aussortiert.length,
    }),
  });

  return { ok: true, empfaenger: verschickt, uebersprungen: geholt.aussortiert.length };
}

// ---------------------------------------------------------------------------
// Abmelden
// ---------------------------------------------------------------------------

/** Meldet eine Adresse ab.
 *
 *  Drei Schritte, alle nötig:
 *    1. Die Adresse kommt auf die Sperrliste. Sie ist der Nachweis, dass du
 *       den Widerspruch beachtest, und sie hält die Adresse auch dann
 *       draussen, wenn ein späterer Import sie wieder einspielt.
 *    2. Die Zeilen in beiden Anmeldetabellen werden gelöscht. So steht es
 *       in der Datenschutzerklärung, und eine Liste, die abgemeldete
 *       Adressen weiterführt, will niemand haben.
 *    3. Ihre Öffnungen und Klicks verschwinden mit. Wer weg ist, ist weg. */
export async function newsletterAbmelden(
  email: string,
  quelle: "link" | "hand" = "link"
): Promise<boolean> {
  const klein = email.trim().toLowerCase();
  if (!EMAIL_MUSTER.test(klein)) return false;

  // on_conflict=email: Meldet sich jemand zweimal ab — etwa über zwei alte
  // Mails —, ist das kein Fehler, sondern derselbe Wunsch. Ohne diese
  // Angabe käme beim zweiten Mal eine Fehlermeldung zurück, und die
  // Abmeldeseite zeigte „hat nicht geklappt", obwohl alles in Ordnung ist.
  const eingetragen = await supabase("newsletter_abmeldungen?on_conflict=email", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify({ email: klein, quelle }),
  });

  const filter = `email=ilike.${encodeURIComponent(klein)}`;
  await supabase(`insider_anmeldungen?${filter}`, { method: "DELETE" });
  await supabase(`futter_check_anmeldungen?${filter}`, { method: "DELETE" });
  await supabase(`newsletter_ereignisse?${filter}`, { method: "DELETE" });

  return eingetragen.ok;
}

export async function istAbgemeldet(email: string): Promise<boolean> {
  const zeile = await ersteZeile<{ email: string }>(
    `newsletter_abmeldungen?email=eq.${encodeURIComponent(
      email.trim().toLowerCase()
    )}&select=email&limit=1`
  );
  return Boolean(zeile);
}

export async function abmeldungenHolen(): Promise<
  { email: string; abgemeldet_am: string; quelle: string }[]
> {
  const zeilen = await supabaseAlle<{
    email: string;
    abgemeldet_am: string;
    quelle: string;
  }>("newsletter_abmeldungen?select=*&order=abgemeldet_am.desc");
  return zeilen ?? [];
}
