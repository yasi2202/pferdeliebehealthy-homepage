// ---------------------------------------------------------------------------
// Die Kopfangaben eines Blogbeitrags und die Prüfung auf die Schreibregeln.
//
// ▸ WARUM EINE EIGENE DATEI
//   Der Blog-Editor in der Verwaltung braucht das im Browser, und lib/blog.ts
//   darf dort nicht hin, weil sie den Ordner auf der Festplatte liest. Hier
//   steht deshalb nichts, was nur auf dem Server läuft.
//
// ▸ WARUM DER KOPF VON HAND GESCHRIEBEN WIRD
//   gray-matter kann den Kopf zwar selbst schreiben, macht dabei aber aus
//   `datum: 2026-09-12` ein `2026-09-12T00:00:00.000Z`. Hier wird jede Zeile
//   so geschrieben, wie sie in den Dateien schon steht. Zeichenketten kommen
//   in doppelte Anführungszeichen, gebildet mit JSON.stringify; das ist
//   gültiges YAML, auch mit Anführungszeichen oder Doppelpunkt im Text.
// ---------------------------------------------------------------------------

export type BlogKopfFelder = {
  titel: string;
  beschreibung: string;
  kategorie: string;
  angebot: string;
  datum: string;
  aktualisiert: string;
  bild: string;
  bildText: string;
  bildBreit: boolean;
  bildFokus: string;
};

export const LEERER_KOPF: BlogKopfFelder = {
  titel: "",
  beschreibung: "",
  kategorie: "Grundlagen",
  angebot: "",
  datum: "",
  aktualisiert: "",
  bild: "",
  bildText: "",
  bildBreit: false,
  bildFokus: "",
};

/** Die Kategorien, die es schon gibt. Siehe inhalte/blog/_vorlage.md. */
export const BEKANNTE_KATEGORIEN = [
  "Grundlagen",
  "Heu und Grundfutter",
  "Nährstoffe",
  "Magen und Darm",
  "Stoffwechsel",
  "Haut, Fell und Hufe",
  "Kräuter und Öle",
  "Kritische Futtermittel",
  "Durchs Jahr",
];

const BEKANNTE_SCHLUESSEL = new Set<string>(Object.keys(LEERER_KOPF));

/** 2026-09-12 aus allem, was YAML daraus gemacht haben kann. */
export function datumText(wert: unknown): string {
  if (!wert) return "";
  if (wert instanceof Date) {
    return Number.isNaN(wert.getTime()) ? "" : wert.toISOString().slice(0, 10);
  }
  const s = String(wert);
  return /^\d{4}-\d{2}-\d{2}/.test(s) ? s.slice(0, 10) : "";
}

/** Zerlegt die Kopfangaben in die bekannten Felder und den Rest. Der Rest
 *  bleibt beim Speichern erhalten, auch wenn der Editor ihn nicht kennt. */
export function kopfAusDaten(data: Record<string, unknown>): {
  kopf: BlogKopfFelder;
  extras: Record<string, unknown>;
} {
  const extras: Record<string, unknown> = {};
  for (const [schluessel, wert] of Object.entries(data)) {
    if (!BEKANNTE_SCHLUESSEL.has(schluessel)) {
      extras[schluessel] = wert instanceof Date ? datumText(wert) : wert;
    }
  }
  const text = (w: unknown) => (w === null || w === undefined ? "" : String(w));
  return {
    kopf: {
      titel: text(data.titel),
      beschreibung: text(data.beschreibung),
      kategorie: text(data.kategorie) || "Grundlagen",
      angebot: text(data.angebot),
      datum: datumText(data.datum),
      aktualisiert: datumText(data.aktualisiert),
      bild: text(data.bild),
      bildText: text(data.bildText),
      bildBreit: data.bildBreit === true,
      bildFokus: text(data.bildFokus),
    },
    extras,
  };
}

/** Setzt Kopf und Text wieder zu einer Beitragsdatei zusammen. */
export function beitragZusammensetzen(
  kopf: BlogKopfFelder,
  inhalt: string,
  extras: Record<string, unknown> = {}
): string {
  const q = (s: string) => JSON.stringify(s);
  const datum = (s: string) => (/^\d{4}-\d{2}-\d{2}$/.test(s) ? ` ${s}` : "");
  const zeilen = [
    "---",
    `titel: ${q(kopf.titel)}`,
    `datum:${datum(kopf.datum)}`,
    `aktualisiert:${datum(kopf.aktualisiert)}`,
    `kategorie: ${q(kopf.kategorie)}`,
    `angebot: ${q(kopf.angebot)}`,
    `bild: ${q(kopf.bild)}`,
    `bildText: ${q(kopf.bildText)}`,
    `bildBreit: ${kopf.bildBreit ? "true" : "false"}`,
    ...(kopf.bildFokus ? [`bildFokus: ${q(kopf.bildFokus)}`] : []),
    `beschreibung: ${q(kopf.beschreibung)}`,
    ...Object.entries(extras).map(([s, w]) => `${s}: ${JSON.stringify(w)}`),
    "---",
  ];
  const text = inhalt.replace(/^\s*\n/, "").replace(/\s*$/, "");
  return `${zeilen.join("\n")}\n${text}\n`;
}

// ---------------------------------------------------------------------------
// Die Prüfung auf die eigenen Regeln.
//
// Das ist kein Verbot, sondern ein Hinweis beim Schreiben. Die Wörter stehen
// in inhalte/blog/_vorlage.md unter „Die Sätze, die nie in einen Beitrag
// dürfen“, dazu die Regel ohne Gedankenstriche. Ein Treffer heißt: einmal
// hinsehen. Manchmal ist er harmlos, etwa „heilt“ in einem Satz über eine
// Wunde, die die Tierärztin versorgt.
// ---------------------------------------------------------------------------

export type Hinweis = { text: string; stelle?: string };

const HEILVERSPRECHEN = [
  "hilft bei",
  "hilft gegen",
  "lindert",
  "heilt",
  "wirkt gegen",
  "beugt vor",
  "vorbeugend gegen",
  "stärkt das immunsystem",
  "stabilisiert die darmflora",
  "unterstützt die leber",
  "entgiftet",
  "antibakteriell",
  "antimikrobiell",
  "entzündungshemmend",
];

function stelle(text: string, i: number, laenge: number): string {
  const von = Math.max(0, i - 45);
  const bis = Math.min(text.length, i + laenge + 45);
  return (
    (von > 0 ? "… " : "") +
    text.slice(von, bis).replace(/\s+/g, " ").trim() +
    (bis < text.length ? " …" : "")
  );
}

export function beitragPruefen(kopf: BlogKopfFelder, inhalt: string): Hinweis[] {
  const hinweise: Hinweis[] = [];
  const alles = `${kopf.titel}\n${kopf.beschreibung}\n${inhalt}`;
  const klein = alles.toLowerCase();

  const strich = alles.search(/[–—]/);
  if (strich !== -1) {
    hinweise.push({
      text: "Gedankenstrich gefunden. Lieber ein Komma oder ein neuer Satz.",
      stelle: stelle(alles, strich, 1),
    });
  }

  for (const wort of HEILVERSPRECHEN) {
    const i = klein.indexOf(wort);
    if (i !== -1) {
      hinweise.push({
        text: `„${wort}“ klingt nach Heilversprechen. Futter ist kein Arzneimittel: besser „wird traditionell eingesetzt“, „enthält“, „liefert“.`,
        stelle: stelle(alles, i, wort.length),
      });
    }
  }

  if (!kopf.titel.trim()) hinweise.push({ text: "Der Titel fehlt." });
  else if (kopf.titel.length > 65) {
    hinweise.push({
      text: `Der Titel hat ${kopf.titel.length} Zeichen. Google zeigt etwa 60, der Rest wird abgeschnitten.`,
    });
  }
  if (!kopf.beschreibung.trim()) {
    hinweise.push({ text: "Die Beschreibung für Google fehlt. Sie entscheidet, ob jemand klickt." });
  } else if (kopf.beschreibung.length > 160) {
    hinweise.push({
      text: `Die Beschreibung hat ${kopf.beschreibung.length} Zeichen. Google zeigt etwa 155.`,
    });
  }
  if (!/^##\s/m.test(inhalt)) {
    hinweise.push({ text: "Noch keine Zwischenüberschrift (##). Die meisten lesen am Handy und überfliegen zuerst." });
  }
  if (kopf.bild && !kopf.bildText.trim()) {
    hinweise.push({ text: "Zum Bild fehlt der Bildtext. Er steht unter dem Bild und wird von Google gelesen." });
  }
  return hinweise;
}
