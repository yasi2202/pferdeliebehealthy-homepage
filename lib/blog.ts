import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";

// ---------------------------------------------------------------------------
// Der Blog: die oeffentliche Seite des Wissens.
//
// ▸ WOFUER GIBT ES IHN, WENN ES SCHON DEN INSIDER-KANAL GIBT?
//
//   Der Insider-Kanal sammelt Adressen. Er ist geschlossen, und das soll er
//   bleiben. Der Blog macht das Gegenteil: Er steht offen, damit Google ihn
//   liest und Leute ueberhaupt erst herfinden. Zwei Kanaele, zwei Aufgaben.
//
//   Deshalb liegen die Texte auch in zwei getrennten Ordnern. Ein Blogbeitrag
//   wird nie zum Insider-Beitrag und umgekehrt — was du wo hinlegst,
//   entscheidest du beim Schreiben.
//
// ▸ SO SCHREIBST DU EINEN BEITRAG:
//   Leg im Ordner `inhalte/blog` eine neue Datei an, zum Beispiel
//   `kotwasser-beim-pferd.md`. Der Dateiname wird zur Web-Adresse:
//   pferdeliebehealthy.de/blog/kotwasser-beim-pferd
//
//   Nur Kleinbuchstaben und Bindestriche, keine Umlaute, keine Leerzeichen.
//   Die Vorlage `_vorlage.md` im selben Ordner erklaert die Einzelheiten.
//
// ▸ Dateien, die mit einem Unterstrich beginnen, werden uebersprungen. So
//   kannst du an einem Entwurf arbeiten, ohne dass er im Netz steht.
// ---------------------------------------------------------------------------

const ORDNER = path.join(process.cwd(), "inhalte", "blog");

export type BlogBeitrag = {
  slug: string;
  titel: string;
  /** Erscheinungsdatum, z. B. 2026-09-01 */
  datum: string;
  /** Wann der Text zuletzt fachlich ueberarbeitet wurde. Leer lassen, solange
   *  sich nichts geaendert hat. Google zeigt das Datum in den Treffern an,
   *  und ein Fachtext, der gepflegt wird, wird besser bewertet als einer,
   *  der seit Jahren unberuehrt daliegt. */
  aktualisiert: string;
  /** Der Satz, der bei Google unter dem Titel steht. Das Wichtigste am
   *  ganzen Beitrag: Er entscheidet, ob jemand klickt. */
  beschreibung: string;
  /** Wird auf der Uebersicht zum Filterknopf. */
  kategorie: string;
  /** Schluessel eines Angebots aus lib/angebote.ts, das unter dem Beitrag
   *  empfohlen wird. Leer lassen, wenn keins wirklich passt. */
  angebot: string;
  bild: string;
  bildText: string;
  /** Fertiges HTML, aus dem Markdown erzeugt */
  html: string;
};

export type BlogKopf = Omit<BlogBeitrag, "html">;

function datumLesbar(wert: unknown): string {
  if (!wert) return "";
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

function kopfBauen(slug: string, data: Record<string, unknown>): BlogKopf {
  return {
    slug,
    titel: String(data.titel ?? slug),
    datum: datumLesbar(data.datum),
    aktualisiert: datumLesbar(data.aktualisiert),
    beschreibung: String(data.beschreibung ?? ""),
    kategorie: String(data.kategorie ?? "Sonstiges"),
    angebot: String(data.angebot ?? ""),
    bild: String(data.bild ?? ""),
    bildText: String(data.bildText ?? ""),
  };
}

/** Alle Beitraege, neueste zuerst — ohne Inhalt, fuer die Uebersicht. */
export function alleBlogBeitraege(): BlogKopf[] {
  return dateienLesen()
    .map((datei) => {
      const roh = fs.readFileSync(path.join(ORDNER, datei), "utf8");
      const { data } = matter(roh);
      return kopfBauen(datei.replace(/\.md$/, ""), data);
    })
    .sort((a, b) => b.datum.localeCompare(a.datum));
}

/** Ein einzelner Beitrag samt Inhalt. `null`, wenn es ihn nicht gibt. */
export function blogBeitragLesen(slug: string): BlogBeitrag | null {
  // Sicherheitsnetz: nur einfache Namen zulassen, damit ueber die Adresse
  // keine anderen Dateien vom Server gelesen werden koennen.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  const pfad = path.join(ORDNER, `${slug}.md`);
  if (!fs.existsSync(pfad)) return null;

  const { data, content } = matter(fs.readFileSync(pfad, "utf8"));
  return {
    ...kopfBauen(slug, data),
    html: marked.parse(content, { async: false }) as string,
  };
}

/** Andere Beitraege derselben Kategorie, hoechstens drei.
 *
 *  Steht unter jedem Beitrag. Wer ueber Google kommt, liest sonst genau
 *  einen Text und ist wieder weg — und Google sieht an der kurzen Verweildauer,
 *  dass die Seite die Frage offenbar nicht beantwortet hat. */
export function verwandteBeitraege(slug: string, kategorie: string): BlogKopf[] {
  const alle = alleBlogBeitraege().filter((b) => b.slug !== slug);
  const gleiche = alle.filter((b) => b.kategorie === kategorie);
  // Reicht die Kategorie nicht fuer drei, wird mit den neuesten aufgefuellt.
  const rest = alle.filter((b) => b.kategorie !== kategorie);
  return [...gleiche, ...rest].slice(0, 3);
}

/** Fuer die Anzeige: 01.09.2026 statt 2026-09-01 */
export function datumDeutsch(datum: string): string {
  if (!datum) return "";
  const [j, m, t] = datum.split("-");
  return `${t}.${m}.${j}`;
}
