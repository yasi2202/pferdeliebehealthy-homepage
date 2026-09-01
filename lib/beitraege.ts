import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// ---------------------------------------------------------------------------
// Liest die Insider-Beiträge aus dem Ordner `inhalte/insider`.
//
// ▸ SO SCHREIBST DU EINEN BEITRAG:
//   Leg im Ordner `inhalte/insider` eine neue Datei an, zum Beispiel
//   `heumenge-richtig-abwiegen.md`. Der Dateiname wird zur Web-Adresse:
//   pferdeliebehealthy.de/insider/heumenge-richtig-abwiegen
//
//   Verwende nur Kleinbuchstaben und Bindestriche, keine Umlaute und
//   keine Leerzeichen im Dateinamen.
//
// ▸ Dateien, die mit einem Unterstrich beginnen (z. B. `_vorlage.md`),
//   werden übersprungen. So kannst du an einem Entwurf arbeiten, ohne
//   dass er auf der Seite erscheint.
// ---------------------------------------------------------------------------

const ORDNER = path.join(process.cwd(), "inhalte", "insider");

// ---------------------------------------------------------------------------
// Oeffnet sich ein Insider-Beitrag nach einer Weile von selbst?
//
// Nein. Der oeffentliche Kanal ist seit dem 01.09.2026 der Blog unter /blog.
// Der Insider-Bereich bleibt geschlossen, so wie Yasemin es entschieden hat:
// Wer dort liest, hat sich eingetragen.
//
// `null` heisst: keine Frist. Steht hier eine Zahl, oeffnet sich jeder
// Beitrag so viele Tage nach seinem Datum von selbst. Unabhaengig davon
// laesst sich ein einzelner Beitrag jederzeit mit `oeffentlich: "ja"`
// freigeben — dafuer bleibt die Mechanik darunter stehen.
// ---------------------------------------------------------------------------
export const TAGE_BIS_OEFFENTLICH: number | null = null;

/** Steht der Beitrag offen im Netz, also auch fuer Google und fuer jede, die
 *  sich nie eingetragen hat?
 *
 *  Im Kopf der Beitragsdatei laesst sich das je Beitrag festlegen:
 *
 *    oeffentlich: "ja"   -> sofort offen, ohne Wartezeit
 *    oeffentlich: "nie"  -> bleibt dauerhaft den Insidern vorbehalten
 *    (Zeile weglassen)   -> automatisch offen nach TAGE_BIS_OEFFENTLICH
 */
function istFrei(datum: string, wunsch: string): boolean {
  const w = wunsch.trim().toLowerCase();
  if (w === "ja") return true;
  if (w === "nie") return false;

  // Keine Frist eingestellt, also bleibt der Beitrag den Insidern vorbehalten.
  if (TAGE_BIS_OEFFENTLICH === null) return false;

  // Ohne Datum keine Frist, also bleibt der Beitrag vorsichtshalber zu.
  if (!datum) return false;

  const erschienen = Date.parse(datum + "T00:00:00Z");
  if (Number.isNaN(erschienen)) return false;

  const tage = (Date.now() - erschienen) / 86400000;
  return tage >= TAGE_BIS_OEFFENTLICH;
}

export type Beitrag = {
  slug: string;
  titel: string;
  datum: string;
  beschreibung: string;
  /** Womit sich die Uebersicht filtern laesst, z. B. "Aus meiner Praxis".
   *  Frei waehlbar: was in den Dateien steht, taucht als Knopf auf. */
  kategorie: string;
  /** Schluessel eines Angebots aus lib/angebote.ts, das unter dem Beitrag
   *  empfohlen wird. Leer lassen, wenn keins passt — ein aufgezwungener
   *  Verkaufskasten unter einem Fachtext schadet mehr, als er bringt. */
  angebot: string;
  /** Was im Kopf der Datei steht: "ja", "nie" oder nichts. Ausgewertet wird
   *  es in `frei` — dort steht die Antwort, hier nur der Wunsch. */
  oeffentlich: string;
  /** Ergebnis der Frist: Darf diesen Beitrag jede lesen, auch ohne Anmeldung? */
  frei: boolean;
  /** Bild oben im Beitrag, z. B. "/images/insider/maehnenkamm.jpg" */
  bild: string;
  bildText: string;
  /** Fertiges HTML, aus dem Markdown erzeugt */
  html: string;
};

export type BeitragKopf = Omit<Beitrag, "html">;

function datumLesbar(wert: unknown): string {
  const d = wert instanceof Date ? wert : new Date(String(wert));
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function dateienLesen(): string[] {
  if (!fs.existsSync(ORDNER)) return [];
  return fs
    .readdirSync(ORDNER)
    .filter((f) => f.endsWith(".md") && !f.startsWith("_"));
}

/** Alle Beiträge, neueste zuerst — ohne Inhalt, für die Übersicht. */
export function alleBeitraege(): BeitragKopf[] {
  return dateienLesen()
    .map((datei) => {
      const roh = fs.readFileSync(path.join(ORDNER, datei), "utf8");
      const { data } = matter(roh);
      const datum = datumLesbar(data.datum);
      const oeffentlich = String(data.oeffentlich ?? "");
      return {
        slug: datei.replace(/\.md$/, ""),
        titel: String(data.titel ?? datei.replace(/\.md$/, "")),
        datum,
        beschreibung: String(data.beschreibung ?? ""),
        kategorie: String(data.kategorie ?? "Sonstiges"),
        angebot: String(data.angebot ?? ""),
        oeffentlich,
        frei: istFrei(datum, oeffentlich),
        bild: String(data.bild ?? ""),
        bildText: String(data.bildText ?? ""),
      };
    })
    .sort((a, b) => b.datum.localeCompare(a.datum));
}

/** Ein einzelner Beitrag samt Inhalt. `null`, wenn es ihn nicht gibt. */
export function beitragLesen(slug: string): Beitrag | null {
  // Sicherheitsnetz: nur einfache Namen zulassen, damit über die Adresse
  // keine anderen Dateien vom Server gelesen werden können.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const pfad = path.join(ORDNER, `${slug}.md`);
  if (!fs.existsSync(pfad)) return null;

  const { data, content } = matter(fs.readFileSync(pfad, "utf8"));
  const datum = datumLesbar(data.datum);
  const oeffentlich = String(data.oeffentlich ?? "");

  return {
    slug,
    titel: String(data.titel ?? slug),
    datum,
    beschreibung: String(data.beschreibung ?? ""),
    kategorie: String(data.kategorie ?? "Sonstiges"),
    angebot: String(data.angebot ?? ""),
    oeffentlich,
    frei: istFrei(datum, oeffentlich),
    bild: String(data.bild ?? ""),
    bildText: String(data.bildText ?? ""),
    html: marked.parse(content, { async: false }) as string,
  };
}

/** Für die Anzeige: 24.08.2026 statt 2026-08-24 */
export function datumDeutsch(datum: string): string {
  if (!datum) return "";
  const [j, m, t] = datum.split("-");
  return `${t}.${m}.${j}`;
}
