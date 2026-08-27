import {
  supabase,
  supabaseAlle,
  supabaseZaehlen,
  ersteZeile,
  esc,
  rahmen,
  anrede,
  ANTWORT_AN,
  EMAIL_MUSTER,
} from "@/lib/versand";
import { insider } from "@/lib/insider";
import type { InsiderAnmeldung } from "@/lib/insider-server";
import type { Beitrag } from "@/lib/beitraege";

// ---------------------------------------------------------------------------
// Der Rundversand: einen Beitrag an alle bestätigten Insider schicken.
//
// Nur aus Route-Handlern und Server-Komponenten importieren.
// ---------------------------------------------------------------------------

/** Wer die Versandseite öffnen und Mails auslösen darf.
 *
 *  Bewusst hier im Code und nicht als Passwort in den Vercel-Einstellungen:
 *  So braucht Yasi keine zusätzliche Zugangsdaten-Verwaltung. Sie meldet sich
 *  mit ihrer eigenen Adresse als Insiderin an — wie alle anderen auch — und
 *  ist damit für diese eine Seite freigeschaltet.
 *
 *  Der Preis: Wer an ihren persönlichen Anmeldelink käme, käme auch hier
 *  heran. Für einen Knopf, der einen Newsletter verschickt, ist das
 *  vertretbar. Sollte es einmal mehr sein, kommt ein Passwort dazu. */
const ADMIN_ADRESSEN = ["info@pferdeliebehealthy.de"];

export function istAdmin(anmeldung: InsiderAnmeldung | null): boolean {
  if (!anmeldung) return false;
  return ADMIN_ADRESSEN.includes(anmeldung.email.toLowerCase());
}

// ---------------------------------------------------------------------------
// Wer hat schon was bekommen
// ---------------------------------------------------------------------------

export type Versandvermerk = {
  slug: string;
  versendet_am: string;
  empfaenger: number;
};

export async function alleVersandvermerke(): Promise<Versandvermerk[]> {
  const res = await supabase("insider_versand?select=*");
  if (!res.ok) return [];
  const zeilen = await res.json();
  return Array.isArray(zeilen) ? zeilen : [];
}

async function vermerkFinden(slug: string): Promise<Versandvermerk | null> {
  return ersteZeile<Versandvermerk>(
    `insider_versand?slug=eq.${encodeURIComponent(slug)}&select=*&limit=1`
  );
}

// ---------------------------------------------------------------------------
// Der Versand
// ---------------------------------------------------------------------------

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const TABELLE = "insider_anmeldungen";
const VON = "Yasi von Pferdeliebehealthy <info@updates.pferdeliebehealthy.de>";

/** Resend nimmt bis zu 100 Mails pro Anfrage entgegen. Einzeln verschickt
 *  liefe die Funktion bei einem wachsenden Verteiler in die Zeitbegrenzung
 *  von Vercel — in Bündeln bleibt sie auch bei tausend Adressen schnell. */
const BUENDEL = 100;

export type VersandErgebnis =
  | { ok: true; empfaenger: number; uebersprungen: number }
  | { ok: false; grund: "schon-versendet" | "keine-empfaenger" | "fehler"; text: string };

// ---------------------------------------------------------------------------
// Der gemeinsame Unterbau der drei Versandarten
// ---------------------------------------------------------------------------

/** Eine fertige Mail, so wie Resend sie erwartet. */
type Mail = Record<string, unknown>;

/** Holt die Empfaengerliste und sortiert unbrauchbare Adressen aus.
 *
 *  Das Aussortieren ist der Punkt, an dem der Versand am 27.08.2026 gehangen
 *  hat: In den uebernommenen Adressen standen zwei mit einem Leerzeichen
 *  mittendrin ("belinda. knott@web.de"). Resend prueft ein Buendel als Ganzes
 *  und weist es komplett zurueck, sobald eine einzige Adresse nicht stimmt —
 *  eine kaputte Adresse hat also hundert Mails verhindert.
 *
 *  Zurueck kommt `null`, wenn die Datenbank nicht erreichbar war. Das ist
 *  etwas anderes als eine leere Liste und muss auch anders gemeldet werden. */
async function empfaengerHolen(
  pfad: string
): Promise<{ liste: InsiderAnmeldung[]; aussortiert: string[] } | null> {
  const zeilen = await supabaseAlle<InsiderAnmeldung>(pfad);
  if (!zeilen) return null;

  const liste: InsiderAnmeldung[] = [];
  const aussortiert: string[] = [];

  for (const e of zeilen) {
    const adresse = (e.email ?? "").trim();
    if (EMAIL_MUSTER.test(adresse)) liste.push({ ...e, email: adresse });
    else aussortiert.push(e.email);
  }

  if (aussortiert.length > 0) {
    console.warn(
      `Insider-Versand: ${aussortiert.length} unbrauchbare Adressen uebersprungen:`,
      aussortiert.join(", ")
    );
  }

  return { liste, aussortiert };
}

/** Kurze Pause zwischen zwei Buendeln. Resend nimmt zwei Anfragen pro
 *  Sekunde entgegen; ohne Pause laufen wir bei elf Buendeln in die Bremse. */
function warte(ms: number): Promise<void> {
  return new Promise((fertig) => setTimeout(fertig, ms));
}

/** Verschickt eine Liste in Buendeln zu hundert.
 *
 *  Geht ein Buendel schief, macht sie mit dem naechsten weiter statt alles
 *  abzubrechen — ein Problem bei hundert Adressen soll nicht neunhundert
 *  andere aufhalten. Erst wenn zweimal hintereinander nichts durchgeht, ist
 *  offenbar etwas Grundsaetzliches kaputt und sie hoert auf. */
async function inBuendelnVerschicken(
  liste: InsiderAnmeldung[],
  mailBauen: (e: InsiderAnmeldung) => Mail,
  wofuer: string
): Promise<{ verschickt: number; fehler: string | null }> {
  let verschickt = 0;
  let fehler: string | null = null;
  let hintereinander = 0;

  for (let i = 0; i < liste.length; i += BUENDEL) {
    if (i > 0) await warte(600);

    const buendel = liste.slice(i, i + BUENDEL);
    const antwort = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buendel.map(mailBauen)),
    });

    if (!antwort.ok) {
      const text = (await antwort.text()).slice(0, 300);
      console.error(`${wofuer} fehlgeschlagen:`, antwort.status, text);
      fehler ??= `${antwort.status} — ${text}`;
      if (++hintereinander >= 2) break;
      continue;
    }

    hintereinander = 0;
    verschickt += buendel.length;
  }

  return { verschickt, fehler };
}

export async function beitragVersenden(
  beitrag: Beitrag,
  basisUrl: string
): Promise<VersandErgebnis> {
  const schon = await vermerkFinden(beitrag.slug);
  if (schon) {
    return {
      ok: false,
      grund: "schon-versendet",
      text: "Dieser Beitrag wurde schon einmal verschickt.",
    };
  }

  const geholt = await empfaengerHolen(
    "insider_anmeldungen?bestaetigt=eq.true&select=vorname,email,token"
  );
  if (!geholt) {
    return { ok: false, grund: "fehler", text: "Die Adressliste war nicht erreichbar." };
  }
  if (geholt.liste.length === 0) {
    return {
      ok: false,
      grund: "keine-empfaenger",
      text: "Es gibt noch keine bestätigten Insider, an die etwas gehen könnte.",
    };
  }

  const { verschickt, fehler } = await inBuendelnVerschicken(
    geholt.liste,
    (e) => {
      // Persönlich: Der Link meldet sie unterwegs gleich an, damit sie nicht
      // vor der Schranke steht, obwohl sie dabei ist.
      const beitragsLink =
        `${basisUrl}/insider-bestaetigt?token=${encodeURIComponent(e.token)}` +
        `&weiter=${encodeURIComponent(`/insider/${beitrag.slug}`)}`;
      const abmeldeLink = `${basisUrl}/insider-abmelden?token=${encodeURIComponent(e.token)}`;

      return {
        from: VON,
        to: [e.email],
        reply_to: ANTWORT_AN,
        subject: beitrag.titel,
        // Sagt dem Postfach, wo man sich abmeldet. Manche zeigen dafür einen
        // eigenen Knopf an — das ist deutlich besser, als wenn jemand
        // stattdessen auf "Spam" drückt.
        headers: { "List-Unsubscribe": `<${abmeldeLink}>` },
        html: rahmen(`
          <p style="font-size:17px;">${anrede(e.vorname)}</p>
          <p style="font-size:16px;line-height:1.6;">
            es gibt einen neuen Beitrag für dich:
          </p>
          <div style="background:#F9EDED;border-radius:12px;padding:20px;margin:24px 0;">
            <p style="font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#B87878;margin:0 0 8px;">${esc(beitrag.kategorie)}</p>
            <p style="font-size:21px;line-height:1.35;margin:0 0 12px;">${esc(beitrag.titel)}</p>
            <p style="font-size:15px;line-height:1.7;margin:0;">${esc(beitrag.beschreibung)}</p>
          </div>
          <p style="margin:28px 0;">
            <a href="${beitragsLink}" style="background:#B87878;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:16px;display:inline-block;">
              Beitrag lesen
            </a>
          </p>
          <p style="font-size:14px;line-height:1.6;color:#8a7070;">
            Der Link meldet dich unterwegs gleich an, du musst also nichts
            eingeben.
          </p>
          <p style="font-size:16px;line-height:1.6;">Alles Gute für dich und dein Pferd,<br>Yasi</p>
          <p style="font-size:13px;line-height:1.6;color:#8a7070;margin-top:28px;">
            Du bekommst diese Mail, weil du dich bei den ${esc(insider.name)}
            eingetragen hast.
            <a href="${abmeldeLink}" style="color:#8a7070;">Hier abmelden</a>
          </p>
        `),
      };
    },
    "Insider-Versand"
  );

  if (verschickt === 0) {
    // Kein Vermerk: Es ist nichts rausgegangen, also muss sich der Beitrag
    // erneut verschicken lassen. Ein Vermerk hier wäre eine Sackgasse, aus
    // der nur ein Eingriff in der Datenbank wieder herausführt.
    return {
      ok: false,
      grund: "fehler",
      text: `Der Versand hat nicht geklappt, es ist keine Mail rausgegangen. ${fehler ?? ""}`.trim(),
    };
  }

  // Ab hier ist etwas raus, und das lässt sich nicht zurücknehmen. Der
  // Vermerk muss deshalb auch dann stehen, wenn nur ein Teil durchging —
  // sonst bekämen beim nächsten Klick alle die Mail ein zweites Mal.
  await supabase("insider_versand", {
    method: "POST",
    body: JSON.stringify({ slug: beitrag.slug, empfaenger: verschickt }),
  });

  return { ok: true, empfaenger: verschickt, uebersprungen: geholt.aussortiert.length };
}

/** Meldet eine Adresse ab. Die Zeile wird gelöscht, nicht markiert — so
 *  steht es auch in der Datenschutzerklärung, und eine Liste, die gelöschte
 *  Adressen weiter mitführt, ist genau das, was niemand haben will. */
export async function insiderAbmelden(token: string): Promise<boolean> {
  const res = await supabase(
    `insider_anmeldungen?token=eq.${encodeURIComponent(token)}`,
    { method: "DELETE" }
  );
  return res.ok;
}

/** Wer steckt hinter dem Abmelde-Schlüssel? Für die Rückfrage vor dem
 *  endgültigen Abmelden. */
export async function anmeldungZuToken(token: string): Promise<InsiderAnmeldung | null> {
  return ersteZeile<InsiderAnmeldung>(
    `insider_anmeldungen?token=eq.${encodeURIComponent(token)}&select=*&limit=1`
  );
}

// ---------------------------------------------------------------------------
// Die einmalige Nachfrage an die übernommenen Anmeldungen.
//
// Beim Umzug von alfima kamen Adressen mit, bei denen kein Bestätigungsklick
// dokumentiert ist. Die stehen als `bestaetigt = false` in der Tabelle und
// bekommen deshalb nichts — bis auf diese eine Mail, die fragt, ob sie noch
// dabei sein möchten.
//
// Wer nicht klickt, hört nichts mehr. Das ist der Sinn der Sache: Am Ende
// steht eine Liste, bei der für jede einzelne Adresse ein Klick belegt ist.
// ---------------------------------------------------------------------------

/** Unter diesem Namen wird die Nachfrage in insider_versand vermerkt, damit
 *  sie nicht zweimal rausgeht. Der Unterstrich macht sichtbar, dass es kein
 *  Beitrag ist. */
const NACHFRAGE = "_nachfrage-uebernahme";

/** Wie viele übernommene Anmeldungen noch auf ihre Bestätigung warten. */
export async function offeneUebernahmen(): Promise<number> {
  const anzahl = await supabaseZaehlen(
    `${TABELLE}?bestaetigt=eq.false&quelle=eq.alfima-uebernahme-offen`
  );
  return Math.max(anzahl, 0);
}

export async function nachfrageSchonRaus(): Promise<Versandvermerk | null> {
  return vermerkFinden(NACHFRAGE);
}

export async function nachfrageVersenden(basisUrl: string): Promise<VersandErgebnis> {
  if (await vermerkFinden(NACHFRAGE)) {
    return {
      ok: false,
      grund: "schon-versendet",
      text: "Die Nachfrage ist schon einmal rausgegangen.",
    };
  }

  const geholt = await empfaengerHolen(
    `${TABELLE}?bestaetigt=eq.false&quelle=eq.alfima-uebernahme-offen&select=vorname,email,token`
  );
  if (!geholt) {
    return { ok: false, grund: "fehler", text: "Die Adressliste war nicht erreichbar." };
  }
  if (geholt.liste.length === 0) {
    return { ok: false, grund: "keine-empfaenger", text: "Es wartet niemand auf eine Nachfrage." };
  }

  const { verschickt, fehler } = await inBuendelnVerschicken(
    geholt.liste,
    (e) => {
      const link = `${basisUrl}/insider-bestaetigt?token=${encodeURIComponent(e.token)}`;
      return {
        from: VON,
        to: [e.email],
        reply_to: ANTWORT_AN,
        subject: `Möchtest du bei den ${insider.name} dabei bleiben?`,
        html: rahmen(`
          <p style="font-size:17px;">${anrede(e.vorname)}</p>
          <p style="font-size:16px;line-height:1.6;">
            du hast dich vor einiger Zeit für die ${esc(insider.name)}
            eingetragen. Der Kanal ist inzwischen auf meine eigene Seite
            umgezogen, und ich möchte das zum Anlass nehmen, einmal
            nachzufragen statt einfach weiterzuschreiben.
          </p>
          <p style="font-size:16px;line-height:1.6;">
            Wenn du weiter dabei sein möchtest, klick einmal hier — dann
            bekommst du wie bisher regelmäßig ein Thema aus meiner Praxis, und
            alle Beiträge stehen dir offen.
          </p>
          <p style="margin:28px 0;">
            <a href="${link}" style="background:#B87878;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:16px;display:inline-block;">
              Ja, ich bleibe dabei
            </a>
          </p>
          <p style="font-size:15px;line-height:1.6;color:#8a7070;">
            Und wenn nicht: Dann musst du gar nichts tun. Ohne deinen Klick
            hörst du nichts mehr von mir — das ist keine Abmeldung, die du
            beantragen musst, sondern einfach das, was passiert.
          </p>
          <p style="font-size:16px;line-height:1.6;">Alles Gute für dich und dein Pferd,<br>Yasi</p>
        `),
      };
    },
    "Nachfrage"
  );

  if (verschickt === 0) {
    return {
      ok: false,
      grund: "fehler",
      text: `Es ist keine Mail rausgegangen. ${fehler ?? ""}`.trim(),
    };
  }

  await supabase("insider_versand", {
    method: "POST",
    body: JSON.stringify({ slug: NACHFRAGE, empfaenger: verschickt }),
  });

  return { ok: true, empfaenger: verschickt, uebersprungen: geholt.aussortiert.length };
}

// ---------------------------------------------------------------------------
// Die einmalige Einladung an die Bestandskundinnen aus Tentary.
//
// Am 27.08.2026 kamen 1023 Adressen dazu: Menschen, die bei Yasi gekauft
// haben, deren Produkt es aber in der Akademie nicht gibt — Fliegenspray,
// Fellwechsel, Arthrose und so weiter. Sie stehen als `bestaetigt = false`
// in der Tabelle und bekommen deshalb nichts, bis auf diese eine Einladung.
//
// Gleiche Regel wie bei der alfima-Nachfrage: Wer klickt, ist danach normal
// dabei. Wer nicht klickt, hört nichts mehr. Am Ende steht eine Liste, bei
// der für jede Adresse ein Klick belegt ist.
// ---------------------------------------------------------------------------

/** Woran die eingeladenen Adressen zu erkennen sind. */
const EINLADUNG_QUELLE = "bestandskunden-2026-08";

/** Unter diesem Namen wird die Einladung in insider_versand vermerkt, damit
 *  sie nicht zweimal rausgeht. Der Unterstrich macht sichtbar, dass es kein
 *  Beitrag ist. */
const EINLADUNG = "_einladung-bestandskunden";

/** Wie viele Eingeladene noch auf ihre Bestätigung warten. */
export async function offeneEinladungen(): Promise<number> {
  const anzahl = await supabaseZaehlen(
    `${TABELLE}?bestaetigt=eq.false&quelle=eq.${EINLADUNG_QUELLE}`
  );
  return Math.max(anzahl, 0);
}

export async function einladungSchonRaus(): Promise<Versandvermerk | null> {
  return vermerkFinden(EINLADUNG);
}

export async function einladungVersenden(basisUrl: string): Promise<VersandErgebnis> {
  if (await vermerkFinden(EINLADUNG)) {
    return {
      ok: false,
      grund: "schon-versendet",
      text: "Die Einladung ist schon einmal rausgegangen.",
    };
  }

  const geholt = await empfaengerHolen(
    `${TABELLE}?bestaetigt=eq.false&quelle=eq.${EINLADUNG_QUELLE}&select=vorname,email,token`
  );
  if (!geholt) {
    return { ok: false, grund: "fehler", text: "Die Adressliste war nicht erreichbar." };
  }
  if (geholt.liste.length === 0) {
    return { ok: false, grund: "keine-empfaenger", text: "Es wartet niemand auf eine Einladung." };
  }

  const { verschickt, fehler } = await inBuendelnVerschicken(
    geholt.liste,
    (e) => {
      const link = `${basisUrl}/insider-bestaetigt?token=${encodeURIComponent(e.token)}`;
      return {
        from: VON,
        to: [e.email],
        reply_to: ANTWORT_AN,
        subject: `Magst du dabei sein? Die ${insider.name}`,
        html: rahmen(`
          <p style="font-size:17px;">${anrede(e.vorname)}</p>
          <p style="font-size:16px;line-height:1.6;">
            du hast vor einiger Zeit etwas bei mir gekauft, und dafür möchte ich
            mich bedanken. Seitdem hat sich einiges getan, und deshalb melde ich
            mich noch einmal.
          </p>
          <p style="font-size:16px;line-height:1.6;">
            Ich schreibe inzwischen regelmäßig über das, was mir in der Praxis
            begegnet: was in echten Rationen schiefgeht, wie man Zusatzfutter
            ehrlich einordnet, wie man Laborwerte liest. Das sind die
            ${esc(insider.name)}. Sie kosten nichts, und ich lade dich dazu ein.
          </p>
          <p style="margin:28px 0;">
            <a href="${link}" style="background:#B87878;color:#fff;padding:14px 28px;border-radius:999px;text-decoration:none;font-size:16px;display:inline-block;">
              Ja, ich bin dabei
            </a>
          </p>
          <p style="font-size:15px;line-height:1.6;color:#8a7070;">
            Ein Klick genügt. Danach kommen die Beiträge in dein Postfach, und
            alle bisherigen stehen dir offen.
          </p>
          <p style="font-size:15px;line-height:1.6;color:#8a7070;">
            Und wenn nicht: Dann musst du gar nichts tun. Ohne deinen Klick
            hörst du nichts mehr von mir. Das ist keine Abmeldung, die du
            beantragen musst, sondern einfach das, was passiert.
          </p>
          <p style="font-size:16px;line-height:1.6;">Alles Gute für dich und dein Pferd,<br>Yasi</p>
        `),
      };
    },
    "Einladung"
  );

  if (verschickt === 0) {
    return {
      ok: false,
      grund: "fehler",
      text: `Es ist keine Mail rausgegangen. ${fehler ?? ""}`.trim(),
    };
  }

  await supabase("insider_versand", {
    method: "POST",
    body: JSON.stringify({ slug: EINLADUNG, empfaenger: verschickt }),
  });

  return { ok: true, empfaenger: verschickt, uebersprungen: geholt.aussortiert.length };
}
