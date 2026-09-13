import { createHmac, timingSafeEqual } from "node:crypto";
import { supabase, ersteZeile } from "@/lib/versand";
import { KOMMENTAR_ANTWORTEN, type Stichwort } from "@/lib/instagram-stichwoerter";

// ---------------------------------------------------------------------------
// Die eigene Antwort auf Instagram-Kommentare, als Ersatz für ManyChat
// (seit 12.09.2026). Nur auf dem Server, die Datei braucht Schlüssel.
//
// ▸ DER WEG ÜBER „INSTAGRAM-API MIT INSTAGRAM-LOGIN“
//   Die App bei Meta bekommt den Anwendungsfall „Instagram-API“, das
//   Instagram-Konto wird dort verbunden, und Meta gibt einen Schlüssel für
//   dieses Konto heraus. Gesprochen wird mit graph.instagram.com, eine
//   Facebook-Seite braucht es dafür nicht.
//
// ▸ DIE DREI UMGEBUNGSVARIABLEN BEI VERCEL
//   INSTAGRAM_ZUGANG          der Schlüssel des Kontos (nur für den Start;
//                             danach liegt der jeweils neueste in der Tabelle
//                             instagram_zugang und wird wöchentlich erneuert)
//   INSTAGRAM_APP_GEHEIMNIS   das Geheimnis der App, damit nur Meldungen von
//                             Meta angenommen werden
//   INSTAGRAM_WEBHOOK_TOKEN   ein frei gewähltes Wort, das auch bei Meta beim
//                             Einrichten des Webhooks eingetragen wird
//
// ▸ WAS META ERLAUBT: auf einen Kommentar genau EINE private Antwort, und
//   zwar innerhalb von sieben Tagen. Genau das tut diese Datei.
//
// ▸ SOLANGE META DIE APP NICHT GEPRÜFT HAT (App Review), kommen Meldungen nur
//   von Konten an, die in der App eine Rolle haben. Zum Testen reicht das.
// ---------------------------------------------------------------------------

export const IG_VERSION = "v23.0";
const IG = `https://graph.instagram.com/${IG_VERSION}`;
const TABELLE = "instagram_kommentar_antworten";

// ---------------------------------------------------------------------------
// Prüfen, dass eine Meldung wirklich von Meta kommt
// ---------------------------------------------------------------------------

/**
 * Prüft die Unterschrift im Kopf `x-hub-signature-256` und sagt, mit welchem
 * Geheimnis sie gemacht ist, oder null.
 *
 * ▸ ZWEI GEHEIMNISSE, WEIL META ZWEI HAT. Die App hat einen eigenen
 *   Geheimcode (App-Einstellungen → Allgemein, bei Vercel META_APP_GEHEIMNIS),
 *   der Instagram-Teil einen zweiten (API-Einrichtung mit Instagram-Login, bei
 *   Vercel INSTAGRAM_APP_GEHEIMNIS). Am 13.09.2026 kam Metas Testmeldung mit
 *   einer Unterschrift an, die zum Instagram-Geheimcode NICHT passte. Welches
 *   Meta für echte Kommentare nimmt, ist nicht sauber dokumentiert; es zählt
 *   deshalb jedes der beiden, und die Eingangsmeldung hält fest, welches passte.
 */
export function unterschriftVon(roh: string, kopf: string | null): "instagram" | "meta" | null {
  if (!kopf || !kopf.startsWith("sha256=")) return null;
  const gegeben = Buffer.from(kopf.slice("sha256=".length));
  const kandidaten: ["instagram" | "meta", string][] = [
    ["instagram", (process.env.INSTAGRAM_APP_GEHEIMNIS || "").trim()],
    ["meta", (process.env.META_APP_GEHEIMNIS || "").trim()],
  ];
  for (const [name, geheimnis] of kandidaten) {
    if (!geheimnis) continue;
    const erwartet = Buffer.from(createHmac("sha256", geheimnis).update(roh, "utf8").digest("hex"));
    if (erwartet.length === gegeben.length && timingSafeEqual(erwartet, gegeben)) return name;
  }
  return null;
}

/** Ja oder nein, für Stellen, die nicht wissen müssen, welches Geheimnis passte. */
export function unterschriftStimmt(roh: string, kopf: string | null): boolean {
  return unterschriftVon(roh, kopf) !== null;
}

// ---------------------------------------------------------------------------
// Der Schlüssel
// ---------------------------------------------------------------------------

/** Der neueste Schlüssel: aus der Tabelle, sonst aus der Umgebungsvariable. */
export async function holeZugang(): Promise<{ token: string; gueltigBis: string | null; woher: string } | null> {
  const zeile = await ersteZeile<{ token: string; gueltig_bis: string | null }>(
    "instagram_zugang?schluessel=eq.haupt&select=token,gueltig_bis&limit=1",
  );
  if (zeile?.token) return { token: zeile.token, gueltigBis: zeile.gueltig_bis, woher: "tabelle" };
  const env = process.env.INSTAGRAM_ZUGANG;
  return env ? { token: env, gueltigBis: null, woher: "vercel" } : null;
}

/**
 * Erneuert den Schlüssel bei Meta und legt den neuen in der Tabelle ab.
 * Ein langlebiger Instagram-Schlüssel hält 60 Tage und lässt sich erneuern,
 * sobald er älter als einen Tag ist. Wöchentlich reicht also dicke.
 */
export async function erneuereZugang(): Promise<{ ok: boolean; meldung: string }> {
  const alt = await holeZugang();
  if (!alt) return { ok: false, meldung: "Kein Schlüssel vorhanden (INSTAGRAM_ZUGANG fehlt)." };
  const res = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(alt.token)}`,
    { cache: "no-store" },
  );
  const d = (await res.json().catch(() => ({}))) as { access_token?: string; expires_in?: number; error?: { message?: string } };
  if (!res.ok || !d.access_token) {
    return { ok: false, meldung: `Meta lehnt die Erneuerung ab: ${d.error?.message ?? res.status}` };
  }
  const gueltigBis = new Date(Date.now() + (d.expires_in ?? 5184000) * 1000).toISOString();
  const speichern = await supabase("instagram_zugang?on_conflict=schluessel", {
    method: "POST",
    headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ schluessel: "haupt", token: d.access_token, gueltig_bis: gueltigBis, erneuert_am: new Date().toISOString() }),
  });
  if (!speichern.ok) return { ok: false, meldung: "Neuer Schlüssel ließ sich nicht speichern. Ist datenbank/instagram-kommentare.sql eingespielt?" };
  return { ok: true, meldung: `Erneuert, gültig bis ${gueltigBis.slice(0, 10)}.` };
}

/** Löscht Einträge, die älter als zwölf Monate sind. So steht es auf /instagram-daten. */
export async function altesLoeschen(): Promise<boolean> {
  const grenze = new Date(Date.now() - 365 * 86400000).toISOString();
  const res = await supabase(`${TABELLE}?erstellt_am=lt.${encodeURIComponent(grenze)}`, { method: "DELETE" });
  return res.ok;
}

// ---------------------------------------------------------------------------
// Einen Kommentar beantworten
// ---------------------------------------------------------------------------

export type Kommentar = {
  id: string;
  text: string;
  beitragId: string | null;
  vonId: string | null;
  vonName: string | null;
};

/**
 * Hält den Kommentar fest, bevor geantwortet wird. Schickt Meta denselben
 * Kommentar noch einmal, gibt die Tabelle keine neue Zeile zurück, und es
 * wird nicht doppelt geantwortet. Fehlt die Tabelle, wird trotzdem
 * geantwortet (null heißt: unbekannt, weiter).
 */
async function vormerken(k: Kommentar, s: Stichwort): Promise<{ id: string } | "doppelt" | null> {
  const res = await supabase(`${TABELLE}?on_conflict=kommentar_id`, {
    method: "POST",
    headers: { Prefer: "resolution=ignore-duplicates,return=representation" },
    body: JSON.stringify({
      kommentar_id: k.id,
      beitrag_id: k.beitragId,
      von_id: k.vonId,
      von_name: k.vonName,
      text: (k.text || "").slice(0, 500),
      stichwort: s.wort,
    }),
  });
  if (!res.ok) {
    console.error("Instagram: Kommentar ließ sich nicht festhalten.", res.status);
    return null;
  }
  const zeilen = (await res.json().catch(() => [])) as { id: string }[];
  return zeilen.length > 0 ? { id: zeilen[0].id } : "doppelt";
}

async function nachtragen(id: string, felder: Record<string, unknown>) {
  await supabase(`${TABELLE}?id=eq.${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(felder),
  });
}

/** Die private Antwort: eine Direktnachricht an die Person, die kommentiert hat. */
async function privateAntwort(token: string, kommentarId: string, text: string): Promise<string | null> {
  const res = await fetch(`${IG}/me/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ recipient: { comment_id: kommentarId }, message: { text } }),
  });
  if (res.ok) return null;
  const d = (await res.json().catch(() => ({}))) as { error?: { message?: string; code?: number } };
  return `Nachricht: ${d.error?.message ?? res.status}`;
}

/** Die kurze Antwort unter dem Kommentar. */
async function oeffentlicheAntwort(token: string, kommentarId: string): Promise<string | null> {
  const text = KOMMENTAR_ANTWORTEN[Math.floor(Math.random() * KOMMENTAR_ANTWORTEN.length)];
  const res = await fetch(`${IG}/${encodeURIComponent(kommentarId)}/replies`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ message: text }),
  });
  if (res.ok) return null;
  const d = (await res.json().catch(() => ({}))) as { error?: { message?: string } };
  return `Antwort: ${d.error?.message ?? res.status}`;
}

/** Beantwortet einen Kommentar mit Stichwort. Gibt zurück, was passiert ist. */
export async function beantworte(k: Kommentar, s: Stichwort): Promise<string> {
  const zugang = await holeZugang();
  if (!zugang) {
    console.error("Instagram: kein Schlüssel, INSTAGRAM_ZUGANG fehlt.");
    return "kein Schlüssel";
  }

  const vormerkung = await vormerken(k, s);
  if (vormerkung === "doppelt") return "schon beantwortet";

  const fehlerNachricht = await privateAntwort(zugang.token, k.id, s.nachricht);
  // Die Antwort darunter nur, wenn die Nachricht wirklich raus ist. Sonst
  // stünde dort „schau in deine Nachrichten“, und es ist nichts angekommen.
  const fehlerAntwort = fehlerNachricht ? "übersprungen" : await oeffentlicheAntwort(zugang.token, k.id);

  if (vormerkung) {
    await nachtragen(vormerkung.id, {
      nachricht_ok: !fehlerNachricht,
      antwort_ok: !fehlerAntwort,
      fehler: [fehlerNachricht, fehlerAntwort === "übersprungen" ? null : fehlerAntwort].filter(Boolean).join(" · ") || null,
    });
  }
  if (fehlerNachricht) console.error("Instagram:", fehlerNachricht);
  return fehlerNachricht ?? "beantwortet";
}

/**
 * Hält fest, wann zuletzt eine Meldung von Meta ankam und ob ihre Unterschrift
 * stimmte. Ohne das endet ein Fehler still: Eine abgewiesene Meldung
 * hinterlässt sonst nur eine Zeile im Vercel-Protokoll, und von außen sieht
 * „Meta schickt nichts“ genauso aus wie „die Website weist alles ab“.
 *
 * Liegt als Zeile `letzte-meldung` in instagram_zugang (Feld `token` trägt hier
 * eine kleine JSON-Angabe, kein Schlüssel), damit keine neue Tabelle nötig ist.
 * Gespeichert werden nur Zeit, Unterschrift ja/nein, Art und Felder der
 * Meldung und ob ein Stichwort dabei war, kein Kommentartext.
 */
export async function merkeLetzteMeldung(angaben: Record<string, unknown>): Promise<void> {
  try {
    await supabase("instagram_zugang?on_conflict=schluessel", {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
      body: JSON.stringify({
        schluessel: "letzte-meldung",
        token: JSON.stringify({ zeit: new Date().toISOString(), ...angaben }),
        erneuert_am: new Date().toISOString(),
      }),
    });
  } catch {
    // Die Eingangsmeldung ist nur Hilfe beim Suchen, sie darf nichts aufhalten.
  }
}

/** Die letzte Eingangsmeldung, für die Übersicht. */
export async function letzteMeldung(): Promise<Record<string, unknown> | null> {
  const zeile = await ersteZeile<{ token: string }>("instagram_zugang?schluessel=eq.letzte-meldung&select=token&limit=1");
  if (!zeile) return null;
  try {
    return JSON.parse(zeile.token);
  } catch {
    return null;
  }
}

/** Der Link zu einem Beitrag, für die Übersicht. Scheitert still. */
export async function beitragsLink(token: string, beitragId: string): Promise<string | null> {
  try {
    const res = await fetch(`${IG}/${encodeURIComponent(beitragId)}?fields=permalink`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const d = (await res.json()) as { permalink?: string };
    return d.permalink ?? null;
  } catch {
    return null;
  }
}
// ENDE DER DATEI
