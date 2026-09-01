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

/** Ein Kapitel im Beitrag, also eine `##`-Ueberschrift. Daraus entsteht oben
 *  im Beitrag das Inhaltsverzeichnis. */
export type Kapitel = { anker: string; titel: string };

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
  /** Wird auf der Uebersicht zum Filterknopf und bestimmt die Farbe der
   *  Karte. Siehe `kategorieFarbe()`. */
  kategorie: string;
  /** Schluessel eines Angebots aus lib/angebote.ts, das unter dem Beitrag
   *  empfohlen wird. Leer lassen, wenn keins wirklich passt. */
  angebot: string;
  bild: string;
  bildText: string;
  /** Geschaetzte Lesezeit in Minuten. Steht auf der Karte und im Kopf des
   *  Beitrags: Wer weiss, dass es sechs Minuten dauert, faengt eher an als
   *  jemand, der vor einer Textwand unbekannter Laenge steht. */
  lesezeit: number;
  /** Fertiges HTML, aus dem Markdown erzeugt */
  html: string;
  /** Die `##`-Ueberschriften des Beitrags, fuer das Inhaltsverzeichnis. */
  kapitel: Kapitel[];
};

export type BlogKopf = Omit<BlogBeitrag, "html" | "kapitel">;

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

/** Aus einer Ueberschrift eine Sprungmarke machen: "Die vier Dinge" wird zu
 *  "die-vier-dinge". Umlaute werden ausgeschrieben, damit in der Adresse
 *  keine Prozentzeichen landen. */
function ankerName(text: string): string {
  return text
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Lesezeit in Minuten, aufgerundet. 200 Woerter je Minute ist der Wert, mit
 *  dem ueblicherweise gerechnet wird; genauer geht es nicht, und genauer
 *  muss es auch nicht sein. */
function lesezeitSchaetzen(text: string): number {
  const woerter = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(woerter / 200));
}

/** Haengt an jede `<h2>` eine Sprungmarke und sammelt sie ein.
 *
 *  marked vergibt selbst keine Kennungen mehr, ohne sie kann das
 *  Inhaltsverzeichnis aber nirgendwohin springen. Die Kennung wird aus der
 *  Ueberschrift gebildet und bei Dopplungen durchnummeriert. */
function ankerSetzen(html: string): { html: string; kapitel: Kapitel[] } {
  const kapitel: Kapitel[] = [];
  const vergeben = new Set<string>();

  const neu = html.replace(
    /<h2>([\s\S]*?)<\/h2>/g,
    (_treffer, inhalt: string) => {
      const titel = inhalt.replace(/<[^>]+>/g, "").trim();
      let anker = ankerName(titel) || `abschnitt-${kapitel.length + 1}`;
      while (vergeben.has(anker)) anker = `${anker}-2`;
      vergeben.add(anker);
      kapitel.push({ anker, titel });
      return `<h2 id="${anker}">${inhalt}</h2>`;
    }
  );

  return { html: neu, kapitel };
}

function kopfBauen(
  slug: string,
  data: Record<string, unknown>,
  inhalt: string
): BlogKopf {
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
    lesezeit: lesezeitSchaetzen(inhalt),
  };
}

/** Alle Beitraege, neueste zuerst — ohne Inhalt, fuer die Uebersicht. */
export function alleBlogBeitraege(): BlogKopf[] {
  return dateienLesen()
    .map((datei) => {
      const roh = fs.readFileSync(path.join(ORDNER, datei), "utf8");
      const { data, content } = matter(roh);
      return kopfBauen(datei.replace(/\.md$/, ""), data, content);
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
  const roh = marked.parse(content, { async: false }) as string;
  const { html, kapitel } = ankerSetzen(roh);

  return { ...kopfBauen(slug, data, content), html, kapitel };
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

// Die Kartenfarben stehen in lib/blog-farben.ts, weil die Liste im Browser
// laeuft und diese Datei hier nicht dorthin darf (sie liest den Ordner).

/** Fuer die Anzeige: 01.09.2026 statt 2026-09-01 */
export function datumDeutsch(datum: string): string {
  if (!datum) return "";
  const [j, m, t] = datum.split("-");
  return `${t}.${m}.${j}`;
}
