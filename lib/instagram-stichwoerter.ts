// ---------------------------------------------------------------------------
// Die Stichwörter für Instagram-Kommentare, als Ersatz für ManyChat.
//
// ▸ SO FUNKTIONIERT ES
//   Jemand kommentiert unter einem Beitrag oder Reel ein Stichwort, zum
//   Beispiel HEU. Meta meldet den Kommentar an app/api/instagram/webhook, die
//   Website sucht hier das passende Stichwort und schickt der Person die
//   `nachricht` als Direktnachricht (eine „private Antwort“ auf den
//   Kommentar). Unter den Kommentar kommt eine der `kommentarAntworten`.
//
// ▸ EIN NEUES STICHWORT anlegen heißt: hier einen Eintrag ergänzen und
//   veröffentlichen. Mehr nicht. Die Übersicht unter /admin/instagram zeigt,
//   wie oft jedes ausgelöst hat.
//
// ▸ WAS IN DIE NACHRICHT GEHÖRT
//   Kurz, freundlich, ein Link mit ?von=instagram-<wort>, damit die Anmeldung
//   hinterher ihre Herkunft kennt. Keine Heilversprechen, und nichts, was nur
//   für Follower gilt: Instagram zeigt die Nachricht auch Leuten, die dir
//   nicht folgen (dann als Nachrichtenanfrage).
//
// ▸ DIE KOMMENTAR-ANTWORTEN DÜRFEN KEIN STICHWORT ENTHALTEN, sonst löst die
//   eigene Antwort das nächste Mal wieder aus. Mehrere Fassungen, weil
//   Instagram hundertmal denselben Satz als Spam werten kann.
//
// Diese Datei enthält nichts Geheimes und darf auch im Browser laufen.
// ---------------------------------------------------------------------------

export type Stichwort = {
  /** Das Wort, in Großbuchstaben. Groß- und Kleinschreibung spielt beim Kommentar keine Rolle. */
  wort: string;
  /** Weitere Schreibweisen, die ebenfalls zählen. */
  auch?: string[];
  /** Die Direktnachricht. */
  nachricht: string;
  /** Aus, ohne es zu löschen. */
  aus?: boolean;
};

export const STICHWOERTER: Stichwort[] = [
  {
    wort: "HEU",
    nachricht:
      "Hallo 👋🏻 Hier ist dein kostenloser Minikurs Heu 2026: fünf kurze Mails, eine pro Tag. " +
      "Trag dich hier ein, nach deiner Bestätigung geht es los:\n\n" +
      "https://www.pferdeliebehealthy.de/heu-2026?von=instagram-heu\n\n" +
      "Liebe Grüße, Yasi",
  },
  {
    wort: "CHECK",
    nachricht:
      "Hallo 👋🏻 Hier ist mein kostenloser Futter-Check. Sechs kurze Fragen, dein Ergebnis " +
      "bekommst du per Mail:\n\n" +
      "https://www.pferdeliebehealthy.de/futter-check-start?von=instagram-check\n\n" +
      "Liebe Grüße, Yasi",
  },
  // Die übrigen Stichwörter aus ManyChat (Pernaturam, Avocado und weitere)
  // kommen dazu, sobald Yasemin die Liste mit den Texten geschickt hat.
];

/** Die kurze Antwort unter dem Kommentar. Enthält bewusst kein Stichwort. */
export const KOMMENTAR_ANTWORTEN = [
  "Ist unterwegs, schau in deine Nachrichten 📩",
  "Hab dir geschrieben, schau mal in deine Nachrichten 💌",
  "Schon verschickt, du findest es in deinen Nachrichten 📩",
];

/** Macht aus einem Kommentar eine Liste von Wörtern in Großbuchstaben, ohne Satzzeichen und Emoji. */
export function woerter(text: string): string[] {
  return (text || "")
    .toUpperCase()
    .replace(/[^A-Z0-9ÄÖÜß]+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);
}

/** Abstand zweier Wörter in Tippfehlern (Einfügen, Löschen, Tauschen eines Buchstabens). */
function abstand(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  return d[a.length][b.length];
}

/** Wörter, die neben einem Stichwort stehen dürfen, ohne dass es aufhört, eins zu sein. */
const FUELLWOERTER = new Set([
  "BITTE", "GERNE", "GERN", "JA", "JAA", "HIER", "DANKE", "ICH", "AUCH", "MIR", "BIN", "DABEI",
  "WILL", "MÖCHTE", "HABEN", "HALLO", "HI", "HEY", "LIEBE", "YASI", "UND", "SUPER", "TOLL",
]);

/**
 * Das Stichwort in einem Kommentar, oder null.
 *
 * ▸ NUR, WENN ES BEWUSST GESCHRIEBEN IST. Auf einem Konto über Heu steht das
 *   Wort Heu in vielen echten Fragen („Wie viel Heu braucht mein Pony?“).
 *   Darauf eine automatische Nachricht und darunter „schau in deine
 *   Nachrichten“ zu setzen, wäre Spam. Es zählt deshalb nur,
 *   - wenn das Stichwort in Großbuchstaben dasteht (HEU, CHECK), so wie es
 *     im Reel angesagt wird, egal was sonst im Kommentar steht, oder
 *   - wenn neben dem Stichwort nur Füllwörter stehen („heu bitte“, „check 🙏“).
 *
 * ▸ EIN TIPPFEHLER ZÄHLT MIT, aber nur bei Wörtern ab fünf Buchstaben. In
 *   ManyChat liefen „Acocado“ und „Abocafo“ ins Leere (siehe Nachrichten vom
 *   Mai 2026). Bei kurzen Wörtern wäre ein Buchstabe zu viel Spielraum: HEU
 *   und HEY liegen nur einen Buchstaben auseinander.
 */
export function stichwortIn(text: string): Stichwort | null {
  // Die Wörter so, wie sie geschrieben wurden, um Großschreibung zu erkennen.
  const roh = (text || "").split(/[^A-Za-z0-9ÄÖÜäöüß]+/).filter(Boolean);
  if (roh.length === 0) return null;
  for (const s of STICHWOERTER) {
    if (s.aus) continue;
    const formen = [s.wort, ...(s.auch ?? [])].map((f) => f.toUpperCase());
    const trifft = (w: string) =>
      formen.includes(w) || (w.length >= 5 && formen.some((f) => f.length >= 5 && abstand(w, f) <= 1));

    const treffer = roh.filter((w) => trifft(w.toUpperCase()));
    if (treffer.length === 0) continue;

    const grossGeschrieben = treffer.some((w) => w === w.toUpperCase() && /[A-ZÄÖÜ]/.test(w));
    const rest = roh.filter((w) => !trifft(w.toUpperCase()));
    const nurFuellwoerter = rest.every((w) => FUELLWOERTER.has(w.toUpperCase()));

    if (grossGeschrieben || nurFuellwoerter) return s;
  }
  return null;
}
