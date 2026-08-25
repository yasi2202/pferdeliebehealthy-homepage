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

export type Beitrag = {
  slug: string;
  titel: string;
  datum: string;
  beschreibung: string;
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
      return {
        slug: datei.replace(/\.md$/, ""),
        titel: String(data.titel ?? datei.replace(/\.md$/, "")),
        datum: datumLesbar(data.datum),
        beschreibung: String(data.beschreibung ?? ""),
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

  return {
    slug,
    titel: String(data.titel ?? slug),
    datum: datumLesbar(data.datum),
    beschreibung: String(data.beschreibung ?? ""),
    html: marked.parse(content, { async: false }) as string,
  };
}

/** Für die Anzeige: 24.08.2026 statt 2026-08-24 */
export function datumDeutsch(datum: string): string {
  if (!datum) return "";
  const [j, m, t] = datum.split("-");
  return `${t}.${m}.${j}`;
}
