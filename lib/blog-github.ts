import matter from "gray-matter";
import { datumText } from "@/lib/blog-kopf";

// ---------------------------------------------------------------------------
// Der Blog-Editor speichert auf GitHub.
//
// ▸ WARUM GITHUB UND NICHT DIE DATENBANK
//   Die Beiträge sind Markdown-Dateien in inhalte/blog, und daran hängt viel:
//   die fertig gebauten Seiten, die Auszeichnung für Google, die Weiterleitung
//   der alten Adressen, die Auswertung in der Akademie. Die Website kann auf
//   dem Server keine Datei schreiben, wohl aber GitHub bitten, es zu tun.
//   Jede Änderung ist damit ein gewöhnlicher Commit: Vercel baut die Seite
//   neu, nach etwa zwei Minuten ist sie online, und jede frühere Fassung
//   liegt in der Versionsgeschichte.
//
// ▸ WAS DU EINRICHTEN MUSST, einmalig:
//   In den Vercel-Einstellungen von pferdeliebehealthy-homepage die Variable
//       GITHUB_TOKEN
//   mit einem Fine-grained Token von GitHub, nur für dieses eine Repository,
//   Berechtigung „Contents: Read and write“. Die Anleitung steht auf der
//   Seite /admin/blog, solange der Schlüssel fehlt.
//
// ▸ DIE KENNUNG DER COMMITS
//   Vercel lehnt Veröffentlichungen ab, deren Commit nicht zur verknüpften
//   GitHub-Kennung passt („Deployment was blocked“). Deshalb steht hier fest
//   die noreply-Adresse, nie die Mailadresse aus dem Profil.
//
// ▸ ENTWURF ODER ONLINE
//   Wie bisher über den Dateinamen: `_name.md` ist ein Entwurf, `name.md`
//   steht online. Veröffentlichen heißt also: neue Datei ohne Unterstrich
//   anlegen, alte löschen. Das sind zwei Commits, und das ist in Ordnung.
// ---------------------------------------------------------------------------

const REPO = "yasi2202/pferdeliebehealthy-homepage";
const ZWEIG = "main";
const ORDNER = "inhalte/blog";
const KENNUNG = {
  name: "yasi2202",
  email: "206202064+yasi2202@users.noreply.github.com",
};

function token(): string {
  return (process.env.GITHUB_TOKEN || "").trim();
}

export function githubEingerichtet(): boolean {
  return token().length > 0;
}

/** Nur Kleinbuchstaben, Ziffern und einzelne Bindestriche, wie die Adressen
 *  der bestehenden Beiträge. Sonst ließe sich über die Adresse eine andere
 *  Datei im Repository ansprechen. */
export function slugGueltig(slug: string): boolean {
  return slug.length > 0 && slug.length <= 120 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

async function gh(
  pfad: string,
  init: { method?: string; body?: string } = {},
  accept = "application/vnd.github+json"
): Promise<Response> {
  return fetch(`https://api.github.com/repos/${REPO}/${pfad}`, {
    method: init.method ?? "GET",
    body: init.body,
    headers: {
      Authorization: `Bearer ${token()}`,
      Accept: accept,
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "pferdeliebehealthy-blog-editor",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
    },
    cache: "no-store",
  });
}

export type BeitragZeile = {
  slug: string;
  entwurf: boolean;
  titel: string;
  datum: string;
  aktualisiert: string;
  kategorie: string;
};

/** Alle Beiträge, Entwürfe zuerst, dann die neuesten. `null`, wenn GitHub
 *  nicht antwortet oder der Schlüssel nicht passt. */
export async function beitraegeListen(): Promise<BeitragZeile[] | null> {
  const res = await gh(`contents/${ORDNER}?ref=${ZWEIG}`);
  if (!res.ok) return null;
  const eintraege = (await res.json()) as Array<{ name: string; path: string; type: string }>;
  const dateien = eintraege.filter(
    (e) => e.type === "file" && e.name.endsWith(".md") && e.name !== "_vorlage.md"
  );

  const zeilen = await Promise.all(
    dateien.map(async (e): Promise<BeitragZeile> => {
      const r = await gh(`contents/${e.path}?ref=${ZWEIG}`, {}, "application/vnd.github.raw+json");
      const text = r.ok ? await r.text() : "";
      let data: Record<string, unknown> = {};
      try {
        data = matter(text).data;
      } catch {
        // Ein kaputter Kopf soll die ganze Liste nicht verhindern.
      }
      const slug = e.name.replace(/^_/, "").replace(/\.md$/, "");
      return {
        slug,
        entwurf: e.name.startsWith("_"),
        titel: String(data.titel ?? slug),
        datum: datumText(data.datum),
        aktualisiert: datumText(data.aktualisiert),
        kategorie: String(data.kategorie ?? ""),
      };
    })
  );

  return zeilen.sort(
    (a, b) => Number(b.entwurf) - Number(a.entwurf) || b.datum.localeCompare(a.datum)
  );
}

export type BeitragDatei = {
  slug: string;
  pfad: string;
  sha: string;
  entwurf: boolean;
  text: string;
};

/** Ein Beitrag samt Text und Stand (sha). `null`, wenn es ihn nicht gibt.
 *  Wirft, wenn GitHub nicht antwortet: Das ist etwas anderes als „gibt es
 *  nicht“, und darf nicht so aussehen. */
export async function beitragHolen(slug: string): Promise<BeitragDatei | null> {
  if (!slugGueltig(slug)) return null;
  for (const entwurf of [false, true]) {
    const pfad = `${ORDNER}/${entwurf ? "_" : ""}${slug}.md`;
    const res = await gh(`contents/${pfad}?ref=${ZWEIG}`);
    if (res.status === 404) continue;
    if (!res.ok) throw new Error(`GitHub antwortet mit ${res.status}`);
    const j = (await res.json()) as { sha: string; content?: string };
    const text = j.content ? Buffer.from(j.content, "base64").toString("utf8") : "";
    return { slug, pfad, sha: j.sha, entwurf, text };
  }
  return null;
}

export type Ergebnis =
  | { ok: true; sha: string; pfad: string; entwurf: boolean; unveraendert?: boolean }
  | { ok: false; grund: "konflikt" | "fehler"; meldung: string };

const KONFLIKT: Ergebnis = {
  ok: false,
  grund: "konflikt",
  meldung:
    "Der Beitrag wurde inzwischen an anderer Stelle geändert. Kopier dir deinen Text, lade die Seite neu und setz ihn dann wieder ein.",
};

function titelAus(text: string, slug: string): string {
  try {
    const t = matter(text).data.titel;
    return t ? `„${String(t).slice(0, 80)}“` : slug;
  } catch {
    return slug;
  }
}

async function schreiben(
  pfad: string,
  text: string,
  nachricht: string,
  sha?: string
): Promise<{ ok: true; sha: string } | { ok: false; status: number }> {
  const res = await gh(`contents/${pfad}`, {
    method: "PUT",
    body: JSON.stringify({
      message: nachricht,
      content: Buffer.from(text, "utf8").toString("base64"),
      branch: ZWEIG,
      committer: KENNUNG,
      author: KENNUNG,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) return { ok: false, status: res.status };
  const j = (await res.json()) as { content: { sha: string } };
  return { ok: true, sha: j.content.sha };
}

async function loeschen(pfad: string, sha: string, nachricht: string): Promise<boolean> {
  const res = await gh(`contents/${pfad}`, {
    method: "DELETE",
    body: JSON.stringify({ message: nachricht, sha, branch: ZWEIG, committer: KENNUNG, author: KENNUNG }),
  });
  return res.ok;
}

/** Speichert den Text an seiner bisherigen Stelle. `bekannteSha` ist der
 *  Stand, den der Editor geladen hat; weicht er ab, hat inzwischen jemand
 *  anderes gespeichert, und nichts wird überschrieben. */
export async function beitragSpeichern(
  slug: string,
  text: string,
  bekannteSha: string
): Promise<Ergebnis> {
  const jetzt = await beitragHolen(slug);
  if (!jetzt) return { ok: false, grund: "fehler", meldung: "Diesen Beitrag gibt es nicht mehr." };
  if (jetzt.sha !== bekannteSha) return KONFLIKT;
  if (jetzt.text === text) {
    return { ok: true, sha: jetzt.sha, pfad: jetzt.pfad, entwurf: jetzt.entwurf, unveraendert: true };
  }
  const r = await schreiben(
    jetzt.pfad,
    text,
    `Blog: ${titelAus(text, slug)} in der Verwaltung bearbeitet`,
    jetzt.sha
  );
  if (!r.ok) {
    return r.status === 409 || r.status === 422
      ? KONFLIKT
      : { ok: false, grund: "fehler", meldung: `GitHub hat das Speichern abgelehnt (${r.status}).` };
  }
  return { ok: true, sha: r.sha, pfad: jetzt.pfad, entwurf: jetzt.entwurf };
}

/** Veröffentlicht einen Entwurf oder holt einen Beitrag zurück in den
 *  Entwurf. Der mitgeschickte Text wird dabei gleich mit gespeichert. */
export async function beitragStatusSetzen(
  slug: string,
  text: string,
  bekannteSha: string,
  veroeffentlichen: boolean
): Promise<Ergebnis> {
  const jetzt = await beitragHolen(slug);
  if (!jetzt) return { ok: false, grund: "fehler", meldung: "Diesen Beitrag gibt es nicht mehr." };
  if (jetzt.sha !== bekannteSha) return KONFLIKT;
  if (jetzt.entwurf === !veroeffentlichen) return beitragSpeichern(slug, text, bekannteSha);

  const ziel = `${ORDNER}/${veroeffentlichen ? "" : "_"}${slug}.md`;
  const titel = titelAus(text, slug);
  const neu = await schreiben(
    ziel,
    text,
    veroeffentlichen ? `Blog: ${titel} veröffentlicht` : `Blog: ${titel} zurück in den Entwurf`
  );
  if (!neu.ok) {
    return { ok: false, grund: "fehler", meldung: `GitHub hat das Anlegen abgelehnt (${neu.status}).` };
  }
  const weg = await loeschen(
    jetzt.pfad,
    jetzt.sha,
    veroeffentlichen ? `Blog: Entwurf von ${titel} entfernt` : `Blog: Online-Fassung von ${titel} entfernt`
  );
  if (!weg) {
    return {
      ok: false,
      grund: "fehler",
      meldung:
        "Die neue Fassung steht, aber die alte Datei ließ sich nicht entfernen. Bitte nicht weiterarbeiten und Claude Bescheid sagen.",
    };
  }
  return { ok: true, sha: neu.sha, pfad: ziel, entwurf: !veroeffentlichen };
}

/** Legt einen neuen Entwurf an. */
export async function beitragAnlegen(slug: string, text: string): Promise<Ergebnis> {
  if (await beitragHolen(slug)) {
    return { ok: false, grund: "fehler", meldung: "Unter dieser Adresse gibt es schon einen Beitrag." };
  }
  const pfad = `${ORDNER}/_${slug}.md`;
  const r = await schreiben(pfad, text, `Blog: neuer Entwurf ${titelAus(text, slug)}`);
  if (!r.ok) {
    return { ok: false, grund: "fehler", meldung: `GitHub hat das Anlegen abgelehnt (${r.status}).` };
  }
  return { ok: true, sha: r.sha, pfad, entwurf: true };
}
