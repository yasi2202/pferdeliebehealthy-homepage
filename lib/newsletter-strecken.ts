import { supabase, supabaseAlle, ersteZeile, ANTWORT_AN, EMAIL_MUSTER } from "@/lib/versand";
import {
  textZuHtml,
  namenEinsetzen,
  newsletterRahmen,
  type Empfaenger,
} from "@/lib/newsletter";
import { abmeldeLink, abmeldeLinkEinKlick } from "@/lib/newsletter-server";

// ---------------------------------------------------------------------------
// Mailstrecken: Serien, die nach der Anmeldung von selbst loslaufen.
//
// Mail 1 am Tag der Anmeldung, Mail 2 nach drei Tagen, Mail 3 nach sieben --
// so lernt jemand dich kennen, ohne dass du daran denken musst.
//
// ▸ WIE ES LÄUFT: Einmal am Tag ruft Vercel /api/newsletter-strecken auf.
//   Der Lauf sieht nach, wer inzwischen so weit ist, verschickt die fällige
//   Mail und vermerkt sie. Mehr passiert nicht.
//
// ▸ ZWEI SPERREN, DIE BEIDE NÖTIG SIND:
//   1. `aktiv_seit` -- es läuft nur hinein, wer sich nach dem Einschalten
//      angemeldet hat. Sonst bekämen tausend Bestandsadressen auf einen
//      Schlag „schön, dass du da bist".
//   2. Der Vermerk in newsletter_strecken_versand -- sonst bekäme dieselbe
//      Person dieselbe Mail jeden Tag wieder, solange sie im Zeitfenster
//      liegt.
// ---------------------------------------------------------------------------

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const VON = "Yasi von Pferdeliebehealthy <info@updates.pferdeliebehealthy.de>";
const BUENDEL = 100;

export type Strecke = {
  id: string;
  erstellt_am: string;
  name: string;
  ausloeser: "insider" | "futter-check" | "alle";
  aktiv: boolean;
  aktiv_seit: string | null;
};

export type StreckenMail = {
  id: string;
  strecke_id: string;
  schritt: number;
  tage_danach: number;
  betreff: string;
  inhalt: string;
};

// ---------------------------------------------------------------------------
// Verwalten
// ---------------------------------------------------------------------------

export async function streckenHolen(): Promise<Strecke[] | null> {
  return supabaseAlle<Strecke>("newsletter_strecken?select=*&order=erstellt_am.asc");
}

export async function streckeHolen(id: string): Promise<Strecke | null> {
  return ersteZeile<Strecke>(
    `newsletter_strecken?id=eq.${encodeURIComponent(id)}&select=*&limit=1`
  );
}

export async function streckenMailsHolen(streckeId: string): Promise<StreckenMail[]> {
  const zeilen = await supabaseAlle<StreckenMail>(
    `newsletter_strecken_mails?strecke_id=eq.${encodeURIComponent(
      streckeId
    )}&select=*&order=schritt.asc`
  );
  return zeilen ?? [];
}

export async function streckeAnlegen(
  name: string,
  ausloeser: Strecke["ausloeser"]
): Promise<Strecke | null> {
  const res = await supabase("newsletter_strecken", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({ name, ausloeser, aktiv: false }),
  });
  if (!res.ok) return null;
  const zeilen = await res.json();
  return Array.isArray(zeilen) && zeilen.length > 0 ? zeilen[0] : null;
}

/** Schaltet eine Strecke ein oder aus.
 *
 *  Beim Einschalten wird `aktiv_seit` auf jetzt gesetzt — ab diesem Moment
 *  läuft jede neue Anmeldung hinein, keine ältere. Beim Ausschalten bleibt
 *  der Wert stehen: Wer mittendrin ist, soll seine Serie zu Ende bekommen,
 *  falls du sie wieder einschaltest. */
export async function streckeSchalten(id: string, aktiv: boolean): Promise<boolean> {
  const felder: Record<string, unknown> = { aktiv };
  if (aktiv) {
    const strecke = await streckeHolen(id);
    // Nur beim allerersten Einschalten setzen. Wer eine Strecke kurz
    // abschaltet und wieder an, will nicht, dass alle Wartenden
    // herausfallen.
    if (strecke && !strecke.aktiv_seit) felder.aktiv_seit = new Date().toISOString();
  }

  const res = await supabase(`newsletter_strecken?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(felder),
  });
  return res.ok;
}

export async function streckeLoeschen(id: string): Promise<boolean> {
  const res = await supabase(`newsletter_strecken?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return res.ok;
}

export async function streckenMailSpeichern(
  streckeId: string,
  schritt: number,
  felder: { tage_danach: number; betreff: string; inhalt: string }
): Promise<boolean> {
  const vorhanden = await ersteZeile<StreckenMail>(
    `newsletter_strecken_mails?strecke_id=eq.${encodeURIComponent(
      streckeId
    )}&schritt=eq.${schritt}&select=id&limit=1`
  );

  if (vorhanden) {
    const res = await supabase(
      `newsletter_strecken_mails?id=eq.${encodeURIComponent(vorhanden.id)}`,
      { method: "PATCH", body: JSON.stringify(felder) }
    );
    return res.ok;
  }

  const res = await supabase("newsletter_strecken_mails", {
    method: "POST",
    body: JSON.stringify({ strecke_id: streckeId, schritt, ...felder }),
  });
  return res.ok;
}

export async function streckenMailLoeschen(id: string): Promise<boolean> {
  const res = await supabase(
    `newsletter_strecken_mails?id=eq.${encodeURIComponent(id)}`,
    { method: "DELETE" }
  );
  return res.ok;
}

// ---------------------------------------------------------------------------
// Der tägliche Lauf
// ---------------------------------------------------------------------------

type Anmeldung = {
  email: string;
  vorname: string | null;
  bestaetigt_am: string | null;
};

/** Wer für diese Strecke in Frage kommt: bestätigt, angemeldet nach dem
 *  Einschalten, nicht auf der Sperrliste. */
async function kandidaten(strecke: Strecke): Promise<Anmeldung[]> {
  if (!strecke.aktiv_seit) return [];

  const ab = encodeURIComponent(strecke.aktiv_seit);
  const felder = "select=email,vorname,bestaetigt_am";
  const filter = `bestaetigt=eq.true&bestaetigt_am=gte.${ab}`;

  const quellen: string[] = [];
  if (strecke.ausloeser === "insider" || strecke.ausloeser === "alle") {
    quellen.push(`insider_anmeldungen?${filter}&${felder}`);
  }
  if (strecke.ausloeser === "futter-check" || strecke.ausloeser === "alle") {
    quellen.push(`futter_check_anmeldungen?${filter}&${felder}`);
  }

  const alle: Anmeldung[] = [];
  for (const pfad of quellen) {
    const zeilen = await supabaseAlle<Anmeldung>(pfad);
    if (zeilen) alle.push(...zeilen);
  }

  // Abgemeldete raus. Wer sich abgemeldet hat, ist zwar meist schon aus der
  // Tabelle gelöscht — aber eine Adresse, die über zwei Wege hereinkam,
  // kann in der anderen Tabelle noch stehen.
  const gesperrt = new Set(
    (await supabaseAlle<{ email: string }>("newsletter_abmeldungen?select=email") ?? [])
      .map((z) => z.email.toLowerCase())
  );

  const gesehen = new Set<string>();
  return alle.filter((a) => {
    const klein = (a.email ?? "").trim().toLowerCase();
    if (!EMAIL_MUSTER.test(klein)) return false;
    if (gesperrt.has(klein) || gesehen.has(klein)) return false;
    gesehen.add(klein);
    return true;
  });
}

/** Wer diese eine Mail schon bekommen hat. */
async function schonBekommen(mailId: string): Promise<Set<string>> {
  const zeilen = await supabaseAlle<{ email: string }>(
    `newsletter_strecken_versand?mail_id=eq.${encodeURIComponent(
      mailId
    )}&select=email`
  );
  return new Set((zeilen ?? []).map((z) => z.email.toLowerCase()));
}

function tageSeit(zeitpunkt: string): number {
  const dann = new Date(zeitpunkt).getTime();
  return Math.floor((Date.now() - dann) / (1000 * 60 * 60 * 24));
}

function warte(ms: number): Promise<void> {
  return new Promise((fertig) => setTimeout(fertig, ms));
}

export type LaufErgebnis = {
  strecke: string;
  schritt: number;
  verschickt: number;
  fehler?: string;
};

/** Ein Durchlauf über alle eingeschalteten Strecken. */
export async function streckenLauf(basisUrl: string): Promise<LaufErgebnis[]> {
  if (!RESEND_API_KEY) return [];

  const strecken = await streckenHolen();
  if (!strecken) return [];

  const ergebnisse: LaufErgebnis[] = [];

  for (const strecke of strecken.filter((s) => s.aktiv && s.aktiv_seit)) {
    const mails = await streckenMailsHolen(strecke.id);
    if (mails.length === 0) continue;

    const leute = await kandidaten(strecke);
    if (leute.length === 0) continue;

    for (const mail of mails) {
      if (!mail.betreff.trim() || !mail.inhalt.trim()) continue;

      const hatten = await schonBekommen(mail.id);

      // Fällig ist, wer lange genug dabei ist und die Mail noch nicht hat.
      const faellig = leute.filter((a) => {
        if (!a.bestaetigt_am) return false;
        if (hatten.has(a.email.toLowerCase())) return false;
        return tageSeit(a.bestaetigt_am) >= mail.tage_danach;
      });

      if (faellig.length === 0) continue;

      let verschickt = 0;
      let fehler: string | undefined;

      for (let i = 0; i < faellig.length; i += BUENDEL) {
        if (i > 0) await warte(600);

        const buendel = faellig.slice(i, i + BUENDEL);

        const antwort = await fetch("https://api.resend.com/emails/batch", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(
            buendel.map((a) => {
              const person: Empfaenger = { email: a.email, vorname: a.vorname };
              return {
                from: VON,
                to: [person.email],
                reply_to: ANTWORT_AN,
                subject: namenEinsetzen(mail.betreff, person.vorname),
                headers: {
                  "List-Unsubscribe": `<${abmeldeLinkEinKlick(person.email, basisUrl)}>`,
                  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
                },
                html: newsletterRahmen(
                  textZuHtml(namenEinsetzen(mail.inhalt, person.vorname)),
                  "",
                  abmeldeLink(person.email, basisUrl)
                ),
              };
            })
          ),
        });

        if (!antwort.ok) {
          const text = (await antwort.text()).slice(0, 300);
          console.error("Streckenversand fehlgeschlagen:", antwort.status, text);
          fehler ??= `${antwort.status} — ${text}`;
          continue;
        }

        // Sofort vermerken, Bündel für Bündel. Bricht Vercel den Lauf
        // mittendrin ab, ist wenigstens das Verschickte festgehalten —
        // sonst bekämen diese Menschen die Mail morgen noch einmal.
        await supabase("newsletter_strecken_versand", {
          method: "POST",
          headers: { Prefer: "resolution=ignore-duplicates" },
          body: JSON.stringify(
            buendel.map((a) => ({ mail_id: mail.id, email: a.email.toLowerCase() }))
          ),
        });

        verschickt += buendel.length;
      }

      ergebnisse.push({
        strecke: strecke.name,
        schritt: mail.schritt,
        verschickt,
        fehler,
      });
    }
  }

  return ergebnisse;
}
