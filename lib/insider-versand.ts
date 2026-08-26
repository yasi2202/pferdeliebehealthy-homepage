import { supabase, ersteZeile, esc, rahmen, ANTWORT_AN } from "@/lib/versand";
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
const VON = "Yasi von Pferdeliebehealthy <info@updates.pferdeliebehealthy.de>";

/** Resend nimmt bis zu 100 Mails pro Anfrage entgegen. Einzeln verschickt
 *  liefe die Funktion bei einem wachsenden Verteiler in die Zeitbegrenzung
 *  von Vercel — in Bündeln bleibt sie auch bei tausend Adressen schnell. */
const BUENDEL = 100;

export type VersandErgebnis =
  | { ok: true; empfaenger: number }
  | { ok: false; grund: "schon-versendet" | "keine-empfaenger" | "fehler"; text: string };

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

  const res = await supabase(
    "insider_anmeldungen?bestaetigt=eq.true&select=vorname,email,token"
  );
  if (!res.ok) {
    return { ok: false, grund: "fehler", text: "Die Adressliste war nicht erreichbar." };
  }
  const empfaenger: InsiderAnmeldung[] = await res.json();

  if (!Array.isArray(empfaenger) || empfaenger.length === 0) {
    return {
      ok: false,
      grund: "keine-empfaenger",
      text: "Es gibt noch keine bestätigten Insider, an die etwas gehen könnte.",
    };
  }

  let verschickt = 0;

  for (let i = 0; i < empfaenger.length; i += BUENDEL) {
    const buendel = empfaenger.slice(i, i + BUENDEL);

    const mails = buendel.map((e) => {
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
          <p style="font-size:17px;">Hallo ${esc(e.vorname)},</p>
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
    });

    const antwort = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(mails),
    });

    if (!antwort.ok) {
      const text = await antwort.text();
      console.error("Insider-Versand fehlgeschlagen:", antwort.status, text.slice(0, 300));
      // Was schon raus ist, ist raus. Deshalb wird der Vermerk trotzdem
      // gesetzt — sonst schickt der nächste Klick alles noch einmal an die,
      // die es bereits haben.
      break;
    }

    verschickt += buendel.length;
  }

  if (verschickt === 0) {
    // Kein Vermerk: Es ist nichts rausgegangen, also muss sich der Beitrag
    // erneut verschicken lassen. Ein Vermerk hier wäre eine Sackgasse, aus
    // der nur ein Eingriff in der Datenbank wieder herausführt.
    return {
      ok: false,
      grund: "fehler",
      text: "Der Versand hat nicht geklappt, es ist keine Mail rausgegangen. Versuch es noch einmal.",
    };
  }

  // Ab hier ist etwas raus, und das lässt sich nicht zurücknehmen. Der
  // Vermerk muss deshalb auch dann stehen, wenn nur ein Teil durchging —
  // sonst bekämen beim nächsten Klick alle die Mail ein zweites Mal.
  await supabase("insider_versand", {
    method: "POST",
    body: JSON.stringify({ slug: beitrag.slug, empfaenger: verschickt }),
  });

  return { ok: true, empfaenger: verschickt };
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
