import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { marked } from "marked";
import { empfehlungen, partnerFinden } from "./empfehlungen";
import { produktFinden } from "./partnerprodukte";

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
  /** Steht in diesem Beitrag ein Rabattcode, ein Partnerlink oder ein
   *  Partnerkasten? Dann zeigt die Seite die Werbekennzeichnung. */
  werbung: boolean;
};

export type BlogKopf = Omit<BlogBeitrag, "html" | "kapitel" | "werbung">;

function datumLesbar(wert: unknown): string {
  if (!wert) return "";
  const d = wert instanceof Date ? wert : new Date(String(wert));
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/** Sollen auch die Entwürfe angezeigt werden?
 *
 *  Nur örtlich, zum Durchsehen vor der Freigabe:
 *
 *      BLOG_ENTWUERFE=1 npm.cmd run build
 *      BLOG_ENTWUERFE=1 npm.cmd start
 *
 *  Auf dem Server ist die Variable nicht gesetzt, dort bleiben Entwürfe also
 *  unsichtbar, egal was hier steht. Die zweite Bedingung ist ein Netz für den
 *  Fall, dass sie doch einmal in die Vercel-Einstellungen gerät.
 *
 *  Die Vorlage bleibt auch beim Durchsehen außen vor, sie ist kein Beitrag. */
const ENTWUERFE_ZEIGEN =
  process.env.BLOG_ENTWUERFE === "1" && process.env.VERCEL !== "1";

function dateienLesen(): string[] {
  if (!fs.existsSync(ORDNER)) return [];
  return fs.readdirSync(ORDNER).filter((f) => {
    if (!f.endsWith(".md")) return false;
    if (f === "_vorlage.md") return false;
    return ENTWUERFE_ZEIGEN || !f.startsWith("_");
  });
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

/** Steckt in diesem Beitrag Werbung?
 *
 *  Gemeint ist alles, wofuer eine Provision fliesst: ein Rabattcode eines
 *  Partners, ein Link in dessen Shop oder ein Partnerkasten.
 *
 *  Warum das automatisch geprueft wird und nicht von Hand im Kopf der Datei
 *  eingetragen: Die Kennzeichnung ist Pflicht, und eine vergessene ist
 *  abmahnfaehig. Etwas, das man vergessen kann, gehoert nicht in die Hand
 *  des Schreibenden, wenn die Seite es selbst sehen kann. Aus den alten
 *  WordPress-Beitraegen sind reihenweise Codes mitgekommen, unter denen
 *  nichts von Werbung stand.
 *
 *  Lieber einmal zu viel gekennzeichnet als einmal zu wenig: Ein Hinweis, wo
 *  gar keine Provision fliesst, kostet nichts. */
function enthaeltWerbung(html: string): boolean {
  if (html.includes("partnerkasten")) return true;

  const text = html.toLowerCase();
  return empfehlungen.some((e) => {
    if (!e.bezahlt) return false;
    if (text.includes(e.code.toLowerCase())) return true;
    // Der Shop-Link, ohne Protokoll und ohne www, damit auch die
    // Partnerlinks aus den alten Beitraegen erkannt werden.
    if (e.url) {
      const host = e.url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
      if (host && text.includes(host)) return true;
    }
    return false;
  });
}

/** Setzt die Partnerkaesten ein.
 *
 *  Im Text steht nur ein Marker, zum Beispiel:
 *
 *      [[partner:biohof-elmengrund]]
 *
 *  Daraus wird ein Kasten mit Name, Rabattcode und Link. Die Angaben kommen
 *  aus lib/empfehlungen.ts, stehen also nur an einer Stelle: Aendert sich ein
 *  Code, aendert er sich in allen Beitraegen mit.
 *
 *  Zwei Sachen sind dabei Pflicht und keine Geschmacksfrage:
 *
 *  - Die Kennzeichnung als Werbung. Fuer die Codes fliesst eine Provision,
 *    und ein nicht gekennzeichneter bezahlter Hinweis ist abmahnfaehig.
 *  - `rel="sponsored"` am Link. Damit sagt die Seite Google, dass hinter dem
 *    Link Geld steht. Fehlt es, wertet Google das als Versuch, mit gekauften
 *    Links zu ranken, und das faellt auf die ganze Seite zurueck.
 */
function partnerkaestenSetzen(html: string): string {
  // Erst die Produktkaesten: Sie sind die genauere Empfehlung und sollen
  // nicht versehentlich vom allgemeinen Partnerkasten verdeckt werden.
  let text = html.replace(
    /<p>\s*\[\[produkt:([a-z0-9-]+)\]\]\s*<\/p>/g,
    (_treffer, schluessel: string) => {
      const gefunden = produktFinden(schluessel);
      if (!gefunden) return "";
      const { produkt, partner } = gefunden;

      const ziel = produkt.url ?? partner.url;
      const knopfText = produkt.url
        ? `${produkt.name} ansehen`
        : `Zum Shop von ${partner.partner}`;
      const knopf = ziel
        ? `<a class="partnerkasten-knopf" href="${ziel}" target="_blank" rel="sponsored noopener">${knopfText}</a>`
        : "";

      return `<aside class="partnerkasten partnerkasten-produkt">
  <p class="partnerkasten-marke">${partner.bezahlt ? "Werbung · " : ""}Produkt dazu</p>
  <p class="partnerkasten-name">${produkt.name}</p>
  <p class="partnerkasten-partner">von ${partner.partner}</p>
  <p class="partnerkasten-warum">${produkt.kurz}</p>
  <p class="partnerkasten-code">Mein Rabattcode: <strong>${partner.code}</strong>${partner.rabatt ? `, ${partner.rabatt}` : ""}</p>
  ${knopf}
  ${partner.bezahlt ? `<p class="partnerkasten-hinweis">Für den Code bekomme ich eine Provision, für dich wird es dadurch nicht teurer.</p>` : ""}
</aside>`;
    }
  );

  return text.replace(
    /<p>\s*\[\[partner:([a-z0-9-]+)\]\]\s*<\/p>/g,
    (_treffer, schluessel: string) => {
      const partner = partnerFinden(schluessel);
      // Unbekannter Schluessel: Der Marker verschwindet, statt als roher Text
      // im Beitrag zu stehen. Ein Tippfehler soll die Seite nicht entstellen.
      if (!partner) return "";

      const knopf = partner.url
        ? `<a class="partnerkasten-knopf" href="${partner.url}" target="_blank" rel="sponsored noopener">Zum Shop von ${partner.partner}</a>`
        : "";

      return `<aside class="partnerkasten">
  <p class="partnerkasten-marke">${partner.bezahlt ? "Werbung · " : ""}Mein Tipp dazu</p>
  <p class="partnerkasten-name">${partner.partner}</p>
  ${partner.warum ? `<p class="partnerkasten-warum">${partner.warum}</p>` : ""}
  <p class="partnerkasten-code">Mein Rabattcode: <strong>${partner.code}</strong>${partner.rabatt ? `, ${partner.rabatt}` : ""}</p>
  ${knopf}
  ${partner.bezahlt ? `<p class="partnerkasten-hinweis">Für den Code bekomme ich eine Provision, für dich wird es dadurch nicht teurer.</p>` : ""}
</aside>`;
    }
  );
}

/** Legt um jede Tabelle einen Rahmen, der bei Bedarf seitlich scrollt.
 *
 *  Eine Tabelle mit vier Spalten passt auf keinem Handy in die Breite. Ohne
 *  diesen Rahmen schiebt sie die ganze Seite auseinander, und dann laesst sich
 *  auch der Fliesstext nur noch seitlich verschoben lesen. Mit ihm bleibt das
 *  Scrollen auf die Tabelle beschraenkt. */
function tabellenEinfassen(html: string): string {
  return html.replace(
    /<table>([\s\S]*?)<\/table>/g,
    (treffer) => `<div class="tabelle-rahmen">${treffer}</div>`
  );
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
      // Der Unterstrich fällt weg: Beim Durchsehen soll ein Entwurf schon
      // unter der Adresse liegen, unter der er später steht.
      return kopfBauen(
        datei.replace(/^_/, "").replace(/\.md$/, ""),
        data,
        content
      );
    })
    .sort((a, b) => b.datum.localeCompare(a.datum));
}

/** Ein einzelner Beitrag samt Inhalt. `null`, wenn es ihn nicht gibt. */
export function blogBeitragLesen(slug: string): BlogBeitrag | null {
  // Sicherheitsnetz: nur einfache Namen zulassen, damit ueber die Adresse
  // keine anderen Dateien vom Server gelesen werden koennen.
  if (!/^[a-z0-9-]+$/.test(slug)) return null;

  let pfad = path.join(ORDNER, `${slug}.md`);
  // Beim Durchsehen liegt der Beitrag noch mit Unterstrich im Ordner.
  if (!fs.existsSync(pfad) && ENTWUERFE_ZEIGEN) {
    pfad = path.join(ORDNER, `_${slug}.md`);
  }
  if (!fs.existsSync(pfad)) return null;

  const { data, content } = matter(fs.readFileSync(pfad, "utf8"));
  const roh = marked.parse(content, { async: false }) as string;
  const { html, kapitel } = ankerSetzen(tabellenEinfassen(partnerkaestenSetzen(roh)));

  return {
    ...kopfBauen(slug, data, content),
    html,
    kapitel,
    werbung: enthaeltWerbung(html),
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

// Die Kartenfarben stehen in lib/blog-farben.ts, weil die Liste im Browser
// laeuft und diese Datei hier nicht dorthin darf (sie liest den Ordner).

/** Fuer die Anzeige: 01.09.2026 statt 2026-09-01 */
export function datumDeutsch(datum: string): string {
  if (!datum) return "";
  const [j, m, t] = datum.split("-");
  return `${t}.${m}.${j}`;
}
