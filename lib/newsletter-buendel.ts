// ---------------------------------------------------------------------------
// Ein Bündel verschicken, auch wenn eine Adresse darin faul ist.
//
// ▸ DAS PROBLEM, DAS DIESE DATEI LÖST
//   Resend nimmt bis zu hundert Mails in einer Anfrage entgegen. Ist EINE
//   Adresse darin fehlerhaft, weist Resend die ganze Anfrage zurück und
//   KEINE der hundert Mails geht raus. Am 04.09.2026 hat das den
//   Aroma-Newsletter getroffen (3.097 von 3.293) und am 05.09.2026 die
//   EquiDesk-Mail (3.036 von 3.293). Rund 200 Kundinnen bekamen ihre Post
//   nicht, ohne dass irgendwo etwas anderes stand als eine zu kleine Zahl.
//
// ▸ DIE LÖSUNG: HALBIEREN, NICHT EINZELN NACHSCHICKEN
//   Ein zurückgewiesenes Bündel wird in zwei Hälften geteilt, die Hälften
//   wieder, bis die faule Adresse allein dasteht. Bei einer kaputten Adresse
//   in hundert kostet das etwa vierzehn Anfragen. Hundert Mails einzeln zu
//   verschicken wären hundert Anfragen, und weil Resend nur zwei Anfragen je
//   Sekunde annimmt, wäre der Versand mitten im Verteiler in die
//   Zeitbegrenzung von Vercel gelaufen.
//
// ▸ WANN NICHT HALBIERT WIRD, und das ist der wichtigste Teil
//   Halbieren hilft nur, wenn eine ADRESSE das Problem ist. Ist es die
//   Bremse (429) oder ein Serverfehler (5xx), macht Halbieren alles
//   schlimmer: Aus einer abgelehnten Anfrage würden zwei, aus zwei vier. In
//   dem Fall wird deshalb einmal gewartet und dasselbe Bündel wiederholt.
//   Geht es dann immer noch nicht, bleibt es liegen und der Fehler wird
//   gemeldet.
//
// Diese Datei kennt weder Resend noch Supabase. Sie bekommt eine
// Sendefunktion übergeben und lässt sich deshalb ohne Mailversand prüfen:
// `node --test` oder das Skript im Scratchpad.
// ---------------------------------------------------------------------------

/** Was beim Versuch, ein Bündel zu verschicken, herauskam. */
export type BuendelAntwort =
  /** Alles raus. */
  | { art: "ok" }
  /** Resend nimmt dieses Bündel nicht an. Verdacht: eine Adresse darin. */
  | { art: "abgelehnt"; text: string }
  /** Zu schnell oder Störung bei Resend. Dasselbe Bündel später nochmal. */
  | { art: "spaeter"; text: string }
  /** Es liegt nicht am Bündel, sondern am Zugang. Weitermachen ist sinnlos. */
  | { art: "aussichtslos"; text: string };

export type BuendelErgebnis = {
  /** So viele Mails hat Resend angenommen. */
  verschickt: number;
  /** Adressen, die Resend einzeln zurückgewiesen hat. Die gehören korrigiert. */
  abgelehnt: string[];
  /** Adressen, die aus einem anderen Grund liegen geblieben sind. */
  liegengeblieben: string[];
  /** Der erste technische Fehler, wörtlich, für die Meldung im Adminbereich. */
  fehler: string | null;
  /** Wie viele Anfragen es gekostet hat. Nur zur Beobachtung. */
  anfragen: number;
};

/**
 * Verschickt ein Bündel und teilt es auf, wenn Resend es zurückweist.
 *
 * @param liste      Die Empfänger dieses Bündels, höchstens hundert.
 * @param adresse    Wie man aus einem Empfänger seine Mailadresse liest.
 * @param senden     Schickt einen Teil wirklich los.
 * @param warte      Pause zwischen zwei Anfragen, damit die Bremse nicht greift.
 * @param pause      Millisekunden zwischen zwei Anfragen.
 * @param hoechstens Notbremse: mehr Anfragen macht ein Bündel nicht.
 */
export async function buendelSenden<T>(
  liste: T[],
  adresse: (empfaenger: T) => string,
  senden: (teil: T[]) => Promise<BuendelAntwort>,
  warte: (ms: number) => Promise<void>,
  pause = 600,
  hoechstens = 40
): Promise<BuendelErgebnis> {
  const ergebnis: BuendelErgebnis = {
    verschickt: 0,
    abgelehnt: [],
    liegengeblieben: [],
    fehler: null,
    anfragen: 0,
  };

  if (liste.length === 0) return ergebnis;

  async function versuchen(teil: T[], ersteAnfrage: boolean): Promise<void> {
    if (teil.length === 0) return;

    // Die Notbremse. Sie greift nur, wenn ein Bündel voller kaputter
    // Adressen steckt. Der Rest bleibt dann liegen, statt den ganzen
    // Versand in die Zeitbegrenzung laufen zu lassen.
    if (ergebnis.anfragen >= hoechstens) {
      ergebnis.liegengeblieben.push(...teil.map(adresse));
      ergebnis.fehler ??=
        `Ein Bündel brauchte mehr als ${hoechstens} Anfragen. Der Rest ist liegen geblieben.`;
      return;
    }

    if (!ersteAnfrage) await warte(pause);
    ergebnis.anfragen++;
    let antwort = await senden(teil);

    // Bremse oder Störung: einmal Luft holen und dasselbe noch einmal.
    // Hier NICHT halbieren, siehe oben im Kopf der Datei.
    if (antwort.art === "spaeter") {
      await warte(pause * 4);
      ergebnis.anfragen++;
      antwort = await senden(teil);
    }

    if (antwort.art === "ok") {
      ergebnis.verschickt += teil.length;
      return;
    }

    // Der Schlüssel stimmt nicht oder das Konto ist gesperrt. Halbieren
    // würde aus einer abgelehnten Anfrage vierzig machen, und keine davon
    // käme durch. Also sofort aufhören und den Grund melden.
    if (antwort.art === "aussichtslos") {
      ergebnis.liegengeblieben.push(...teil.map(adresse));
      ergebnis.fehler ??= antwort.text;
      return;
    }

    if (antwort.art === "spaeter") {
      ergebnis.liegengeblieben.push(...teil.map(adresse));
      ergebnis.fehler ??= antwort.text;
      return;
    }

    // Abgelehnt. Bei einer einzelnen Adresse ist die Schuldige gefunden.
    if (teil.length === 1) {
      ergebnis.abgelehnt.push(adresse(teil[0]));
      ergebnis.fehler ??= antwort.text;
      return;
    }

    ergebnis.fehler ??= antwort.text;

    const mitte = Math.ceil(teil.length / 2);
    await versuchen(teil.slice(0, mitte), false);
    await versuchen(teil.slice(mitte), false);
  }

  await versuchen(liste, true);
  return ergebnis;
}

/**
 * Ordnet eine Antwort von Resend einer der drei Möglichkeiten zu.
 *
 * ▸ 429 ist die Bremse, 5xx eine Störung bei Resend: beides geht später
 *   vielleicht von selbst. 401 und 403 sind der Zugang, da hilft weder
 *   Warten noch Halbieren — dann ist der Schlüssel falsch oder das Konto
 *   gesperrt, und jede weitere Anfrage ist verlorene Zeit. Alles andere im
 *   4xx-Bereich ist ein Grund zum Halbieren; bei einer fehlerhaften Adresse
 *   antwortet Resend mit 422.
 */
export function antwortEinordnen(status: number, text: string): BuendelAntwort {
  if (status >= 200 && status < 300) return { art: "ok" };
  if (status === 429 || status >= 500)
    return { art: "spaeter", text: `${status} — ${text}` };
  if (status === 401 || status === 403)
    return { art: "aussichtslos", text: `${status} — ${text}` };
  return { art: "abgelehnt", text: `${status} — ${text}` };
}
